/* =============================================================================
 * Riverside Regional — PLACEHOLDER center (second country)
 * =============================================================================
 * Scaffolding, not research. This one sits in a different country from the
 * others so the home page's Country → Region grouping is visible with real data
 * rather than only in theory.
 *
 * See data/harbor-point.js for the notes on turning a placeholder into a real
 * center, and data/_template.js for the full authorable shape.
 * ========================================================================== */

window.CENTER_RIVERSIDE = {
  meta: {
    id: "riverside",
    name: "Riverside Regional Communications",
    location: "Provincial Emergency Communications Centre",
    visitDate: "Not yet visited",
    geo: { country: "Canada", region: "British Columbia", city: "Placeholder city" },
    status: "placeholder",
    summary:
      "Placeholder center in a second country, included to show how the home " +
      "page groups centers by country and then by region.",
    tags: [
      { label: "Placeholder location", tone: "location", icon: "map-pin" },
      { label: "Placeholder agency type", tone: "agency", icon: "building" },
      { label: "Placeholder size", tone: "size", icon: "bar-chart" },
    ],
  },

  layers: [],

  research: {
    overview: {
      sections: [
        {
          heading: "Why this center",
          text:
            "Placeholder: what a comparison outside the first country would add " +
            "— different call volumes, staffing model, or radio infrastructure.",
        },
      ],
    },
    findings: [
      {
        id: "placeholder-finding",
        title: "Placeholder finding",
        impact: "low",
        detail:
          "One placeholder entry so you can see a populated tab sitting next to " +
          "empty ones. Delete it once real findings exist.",
        evidence: ["Placeholder evidence."],
      },
    ],
  },
};

(window.RESEARCH_CENTERS = window.RESEARCH_CENTERS || []).push(window.CENTER_RIVERSIDE);
