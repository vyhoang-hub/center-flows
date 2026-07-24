/* =============================================================================
 * NORCOMM — dispatch center data (1:1 rebuild from Figma node 54:146 "norcomm-2")
 * =============================================================================
 * This file IS the diagram. The UI reads this object and draws everything from
 * it. To add a new dispatch center later, copy data/_template.js, fill it in,
 * and point index.html at your new file. You never touch the UI code.
 *
 * COORDINATE SYSTEM
 *   The "stage" is 2210 x 1303 units — the Figma frame's size. Every x/y is a
 *   TOP-LEFT position in that space, straight from Figma (no offsets). The app
 *   scales the whole stage to fit the screen, so you think in Figma pixels.
 *
 * CONNECTORS
 *   The curved lines and dashed zone outlines are the actual vectors exported
 *   from Figma (in /assets, named by their Figma asset hash). Each is placed at
 *   its exact Figma x/y with its own viewBox w/h.
 *
 * LAYERS  (match the data-annotations tags set in Figma)
 *   Every element lists the layer ids it belongs to. The incident-flow lines
 *   AND the incident annotations share ONE layer ("flow"), per the design.
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

  // ---- Regions (large soft background groupings) ----------------------------
  regions: [
    {
      asset: "inside-center-blob",           // organic blob (#F9F9F8) from Figma
      x: 314, y: 51, w: 1291.319, h: 909.204,
      label: "INSIDE THE CENTER", labelX: 841.92, labelY: 88.98,
      layers: ["departments"],
    },
    {
      label: "OUTSIDE THE CENTER", labelX: 1759, labelY: 960,
      x: 1759, y: 960, w: 0, h: 0,
      layers: ["departments"],
    },
  ],

  // ---- Connectors (EXACT Figma vectors from /assets) ------------------------
  // asset = Figma asset hash (file in /assets), x/y = top-left in stage units,
  // w/h = the SVG's own viewBox size. Layer assigned by stroke color:
  //   #C7C0B8 tan  -> departments (dashed zone outlines)
  //   #B866A3 pink -> communications
  //   #454141 dark -> flow (incident routing)  [was gray in the old frame]
  connectors: [
    // --- Dashed department zone outlines (tan #C7C0B8) ---------------------
    { asset: "a5bec082f2814941aff57337fba50048e4879e68", x: 356.78,  y: 456.74, w: 257,     h: 338,     layers: ["departments"] }, // CALL zone
    { asset: "de25eeb2ebe045b0eca193a6c1e573a0950c0dbf", x: 1057.08, y: 246.29, w: 435.72,  h: 315.6,   layers: ["departments"] }, // POLICE zone
    { asset: "d4dc96dd1c1d4204ad019380b07b8990fe157b3b", x: 947.08,  y: 651,    w: 551,     h: 270,     layers: ["departments"] }, // FIRE zone

    // --- Pink communication paths (#B866A3) --------------------------------
    { asset: "14727ee2ad7e12b2d46d5a56f58edc8f70ef1b23", x: 62,      y: 225.75, w: 885.58,  h: 743.526, layers: ["communications"] }, // big call loop
    { asset: "3cde38e0066d617e4cc83073e3bbcec307b2d3b2", x: 173,     y: 575,    w: 182.692, h: 67.338,  layers: ["communications"] }, // 911 telephone comm line
    { asset: "f50ecc3f5b5e5886e565ce3fbf962cfd3a77c1f0", x: 214.5,   y: 694,    w: 218.5,   h: 5.774,   layers: ["communications"] }, // non-emergency telephone comm line
    { asset: "c66be46b43f7ae646d79742fc72e3352f5f89e84", x: 1474.08, y: 271.24, w: 318,     h: 66.914,  layers: ["communications"] }, // data radio (long)
    { asset: "ca0625eedf726efb58c7e0e53b549ecba79bad89", x: 1121.58, y: 112.86, w: 674.5,   h: 155.139, layers: ["communications"] }, // data radio arc
    { asset: "5d0fccb56acee71c594d6c0ac4082c599dd077ca", x: 639.39,  y: 253.5,  w: 417.171, h: 207.508, layers: ["communications"] }, // supervisor -> police dispatch
    { asset: "fada462644d6da559227d48e5ccda08b0b16aa38", x: 486.58,  y: 253.5,  w: 205.5,   h: 201,     layers: ["communications"] }, // supervisor -> call receivers
    { asset: "ee21d888b5c0810bfb38ccead9245091ee86a3b4", x: 1003.58, y: 835,    w: 464.079, h: 347.168, layers: ["communications"] }, // fire radio
    { asset: "c3489db0dc3d7aafc17b15573c8c66bcb9147b9a", x: 870.08,  y: 835.5,  w: 597.983, h: 388.216, layers: ["communications"] }, // fire radio (long)
    { asset: "8b4ec6d8cbf9fe3ba658ed91f380f84f92b6c191", x: 1478.58, y: 463.5,  w: 330.5,   h: 70.298,  layers: ["communications"] }, // police radio

    // --- Inter-department "verbally in person" comm loop (pink, from Figma) --
    { asset: "5bde06ce78e133eef735ea91acb00adf98e685fb", x: 550.5,  y: 771.5,   w: 440,     h: 107.776, layers: ["communications"] }, // fire <-> call (Vector 16)
    { asset: "122fbad8940805ba1b1765c600fcea95dc0bfda5", x: 1439,   y: 488,     w: 34.5,    h: 215,     layers: ["communications"] }, // police <-> fire (Vector 17)
    { asset: "ed11163107ac97a3f6eab53a9dac1516b63bc42d", x: 600.5,  y: 450.566, w: 465,     h: 103.703, layers: ["communications"] }, // call <-> police (Vector 18)

    // --- Dark incident-flow connectors (#454141) --------------------------
    { asset: "3b602bf4e2c989c82aec549f3bdd6485fcdb19c5", x: 605,     y: 565.31, w: 169.58,  h: 51.439,  layers: ["flow"] }, // 911 receiver -> CAD
    { asset: "5071df4a3eec7f96c1384921bbc7e55da364c974", x: 605,     y: 613.37, w: 169.92,  h: 76.508,  layers: ["flow"] }, // non-emergency -> CAD
    { asset: "c7f2d8c97684b2fe3885c87dc4de60f04f8cc399", x: 906.08,  y: 469,    w: 170.5,   h: 143,     layers: ["flow"] }, // CAD -> police
    { asset: "416e5ebe4de4a578ddbe37fb1060d3086b4258e0", x: 905.58,  y: 610.5,  w: 80,      h: 108.239, layers: ["flow"] }, // CAD -> fire
    { asset: "260da7be6b30a105c4a80b74f8264666a4abcf7f", x: 1173.08, y: 276.5,  w: 142.5,   h: 55.5,    layers: ["flow"] }, // data -> police CAD
    { asset: "fc7f55d8d8137d2d970f8b1f9da73fefeda253b8", x: 1061.18, y: 162,    w: 138.601, h: 159,     layers: ["flow"] }, // data elbow
    { asset: "e34446a102e90f8dfc5126b447c571c4588cd22a", x: 1099.08, y: 783.5,  w: 250.549, h: 54.915,  layers: ["flow"] }, // pitch -> receive
    { asset: "3c18c789b42e03e05530d55d96a1eafda10c9c4e", x: 820.08,  y: 836.5,  w: 363.398, h: 212.854, layers: ["flow"] }, // fire dispatch -> resources
    { asset: "65ca9e9a4f697b1d998355b3ae4e991b443a6c0d", x: 956.07,  y: 836.5,  w: 227.654, h: 212.331, layers: ["flow"] }, // fire dispatch -> resources
    { asset: "8e3e295c684357ab1dbceb83204b42cdb7f91e4a", x: 869.58,  y: 838,    w: 414.588, h: 232,     layers: ["flow"] }, // fire dispatch -> resources
    { asset: "6b192727f8acd1b9cee6f9541cfe0dbaf6fc947c", x: 1020.58, y: 838,    w: 264.006, h: 282.17,  layers: ["flow"] }, // fire dispatch -> resources
    { asset: "5a4bfb8f0f632344968a1a8d0846ad41e7ad7f73", x: 1493.58, y: 407.5,  w: 298,     h: 81.995,  layers: ["flow"] }, // police -> patrol
    { asset: "38202b6335845b278f288e95a4e1fc66d6706183", x: 1493.58, y: 301.63, w: 297.5,   h: 111.533, layers: ["flow"] }, // police -> resource

    // --- Intake tap lines into the call receivers (dark #454141) ----------
    { asset: "adf74ffaa4fc4c63fd21d1f236c054f1c473d0da", x: 174.5,   y: 554.87, w: 193,     h: 31.529,  layers: ["flow"] }, // 911 tag -> loop
    { asset: "e4f3f9ef7dcfccde2642ff52e141bfc9d6697cab", x: 193.5,   y: 695.43, w: 190.5,   h: 53.313,  layers: ["flow"] }, // non-emergency tag -> loop
  ],


  // ---- Nodes (clickable; rendered as HTML on top of the connectors) ---------
  // type:  circle (roles) | resource (soft-glow field resources) | system (CAD)
  // glow:  soft blurred blob asset behind a resource node (Figma)
  // iconAsset: an exported SVG icon (Phosphor, from Figma) drawn on the node
  nodes: [
    // Call intake
    {
      id: "call-911", type: "circle", label: "911 Call Receiver",
      x: 432.74, y: 510.84, w: 108.68, h: 108.68, category: "neutral", layers: ["people"],
      detail: {
        subtitle: "Call intake",
        systems: ["CAD (digital command & control software)", "Telephone"],
        responsibilities: [
          "Answers incoming 911 emergency calls.",
          "Gathers incident information from the caller.",
          "Enters the information into CAD for dispatchers.",
        ],
        notes: [
          "Call receivers and dispatchers collaborate on an incident through " +
            "CAD — but can also talk in person or by any other communication " +
            "method if it's urgent.",
        ],
      },
    },
    {
      id: "call-nonemergency", type: "circle", label: "Non-emergency Call Receiver",
      x: 432.74, y: 639.74, w: 108.68, h: 108.68, category: "neutral", layers: ["people"],
      detail: {
        subtitle: "Call intake",
        systems: ["CAD (digital command & control software)", "Telephone"],
        responsibilities: ["Answers non-emergency calls.", "Enters information into CAD."],
        notes: ["Non-emergency call takers sometimes take 911 calls when it is busy."],
      },
    },

    // Supervisor
    {
      id: "supervisor", type: "circle", label: "Supervisor",
      x: 692.08, y: 196, w: 121.08, h: 121.08, category: "neutral", layers: ["people"],
      detail: {
        subtitle: "Floor oversight",
        responsibilities: [
          "Oversees the floor and coordinates staff.",
          "Helps with any issues the staff on the floor encounter — barging " +
            "into calls, helping make decisions, and so on.",
        ],
        notes: ["Communicates verbally / in person with call receivers."],
      },
    },

    // Data
    {
      id: "data", type: "circle", label: "Data",
      x: 1041.08, y: 81, w: 80.08, h: 80.08, category: "data", layers: ["people"],
      detail: {
        subtitle: "Data support role",
        responsibilities: [
          "Helps with additional research for officers when police dispatchers are too busy.",
        ],
      },
    },

    // Police dispatch
    {
      id: "police-1", type: "circle", label: "Police Dispatch 1",
      x: 1138.08, y: 322, w: 132, h: 132, category: "police", layers: ["people"],
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
          "Police Dispatch 1 and 2 do the same job — just for different regions " +
            "of their jurisdiction.",
          "On-duty/patrol officers are separate from officers available to be " +
            "assigned to an incident.",
        ],
      },
    },
    {
      id: "police-2", type: "circle", label: "Police Dispatch 2",
      x: 1283.68, y: 322, w: 131.56, h: 131.56, category: "police", layers: ["people"],
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
          "Police Dispatch 1 and 2 do the same job — just for different regions " +
            "of their jurisdiction.",
          "On-duty/patrol officers are separate from officers available to be " +
            "assigned to an incident.",
        ],
      },
    },

    // Fire dispatch
    {
      id: "fire-pitch", type: "circle", label: "Fire Dispatch 2 (pitch)",
      x: 985.08, y: 705, w: 131.56, h: 131.56, category: "fire", layers: ["people"],
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
      id: "fire-receive", type: "circle", label: "Fire Dispatch 1 (receive)",
      x: 1333.08, y: 718, w: 131.56, h: 131.56, category: "fire", layers: ["people"],
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

    // CAD system boxes (sage #6E936E, 133x50, rounded 4)
    {
      id: "cad-central", type: "system", label: "digital command & control software",
      x: 774.08, y: 585, w: 133, h: 50, category: "system", layers: ["technology"],
      detail: {
        subtitle: "CAD system",
        notes: [
          "CAD is used for record-keeping and dispatching.",
          "Call takers and dispatchers collaborate on an incident through CAD — " +
            "they can also talk in person or by any other communication method " +
            "if it's urgent.",
        ],
      },
    },
    {
      id: "cad-police", type: "system", label: "digital command & control software",
      x: 1106.08, y: 227, w: 133, h: 50, category: "system", layers: ["technology"],
      detail: { subtitle: "CAD system (police)", notes: ["Shared CAD system."] },
    },
    {
      id: "cad-fire", type: "system", label: "digital command & control software",
      x: 1164.08, y: 788, w: 133, h: 50, category: "system", layers: ["technology"],
      detail: { subtitle: "CAD system (fire)", notes: ["Shared CAD system."] },
    },

    // Field resources — soft glow blobs + Phosphor icon + label (Figma)
    {
      id: "res-police", type: "resource", label: "Police resource(s)",
      glow: "glow-police", iconAsset: "ph-policecar",
      x: 1792.08, y: 235, w: 126.698, h: 126.698, category: "police", layers: ["resources"],
      detail: { subtitle: "Field resource", notes: ["Police units available to be dispatched, reached by radio."] },
    },
    {
      id: "res-patrol", type: "resource", label: "Police on-duty/patrol",
      glow: "glow-patrol", iconAsset: "ph-siren",
      x: 1792.08, y: 404, w: 126.698, h: 126.698, category: "police", layers: ["resources"],
      detail: {
        subtitle: "Field resource",
        notes: [
          "Officers on duty / patrol, reached by radio.",
          "Transmit to dispatchers when they pull someone over to ask for " +
            "information look-ups — warrants, identification, running license " +
            "plates, etc.",
        ],
      },
    },
    {
      id: "res-fire", type: "resource", label: "Fire resource(s)",
      glow: "glow-fire", iconAsset: "ph-fire",
      x: 761.08, y: 1049, w: 126.7, h: 126.7, category: "fire", layers: ["resources"],
      detail: { subtitle: "Field resource", notes: ["Fire units dispatched to the incident."] },
    },
    {
      id: "res-ems", type: "resource", label: "EMS resource(s)",
      glow: "glow-ems", iconAsset: "ph-firetruck",
      x: 894.08, y: 1049, w: 126.7, h: 126.7, category: "fire", layers: ["resources"],
      detail: { subtitle: "Field resource", notes: ["EMS / medical units dispatched to the incident."] },
    },
  ],

  // ---- Pills & labels (small text chips on the diagram) ---------------------
  // kind: comm (pink) | c911 (red outline) | nonemergency (yellow outline)
  //       | zonelabel | flowlabel  ; iconAsset = exported Phosphor icon
  pills: [
    // Intake tags — OUTLINE style (white fill, colored border+text) per Figma.
    // Empty layers = ALWAYS visible; they must not disappear with Incident Flow.
    { text: "911",           kind: "c911",         x: 139,     y: 557,    w: 40,  h: 22, layers: [] },
    { text: "non-emergency", kind: "nonemergency", x: 103,     y: 682,    w: 115, h: 22, layers: [] },

    // Communications pills (pink #B866A3) with Phosphor icons
    { text: "telephone", kind: "comm", iconAsset: "ph-phone",     x: 246,  y: 682,  w: 96,  h: 22, layers: ["communications"] },
    { text: "telephone", kind: "comm", iconAsset: "ph-phone",     x: 194,  y: 602,  w: 96,  h: 22, layers: ["communications"] },
    { text: "verbally in person", kind: "comm", iconAsset: "ph-usersound", x: 543,  y: 251, w: 141, h: 22, layers: ["communications"] },
    { text: "verbally in person", kind: "comm", iconAsset: "ph-usersound", x: 747,  y: 514, w: 141, h: 22, layers: ["communications"] },
    { text: "verbally in person", kind: "comm", iconAsset: "ph-usersound", x: 784,  y: 868, w: 141, h: 22, layers: ["communications"] },
    { text: "verbally in person", kind: "comm", iconAsset: "ph-usersound", x: 1399, y: 635, w: 141, h: 22, layers: ["communications"] },
    { text: "radio",     kind: "comm", iconAsset: "ph-radio",     x: 1474, y: 120,  w: 65,  h: 22, layers: ["communications"] },
    { text: "radio",     kind: "comm", iconAsset: "ph-radio",     x: 1600, y: 271,  w: 65,  h: 22, layers: ["communications"] },
    { text: "radio",     kind: "comm", iconAsset: "ph-radio",     x: 1624, y: 522,  w: 65,  h: 22, layers: ["communications"] },
    { text: "radio",     kind: "comm", iconAsset: "ph-radio",     x: 1399, y: 997,  w: 65,  h: 22, layers: ["communications"] },

    // Zone labels (tan bold) — centered on their dashed zone box: x = zoneCenter
    // − w/2 (horizontal), y = borderEdge − h/2 so the text straddles the dashed
    // line. CALL/POLICE sit on their zone's bottom edge, FIRE on its top edge.
    { text: "CALL",   kind: "zonelabel", x: 457.3,  y: 784.74, w: 56, h: 20, layers: ["departments"] },
    { text: "POLICE", kind: "zonelabel", x: 1239.9, y: 551.89, w: 70, h: 20, layers: ["departments"] },
    { text: "FIRE",   kind: "zonelabel", x: 1199.6, y: 641,    w: 46, h: 20, layers: ["departments"] },

    // Flow labels (italic on #F9F9F8, per Figma)
    { text: "police incident",      kind: "flowlabel", x: 982.08, y: 543, w: 97,  h: 24, layers: ["flow"] },
    { text: "fire or ems incident", kind: "flowlabel", x: 888.08, y: 654, w: 122, h: 22, layers: ["flow"] },

    // Count annotations (italic tan) — x is the CENTER (pill is center-anchored),
    // aligned under their node cluster: call c=487, police c=1274.9, fire c=1245.
    { text: "(1-3 call receivers)",     kind: "annotation", x: 487,    y: 761, layers: ["annotations"] },
    { text: "(2-4 police dispatchers)", kind: "annotation", x: 1274.9, y: 530, layers: ["annotations"] },
    { text: "(2-3 fire dispatchers)",   kind: "annotation", x: 1245,   y: 663, layers: ["annotations"] },
  ],

  // ---- Annotations (the incident-flow story) --------------------------------
  // These live on the SAME layer as the incident-flow lines ("flow"), per the
  // Figma data-annotations grouping.
  // x is the CENTER of the note (Figma anchors these with translateX(-50%)).
  annotations: [
    {
      text: "call → incident: calls get picked up by the call receiver and " +
        "entered into the digital command & control software",
      x: 771, y: 722, w: 264, layers: ["flow"],
    },
    {
      text: "once the incident has been assessed, it would go to the needed dispatchers",
      x: 1282.5, y: 592, w: 205, layers: ["flow"],
    },
    {
      text: "after resources have been notified and sent out, the incident is " +
        "closely monitored by the dispatcher until it is closed out",
      x: 1798, y: 758, w: 232, layers: ["flow"],
    },
  ],

  // ---- About this center (floating, collapsible card) -----------------------
  // Parent card with child sections. Staff distribution is now one section
  // alongside observations & notes from the site visit.
  about: {
    layers: ["annotations"],
    title: "About this center",
    sections: [
      {
        heading: "Staff distribution",
        text: "9–12 people on the floor per shift",
        items: ["1–3 call takers", "2–4 police dispatchers", "2–3 fire dispatchers"],
      },
      {
        heading: "Observations & notes",
        items: [
          {
            text: "Distinct alert tones play on the floor to flag urgent " +
              "situations to the telecommunicators:",
            children: [
              "Hooting tone (owl-like) — a Priority 1 incident is in progress, " +
                "meaning one that involves a weapon.",
              "Bird-chirping tone — a police call has been waiting 20 minutes " +
                "with no PD responder assigned to it yet.",
            ],
          },
        ],
      },
    ],
  },
};
