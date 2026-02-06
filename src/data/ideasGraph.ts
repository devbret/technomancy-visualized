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
];
