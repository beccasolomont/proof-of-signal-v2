import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.100.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const DEMO_EMAIL = 'diana@demo.proofofsignal.com';
    const DEMO_PASSWORD = 'DemoPass123!';

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(u => u.email === DEMO_EMAIL);

    let userId: string;

    if (existing) {
      userId = existing.id;
      // Update password in case it changed
      await supabase.auth.admin.updateUserById(userId, {
        password: DEMO_PASSWORD,
        email_confirm: true,
      });
    } else {
      // Create user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        email_confirm: true,
      });
      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // Upsert profile
    await supabase.from('profiles').upsert({
      id: userId,
      first_name: 'Diana',
      career_stage: 'Senior PM',
      goals: ['Getting promoted', 'Building executive presence'],
      onboarding_complete: true,
    });

    // Delete existing signals and re-insert demo data
    await supabase.from('signals').delete().eq('user_id', userId);

    const demoSignals = [
      {
        user_id: userId,
        text: "Stakeholder review went well — CPO mentioned the roadmap framing by name in the all-hands recap. I didn't know she was going to reference it.",
        date: '2025-03-18',
        tag: 'Recognition',
        flagged: true,
      },
      {
        user_id: userId,
        text: "Felt like my idea about the discovery sprint structure got picked up in the PM sync without attribution. Not sure if I'm reading into it.",
        date: '2025-03-19',
        tag: 'Missed Credit',
        flagged: true,
      },
      {
        user_id: userId,
        text: "1:1 with my manager was shorter than usual. He moved through the agenda fast and didn't ask follow-up questions. Not sure what to make of it.",
        date: '2025-03-20',
        tag: 'Manager Signal',
        flagged: false,
      },
      {
        user_id: userId,
        text: 'Led my first cross-functional roadmap review with design + eng + data. It ran long but nobody left. That felt like something.',
        date: '2025-03-21',
        tag: 'Personal Milestone',
        flagged: true,
      },
      {
        user_id: userId,
        text: "Got feedback in writing from the VP of Design that my framing of the Q2 priorities was 'unusually clear for this stage of planning.' Saved the email.",
        date: '2025-03-22',
        tag: 'Recognition',
        flagged: true,
      },
    ];

    const { error: insertError } = await supabase.from('signals').insert(demoSignals);
    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, userId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
