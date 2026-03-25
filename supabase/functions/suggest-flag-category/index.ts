import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_CATEGORIES = [
  "Promotion evidence",
  "Performance review",
  "Difficult conversation",
  "Watch closely",
] as const;

const SYSTEM_PROMPT = `You are a career signal analyst. Given a workplace signal and its category tag, suggest the most appropriate review subcategory using the suggest_flag_category tool.

## Subcategories

1. **Promotion evidence** — The signal demonstrates readiness for promotion: visible wins, leadership moments, executive recognition, or stretch accomplishments.

2. **Performance review** — The signal is relevant to an upcoming performance review: feedback received, impact demonstrated, goals achieved, or development areas noted.

3. **Difficult conversation** — The signal relates to a conversation the user should have: addressing credit gaps, clarifying expectations, raising concerns, or navigating tension.

4. **Watch closely** — The signal indicates something to monitor: shifts in manager behavior, organizational changes, subtle political dynamics, or early warning signs.

## Rules
- Consider both the signal text AND its category tag when deciding.
- Recognition + senior stakeholder visibility → likely "Promotion evidence"
- Missed Credit or tension signals → likely "Difficult conversation"
- Manager behavior changes or org shifts → likely "Watch closely"
- Feedback or milestone signals → likely "Performance review"
- When uncertain, choose the category that would be most actionable for the user.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, tag } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "text is required" }),
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

    const userMessage = tag
      ? `Signal category: ${tag}\n\nSignal text: ${text.trim()}`
      : text.trim();

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_flag_category",
              description: "Suggest a review subcategory for a flagged career signal.",
              parameters: {
                type: "object",
                properties: {
                  category: {
                    type: "string",
                    enum: VALID_CATEGORIES,
                    description: "The review subcategory that best fits the signal.",
                  },
                },
                required: ["category"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_flag_category" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited — please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI suggestion failed", fallback: true }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const args = JSON.parse(toolCall.function.arguments);
      if (VALID_CATEGORIES.includes(args.category)) {
        return new Response(
          JSON.stringify({ category: args.category }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.error("Unexpected AI response:", JSON.stringify(data));
    return new Response(
      JSON.stringify({ error: "Could not parse AI response", fallback: true }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("suggest-flag-category error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", fallback: true }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
