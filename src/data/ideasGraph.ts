export type IdeaNode = {
  id: string;
  label: string;
  description: string;
  url?: string;
  tags: string[];
  type?: "concept" | "resource" | "observation" | "idea";
};

export const ideaNodes: IdeaNode[] = [
  {
    id: "global-knowledge-economy",
    label: "Global Knowledge Economy",
    description:
      "An economic system in which knowledge is the primary source of value, enabled by modern technology that lowers barriers to creating, storing and sharing information at a worldwide scale.",
    url: "",
    tags: ["lowering-barriers", "intellectual-capital", "abundance"],
    type: "concept",
  },
  {
    id: "computer",
    label: "Computer",
    description:
      "An indispensable electronic, programmable machine relying on hardware and software to process symbols or data into many forms of input and output, performing complex and repetitive tasks with speed, accuracy, reliability and consistency as a foundational part of modern society.",
    url: "",
    tags: ["symbols", "hardware", "software", "automation"],
    type: "concept",
  },
  {
    id: "consciousness-lexicon",
    label: "Consciousness Lexicon",
    description:
      "A community-driven vocabulary for AI consciousness & human-AI collaboration.",
    url: "https://primalway.org/",
    tags: ["symbols", "research", "conversations", "system", "grimoire"],
    type: "resource",
  },
  {
    id: "cyberculture",
    label: "Cyberculture",
    description:
      "Cyberculture is the global culture formed through networked computer and internet technologies, defined by digitally mediated practices, languages and social structures that transcend physical location, blur boundaries and evolve through decentralized, information-driven interaction in cyberspace.",
    url: "",
    tags: ["cyberspace", "internet", "decentralized", "computer"],
    type: "concept",
  },
  {
    id: "digital-immortality",
    label: "Digital Immortality",
    description:
      "Digital immortality is the preservation or continuation of a person's identity through a data-driven digital representation that can exist as a static archive or as an evolving, learning entity, thereby raising ethical, human and data-protection questions.",
    url: "",
    tags: ["representation", "preservation", "experiences", "memories"],
    type: "concept",
  },
  {
    id: "tek-gnostic-media",
    label: "Tek-Gnostics Media",
    description:
      "...an aggregator of Old Earth's collective knowledge... for each of you... the collective conscious. The many databases and hyper-linked information streams that are housed within our virtual walls function as a repository of illuminated manuscripts of the digital age... an annotated portal to the Mysteries.",
    url: "https://www.tekgnostics.com/home.htm",
    tags: ["synchronicity", "preservation", "cyberspace", "consciousness"],
    type: "resource",
  },
  {
    id: "models-of-magick",
    label: "Models Of Magick",
    description:
      "Magick can be understood through multiple paradigms, each offering a different lens for explaining how intention creates change.",
    url: "",
    tags: ["occult", "paradigms", "energy", "experience"],
    type: "concept",
  },
  {
    id: "servitors",
    label: "Servitors",
    description:
      "An energy construct designed by a practitioner to perform specific tasks, sustained through focused intent, symbolic structure, initial energetic charging and ongoing feeding via attention, emotion, ritual or symbolic energy to remain active over time.",
    url: "",
    tags: ["sigil", "energy", "thoughtform"],
    type: "concept",
  },
  {
    id: "gnosis",
    label: "Gnosis",
    description:
      "An altered state of consciousness characterized by vacant awareness in which ordinary knowledge, memory and ego recede, allowing direct, present-moment insight and transformative action to arise, often accessed through practices that disrupt habitual thought and continuity.",
    url: "",
    tags: [
      "consciousness",
      "altered-state",
      "inspiration",
      "knowledge",
      "creativity",
    ],
    type: "concept",
  },
  {
    id: "chaos-magick",
    label: "Chaos Magick",
    description:
      "A results-focused, non-dogmatic practice that treats belief as a flexible tool, prioritizes personal experience, technical skill, altered states of consciousness, eclectic experimentation and playful integration into everyday life to produce tangible change.",
    url: "",
    tags: ["gnosis", "consciousness", "results", "belief", "experience"],
    type: "concept",
  },
];
