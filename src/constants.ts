import { CourseStep, Slide, TroubleshootingScenario } from "./types";

export const TROUBLESHOOTING_SCENARIOS: TroubleshootingScenario[] = [
  {
    id: "ts1",
    title: "The 'Crunchy' Tissue",
    problemDescription: "During microtomy, the tissue is brittle, 'crunchy', and frequently falls out of the paraffin block during sectioning.",
    observation: "The tissue appears dark and shrunken within the block.",
    options: [
      "Incomplete fixation",
      "Over-dehydration in alcohols",
      "Clearing agent was contaminated",
      "Paraffin bath was too cold"
    ],
    correctOptionIndex: 1,
    explanation: "Over-dehydration (staying too long in high-grade alcohols) removes bound water from the tissue, making it brittle and difficult to section. This is a common processing error.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Histology_of_the_kidney.jpg/800px-Histology_of_the_kidney.jpg"
  },
  {
    id: "ts2",
    title: "Chatter Marks",
    problemDescription: "The sections show fine parallel lines (chatter) perpendicular to the direction of the cut.",
    observation: "The lines are consistent across the entire ribbon.",
    options: [
      "Dull microtome blade",
      "Loose knife or block holder",
      "Water bath is too hot",
      "Tissue was not fixed properly"
    ],
    correctOptionIndex: 1,
    explanation: "Chatter is most often caused by vibration in the microtome, usually due to a loose knife, loose block holder, or the block being too hard for the clearance angle.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Cardiac_muscle_histology.jpg/800px-Cardiac_muscle_histology.jpg"
  },
  {
    id: "ts3",
    title: "Pale Nuclear Staining",
    problemDescription: "After H&E staining, the nuclei appear very pale and lack crisp detail.",
    observation: "The eosin (cytoplasmic) staining looks normal.",
    options: [
      "Hematoxylin is over-oxidized (exhausted)",
      "The slide was over-differentiated in acid alcohol",
      "The bluing step was skipped",
      "All of the above"
    ],
    correctOptionIndex: 3,
    explanation: "Pale nuclei can result from exhausted hematoxylin, over-differentiation (removing too much stain), or failing to 'blue' the hematoxylin to its final stable color.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Epithelial_Tissues_Stratified_Squamous_Epithelium_%2840230842160%29.jpg/800px-Epithelial_Tissues_Stratified_Squamous_Epithelium_%2840230842160%29.jpg"
  },
  {
    id: "ts4",
    title: "Moth-Eaten Artifact",
    problemDescription: "The tissue section appears to have holes or a 'moth-eaten' appearance, particularly in cellular areas.",
    observation: "The architecture is disrupted with irregular clear spaces.",
    options: [
      "Incomplete dehydration",
      "Poor fixation prior to processing",
      "Aggressive sectioning (thick cuts)",
      "Water bath temperature too low"
    ],
    correctOptionIndex: 1,
    explanation: "A moth-eaten appearance is a classic sign of poor or delayed fixation, leading to autolysis and tissue breakdown before the processing steps could stabilize the proteins.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Micrograph_of_a_normal_liver.jpg/800px-Micrograph_of_a_normal_liver.jpg"
  },
  {
    id: "ts5",
    title: "Squamous Cells on Slide",
    problemDescription: "You observe scattered squamous epithelial cells on a slide that is supposed to be a section of liver.",
    observation: "The cells are sitting on top of the tissue plane and background.",
    options: [
      "Metaplasia in the liver",
      "Contamination from the water bath (squames)",
      "Dirty staining solutions",
      "Incorrect tissue embedded"
    ],
    correctOptionIndex: 1,
    explanation: "Squamous cells (squames) floating onto the slide are a classic artifact caused by the technician's skin cells shedding into the flotation water bath. The bath must be skimmed regularly.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Squamous_cell_carcinoma_-_lung.jpg"
  },
  {
    id: "ts6",
    title: "Washboarding",
    problemDescription: "Broad, coarse parallel lines appear regularly across the tissue section, much thicker and more spaced out than 'chatter'.",
    observation: "The block holder or blade clamp felt slightly loose during sectioning.",
    options: [
      "Blade is too sharp",
      "Mechanical looseness/vibration in the microtome",
      "Tissue is too soft",
      "Water bath is too cold"
    ],
    correctOptionIndex: 1,
    explanation: "Washboarding is a macro-vibration artifact caused by looseness in the microtome assembly—usually an unclamped block or blade holder.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/12/Glomerulus_of_mouse_kidney_-_TEM.jpg"
  },
  {
    id: "ts7",
    title: "Nuclear Bubbling",
    problemDescription: "Tiny clear vacuoles are visible within the nuclei, giving them a 'bubbly' or 'soapy' appearance under high power.",
    observation: "The tissue was processed using a high-heat rapid processor.",
    options: [
      "Over-fixation",
      "Heat damage during processing",
      "Incomplete clearing",
      "Dull microtome blade"
    ],
    correctOptionIndex: 1,
    explanation: "Nuclear bubbling occurs when tissue is exposed to excessive heat, causing moisture to vaporize within the nuclei during the processing cycle.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Simple_cuboidal_epithelial_tissue.jpg"
  },
  {
    id: "ts8",
    title: "White Spots on Slide",
    problemDescription: "After staining, there are irregular white patches where the tissue appears completely unstained and 'opaque'.",
    observation: "The unstained areas correspond to residual paraffin that was not removed.",
    options: [
      "Incomplete deparaffinization in xylene",
      "Hematoxylin was too old",
      "Eosin was too acidic",
      "Water was contaminated"
    ],
    correctOptionIndex: 0,
    explanation: "If slides are not in xylene long enough, paraffin remains on the tissue, blocking the aqueous stains and leaving white spots.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Histology_of_the_kidney.jpg"
  },
  {
    id: "ts9",
    title: "Air Bubbles on Slide",
    problemDescription: "Round, dark-rimmed clear circles are visible, partially obscuring the tissue architecture.",
    observation: "The circles are mostly found at the edges or near thick tissue sections.",
    options: [
      "Incomplete clearing",
      "Trapped air during mounting",
      "Fungal contamination",
      "Poor fixation"
    ],
    correctOptionIndex: 1,
    explanation: "Air bubbles are common mounting artifacts caused by poor technique when lowering the coverslip or insufficient mounting medium.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Small_intestine_villi.jpg"
  },
  {
    id: "ts10",
    title: "Venetian Blind Effect",
    problemDescription: "The section appears to be split or shredded into parallel strips following the direction of the blade.",
    observation: "Parallel vertical tears are visible in the ribbon as it comes off the block.",
    options: [
      "Dull or nicked blade",
      "Tissue is too hard",
      "Paraffin is too soft",
      "Water bath is too hot"
    ],
    correctOptionIndex: 0,
    explanation: "A nicked or dull blade edge snags the tissue at specific points, causing strips or 'Venetian blind' shredding.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Liver_lobule_1.jpg"
  },
  {
    id: "ts11",
    title: "Eosin Bleeding",
    problemDescription: "The eosin (pink) stain appears hazy and is slowly leaching out of the tissue into the mounting medium.",
    observation: "The slides remained in a high humidity environment before mounting.",
    options: [
      "Incomplete dehydration before xylene",
      "Hematoxylin was too strong",
      "Clearing agent was too fresh",
      "Paraffin was too hot"
    ],
    correctOptionIndex: 0,
    explanation: "Residual water in the tissue (due to incomplete dehydration) prevents the mounting medium from sealing the eosin, causing it to 'bleed'.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Peripheral_nerve_cross_section.jpg"
  },
  {
    id: "ts12",
    title: "Washboarding (Hard Tissue)",
    problemDescription: "A section of uterus shows periodic thick and thin zones forming a 'washboard' pattern.",
    observation: "The tissue contains dense connective tissue or leiomyoma.",
    options: [
      "Tissue is too hard for the blade angle",
      "Water bath is too cold",
      "Incomplete clearing",
      "Slides were not coated"
    ],
    correctOptionIndex: 0,
    explanation: "Extreme washboarding can occur when the tissue is too hard for the set clearance angle, causing the blade to 'jump' during the stroke.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/08/Hyaline_cartilage_2.jpg"
  },
  {
    id: "ts13",
    title: "Folded Sections",
    problemDescription: "Deeply stained blue lines or 'collapsed' areas are visible within the tissue section.",
    observation: "The folds are most prominent in large sections like brain or breast.",
    options: [
      "Poor flotation technique",
      "Water bath was too hot",
      "Over-fixation",
      "Microtome speed was too fast"
    ],
    correctOptionIndex: 0,
    explanation: "Folds occur when the section is not flattened properly on the water bath or is picked up too aggressively with the slide.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/73/Compact_bone_-_ground_section.jpg"
  },
  {
    id: "ts14",
    title: "H&E: Smudgy Nuclei",
    problemDescription: "Nuclei lack crisp chromatin detail and appear as dark, 'smudgy' blobs without distinct features.",
    observation: "The tissue was left in the fixative for 3 days over a weekend.",
    options: [
      "Over-fixation in Formalin",
      "Old Hematoxylin",
      "Bluing step was too short",
      "Water was too acidic"
    ],
    correctOptionIndex: 0,
    explanation: "Prolonged fixation (especially in formalin) can cross-link proteins so heavily that nuclear detail becomes obscured or 'smudgy'.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Cardiac_muscle_histology.jpg"
  },
  {
    id: "ts15",
    title: "Parched Tissue",
    problemDescription: "The tissue appears shattered or fragmented, with many fine cracks resembling 'crazed' glass.",
    observation: "The tissue sat in the xylene/clearing step for 8 hours due to a processor delay.",
    options: [
      "Excessive exposure to clearing agent (Parched)",
      "Incomplete dehydration",
      "Paraffin was contaminated",
      "Blade was too cold"
    ],
    correctOptionIndex: 0,
    explanation: "Over-clearing in xylene makes tissue extremely brittle and 'parched', causing it to shatter or crack during sectioning.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Skeletal_muscle_-_longitudinal_section.jpg"
  }
];

export const SLIDES: Slide[] = [
  {
    id: "s1",
    title: "Renal Glomerulus",
    description: "A high-magnification view of a renal corpuscle showing the Bowman's capsule and the intricate capillary loops of the glomerulus. Key features include the mesangium and podocytes.",
    topic: "Anatomy & Physiology",

    magnification: "400x",
    stain: "H&E"
  },
  {
    id: "s2",
    title: "Hepatic Lobule",
    description: "Classic hexagonal structure of the liver lobule with the central vein and peripheral portal triads clearly visible. Hepatocytes are arranged in cords.",
    topic: "Anatomy & Physiology",

    magnification: "100x",
    stain: "H&E"
  },
  {
    id: "s3",
    title: "Cardiac Muscle",
    description: "Striated muscle fibers of the heart showing intercalated discs and branching fibers. Centrally located nuclei are a key diagnostic feature.",
    topic: "Anatomy & Physiology",

    magnification: "400x",
    stain: "H&E"
  },
  {
    id: "s4",
    title: "Skeletal Muscle",
    description: "Long, cylindrical fibers with peripherally located nuclei. Striations (A and I bands) are prominent at high magnification.",
    topic: "Anatomy & Physiology",

    magnification: "400x",
    stain: "H&E"
  },
  {
    id: "s5",
    title: "Simple Cuboidal Epithelium",
    description: "Single layer of cube-shaped cells, commonly found in kidney tubules and glandular ducts. Nuclei are large and centrally located.",
    topic: "Anatomy & Physiology",

    magnification: "400x",
    stain: "H&E"
  },
  {
    id: "s6",
    title: "Pancreatic Islets",
    description: "Lighter-staining clusters of endocrine cells (Islets of Langerhans) surrounded by darker-staining exocrine acini.",
    topic: "Anatomy & Physiology",

    magnification: "200x",
    stain: "H&E"
  },
  {
    id: "s7",
    title: "Small Intestine (Villi)",
    description: "Finger-like projections (villi) lined by simple columnar epithelium with goblet cells. Note the brush border (microvilli).",
    topic: "Anatomy & Physiology",

    magnification: "100x",
    stain: "H&E"
  },
  {
    id: "s8",
    title: "Nerve Fascicle (CS)",
    description: "Cross-section of a peripheral nerve showing axons, myelin sheaths, and the surrounding perineurium.",
    topic: "Anatomy & Physiology",

    magnification: "200x",
    stain: "H&E"
  },
  {
    id: "s9",
    title: "Hyaline Cartilage",
    description: "Chondrocytes located in lacunae within a glassy, homogenous extracellular matrix. Commonly found in the trachea and joint surfaces.",
    topic: "Anatomy & Physiology",

    magnification: "200x",
    stain: "H&E"
  },
  {
    id: "s10",
    title: "Compact Bone",
    description: "Haversian systems (osteons) with concentric lamellae, lacunae containing osteocytes, and central canals.",
    topic: "Anatomy & Physiology",

    magnification: "100x",
    stain: "Ground Section"
  }
];

export const GUIDED_COURSE: CourseStep[] = [
  {
    id: 0,
    title: "The Foundation: Fixation",
    description: "Learn how to preserve tissue structure and prevent autolysis. This is the most critical step in histology.",
    topic: "Fixation",
    objectives: [
      "Understand the action of Formalin",
      "Learn fixation times for different tissue types",
      "Identify common fixation artifacts"
    ]
  },
  {
    id: 1,
    title: "Tissue Processing & Embedding",
    description: "Master the dehydration, clearing, and infiltration sequence to prepare tissue for sectioning.",
    topic: "Processing & Embedding",
    objectives: [
      "Learn the chemical sequence (Alcohol -> Xylene -> Paraffin)",
      "Understand the role of clearing agents",
      "Master embedding orientation for different organs"
    ]
  },
  {
    id: 2,
    title: "Precision Microtomy",
    description: "Techniques for sectioning paraffin blocks and troubleshooting common cutting issues.",
    topic: "Microtomy",
    objectives: [
      "Identify causes of 'chatters' and 'wash-boarding'",
      "Learn optimal water bath temperatures",
      "Understand blade angles and clearance"
    ]
  },
  {
    id: 3,
    title: "Routine Staining (H&E)",
    description: "The bread and butter of histology. Learn the chemistry behind Hematoxylin and Eosin.",
    topic: "Staining",
    objectives: [
      "Differentiate between progressive and regressive staining",
      "Understand the role of mordants",
      "Troubleshoot pale staining or over-staining"
    ]
  },
  {
    id: 4,
    title: "Special Stains Mastery",
    description: "Identifying specific components like carbohydrates, amyloid, and microorganisms.",
    topic: "Special Stains",
    objectives: [
      "Master the PAS reaction for carbohydrates",
      "Learn connective tissue stains (Trichrome, Verhoeff)",
      "Identify silver stains for fungi and bacteria"
    ]
  },
  {
    id: 5,
    title: "Lab Operations & Safety",
    description: "Regulatory requirements and safe handling of hazardous chemicals.",
    topic: "Lab Operations & Safety",
    objectives: [
      "Understand OSHA Hazard Communication standards",
      "Learn proper waste disposal (EPA guidelines)",
      "Master quality control and documentation"
    ]
  },
  {
    id: 6,
    title: "Anatomy & Physiology Context",
    description: "Connecting histological structure to biological function.",
    topic: "Anatomy & Physiology",
    objectives: [
      "Identify the four basic tissue types",
      "Recognize organ-specific micro-anatomy",
      "Understand normal vs. pathological morphology"
    ]
  }
];
