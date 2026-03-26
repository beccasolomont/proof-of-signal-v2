import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a senior career coach for product managers. You will receive ALL of a user's career signals (journal entries about workplace events) along with their tag distribution and flagged items.

Your job is to produce a JSON response with three fields:

1. "insight" — A 2-4 sentence analysis of the OVERALL patterns across ALL signals. Do NOT focus on just one week or one category. Synthesize the full picture: what recurring themes emerge, how they connect, and what they mean for the user's career trajectory. Be specific, referencing actual patterns you see. Speak directly to the user with "you/your".

2. "quote" — A short motivational quote (1-2 sentences) that is thematically relevant to the patterns you identified. It can be from a known figure or original. Include attribution if from a known source. Keep it concise.

3. "checklist" — An array of 3-5 specific, actionable next steps based on the FLAGGED signals and patterns. Each item should be an object with:
   - "text": A specific, tactical action item (1 sentence)
   - "priority": "high" | "medium" | "low"
   
   Prioritize items that address the most impactful patterns. Be specific — suggest exact conversations, documents to create, or actions to take. Do NOT be generic.

Respond ONLY with valid JSON. No markdown, no explanation outside the JSON.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { signals, tagCounts, flaggedSignals, careerStage, goals } = await req.json();

    if (!signals || !Array.isArray(signals)) {
      return new Response(
        JSON.stringify({ error: "signals array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const signalSummary = signals
      .map((s: { date: string; tag: string; text: string; flagged: boolean; flagCategory?: string }) =>
        `[${s.date}] (${s.tag}${s.flagged ? ` | flagged: ${s.flagCategory || 'uncategorized'}` : ''}) ${s.text}`
      )
      .join("\n");

    const tagDistribution = Object.entries(tagCounts || {})
      .filter(([, count]) => (count as number) > 0)
      .map(([tag, count]) => `${tag}: ${count}`)
      .join(", ");

    const flaggedSummary = (flaggedSignals || [])
      .map((s: { text: string; tag: string; flagCategory?: string }) =>
        `- [${s.tag} → ${s.flagCategory || 'uncategorized'}] ${s.text}`
      )
      .join("\n");

    const userMessage = `Career stage: ${careerStage || "Unknown"}
Goals: ${(goals || []).join(", ") || "Not specified"}

Tag distribution: ${tagDistribution}
Total signals: ${signals.length}

--- ALL SIGNALS ---
${signalSummary}

--- FLAGGED SIGNALS ---
${flaggedSummary || "None flagged"}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI insight generation failed" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content?.trim() || "";

    // Strip markdown code fences if present
    content = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

    try {
      const parsed = JSON.parse(content);
      return new Response(
        JSON.stringify(parsed),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch {
      console.error("Failed to parse AI response as JSON:", content);
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (e) {
    console.error("generate-pattern-insight error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
