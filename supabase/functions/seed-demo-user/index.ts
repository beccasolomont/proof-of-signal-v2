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
      { user_id: userId, text: "CPO referenced my roadmap framing by name in the all-hands recap. I didn't know she was going to do that.", date: '2026-02-03', tag: 'Recognition', flagged: true },
      { user_id: userId, text: 'Ran the Q1 planning kickoff for the first time without a co-lead. It went long but the room stayed with it.', date: '2026-02-06', tag: 'Personal Milestone', flagged: true },
      { user_id: userId, text: "My framework for prioritizing the discovery backlog got picked up in the eng sync — presented as the team's approach, not mine specifically. Not sure how to feel about that.", date: '2026-02-11', tag: 'Missed Credit', flagged: true },
      { user_id: userId, text: "1:1 with my manager felt different today. He was distracted, moved through the agenda fast, didn't ask follow-up questions. Not sure if it's me or something else going on.", date: '2026-02-18', tag: 'Manager Signal', flagged: false },
      { user_id: userId, text: "Got pulled into an exec design review I'm not usually in. Nobody explained why. Just got the calendar invite.", date: '2026-02-20', tag: 'Org / Political Signal', flagged: false },
      { user_id: userId, text: "Peer asked me to review their roadmap before they took it to leadership. First time someone's done that.", date: '2026-02-24', tag: 'Recognition', flagged: false },
      { user_id: userId, text: 'Told in my review feedback to "work on executive presence." No examples. No definition of what that means at my level. Just the phrase.', date: '2026-02-27', tag: 'Constructive Feedback', flagged: true },
      { user_id: userId, text: 'Led my first cross-functional roadmap review with design, eng, and data all in the room. It ran over but nobody left.', date: '2026-03-04', tag: 'Personal Milestone', flagged: true },
      { user_id: userId, text: "My idea about restructuring the discovery sprint cadence got brought up in the PM sync by someone else. No attribution. Not sure if I'm reading into it.", date: '2026-03-07', tag: 'Missed Credit', flagged: true },
      { user_id: userId, text: 'Manager asked me to present the Q2 priorities directly to the VP instead of him doing it. He said "you know this better than I do."', date: '2026-03-10', tag: 'Recognition', flagged: true },
      { user_id: userId, text: 'Reorg rumors. Two people on adjacent teams have been told their roles are "under review." Nobody has said anything to me directly.', date: '2026-03-13', tag: 'Org / Political Signal', flagged: false },
      { user_id: userId, text: 'VP of Design said my framing of the Q2 priorities was "unusually clear for this stage of planning." Saved the email.', date: '2026-03-18', tag: 'Recognition', flagged: true },
      { user_id: userId, text: 'Stakeholder review went well. CPO mentioned the roadmap framing by name in the all-hands recap afterward.', date: '2026-03-19', tag: 'Recognition', flagged: true },
      { user_id: userId, text: '1:1 with my manager was shorter than usual again. He moved through the agenda fast and rescheduled our next two.', date: '2026-03-20', tag: 'Manager Signal', flagged: false },
      { user_id: userId, text: 'Promotion conversation with my manager is in two weeks. I have 6 weeks of signals. The pattern is clearer than I expected.', date: '2026-03-22', tag: 'Personal Milestone', flagged: true },
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
