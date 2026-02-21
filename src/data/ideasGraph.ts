export type IdeaNode = {
  id: string;
  label: string;
  description: string;
  url?: string;
  tags: string[];
  type?: "concept" | "resource" | "person" | "location";
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
    tags: [
      "gnosis",
      "consciousness",
      "results",
      "belief",
      "experience",
      "magick",
    ],
    type: "concept",
  },
  {
    id: "technology",
    label: "Technology",
    description:
      "The systematic and evolving application of knowledge which creates reusable, low-resistance ways to achieve practical goals and mediates how humans experience, organize and transform the world.",
    url: "",
    tags: ["experience", "knowledge", "innovation"],
    type: "concept",
  },
  {
    id: "cyberspace",
    label: "Cyberspace",
    description:
      "A global, immaterial domain created by interconnected computer systems and networks where data, interactions, identities and experiences exist and evolve independently of time and geography.",
    url: "",
    tags: ["internet", "realm", "reality"],
    type: "concept",
  },
  {
    id: "cyborg-consciousness",
    label: "Cyborg Consciousness",
    description:
      "A posthuman mode of awareness which emerges from boundary dissolution, embraces contradiction, rejects fixed dualisms and operates politically through intentional coalition, affinity and resistance within networks of power.",
    url: "",
    tags: ["transhumanism", "blasphemy", "strategic"],
    type: "concept",
  },
  {
    id: "free-and-open-source-software",
    label: "Free And Open Source Software",
    description:
      "Software whose source code is openly accessible and licensed to guarantee users the freedom to run, study, modify and redistribute it, thereby promoting transparency, collaboration and shared technological advancement.",
    url: "",
    tags: ["flexibility", "freedom", "movement", "community"],
    type: "concept",
  },
  {
    id: "remixing",
    label: "Remixing",
    description:
      "The creative practice of meaningfully re-appropriating and combining existing media from multiple sources into new forms, driving continuous cultural evolution through reinterpretation, collage and innovation.",
    url: "",
    tags: ["innovation", "memetics", "distribution"],
    type: "concept",
  },
  {
    id: "nmrdc",
    label: "NMRDC",
    description:
      "The goal of this project is to create online resource center for researchers, students and those interested in investigating the intersection of new media, religion and digital culture.",
    url: "https://www.digrel.com/",
    tags: ["religion", "cyberspace", "culture"],
    type: "resource",
  },
  {
    id: "electronic-frontier-foundation",
    label: "Electronic Frontier Foundation",
    description:
      "...is the leading nonprofit organization defending civil liberties in the digital world. Founded in 1990, EFF champions user privacy, free expression, and innovation through impact litigation, policy analysis, grassroots activism, and technology development.",
    url: "https://www.eff.org/",
    tags: ["liberty", "cyberspace", "technology"],
    type: "resource",
  },
  {
    id: "matrix-4-humans",
    label: "Matrix 4 Humans",
    description:
      "We are providing unique insights into the background and framework of the Matrix movies.",
    url: "https://matrix4humans.com/",
    tags: ["gnosticism", "consciousness"],
    type: "resource",
  },
  {
    id: "psychonaut-guide",
    label: "Psychonaut Guide",
    description: "Explore psychedelics safely.",
    url: "https://psychonaut.guide/",
    tags: ["psychedelics", "psychonautics", "data"],
    type: "resource",
  },
  {
    id: "psychonautics",
    label: "Psychonautics",
    description:
      "The intentional and responsible exploration of altered states of consciousness, in order to investigate the mind, spirituality and personal transformation through direct experience.",
    url: "",
    tags: ["psychonautics", "consciousness", "exploration"],
    type: "concept",
  },
  {
    id: "meditation",
    label: "Meditation",
    description:
      "A transformative state of growth in which one moves beyond language and mental chatter, dissolves the barrier between observer and observed, and becomes consciously unified with existence itself.",
    url: "",
    tags: ["consciousness", "experience", "practice"],
    type: "concept",
  },
  {
    id: "synchronicity",
    label: "Synchronicity",
    description:
      "The experience of meaningful coincidences in which seemingly unrelated internal and external events align in an acausal way, creating a sense of deeper interconnectedness often interpreted as a reaffirming signal from the universe or a higher power.",
    url: "",
    tags: ["interconnected", "carl-jung", "awakening", "enchantment"],
    type: "concept",
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    description:
      "A science fiction subgenre set in a dystopian near future where advanced technology collides with social decay, inequality and rebellious anti-heroes navigating a 'low life, high tech' world.",
    url: "",
    tags: ["science-fiction", "cyberspace", "william-gibson", "technology"],
    type: "concept",
  },
  {
    id: "ghost-in-the-shell",
    label: "Ghost In The Shell",
    description:
      "A cyberpunk film set in a hyper-connected, dystopian metropolis which explores the philosophical conflict between consciousness and the cybernetic body, questioning what it means to be human in a world of pervasive cyberization, artificial intelligence and malleable memory.",
    url: "https://theghostintheshell.jp/en",
    tags: ["cyberpunk", "artificial-intelligence", "cyberspace"],
    type: "resource",
  },
  {
    id: "psychedelics",
    label: "Psychedelics",
    description:
      "Psychoactive substances which primarily act on serotonin 5-HT2A receptors to produce profound alterations in perception and cognition while promoting neural plasticity, enhanced learning and potential therapeutic benefits.",
    url: "",
    tags: ["psychonautics", "consciousness", "artifact", "terence-mckenna"],
    type: "concept",
  },
  {
    id: "divination",
    label: "Divination",
    description:
      "An ancient, interpretive practice seeking insight into the past, present, future or hidden causes of events through symbolic methods and tools, functioning as a proactive dialogue between the conscious and unconscious distinct from mere fortune telling.",
    url: "",
    tags: ["randomness", "practice", "guidance"],
    type: "concept",
  },
  {
    id: "psychic-vampirism",
    label: "Psychic Vampirism",
    description:
      "The phenomenon where an individual drains others' emotional or spiritual energy to sustain themselves, sometimes through manipulation or drama, though it may also be practiced ethically through consensual or ambient energy exchange.",
    url: "",
    tags: ["loosh", "feeding", "empaths"],
    type: "concept",
  },
  {
    id: "cybernetics",
    label: "Cybernetics",
    description:
      "The interdisciplinary study of how complex systems use feedback, communication and self-regulating processes to maintain organization, adapt to their environment and shape their own behavior over time.",
    url: "",
    tags: ["virtuality", "circularity", "observation", "feedback"],
    type: "concept",
  },
  {
    id: "systems-theory",
    label: "Systems Theory",
    description:
      "A framework for studying how interconnected and interdependent components within open or closed systems interact through feedback, boundaries and environmental exchange to produce emergent, goal-oriented behaviors in which the whole is greater than the sum of its parts.",
    url: "",
    tags: ["emergence", "boundaries", "environment", "feedback"],
    type: "concept",
  },
  {
    id: "osint",
    label: "OSINT",
    description:
      "The iterative practice of gathering, processing, analyzing and reporting on publicly available information to generate actionable insights, enhance situational awareness and support decision-making for individuals or organizations.",
    url: "",
    tags: ["public", "data", "research", "mindset", "reporting"],
    type: "concept",
  },
  {
    id: "forking-software",
    label: "Forking Software",
    description:
      "The creation of a new, independent line of development from an existing project's source code and is a fundamental right within free and open-source software that allows communities to diverge in direction, features or governance.",
    url: "",
    tags: ["communities", "licenses", "source-code", "software"],
    type: "concept",
  },
  {
    id: "network-state-movement",
    label: "Network State Movement",
    description:
      "An internet-first, geographically decentralized effort to build digitally coordinated communities that organize collective action online, acquire physical territory and ultimately seek diplomatic recognition as sovereign entities independent of traditional nation-states.",
    url: "",
    tags: ["decentralized", "internet", "diplomacy", "anarcho-capitalist"],
    type: "concept",
  },
  {
    id: "open-source-religion",
    label: "Open Source Religion",
    description:
      "A decentralized, collaborative and techno-optimistic approach to spirituality in which individuals actively construct and remix their own belief systems much like open source software, emphasizing transparency, iteration, personalization and shared contribution.",
    url: "",
    tags: [
      "technology",
      "discordianism",
      "collaboration",
      "blasphemy",
      "spirituality",
    ],
    type: "concept",
  },
  {
    id: "human-enhancement",
    label: "Human Enhancement",
    description:
      "The use of medical, genetic, cognitive or technological interventions to restore or extend human capabilities beyond typical biological limits, thus raising profound economic, social, ethical and geopolitical implications that require careful governance, public dialogue and responsible regulation.",
    url: "",
    tags: ["social-cohesion", "superhuman", "augmentation"],
    type: "concept",
  },
  {
    id: "technological-singularity",
    label: "Technological Singularity",
    description:
      "A near-future point at which accelerating technological growth and an intelligence explosion from self-improving AI surpass human cognition, rendering the future fundamentally unpredictable and irreversibly transforming human civilization.",
    url: "",
    tags: [
      "artificial-intelligence",
      "change",
      "novelty",
      "human-civilization",
    ],
    type: "concept",
  },
  {
    id: "magick",
    label: "Magick",
    description:
      "The disciplined art and science of causing change in accordance with one's will by ritualizing intention and engaging hidden natural forces to shape experience, foster self-knowledge and harmonize with the deeper patterns of the universe.",
    url: "",
    tags: [
      "occult",
      "resonance",
      "synchronicity",
      "energy",
      "cycles",
      "evolution",
    ],
    type: "concept",
  },
  {
    id: "technomancy",
    label: "Technomancy",
    description:
      "A modern hybrid practice which uses technology as the medium for magick by treating digital tools, systems and media as energetic interfaces through which intention, perception and reality can be shaped for personal insight and societal transformation.",
    url: "",
    tags: ["technology", "magick", "occult", "cyberspace", "divination"],
    type: "concept",
  },
  {
    id: "history-of-technomancy",
    label: "History Of Technomancy",
    description:
      "Traces humanity's long blending of ritual and machinery, from ancient temple engineering, occult-linked telecommunication pioneers and enchanted instruments like mirrors and automata, to the internet age where digital networks have become ritual spaces for collaborative, hybridized magickal practice.",
    url: "",
    tags: ["technomancy", "ritual", "occult", "technology", "ritual"],
    type: "concept",
  },
  {
    id: "technopagan-agency",
    label: "Technopagan Agency",
    description:
      "A hybrid agency emerging from the convergence of neopaganism, ecological consciousness and cyberculture, in which individuals embrace technology as both practical tool and sacred space, thus bridging spirituality and the material world.",
    url: "",
    tags: ["cyberculture", "convergence", "spirituality", "hybrid"],
    type: "concept",
  },
  {
    id: "open-source-movement",
    label: "Open Source Movement",
    description:
      "A community-driven approach to software development promoting transparent access to source code, collaborative contribution and licensing models that protect users' freedoms to use, study, modify, share and even fork software, fostering innovation, security and shared global technological advancement.",
    url: "",
    tags: [
      "source-code",
      "community",
      "licensing",
      "transparency",
      "innovation",
    ],
    type: "concept",
  },
  {
    id: "transhumanism",
    label: "Transhumanism",
    description:
      "A philosophical and cultural movement which emphasizes humans can and should use advanced technology to transcend biological limitations via enhancing intelligence, eliminating suffering and ultimately evolving into a posthuman state beyond our current form.",
    url: "",
    tags: [
      "extropy",
      "augmentation",
      "boundaries",
      "singularity",
      "immortality",
    ],
    type: "concept",
  },
  {
    id: "cyborg-anthropology",
    label: "Cyborg Anthropology",
    description:
      "The study of humans as hybrid beings exploring how technology, language, politics and imagination reshape social reality through partial, ironic and intimate couplings between humans, animals and machines.",
    url: "",
    tags: ["chimeras", "couplings", "hybrid", "technology"],
    type: "concept",
  },
  {
    id: "emerging-global-vision",
    label: "Emerging Global Vision",
    description:
      "As the center of world influence shifts from West to East, humanity must move beyond the historical imbalance between rational Western systems and intuitive Eastern perspectives toward a unified, balanced global consciousness which integrates logic, emotion, psyche and body into a more whole human experience.",
    url: "",
    tags: ["chaos", "rational", "imbalance", "chimeras"],
    type: "concept",
  },
  {
    id: "fusion-anomaly",
    label: "Fusion Anomaly",
    description: "This nexus is permanently morphing...",
    url: "https://fusionanomaly.net/nodebase.html",
    tags: ["memetics", "technoshamanism", "absurd"],
    type: "resource",
  },
  {
    id: "history-of-rave-culture",
    label: "History Of Rave Culture",
    description:
      "Originated from mid-20th-century large music events and evolved through underground disco, house and techno scenes in the U.S. and U.K. during the 1970s-1990s into a global movement centered on electronic music, community, altered states, spiritual experience and immersive, often subversive gatherings that later became mainstream yet remain highly influential.",
    url: "",
    tags: ["rave", "detroit", "plur", "techno"],
    type: "concept",
  },
  {
    id: "technological-re-enchantment",
    label: "Technological Re-Enchantment",
    description:
      "Reframes technology as a modern continuation of Pythagorean-Platonic theurgy and technomancy, treating code and computation as pathways to transcendence within a hierarchically ordered, information-based universe where consciousness can evolve beyond material limitations.",
    url: "",
    tags: ["theurgy", "technomancy", "transhumanism", "transcendence"],
    type: "concept",
  },
  {
    id: "technomysticism",
    label: "Technomysticism",
    description:
      "A worldview which treats technology as a medium for spiritual experience and self-transformation, integrating mysticism and digital culture to re-enchant the world through conscious, reverent engagement with technological systems.",
    url: "",
    tags: ["enchantment", "experience", "rave-culture", "computers"],
    type: "concept",
  },
];
