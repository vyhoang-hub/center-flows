/* =============================================================================
 * TEMPLATE — copy this file to add a new center to the research hub.
 * =============================================================================
 * STEPS
 *   1. Copy this file, e.g. data/springfield.js
 *   2. Fill in the fields below (delete the example rows you don't need).
 *   3. Add one line to index.html next to the other data files:
 *        <script src="data/springfield.js"></script>
 *   4. Double-click index.html to preview. The center appears on the home page
 *      under its country/region, at #/c/<meta.id>.
 *
 * This file is NOT bundled — build.sh skips data/_template.js.
 *
 * WHAT A CENTER IS
 *   One object holding everything from one site visit: the metadata that places
 *   it on the home page, an optional interactive diagram (layers / nodes / edges
 *   / pills), and a `research` block for the other tabs. Every part is optional —
 *   a center with only `meta` still works, it just shows empty states.
 *
 * See data/norcomm.js for a complete, real-world example you can imitate, and
 * data/harbor-point.js for the smallest useful placeholder.
 *
 * TWO WAYS TO DRAW LINES
 *   - `edges`      : data-drawn curves between two nodes (from/to). No Figma
 *                    export needed. THIS IS THE EASY PATH — use it for new
 *                    centers. The example below uses only edges.
 *   - `connectors` : exact SVG vectors exported from a Figma frame, positioned
 *                    by hand. NORCOMM uses these to stay pixel-faithful to its
 *                    design. You only need them if you're matching a specific
 *                    Figma layout. (Omit the array entirely if you're not.)
 *
 * COORDINATE SYSTEM
 *   The stage is 2210 wide x 1303 tall. A node/zone x/y is its TOP-LEFT corner
 *   in that space, and w/h is its size. Edges connect node CENTERS automatically
 *   (computed from x/y + w/h), so you only ever position the boxes.
 * ========================================================================== */

/* Give this a name unique to your center — each data file gets its own global so
   two centers can't overwrite each other. */
window.CENTER_TEMPLATE = {
  meta: {
    id: "REPLACE-ME",                 // short unique id, no spaces — it's the URL
    name: "Center Name",
    location: "Regional 911 / Dispatch Center",   // what kind of center it is
    visitDate: "2026",
    // Where it sits on the home page. Centers are grouped by country, then by
    // region; `city` shows on the card only.
    geo: { country: "Country", region: "State / Province", city: "City" },
    status: "documented",             // "documented" | "placeholder"
    summary: "One or two sentences describing this center.",
    // tone drives the pill color: location | agency | size | neutral
    // icon is a Lucide key: shield car flame ambulance map-pin building
    //                       bar-chart radio phone message
    tags: [
      { label: "City, ST", tone: "location", icon: "map-pin" },
      { label: "Consolidated / standalone", tone: "agency", icon: "building" },
      { label: "Center size", tone: "size", icon: "bar-chart" },
    ],
  },

  // ===========================================================================
  // THE DIAGRAM (optional — delete everything down to `research` if this center
  // has no mental-model diagram yet, but keep `layers: []`).
  // ===========================================================================

  // The toggle list on the right. Keep ids stable — nodes/edges/zones use them.
  // color drives the layer dot only: neutral | slate | blue | sage | pink | flow
  layers: [
    { id: "departments",    label: "Departments",    color: "neutral", on: true },
    { id: "people",         label: "People & Roles", color: "slate",   on: true },
    { id: "resources",      label: "Resources",      color: "blue",    on: true },
    { id: "technology",     label: "Technology",     color: "sage",    on: true },
    { id: "communications", label: "Communications", color: "pink",    on: true },
    { id: "flow",           label: "Incident Flow",  color: "flow",    on: true },
    { id: "annotations",    label: "Annotations",    color: "neutral", on: true },
  ],

  // Big grouping outlines drawn from data (no SVG needed). Optional.
  //   x/y = top-left, w/h = size, color = a layer color name for the outline.
  zones: [
    { id: "call", label: "CALL", subtitle: "(1-3 call takers)",
      x: 360, y: 430, w: 260, h: 340, color: "neutral", layers: ["departments"] },
    // { id: "police", label: "POLICE", x: 1072, y: 225, w: 435, h: 315, ... },
  ],

  // The boxes/circles on the diagram.
  //   type:  circle (role) | resource (field resource) | system (CAD box)
  //   category: police | fire | data | system | neutral  (drives the accent
  //             color of the shape and of its detail panel)
  //   icon:      a Lucide key (see the list under meta.tags)
  //   iconAsset: an SVG exported to /assets — takes priority over `icon`
  //   glow:      an exported SVG blob drawn behind a `resource` node
  nodes: [
    {
      id: "call-911", type: "circle", label: "911 Call Receiver",
      x: 430, y: 500, w: 108, h: 108, category: "neutral", layers: ["people"],
      detail: {
        subtitle: "Call intake",
        systems: ["CAD", "Telephone"],
        responsibilities: ["Answers 911 calls.", "Enters info into CAD."],
        notes: ["Any observations from your visit."],
      },
    },
    {
      id: "cad", type: "system",
      label: "digital command & control software",
      x: 780, y: 530, w: 133, h: 50, category: "system", layers: ["technology"],
      detail: { subtitle: "CAD system", notes: ["Shared record-keeping / dispatch."] },
    },
    {
      id: "police-1", type: "circle", label: "Police Dispatch",
      x: 1150, y: 500, w: 132, h: 132, category: "police", layers: ["people"],
      detail: {
        subtitle: "Police dispatch",
        systems: ["CAD", "Radio"],
        responsibilities: ["Assigns and dispatches officers to incidents."],
      },
    },
    {
      id: "patrol", type: "resource", icon: "car",
      label: "police on-duty/patrol",
      x: 1500, y: 505, w: 126, h: 126, category: "police", layers: ["resources"],
      detail: { subtitle: "Field resource", notes: ["Reached by radio."] },
    },
  ],

  // Lines between nodes — drawn as curves from one node id to another.
  //   from / to : node ids           style : "solid" | "dashed"
  //   color     : comm (pink) | flow (gray) | neutral
  //   curve     : perpendicular bend in units (+/-), 0 = mostly straight
  //   arrow     : true (default) draws an arrowhead at `to`; false = plain line
  edges: [
    { from: "call-911", to: "cad",     label: "", style: "solid",  color: "flow", curve: 20,  layers: ["flow"] },
    { from: "cad",      to: "police-1",label: "", style: "solid",  color: "flow", curve: -20, layers: ["flow"] },
    { from: "police-1", to: "patrol",  label: "", style: "dashed", color: "comm", curve: 0,   layers: ["communications"] },
  ],

  // Small text chips on the diagram.
  //   kind: comm (pink) | c911 (red) | nonemergency (yellow)
  //         | zonelabel (white) | flowlabel (white) | annotation (italic gray)
  pills: [
    { text: "911",   kind: "c911", x: 300, y: 540, w: 39, h: 22, layers: ["flow"] },
    { text: "radio", kind: "comm", x: 1360, y: 545, w: 49, h: 22, layers: ["communications"] },
  ],

  // The "About this center" card floating over the diagram. Doubles as the
  // Overview tab's content when `research.overview` is absent, so you only
  // write it once. Sections can nest one level via `children`.
  about: {
    layers: ["annotations"],
    title: "About this center",
    sections: [
      {
        heading: "Staff distribution",
        text: "9-12 people on the floor per shift",
        items: ["1-3 call takers", "2-4 police dispatchers", "2-3 fire dispatchers"],
      },
      {
        heading: "Observations & notes",
        items: [
          { text: "Something you noticed:", children: ["A supporting detail."] },
        ],
      },
    ],
  },

  // ===========================================================================
  // RESEARCH — the center page's tabs. Every key is optional; a missing or empty
  // section renders a hint naming the field to fill in.
  // ===========================================================================
  research: {
    // Omit this to reuse the `about` sections above (recommended).
    // overview: { sections: [ { heading: "", text: "", items: [] } ] },

    // view:"diagram" means "this artifact is the interactive canvas". Without
    // it, entries render as plain cards.
    mentalModels: [
      { id: "floor-model", title: "Dispatch floor mental model",
        description: "How an incident moves across the floor.", view: "diagram" },
    ],

    personas: [
      {
        id: "persona-1",
        name: "Name or archetype",
        role: "What they do on the floor",
        shift: "Shift pattern",
        quote: "Something they actually said.",
        goals: ["What they're trying to achieve."],
        frustrations: ["What gets in the way."],
        tools: ["CAD", "Radio console"],
      },
    ],

    // Written workflows. The diagram belongs under mentalModels, not here.
    workflows: [
      {
        id: "workflow-1",
        title: "Call intake to unit assignment",
        description: "One sentence on what this workflow covers.",
        steps: ["First step.", "Second step.", "Third step."],
      },
    ],

    findings: [
      {
        id: "finding-1",
        title: "What you learned",
        impact: "high",              // high | medium | low — drives the badge
        detail: "Why it matters, in a sentence or two.",
        evidence: ["What you observed.", "What a participant said."],
      },
    ],

    supporting: [
      { id: "notes", title: "Site visit notes", kind: "note",
        description: "Where the raw material lives." },
      // kind: photo | note | transcript | artifact
    ],
  },
};

/* Register with the hub. This line is what makes the center appear on the home
   page — remember to change the global name to match the one above. */
(window.RESEARCH_CENTERS = window.RESEARCH_CENTERS || []).push(window.CENTER_TEMPLATE);
