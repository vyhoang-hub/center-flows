/* =============================================================================
 * Harbor Point — PLACEHOLDER center
 * =============================================================================
 * Scaffolding, not research. It exists so you can see how a second center looks
 * on the home page and what a center page shows before anything is documented.
 *
 * When a real site visit replaces it:
 *   1. Rename this file and change `meta.id` (the id is the URL: #/c/<id>).
 *   2. Set `meta.status` to "documented" — that swaps the muted "Placeholder"
 *      badge on the home card for an artifact count.
 *   3. Fill in `research`, deleting any section you have nothing for; an empty
 *      or missing section renders a hint naming the field to fill in.
 *   4. Add a mental-model diagram by copying data/_template.js — the nodes /
 *      connectors / layers keys, plus a `research.mentalModels` entry with
 *      `view: "diagram"`.
 *
 * `layers: []` is required even with no diagram: the layer panel iterates it.
 * ========================================================================== */

window.CENTER_HARBOR_POINT = {
  meta: {
    id: "harbor-point",
    name: "Harbor Point Communications",
    location: "Consolidated 911 Center",
    visitDate: "Not yet visited",
    geo: { country: "United States", region: "Oregon", city: "Placeholder city" },
    status: "placeholder",
    summary:
      "Placeholder center. Replace this file with a real site visit — the home " +
      "page picks it up automatically.",
    tags: [
      { label: "Placeholder location", tone: "location", icon: "map-pin" },
      { label: "Placeholder agency type", tone: "agency", icon: "building" },
    ],
  },

  layers: [],

  research: {
    overview: {
      sections: [
        {
          heading: "Why this center",
          text:
            "Placeholder: what makes this center worth studying, and how it " +
            "differs from the others already documented.",
        },
        {
          heading: "Visit plan",
          items: [
            "Placeholder: who to observe",
            "Placeholder: which shifts to cover",
            "Placeholder: what to bring back",
          ],
        },
      ],
    },
    // The other sections are intentionally left out so you can see the empty
    // state each tab shows before it has content.
  },
};

(window.RESEARCH_CENTERS = window.RESEARCH_CENTERS || []).push(window.CENTER_HARBOR_POINT);
