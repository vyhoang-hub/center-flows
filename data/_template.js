/* =============================================================================
 * TEMPLATE — copy this file to add a new dispatch center.
 * =============================================================================
 * STEPS
 *   1. Copy this file, e.g. data/springfield.js
 *   2. Fill in the fields below (delete the example rows you don't need).
 *   3. In index.html, change  <script src="data/norcomm.js">  to your new file.
 *   4. Double-click index.html to preview.
 *
 * See data/norcomm.js for a complete, real-world example you can imitate.
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
 *   The stage is 2002 wide x 1303 tall. A node/zone x/y is its TOP-LEFT corner
 *   in that space, and w/h is its size. Edges connect node CENTERS automatically
 *   (computed from x/y + w/h), so you only ever position the boxes.
 * ========================================================================== */

window.DISPATCH_CENTER = {
  meta: {
    id: "REPLACE-ME",                 // short unique id, no spaces
    name: "Center Name",
    location: "City / Region",
    visitDate: "2026",
    summary: "One or two sentences describing this center.",
    tags: ["Location: City, ST", "Consolidated / standalone", "Center size"],
  },

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
  //   type:  circle (role) | octagon (field resource) | system (CAD box)
  //   fill:  slate | blue | sage  (the shape's color)
  //   category: police | fire | data | system | neutral  (detail-panel accent)
  //   icon: optional emoji shown above the label (octagons)
  nodes: [
    {
      id: "call-911", type: "circle", fill: "slate", label: "911 Call Receiver",
      x: 430, y: 500, w: 108, h: 108, category: "neutral", layers: ["people"],
      detail: {
        subtitle: "Call intake",
        systems: ["CAD", "Telephone"],
        responsibilities: ["Answers 911 calls.", "Enters info into CAD."],
        notes: ["Any observations from your visit."],
      },
    },
    {
      id: "cad", type: "system", fill: "sage",
      label: "digital command & control software",
      x: 780, y: 530, w: 133, h: 50, category: "system", layers: ["technology"],
      detail: { subtitle: "CAD system", notes: ["Shared record-keeping / dispatch."] },
    },
    {
      id: "police-1", type: "circle", fill: "slate", label: "Police Dispatch",
      x: 1150, y: 500, w: 132, h: 132, category: "police", layers: ["people"],
      detail: {
        subtitle: "Police dispatch",
        systems: ["CAD", "Radio"],
        responsibilities: ["Assigns and dispatches officers to incidents."],
      },
    },
    {
      id: "patrol", type: "octagon", fill: "blue", icon: "🚔",
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

  // Optional staff-distribution card (shown under the layer panel).
  staff: {
    layers: ["annotations"],
    summary: "9-12 people on the floor per shift",
    breakdown: ["1-3 call takers", "2-4 police dispatchers", "2-3 fire dispatchers"],
  },
};
