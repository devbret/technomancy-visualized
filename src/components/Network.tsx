import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { ideaNodes, type IdeaNode } from "../data/ideasGraph";

type IdeaType = NonNullable<IdeaNode["type"]>;

type TagNode = {
  id: string;
  label: string;
  type: "tag";
  tag: string;
};

type GraphNode =
  | (IdeaNode & { nodeKind: "idea"; searchMatch?: boolean })
  | (TagNode & { nodeKind: "tag"; searchMatch?: boolean });

type SimNode = d3.SimulationNodeDatum & GraphNode;

type GraphLink = {
  id: string;
  source: string | SimNode;
  target: string | SimNode;
  kind: "idea-tag";
  weight: number;
};

type LinkDatum = d3.SimulationLinkDatum<SimNode> & GraphLink;

type DragSubject = SimNode | d3.SubjectPosition;

type IdeaSimNode = d3.SimulationNodeDatum &
  (IdeaNode & { nodeKind: "idea"; searchMatch?: boolean });

type TagSimNode = d3.SimulationNodeDatum &
  (TagNode & { nodeKind: "tag"; searchMatch?: boolean });

type IdeaTypeFilter = Record<IdeaType, boolean>;

const DEFAULT_VISIBLE_TYPES: IdeaTypeFilter = {
  concept: true,
  resource: true,
  person: true,
  location: true,
};

const DEFAULT_ZOOM_SCALE = 0.33;
const TAG_LABEL_ZOOM_THRESHOLD = 0.73;
const FULL_IDEA_LABEL_ZOOM_THRESHOLD = 0.85;
const TAG_DROPDOWN_ROW_HEIGHT = 38;
const TAG_DROPDOWN_VISIBLE_ROWS = 10;

const UI_PANEL_WIDTH = 360;
const MINI_MAP_WIDTH = UI_PANEL_WIDTH;
const MINI_MAP_HEIGHT = 170;
const MINI_MAP_PADDING = 16;

const getIdeaType = (idea: IdeaNode): IdeaType => idea.type ?? "location";

const truncateLabel = (label: string, maxLength = 26) => {
  if (label.length <= maxLength) return label;
  return `${label.slice(0, maxLength - 1)}…`;
};

export default function IdeasGraphView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const miniMapSvgRef = useRef<SVGSVGElement | null>(null);
  const resetZoomRef = useRef<(() => void) | null>(null);
  const tagDropdownRef = useRef<HTMLDivElement | null>(null);

  const [selected, setSelected] = useState<GraphNode | null>(null);

  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);
  const [showTags, setShowTags] = useState(true);
  const [visibleTypes, setVisibleTypes] = useState<IdeaTypeFilter>(
    DEFAULT_VISIBLE_TYPES,
  );

  const ideaFill = (t?: IdeaNode["type"]) => {
    switch (t) {
      case "concept":
        return "rgba(70, 210, 255, 0.85)";
      case "resource":
        return "rgba(255, 210, 70, 0.85)";
      case "person":
        return "rgba(190, 190, 190, 0.85)";
      case "location":
      default:
        return "rgba(220, 120, 255, 0.85)";
    }
  };

  const ideaStroke = (t?: IdeaNode["type"]) => {
    switch (t) {
      case "concept":
        return "rgba(70, 210, 255, 0.95)";
      case "resource":
        return "rgba(255, 210, 70, 0.95)";
      case "person":
        return "rgba(220, 220, 220, 0.9)";
      case "location":
      default:
        return "rgba(220, 120, 255, 0.95)";
    }
  };

  const ideaGlow = (t?: IdeaNode["type"]) => {
    switch (t) {
      case "concept":
        return "drop-shadow(0 0 6px rgba(70, 210, 255, 0.55))";
      case "resource":
        return "drop-shadow(0 0 6px rgba(255, 210, 70, 0.55))";
      case "person":
        return "drop-shadow(0 0 6px rgba(220, 220, 220, 0.35))";
      case "location":
      default:
        return "drop-shadow(0 0 6px rgba(220, 120, 255, 0.45))";
    }
  };

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();

    for (const idea of ideaNodes) {
      for (const tag of idea.tags) {
        tagSet.add(tag);
      }
    }

    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, []);

  const selectedTagLabel = selectedTag === "all" ? "All tags" : selectedTag;

  const toggleType = (type: IdeaType) => {
    setVisibleTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const resetControls = () => {
    setQuery("");
    setSelectedTag("all");
    setIsTagDropdownOpen(false);
    setHoveredTag(null);
    setShowTags(true);
    setVisibleTypes(DEFAULT_VISIBLE_TYPES);
    setSelected(null);
  };

  const resetView = () => {
    resetZoomRef.current?.();
  };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!tagDropdownRef.current) return;

      if (!tagDropdownRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
        setHoveredTag(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const { nodes, links } = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filteredIdeas = ideaNodes.filter((idea) => {
      const ideaType = getIdeaType(idea);
      const matchesType = visibleTypes[ideaType];
      const matchesTag =
        selectedTag === "all" ? true : idea.tags.includes(selectedTag);

      return matchesType && matchesTag;
    });

    const ideaSimNodes: IdeaSimNode[] = filteredIdeas.map((n) => {
      const searchHaystack = [
        n.label,
        n.description,
        getIdeaType(n),
        n.url ?? "",
        ...n.tags,
      ]
        .join(" ")
        .toLowerCase();

      return {
        ...n,
        type: getIdeaType(n),
        nodeKind: "idea",
        searchMatch:
          normalizedQuery.length === 0
            ? true
            : searchHaystack.includes(normalizedQuery),
      };
    });

    const tagSet = new Set<string>();

    if (showTags) {
      for (const n of filteredIdeas) {
        for (const t of n.tags) {
          tagSet.add(t);
        }
      }
    }

    const tagNodes: TagSimNode[] = Array.from(tagSet)
      .sort((a, b) => a.localeCompare(b))
      .map((tag) => ({
        id: `tag:${tag}`,
        label: tag,
        type: "tag",
        tag,
        nodeKind: "tag",
        searchMatch:
          normalizedQuery.length === 0
            ? true
            : tag.toLowerCase().includes(normalizedQuery),
      }));

    const tagIndex = new Map<string, string>();

    for (const tn of tagNodes) {
      tagIndex.set(tn.tag, tn.id);
    }

    const builtLinks: GraphLink[] = [];

    if (showTags) {
      for (const idea of filteredIdeas) {
        for (const tag of idea.tags) {
          const tagId = tagIndex.get(tag);

          if (!tagId) continue;

          builtLinks.push({
            id: `L:idea-tag:${idea.id}->${tagId}`,
            source: idea.id,
            target: tagId,
            kind: "idea-tag",
            weight: 1,
          });
        }
      }
    }

    const graphNodes: SimNode[] = showTags
      ? [...ideaSimNodes, ...tagNodes]
      : ideaSimNodes;

    if (normalizedQuery.length === 0) {
      return {
        nodes: graphNodes,
        links: builtLinks,
      };
    }

    const matchingNodeIds = new Set<string>();

    for (const node of graphNodes) {
      if (node.searchMatch) {
        matchingNodeIds.add(node.id);
      }
    }

    for (const link of builtLinks) {
      const sourceId =
        typeof link.source === "string" ? link.source : link.source.id;
      const targetId =
        typeof link.target === "string" ? link.target : link.target.id;

      if (matchingNodeIds.has(sourceId) || matchingNodeIds.has(targetId)) {
        matchingNodeIds.add(sourceId);
        matchingNodeIds.add(targetId);
      }
    }

    return {
      nodes: graphNodes.map((node) => ({
        ...node,
        searchMatch: matchingNodeIds.has(node.id),
      })),
      links: builtLinks,
    };
  }, [query, selectedTag, showTags, visibleTypes]);

  useEffect(() => {
    const container = containerRef.current;
    const svgEl = svgRef.current;
    const miniMapSvgEl = miniMapSvgRef.current;

    if (!container || !svgEl || !miniMapSvgEl) return;

    const graphContainer = container;
    const mainSvgEl = svgEl;
    const miniSvgEl = miniMapSvgEl;

    const svg = d3.select(mainSvgEl);
    svg.selectAll("*").remove();

    const miniMapSvg = d3.select(miniSvgEl);
    miniMapSvg.selectAll("*").remove();

    d3.select(graphContainer).selectAll("div.hover-tooltip").remove();

    const tooltip = d3
      .select(graphContainer)
      .append("div")
      .attr("class", "hover-tooltip")
      .style("position", "absolute")
      .style("left", "0px")
      .style("top", "0px")
      .style("transform", "translate(-9999px, -9999px)")
      .style("pointer-events", "none")
      .style("z-index", "50")
      .style("max-width", "320px")
      .style("padding", "10px 12px")
      .style("border-radius", "12px")
      .style("border", "1px solid rgba(255,255,255,0.18)")
      .style("background", "rgba(0,0,0,0.72)")
      .style("backdrop-filter", "blur(6px)")
      .style("color", "white")
      .style(
        "font-family",
        "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      )
      .style("font-size", "13px")
      .style("line-height", "1.35")
      .style("box-shadow", "0 10px 30px rgba(0,0,0,0.35)")
      .style("opacity", "0");

    const showTooltip = (event: MouseEvent, d: SimNode) => {
      if (d.nodeKind !== "idea") return;

      const t = getIdeaType(d as IdeaNode);
      if (t !== "concept" && t !== "resource") return;

      const rect = graphContainer.getBoundingClientRect();
      const x = event.clientX - rect.left + 14;
      const y = event.clientY - rect.top + 14;

      tooltip
        .html(
          `<div style="font-weight:800; font-size:14px; margin-bottom:6px;">${d.label}</div>
           <div style="opacity:0.92;">${(d as IdeaNode).description}</div>`,
        )
        .style("transform", `translate(${x}px, ${y}px)`)
        .style("opacity", "1");
    };

    const moveTooltip = (event: MouseEvent, d: SimNode) => {
      if (d.nodeKind !== "idea") return;

      const t = getIdeaType(d as IdeaNode);
      if (t !== "concept" && t !== "resource") return;

      const rect = graphContainer.getBoundingClientRect();
      const x = event.clientX - rect.left + 14;
      const y = event.clientY - rect.top + 14;

      tooltip.style("transform", `translate(${x}px, ${y}px)`);
    };

    const hideTooltip = () => {
      tooltip
        .style("opacity", "0")
        .style("transform", "translate(-9999px, -9999px)");
    };

    const gRoot = svg.append("g");
    const linkLayer = gRoot.append("g").attr("class", "links");
    const nodeLayer = gRoot.append("g").attr("class", "nodes");

    const miniMapLinkLayer = miniMapSvg.append("g").attr("class", "mini-links");
    const miniMapNodeLayer = miniMapSvg.append("g").attr("class", "mini-nodes");

    const miniMapViewport = miniMapSvg
      .append("rect")
      .attr("class", "mini-viewport")
      .attr("fill", "rgba(255,255,255,0.08)")
      .attr("stroke", "rgba(255,255,255,0.78)")
      .attr("stroke-width", 1.4)
      .attr("rx", 6)
      .attr("ry", 6)
      .style("pointer-events", "none");

    let currentZoomScale = DEFAULT_ZOOM_SCALE;
    let currentTransform = getDefaultZoomTransform();
    let hoveredNodeId: string | null = null;

    const updateLabelVisibility = (zoomScale: number) => {
      currentZoomScale = zoomScale;

      nodeLayer
        .selectAll<SVGTextElement, SimNode>("text.node-label")
        .text((d) => {
          if (d.nodeKind === "tag") return d.label;

          return zoomScale >= FULL_IDEA_LABEL_ZOOM_THRESHOLD
            ? d.label
            : truncateLabel(d.label, 18);
        })
        .attr("font-size", (d) => {
          if (d.nodeKind === "tag") return zoomScale >= 1.6 ? 9 : 8;
          return zoomScale >= FULL_IDEA_LABEL_ZOOM_THRESHOLD ? 18 : 14;
        })
        .style("opacity", (d) => {
          if (d.nodeKind === "tag") {
            return zoomScale >= TAG_LABEL_ZOOM_THRESHOLD ||
              d.id === hoveredNodeId
              ? 1
              : 0;
          }

          if (zoomScale < 0.45) return 0.55;
          if (zoomScale < FULL_IDEA_LABEL_ZOOM_THRESHOLD) return 0.78;

          return 1;
        })
        .style("pointer-events", "none");
    };

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 3])
      .on("zoom", (event) => {
        currentTransform = event.transform;
        gRoot.attr("transform", event.transform.toString());
        updateLabelVisibility(event.transform.k);
        updateMiniMap();
      });

    svg.call(zoom);

    function getDefaultZoomTransform() {
      const rect = graphContainer.getBoundingClientRect();
      const width = Math.max(300, rect.width);
      const height = Math.max(300, rect.height);

      return d3.zoomIdentity
        .translate(
          (width * (1 - DEFAULT_ZOOM_SCALE)) / 2,
          (height * (1 - DEFAULT_ZOOM_SCALE)) / 2,
        )
        .scale(DEFAULT_ZOOM_SCALE);
    }

    resetZoomRef.current = () => {
      svg
        .transition()
        .duration(500)
        .call(zoom.transform, getDefaultZoomTransform());
    };

    const sim = d3
      .forceSimulation<SimNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, LinkDatum>(links as LinkDatum[])
          .id((d) => d.id)
          .distance(130)
          .strength(0.18),
      )
      .force("charge", d3.forceManyBody().strength(-420))
      .force(
        "collide",
        d3.forceCollide((d: SimNode) => (d.nodeKind === "tag" ? 18 : 36)),
      )
      .force("x", d3.forceX(0).strength(0.03))
      .force("y", d3.forceY(0).strength(0.03));

    const visibleLinks: LinkDatum[] = links as LinkDatum[];

    const linkSel = linkLayer
      .selectAll<SVGLineElement, LinkDatum>("line.link")
      .data(visibleLinks, (d) => d.id)
      .join("line")
      .attr("class", "link")
      .attr("stroke", "rgba(255,255,255,0.10)")
      .attr("stroke-width", 1)
      .attr("stroke-linecap", "round");

    const isClickableIdea = (d: SimNode) => {
      if (d.nodeKind !== "idea") return false;

      const ideaType = getIdeaType(d as IdeaNode);

      return ideaType === "concept" || ideaType === "resource";
    };

    const nodeSel = nodeLayer
      .selectAll<SVGGElement, SimNode>("g.node")
      .data(nodes, (d) => d.id)
      .join("g")
      .attr("class", "node")
      .style("cursor", (d) => (isClickableIdea(d) ? "pointer" : "default"));

    const miniMapLinkSel = miniMapLinkLayer
      .selectAll<SVGLineElement, LinkDatum>("line.mini-link")
      .data(visibleLinks, (d) => d.id)
      .join("line")
      .attr("class", "mini-link")
      .attr("stroke", "rgba(255,255,255,0.16)")
      .attr("stroke-width", 0.7)
      .attr("stroke-linecap", "round");

    const miniMapNodeSel = miniMapNodeLayer
      .selectAll<SVGCircleElement, SimNode>("circle.mini-node")
      .data(nodes, (d) => d.id)
      .join("circle")
      .attr("class", "mini-node")
      .attr("r", (d) => (d.nodeKind === "tag" ? 1.5 : 2.6))
      .attr("fill", (d) =>
        d.nodeKind === "tag"
          ? "rgba(255,255,255,0.42)"
          : ideaFill(getIdeaType(d as IdeaNode)),
      )
      .attr("stroke", (d) =>
        d.nodeKind === "tag"
          ? "rgba(255,255,255,0.25)"
          : ideaStroke(getIdeaType(d as IdeaNode)),
      )
      .attr("stroke-width", 0.5);

    const nodeId = (n: string | SimNode) => (typeof n === "string" ? n : n.id);

    const getMiniMapProjection = () => {
      const positionedNodes = nodes.filter(
        (n) =>
          Number.isFinite(n.x) &&
          Number.isFinite(n.y) &&
          typeof n.x === "number" &&
          typeof n.y === "number",
      );

      if (positionedNodes.length === 0) return null;

      const minX = d3.min(positionedNodes, (d) => d.x ?? 0) ?? 0;
      const maxX = d3.max(positionedNodes, (d) => d.x ?? 0) ?? 1;
      const minY = d3.min(positionedNodes, (d) => d.y ?? 0) ?? 0;
      const maxY = d3.max(positionedNodes, (d) => d.y ?? 0) ?? 1;

      const graphWidth = Math.max(1, maxX - minX);
      const graphHeight = Math.max(1, maxY - minY);

      const availableWidth = MINI_MAP_WIDTH - MINI_MAP_PADDING * 2;
      const availableHeight = MINI_MAP_HEIGHT - MINI_MAP_PADDING * 2;

      const scale = Math.min(
        availableWidth / graphWidth,
        availableHeight / graphHeight,
      );

      const offsetX = (MINI_MAP_WIDTH - graphWidth * scale) / 2;
      const offsetY = (MINI_MAP_HEIGHT - graphHeight * scale) / 2;

      const mapX = (x: number) => offsetX + (x - minX) * scale;
      const mapY = (y: number) => offsetY + (y - minY) * scale;

      const invertX = (x: number) => (x - offsetX) / scale + minX;
      const invertY = (y: number) => (y - offsetY) / scale + minY;

      return {
        mapX,
        mapY,
        invertX,
        invertY,
      };
    };

    function updateMiniMap() {
      const projection = getMiniMapProjection();

      if (!projection) {
        miniMapViewport.style("opacity", "0");
        return;
      }

      const { mapX, mapY } = projection;

      miniMapLinkSel
        .attr("x1", (d) => mapX((d.source as SimNode).x ?? 0))
        .attr("y1", (d) => mapY((d.source as SimNode).y ?? 0))
        .attr("x2", (d) => mapX((d.target as SimNode).x ?? 0))
        .attr("y2", (d) => mapY((d.target as SimNode).y ?? 0))
        .style("opacity", (l) => {
          const hasQuery = query.trim().length > 0;

          if (!hasQuery) return 1;

          const sourceId = nodeId(l.source);
          const targetId = nodeId(l.target);

          const sourceNode = nodes.find((n) => n.id === sourceId);
          const targetNode = nodes.find((n) => n.id === targetId);

          return sourceNode?.searchMatch || targetNode?.searchMatch ? 0.9 : 0.1;
        });

      miniMapNodeSel
        .attr("cx", (d) => mapX(d.x ?? 0))
        .attr("cy", (d) => mapY(d.y ?? 0))
        .style("opacity", (d) => {
          const hasQuery = query.trim().length > 0;

          if (!hasQuery) return d.nodeKind === "tag" ? 0.65 : 1;

          return d.searchMatch ? 1 : 0.18;
        });

      const rect = graphContainer.getBoundingClientRect();
      const width = Math.max(300, rect.width);
      const height = Math.max(300, rect.height);

      const viewX0 = (0 - currentTransform.x) / currentTransform.k;
      const viewY0 = (0 - currentTransform.y) / currentTransform.k;
      const viewX1 = (width - currentTransform.x) / currentTransform.k;
      const viewY1 = (height - currentTransform.y) / currentTransform.k;

      const miniX0 = mapX(viewX0);
      const miniY0 = mapY(viewY0);
      const miniX1 = mapX(viewX1);
      const miniY1 = mapY(viewY1);

      miniMapViewport
        .style("opacity", "1")
        .attr("x", Math.min(miniX0, miniX1))
        .attr("y", Math.min(miniY0, miniY1))
        .attr("width", Math.abs(miniX1 - miniX0))
        .attr("height", Math.abs(miniY1 - miniY0));
    }

    miniMapSvg
      .attr("viewBox", `0 0 ${MINI_MAP_WIDTH} ${MINI_MAP_HEIGHT}`)
      .style("cursor", "crosshair")
      .on("click", (event: MouseEvent) => {
        const projection = getMiniMapProjection();

        if (!projection) return;

        const [miniX, miniY] = d3.pointer(event, miniSvgEl);
        const graphX = projection.invertX(miniX);
        const graphY = projection.invertY(miniY);

        const rect = graphContainer.getBoundingClientRect();
        const width = Math.max(300, rect.width);
        const height = Math.max(300, rect.height);

        const nextTransform = d3.zoomIdentity
          .translate(
            width / 2 - graphX * currentTransform.k,
            height / 2 - graphY * currentTransform.k,
          )
          .scale(currentTransform.k);

        svg.transition().duration(400).call(zoom.transform, nextTransform);
      });

    const applySearchAppearance = () => {
      const hasQuery = query.trim().length > 0;

      nodeSel
        .style("opacity", (d) => {
          if (!hasQuery) return 1;
          return d.searchMatch ? 1 : 0.14;
        })
        .style("filter", (d) => {
          if (hasQuery && d.searchMatch) {
            return "drop-shadow(0 0 10px rgba(255,255,255,0.75))";
          }

          if (d.nodeKind === "tag") return "none";

          return ideaGlow(getIdeaType(d as IdeaNode));
        });

      linkSel.style("opacity", (l) => {
        if (!hasQuery) return 1;

        const sourceId = nodeId(l.source);
        const targetId = nodeId(l.target);

        const sourceNode = nodes.find((n) => n.id === sourceId);
        const targetNode = nodes.find((n) => n.id === targetId);

        return sourceNode?.searchMatch || targetNode?.searchMatch ? 0.85 : 0.04;
      });

      updateMiniMap();
    };

    const applyHoverHighlight = (focus: SimNode) => {
      const focusId = focus.id;
      const neighborIds = new Set<string>([focusId]);
      const touchingLinkIds = new Set<string>();

      for (const l of visibleLinks) {
        const s = nodeId(l.source);
        const t = nodeId(l.target);

        if (s === focusId || t === focusId) {
          neighborIds.add(s);
          neighborIds.add(t);
          touchingLinkIds.add(l.id);
        }
      }

      nodeSel.style("opacity", (n) => (neighborIds.has(n.id) ? 1 : 0.18));

      linkSel
        .style("opacity", (l) => (touchingLinkIds.has(l.id) ? 1 : 0.06))
        .attr("stroke", (l) =>
          touchingLinkIds.has(l.id)
            ? "rgba(255,255,255,0.55)"
            : "rgba(255,255,255,0.10)",
        )
        .attr("stroke-width", (l) => (touchingLinkIds.has(l.id) ? 2.2 : 1));
    };

    const clearHoverHighlight = () => {
      applySearchAppearance();

      linkSel.attr("stroke", "rgba(255,255,255,0.10)").attr("stroke-width", 1);
    };

    nodeSel
      .on("click", (_event, d) => {
        if (!isClickableIdea(d)) return;
        setSelected(d);
      })
      .on("mouseenter", (event, d) => {
        hoveredNodeId = d.id;
        applyHoverHighlight(d);
        updateLabelVisibility(currentZoomScale);
        showTooltip(event as MouseEvent, d);
      })
      .on("mousemove", (event, d) => {
        moveTooltip(event as MouseEvent, d);
      })
      .on("mouseleave", () => {
        hoveredNodeId = null;
        clearHoverHighlight();
        updateLabelVisibility(currentZoomScale);
        hideTooltip();
      });

    nodeSel
      .append("circle")
      .attr("r", (d) => (d.nodeKind === "tag" ? 6 : 13))
      .attr("fill", (d) =>
        d.nodeKind === "tag"
          ? "rgba(255,255,255,0.12)"
          : ideaFill(getIdeaType(d as IdeaNode)),
      )
      .attr("stroke", (d) =>
        d.nodeKind === "tag"
          ? "rgba(255,255,255,0.35)"
          : ideaStroke(getIdeaType(d as IdeaNode)),
      )
      .attr("stroke-width", (d) => (d.nodeKind === "tag" ? 1.2 : 2))
      .style("filter", (d) =>
        d.nodeKind === "tag" ? "none" : ideaGlow(getIdeaType(d as IdeaNode)),
      );

    nodeSel
      .append("text")
      .attr("class", "node-label")
      .text((d) =>
        d.nodeKind === "tag" ? d.label : truncateLabel(d.label, 18),
      )
      .attr("x", (d) => (d.nodeKind === "tag" ? 10 : 14))
      .attr("y", 4)
      .attr("fill", (d) =>
        d.nodeKind === "tag"
          ? "rgba(255,255,255,0.8)"
          : "rgba(255,255,255,0.92)",
      )
      .attr("font-size", (d) => (d.nodeKind === "tag" ? 8 : 14))
      .attr(
        "font-family",
        "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      )
      .attr("paint-order", "stroke")
      .attr("stroke", "rgba(0,0,0,0.65)")
      .attr("stroke-width", 3)
      .style("opacity", (d) => (d.nodeKind === "tag" ? 0 : 0.78))
      .style("pointer-events", "none");

    updateLabelVisibility(DEFAULT_ZOOM_SCALE);

    const drag: d3.DragBehavior<SVGGElement, SimNode, DragSubject> = d3
      .drag<SVGGElement, SimNode>()
      .on("start", (event, d) => {
        hideTooltip();
        clearHoverHighlight();

        if (!event.active) sim.alphaTarget(0.2).restart();

        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) sim.alphaTarget(0);

        d.fx = null;
        d.fy = null;
      });

    nodeSel.call(drag);

    let hasAppliedInitialZoom = false;

    const resize = () => {
      const rect = graphContainer.getBoundingClientRect();
      const width = Math.max(300, rect.width);
      const height = Math.max(300, rect.height);

      svg.attr("width", width).attr("height", height);

      sim.force("center", d3.forceCenter(width / 2, height / 2));
      sim.alpha(0.6).restart();

      if (!hasAppliedInitialZoom) {
        hasAppliedInitialZoom = true;

        svg
          .transition()
          .duration(0)
          .call(zoom.transform, getDefaultZoomTransform());
      }

      updateMiniMap();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(graphContainer);
    resize();

    applySearchAppearance();

    sim.on("tick", () => {
      linkSel
        .attr("x1", (d) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimNode).y ?? 0);

      nodeSel.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);

      updateMiniMap();
    });

    return () => {
      resetZoomRef.current = null;
      ro.disconnect();
      sim.stop();
      tooltip.remove();
      miniMapSvg.on("click", null);
    };
  }, [nodes, links, query]);

  const panel = useMemo(() => {
    if (!selected) return null;
    if (selected.nodeKind === "tag") return null;

    const idea = selected as IdeaNode & { nodeKind: "idea" };
    const ideaType = getIdeaType(idea);

    if (ideaType !== "concept" && ideaType !== "resource") return null;

    return {
      title: idea.label,
      description: idea.description,
      url: idea.url,
      tags: idea.tags,
      relatedIdeas: [],
    };
  }, [selected]);

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <div
        ref={containerRef}
        style={{
          height: "100%",
          width: "100%",
          overflow: "hidden",
          background: "rgba(0,0,0,0.0)",
          position: "relative",
        }}
      >
        <svg ref={svgRef} style={{ display: "block" }} />
      </div>

      <section
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          width: UI_PANEL_WIDTH,
          maxHeight: "calc(100vh - 32px)",
          overflow: "visible",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(6px)",
          padding: 16,
          boxSizing: "border-box",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
          color: "white",
          zIndex: 30,
        }}
      >
        <div
          style={{
            maxHeight: "calc(100vh - 64px)",
            overflow: "visible",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>
            Graph Controls
          </div>

          <label
            style={{
              display: "block",
              fontSize: 12,
              opacity: 0.8,
              marginBottom: 6,
            }}
          >
            Search
          </label>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search ideas, tags, descriptions..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 12px",
              marginBottom: 14,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.08)",
              color: "white",
              outline: "none",
            }}
          />

          <label
            style={{
              display: "block",
              fontSize: 12,
              opacity: 0.8,
              marginBottom: 6,
            }}
          >
            Tag filter
          </label>

          <div
            ref={tagDropdownRef}
            style={{
              position: "relative",
              marginBottom: 14,
            }}
          >
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isTagDropdownOpen}
              onClick={() => setIsTagDropdownOpen((prev) => !prev)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(20,20,20,0.95)",
                color: "white",
                outline: "none",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                textAlign: "left",
              }}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {selectedTagLabel}
              </span>

              <span
                style={{
                  opacity: 0.75,
                  transform: isTagDropdownOpen
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 150ms ease",
                }}
              >
                ▾
              </span>
            </button>

            {isTagDropdownOpen ? (
              <div
                role="listbox"
                aria-label="Tag filter"
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  right: 0,
                  maxHeight:
                    TAG_DROPDOWN_ROW_HEIGHT * TAG_DROPDOWN_VISIBLE_ROWS,
                  overflowY: "auto",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(20,20,20,0.98)",
                  boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
                  zIndex: 100,
                }}
              >
                {["all", ...allTags].map((tag) => {
                  const label = tag === "all" ? "All tags" : tag;
                  const isSelected = selectedTag === tag;
                  const isHovered = hoveredTag === tag;

                  return (
                    <button
                      key={tag}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setHoveredTag(tag)}
                      onMouseLeave={() => setHoveredTag(null)}
                      onFocus={() => setHoveredTag(tag)}
                      onBlur={() => setHoveredTag(null)}
                      onClick={() => {
                        setSelectedTag(tag);
                        setIsTagDropdownOpen(false);
                        setHoveredTag(null);
                      }}
                      style={{
                        width: "100%",
                        minHeight: TAG_DROPDOWN_ROW_HEIGHT,
                        padding: "9px 12px",
                        border: "none",
                        borderBottom: "1px solid rgba(255,255,255,0.07)",
                        background: isHovered
                          ? "rgba(255,255,255,0.22)"
                          : isSelected
                            ? "rgba(255,255,255,0.14)"
                            : "transparent",
                        color: "white",
                        cursor: "pointer",
                        textAlign: "left",
                        fontWeight: isSelected ? 800 : 500,
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div
            style={{
              fontSize: 12,
              opacity: 0.8,
              marginBottom: 8,
            }}
          >
            Idea types
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginBottom: 14,
            }}
          >
            {(["concept", "resource", "person", "location"] as IdeaType[]).map(
              (type) => (
                <label
                  key={type}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    opacity: visibleTypes[type] ? 1 : 0.5,
                    textTransform: "capitalize",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={visibleTypes[type]}
                    onChange={() => toggleType(type)}
                  />
                  {type}
                </label>
              ),
            )}
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            <input
              type="checkbox"
              checked={showTags}
              onChange={() => setShowTags((prev) => !prev)}
            />
            Show tag nodes
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            <button
              type="button"
              onClick={resetView}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.08)",
                color: "white",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Reset view
            </button>

            <button
              type="button"
              onClick={resetControls}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.08)",
                color: "white",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Reset controls
            </button>
          </div>
        </div>
      </section>

      <aside
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          width: UI_PANEL_WIDTH,
          maxHeight: "calc(100vh - 32px)",
          overflow: "auto",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(6px)",
          padding: 16,
          boxSizing: "border-box",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
          color: "white",
          zIndex: 20,
        }}
      >
        {panel ? (
          <>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
              {panel.title}
            </div>

            <div
              style={{
                opacity: 0.92,
                lineHeight: 1.5,
                marginBottom: 12,
              }}
            >
              {panel.description}
            </div>

            {panel.tags.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                {panel.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: "inline-block",
                      padding: "5px 8px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.16)",
                      background: "rgba(255,255,255,0.07)",
                      fontSize: 12,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            {panel.url ? (
              <a
                href={panel.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.06)",
                  color: "white",
                  textDecoration: "none",
                  marginTop: 12,
                }}
              >
                Open link ↗
              </a>
            ) : null}
          </>
        ) : (
          <div style={{ opacity: 0.85, lineHeight: 1.5 }}>
            <p style={{ margin: 0 }}>
              Use the controls on the left to search ideas, filter by tag,
              choose which node types are visible and more.{" "}
            </p>
            <p style={{ marginTop: 12, marginBottom: 0 }}>
              Hover over nodes to highlight their connections. Hover over
              colorful nodes for a preview, then click one to open its full
              details here.
            </p>
          </div>
        )}
      </aside>

      <div
        aria-label="Graph mini-map"
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          width: MINI_MAP_WIDTH,
          height: MINI_MAP_HEIGHT,
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.16)",
          background: "rgba(0,0,0,0.42)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 18px 45px rgba(0,0,0,0.38)",
          overflow: "hidden",
          zIndex: 45,
        }}
      >
        <svg
          ref={miniMapSvgRef}
          width={MINI_MAP_WIDTH}
          height={MINI_MAP_HEIGHT}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    </div>
  );
}
