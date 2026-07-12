// Per-skill hero mocks. When a skill has a rich, hand-built demo (ported from a
// Claude artifact), register it here and the detail page hero uses it instead of
// the generic category thumbnail. Add new mocks as skills get their own artifacts.

import type { ComponentType } from "react";
import RankTrackerMock from "./RankTrackerMock";
import CompetitorRankMock from "./CompetitorRankMock";
import SeoAuditMock from "./SeoAuditMock";
import SeoReportMock from "./SeoReportMock";
import AiTrafficReportMock from "./AiTrafficReportMock";
import KeywordCannibalizationMock from "./KeywordCannibalizationMock";
import TechnicalSeoAuditMock from "./TechnicalSeoAuditMock";

// Rich hero-slot mocks (right column of the detail hero).
export const HERO_MOCKS: Record<string, ComponentType> = {
  "keyword-rank-tracker": RankTrackerMock,
  "competitor-rank-watch": CompetitorRankMock,
};

// "See it in action" (second section) mocks — used for larger, scrollable
// outputs that don't belong in the hero. When present, replaces OutputPreview.
export const OUTPUT_MOCKS: Record<string, ComponentType> = {
  "seo-audit": SeoAuditMock,
  "seo-report-generator": SeoReportMock,
  "ai-traffic-report": AiTrafficReportMock,
  "keyword-cannibalization": KeywordCannibalizationMock,
  "technical-seo-audit": TechnicalSeoAuditMock,
};
