/**
 * DemoInsight — Diana-specific insight copy shared between Dashboard and Patterns.
 * Extracted to eliminate duplication of the demo insight text.
 */
import { DEMO_INSIGHT_TITLE, DEMO_INSIGHT_BODY, DEMO_INSIGHT_ACTION } from '@/lib/constants';

const DemoInsight = () => (
  <div className="space-y-3">
    <h4 className="text-sm font-semibold text-navy">{DEMO_INSIGHT_TITLE}</h4>
    <p className="text-sm text-foreground leading-relaxed">{DEMO_INSIGHT_BODY}</p>
    <p className="text-sm text-foreground leading-relaxed font-medium">{DEMO_INSIGHT_ACTION}</p>
  </div>
);

export default DemoInsight;
