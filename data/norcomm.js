/* =============================================================================
 * NORCOMM — dispatch center data (matches the Figma design exactly)
 * =============================================================================
 * This file IS the diagram. The UI reads this object and draws everything from
 * it. To add a new dispatch center later, copy data/_template.js, fill it in,
 * and point index.html at your new file. You never touch the UI code.
 *
 * COORDINATE SYSTEM
 *   The "stage" is 2002 x 1303 units — the Figma frame's diagram area. Every
 *   x/y is a TOP-LEFT position in that space, straight from Figma. The app
 *   scales the whole stage to fit the screen, so you think in Figma pixels.
 *
 * CONNECTORS
 *   The curved lines and dashed zone outlines are the actual vectors exported
 *   from Figma (in the /assets folder). We position each at its Figma spot so
 *   the layout is pixel-faithful rather than approximated.
 *
 * LAYERS
 *   Every element lists the layer ids it belongs to. Turn a layer off in the
 *   panel and everything tagged with only-hidden layers fades out.
 * ========================================================================== */

window.DISPATCH_CENTER = {
  // ---- Center metadata (header) --------------------------------------------
  meta: {
    id: "norcomm",
    name: "NORCOMM",
    location: "Regional 911 / Dispatch Center",
    visitDate: "2026",
    summary:
      "A combined 911 and non-emergency dispatch center handling call intake, " +
      "CAD entry, and separate fire/EMS and police dispatch workflows.",
    // Header tags. Each can be a plain string or { label, tone, icon }.
    // tone drives the color-code chip: location | agency | size | neutral.
    tags: [
      { label: "Bellevue, WA", tone: "location", icon: "map-pin" },
      { label: "Consolidated Agency (call taking + police + fire dispatch)", tone: "agency", icon: "building" },
      { label: "US Medium-size center", tone: "size", icon: "bar-chart" },
    ],
  },

  // ---- Layers (the toggle list on the right) --------------------------------
  layers: [
    { id: "departments",    label: "Departments",    color: "neutral", on: true },
    { id: "people",         label: "People & Roles", color: "slate",   on: true },
    { id: "resources",      label: "Resources",      color: "blue",    on: true },
    { id: "technology",     label: "Technology",     color: "sage",    on: true },
    { id: "communications", label: "Communications", color: "pink",    on: true },
    { id: "flow",           label: "Incident Flow",  color: "flow",    on: true },
    { id: "annotations",    label: "Annotations",    color: "neutral", on: true },
  ],

  // ---- Connectors (EXACT Figma vectors from /assets) ------------------------
  // Every line below is a real vector exported from the Figma Dev Mode server —
  // asset = the file's hash in /assets, x/y = top-left in stage units (straight
  // from Figma), w/h = the SVG's own viewBox size. Layer is assigned by the
  // vector's stroke color in Figma:
  //   tan  #C7C0B8 -> departments (zone outlines)
  //   pink #B866A3 -> communications
  //   gray #929292 -> flow (incident routing)
  // NOTE: new dispatch centers do NOT need to export SVGs — they can draw lines
  // with the data-driven `edges` array instead (see data/_template.js). These
  // exported vectors exist so NORCOMM is pixel-faithful to its Figma frame.
  connectors: [
    // --- Dashed zone outlines (tan #C7C0B8) --------------------------------
    { asset: "d67d82e93c03f51272fa8d191dc6ef4b8d75ef60", x: 371.7, y: 435.74, w: 256,     h: 337,     layers: ["departments"] }, // CALL zone
    { asset: "7917c1f242658c7fe829b9ddf59c5ec9b0bb54b6", x: 1072,  y: 225.29, w: 434.72,  h: 314.6,   layers: ["departments"] }, // POLICE zone
    { asset: "d7f64c5d1c0b100677846f9a6513346039079cb4", x: 962,   y: 630,    w: 550,     h: 269,     layers: ["departments"] }, // FIRE zone

    // --- Pink dashed communication paths (#B866A3) -------------------------
    { asset: "5130b94759cb0490f49a234a889a98f7ec14b54f", x: 76.92,  y: 204.75, w: 885.08,  h: 742.528, layers: ["communications"] }, // big call loop
    { asset: "90e9eef41cc18b7fadee386b28ed03f01728faba", x: 256,    y: 547,    w: 192.5,   h: 5.774,   layers: ["communications"] }, // 911 telephone
    { asset: "1c8b1d9a260fe8e9fca319a67c2f20bc3531e393", x: 302,    y: 673,    w: 143,     h: 1,       layers: ["communications"] }, // non-emergency telephone
    { asset: "e7b6544c35de5a4628a0fe28937849db59c62aee", x: 251.08, y: 557.5,  w: 196.915, h: 115.679, layers: ["communications"] },
    { asset: "fada462644d6da559227d48e5ccda08b0b16aa38", x: 501.5,  y: 232.5,  w: 205.5,   h: 201,     layers: ["communications"] }, // supervisor
    { asset: "6e62f17f8b41deb30adeddfaeaeaa0e3be2e8ffa", x: 654.31, y: 232.5,  w: 417.171, h: 207.508, layers: ["communications"] }, // supervisor -> dispatch
    { asset: "0adb58747a2d1adadfca2cb4e00a3aa10b2a2060", x: 1136.5, y: 91.55,  w: 569,     h: 154.447, layers: ["communications"] }, // data radio (long)
    { asset: "b65097af25c1c5b328a74d0bdaccfa590d93ea10", x: 1076.1, y: 141,    w: 138.601, h: 159,     layers: ["communications"] }, // data radio (elbow)
    { asset: "8b4ec6d8cbf9fe3ba658ed91f380f84f92b6c191", x: 1493.5, y: 442.5,  w: 330.5,   h: 70.298,  layers: ["communications"] }, // police radio
    { asset: "d7ad8785695fede9a4147719d38acc3e2e309063", x: 1489,   y: 249.3,  w: 208.5,   h: 67.688,  layers: ["communications"] }, // police radio
    { asset: "72bed7425050adad15e131c0aefe0d6fb7309c88", x: 885,    y: 814.5,  w: 597.983, h: 388.216, layers: ["communications"] }, // fire radio (long)
    { asset: "c0e108e80afad39d8bc0d71b72e4cb520dc5e065", x: 1018.5, y: 814,    w: 465.443, h: 346.787, layers: ["communications"] }, // fire radio

    // --- Solid incident-flow connectors (gray #929292) --------------------
    { asset: "98de82c9b8c3ffcecf886825e0042f259ba29a6e", x: 556.34, y: 543.87, w: 233.179, h: 51.877,  layers: ["flow"] }, // 911 receiver -> CAD
    { asset: "e788e2111288aa54f77f5816f3ed548f6e73cac8", x: 556.68, y: 592.37, w: 233.16,  h: 83.753,  layers: ["flow"] }, // non-emergency -> CAD
    { asset: "967d65e5ece71783e867960d40f8f8b0859c4f6d", x: 921,    y: 448,    w: 170.5,   h: 143,     layers: ["flow"] }, // CAD -> police
    { asset: "467ce836ef87fed63d910b36397cb3e2f9907162", x: 920.5,  y: 589.5,  w: 80,      h: 108.239, layers: ["flow"] }, // CAD -> fire
    { asset: "5421e21a8c7fe094c2f8cc60820f77252250903c", x: 1114,   y: 762.5,  w: 250.454, h: 54.447,  layers: ["flow"] }, // pitch -> receive
    { asset: "d868c4e2a96e8120b7147d7a31165cf57e775b66", x: 835,    y: 815.5,  w: 363.398, h: 212.854, layers: ["flow"] }, // fire dispatch -> resources
    { asset: "8da5017ed96a81cca000df0e516edaf7dc994086", x: 970.99, y: 815.5,  w: 227.654, h: 212.331, layers: ["flow"] }, // fire dispatch -> resources
    { asset: "83be43a2ca9d9dfc18d3e320b529828b6fd92905", x: 884.5,  y: 817,    w: 414.588, h: 232,     layers: ["flow"] }, // fire dispatch -> resources
    { asset: "5d4ab1e324fdd05adb335c77b570e18d52d64735", x: 1035.5, y: 817,    w: 264.006, h: 282.17,  layers: ["flow"] }, // fire dispatch -> resources
    { asset: "789ea52389c2fff2cc3bae0c553f8bafabbbe30f", x: 1188,   y: 255.5,  w: 142.5,   h: 55.5,    layers: ["flow"] }, // data -> police CAD
    { asset: "400a7b6eb02fade51c705654d5a891c984611f8b", x: 1508.5, y: 296.08, w: 171,     h: 96.056,  layers: ["flow"] }, // police -> patrol
    { asset: "5785ad735b459faaec50cea4d6aceeecaa973f16", x: 1508.5, y: 385.9,  w: 298,     h: 63.963,  layers: ["flow"] }, // police -> patrol
  ],

  // ---- Nodes (clickable; rendered as HTML on top of the connectors) ---------
  // type:  circle (roles) | octagon (field resources) | system (CAD boxes)
  // fill:  visual color that matches Figma (slate | blue | sage)
  // category: drives ONLY the detail-panel accent color (per the concept doc's
  //           color coding) — the shape's fill stays faithful to Figma.
  nodes: [
    // Call intake
    {
      id: "call-911", type: "circle", fill: "slate", label: "911 Call Receiver",
      x: 447.66, y: 489.84, w: 108.68, h: 108.68, category: "neutral", layers: ["people"],
      detail: {
        subtitle: "Call intake",
        systems: ["CAD (digital command & control software)", "Telephone"],
        responsibilities: [
          "Answers incoming 911 emergency calls.",
          "Gathers incident information from the caller.",
          "Enters the information into CAD for dispatchers.",
        ],
        notes: ["Communicates with dispatchers through CAD."],
      },
    },
    {
      id: "call-nonemergency", type: "circle", fill: "slate",
      label: "Non-emergency Call Receiver",
      x: 447.66, y: 618.74, w: 108.68, h: 108.68, category: "neutral", layers: ["people"],
      detail: {
        subtitle: "Call intake",
        systems: ["CAD (digital command & control software)", "Telephone"],
        responsibilities: ["Answers non-emergency calls.", "Enters information into CAD."],
        notes: ["Non-emergency call takers sometimes take 911 calls when it is busy."],
      },
    },

    // Supervisor
    {
      id: "supervisor", type: "circle", fill: "slate", label: "Supervisor",
      x: 707, y: 175, w: 121.08, h: 121.08, category: "neutral", layers: ["people"],
      detail: {
        subtitle: "Floor oversight",
        responsibilities: ["Oversees the floor and coordinates staff."],
        notes: ["Communicates verbally / in person with call receivers."],
      },
    },

    // Data
    {
      id: "data", type: "circle", fill: "slate", label: "Data",
      x: 1056, y: 60, w: 80.08, h: 80.08, category: "data", layers: ["people"],
      detail: {
        subtitle: "Data support role",
        responsibilities: [
          "Helps with additional research for officers when police dispatchers are too busy.",
        ],
      },
    },

    // Police dispatch
    {
      id: "police-1", type: "circle", fill: "slate", label: "Police Dispatch 1",
      x: 1153, y: 301, w: 132, h: 132, category: "police", layers: ["people"],
      detail: {
        subtitle: "Police dispatch (split by region)",
        systems: ["CAD (digital command & control software)", "Radio"],
        responsibilities: [
          "Assigns and dispatches officers to incidents.",
          "Updates officers' status.",
          "Provides what officers need — warrant checks, additional info.",
          "Dispatches and updates officers patrolling or on duty.",
          "Checks on responders and answers radio transmissions.",
        ],
        notes: [
          "Police roles are split by geography / region.",
          "On-duty/patrol officers are separate from officers available to be " +
            "assigned to an incident.",
        ],
      },
    },
    {
      id: "police-2", type: "circle", fill: "slate", label: "Police Dispatch 2",
      x: 1298.6, y: 301, w: 131.56, h: 131.56, category: "police", layers: ["people"],
      detail: {
        subtitle: "Police dispatch (split by region)",
        systems: ["CAD (digital command & control software)", "Radio"],
        responsibilities: [
          "Assigns and dispatches officers to incidents in their region.",
          "Updates officer status and relays needed information.",
        ],
        notes: ["Which dispatcher handles a call is dependent on location."],
      },
    },

    // Fire dispatch
    {
      id: "fire-pitch", type: "circle", fill: "slate", label: "Fire Dispatch 2 (pitch)",
      x: 1000, y: 684, w: 131.56, h: 131.56, category: "fire", layers: ["people"],
      detail: {
        subtitle: "Fire dispatch — Pitch role",
        systems: ["CAD (digital command & control software)"],
        responsibilities: [
          "Assesses the incident.",
          "Uses CAD to determine which units to send.",
          "Attaches units to the incident.",
          "Selects the radio channel used for the incident.",
        ],
      },
    },
    {
      id: "fire-receive", type: "circle", fill: "slate", label: "Fire Dispatch 1 (receive)",
      x: 1348, y: 697, w: 131.56, h: 131.56, category: "fire", layers: ["people"],
      detail: {
        subtitle: "Fire dispatch — Receive role",
        systems: ["CAD (digital command & control software)", "Radio"],
        responsibilities: [
          "Takes the incident from the Pitch role and reads the CAD incident.",
          "Gets a full picture of what is happening.",
          "Transmits to units and explains the situation.",
          "Provides information responders need to reach the location.",
          "Monitors the incident and updates unit status.",
        ],
      },
    },

    // CAD system boxes
    {
      id: "cad-central", type: "system", fill: "sage",
      label: "digital command & control software",
      x: 789, y: 564, w: 133, h: 50, category: "system", layers: ["technology"],
      detail: {
        subtitle: "CAD system",
        notes: [
          "CAD is used for record-keeping and dispatching.",
          "Call takers and dispatchers communicate through CAD.",
        ],
      },
    },
    {
      id: "cad-police", type: "system", fill: "sage",
      label: "digital command & control software",
      x: 1121, y: 206, w: 133, h: 50, category: "system", layers: ["technology"],
      detail: { subtitle: "CAD system (police)", notes: ["Shared CAD system."] },
    },
    {
      id: "cad-fire", type: "system", fill: "sage",
      label: "digital command & control software",
      x: 1179, y: 767, w: 133, h: 50, category: "system", layers: ["technology"],
      detail: { subtitle: "CAD system (fire)", notes: ["Shared CAD system."] },
    },

    // Field resources (octagons)
    {
      id: "patrol-1", type: "octagon", fill: "blue", icon: "shield",
      label: "police on-duty/patrol",
      x: 1679.89, y: 236, w: 126.698, h: 126.698, category: "police", layers: ["resources"],
      detail: { subtitle: "Field resource", notes: ["Officers on duty / patrol, reached by radio."] },
    },
    {
      id: "patrol-2", type: "octagon", fill: "blue", icon: "car",
      label: "police on-duty/patrol",
      x: 1807, y: 383, w: 126.698, h: 126.698, category: "police", layers: ["resources"],
      detail: { subtitle: "Field resource", notes: ["Officers on duty / patrol, reached by radio."] },
    },
    {
      id: "res-fire", type: "octagon", fill: "blue", icon: "flame", label: "fire resource(s)",
      x: 776, y: 1028, w: 126.7, h: 126.7, category: "fire", layers: ["resources"],
      detail: { subtitle: "Field resource", notes: ["Fire units dispatched to the incident."] },
    },
    {
      id: "res-ems", type: "octagon", fill: "blue", icon: "ambulance", label: "ems resource(s)",
      x: 909, y: 1028, w: 126.7, h: 126.7, category: "fire", layers: ["resources"],
      detail: { subtitle: "Field resource", notes: ["EMS / medical units dispatched to the incident."] },
    },
  ],

  // ---- Pills & labels (small text chips on the diagram) ---------------------
  // kind: comm (pink) | c911 (red) | nonemergency (yellow) | zonelabel (white)
  //       | flowlabel (white) | annotation (italic gray)
  pills: [
    // Intake
    { text: "911",           kind: "c911",         x: 231,     y: 536,    w: 39,  h: 22, layers: ["flow"] },
    { text: "non-emergency", kind: "nonemergency", x: 195,     y: 661,    w: 112, h: 22, layers: ["flow"] },
    { text: "telephone",     kind: "comm",         x: 332,     y: 536,    w: 80,  h: 22, layers: ["communications"] },
    { text: "telephone",     kind: "comm",         x: 356,     y: 661,    w: 80,  h: 22, layers: ["communications"] },

    // Communications
    { text: "verbally in person", kind: "comm",     x: 575,    y: 227,    w: 125, h: 22, layers: ["communications"] },
    { text: "radio",         kind: "comm",         x: 1438,    y: 105,    w: 49,  h: 22, layers: ["communications"] },
    { text: "radio",         kind: "comm",         x: 1560,    y: 247,    w: 49,  h: 22, layers: ["communications"] },
    { text: "radio",         kind: "comm",         x: 1560,    y: 472,    w: 49,  h: 22, layers: ["communications"] },
    { text: "radio",         kind: "comm",         x: 1447,    y: 935,    w: 49,  h: 22, layers: ["communications"] },

    // Zone labels (sit on the dashed outlines)
    { text: "CALL",          kind: "zonelabel",    x: 471.7,   y: 752.74, w: 55,  h: 36, layers: ["departments"] },
    { text: "POLICE",        kind: "zonelabel",    x: 1257,    y: 522,    w: 69,  h: 36, layers: ["departments"] },
    { text: "FIRE",          kind: "zonelabel",    x: 1235.7,  y: 612.74, w: 46,  h: 36, layers: ["departments"] },

    // Flow labels
    { text: "police incident",     kind: "flowlabel", x: 997,  y: 522,    w: 109, h: 24, layers: ["flow"] },
    { text: "fire or ems incident",kind: "flowlabel", x: 903,  y: 633,    w: 138, h: 22, layers: ["flow"] },

    // Annotations (italic)
    { text: "(1-3 call receivers)",     kind: "annotation", x: 448,     y: 781, w: 130, h: 16, layers: ["annotations"] },
    { text: "(2-4 police dispatchers)", kind: "annotation", x: 1225,    y: 551, w: 160, h: 16, layers: ["annotations"] },
    { text: "(2-3 fire dispatchers)",   kind: "annotation", x: 1192,    y: 644, w: 140, h: 16, layers: ["annotations"] },
    { text: "dependent on location",    kind: "annotation", x: 1221.94, y: 450, w: 150, h: 16, layers: ["annotations"] },
  ],

  // ---- Staff distribution (annotation card under the layer panel) -----------
  staff: {
    layers: ["annotations"],
    summary: "9–12 people on the floor per shift",
    breakdown: ["1–3 call takers", "2–4 police dispatchers", "2–3 fire dispatchers"],
  },
};
