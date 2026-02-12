import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { ideaNodes, type IdeaNode } from "../data/ideasGraph";

type TagNode = {
  id: string; // e.g. "tag:systems"
  label: string; // e.g. "systems"
  type: "tag";
  tag: string;
};

type GraphNode =
  | (IdeaNode & { nodeKind: "idea" })
  | (TagNode & { nodeKind: "tag" });

type SimNode = d3.SimulationNodeDatum & GraphNode;

type GraphLink = {
  id: string;
  source: string | SimNode;
  target: string | SimNode;
  kind: "idea-tag" | "tag-tag";
  weight: number; // used for stroke/force strength
};

// D3-friendly link datum (source/target become SimNode once simulation runs)
type LinkDatum = d3.SimulationLinkDatum<SimNode> & GraphLink;

// Drag subject typing (no `any`)
type DragSubject = SimNode | d3.SubjectPosition;

type IdeaSimNode = d3.SimulationNodeDatum & (IdeaNode & { nodeKind: "idea" });
type TagSimNode = d3.SimulationNodeDatum & (TagNode & { nodeKind: "tag" });

export default function IdeasGraphView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [selected, setSelected] = useState<GraphNode | null>(null);

  // Color helpers (concept vs resource vs others)
  const ideaFill = (t?: IdeaNode["type"]) => {
    switch (t) {
      case "concept":
        return "rgba(70, 210, 255, 0.85)"; // aqua
      case "resource":
        return "rgba(255, 210, 70, 0.85)"; // gold
      case "person":
        return "rgba(190, 190, 190, 0.85)"; // neutral
      case "idea":
      default:
        return "rgba(220, 120, 255, 0.85)"; // magenta-ish
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
      case "idea":
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
      case "idea":
      default:
        return "drop-shadow(0 0 6px rgba(220, 120, 255, 0.45))";
    }
  };

  const { nodes, links } = useMemo(() => {
    // 1) Make idea sim nodes
    const ideaSimNodes: IdeaSimNode[] = ideaNodes.map((n) => ({
      ...n,
      nodeKind: "idea",
    }));

    // 2) Build unique tags
    const tagSet = new Set<string>();
    for (const n of ideaNodes) for (const t of n.tags) tagSet.add(t);

    const tagNodes: TagSimNode[] = Array.from(tagSet)
      .sort((a, b) => a.localeCompare(b))
      .map((tag) => ({
        id: `tag:${tag}`,
        label: tag,
        type: "tag",
        tag,
        nodeKind: "tag",
      }));

    const tagIndex = new Map<string, string>(); // tag -> nodeId ("tag:xxx")
    for (const tn of tagNodes) tagIndex.set(tn.tag, tn.id);

    // 3) Links: idea -> tag
    const builtLinks: GraphLink[] = [];
    for (const idea of ideaNodes) {
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

    // 4) Links: tag <-> tag based on co-occurrence within the same idea
    // NOTE: We still compute these, but we won't render them (see visibleLinks below).
    const pairCounts = new Map<string, number>();
    const pairKey = (a: string, b: string) =>
      a < b ? `${a}||${b}` : `${b}||${a}`;

    for (const idea of ideaNodes) {
      const tags = Array.from(new Set(idea.tags)); // de-dupe within node
      for (let i = 0; i < tags.length; i++) {
        for (let j = i + 1; j < tags.length; j++) {
          const k = pairKey(tags[i], tags[j]);
          pairCounts.set(k, (pairCounts.get(k) ?? 0) + 1);
        }
      }
    }

    // Convert counts -> links (you can threshold to reduce clutter)
    const CO_OCCURRENCE_THRESHOLD = 1; // bump to 2+ when you have more data
    for (const [k, count] of pairCounts.entries()) {
      if (count < CO_OCCURRENCE_THRESHOLD) continue;
      const [a, b] = k.split("||");
      const aId = tagIndex.get(a);
      const bId = tagIndex.get(b);
      if (!aId || !bId) continue;

      builtLinks.push({
        id: `L:tag-tag:${aId}<->${bId}`,
        source: aId,
        target: bId,
        kind: "tag-tag",
        weight: count, // higher count => stronger
      });
    }

    return {
      nodes: [...ideaSimNodes, ...tagNodes],
      links: builtLinks,
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const svgEl = svgRef.current;
    if (!container || !svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();

    // --- HTML tooltip (inside container so positioning is easy) ---
    // Remove any previous tooltip (in case of hot reload / effect reruns)
    d3.select(container).selectAll("div.hover-tooltip").remove();

    const tooltip = d3
      .select(container)
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
      const t = (d as IdeaNode).type;
      if (t !== "concept" && t !== "resource") return;

      const rect = container.getBoundingClientRect();
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
      const t = (d as IdeaNode).type;
      if (t !== "concept" && t !== "resource") return;

      const rect = container.getBoundingClientRect();
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

    // Zoom/pan
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 3])
      .on("zoom", (event) => {
        gRoot.attr("transform", event.transform.toString());
      });

    svg.call(zoom);

    // ---- Simulation with links ----
    const sim = d3
      .forceSimulation<SimNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, LinkDatum>(links as LinkDatum[])
          .id((d) => d.id)
          .distance((l) => (l.kind === "tag-tag" ? 90 : 130))
          .strength((l) => {
            if (l.kind === "tag-tag") return Math.min(0.4, 0.08 * l.weight);
            return 0.18;
          }),
      )
      .force("charge", d3.forceManyBody().strength(-420))
      .force(
        "collide",
        d3.forceCollide((d: SimNode) => (d.nodeKind === "tag" ? 18 : 26)),
      )
      .force("x", d3.forceX(0).strength(0.03))
      .force("y", d3.forceY(0).strength(0.03));

    // ---- Render links (hide tag-tag interconnections) ----
    const visibleLinks: LinkDatum[] = (links as LinkDatum[]).filter(
      (l) => l.kind !== "tag-tag",
    );

    const linkSel = linkLayer
      .selectAll<SVGLineElement, LinkDatum>("line.link")
      .data(visibleLinks, (d) => d.id)
      .join("line")
      .attr("class", "link")
      .attr("stroke", "rgba(255,255,255,0.10)")
      .attr("stroke-width", 1)
      .attr("stroke-linecap", "round");

    // ---- Render nodes (group with circle + label) ----
    const isClickableIdea = (d: SimNode) =>
      d.nodeKind === "idea" &&
      ((d as IdeaNode).type === "concept" ||
        (d as IdeaNode).type === "resource");

    const nodeSel = nodeLayer
      .selectAll<SVGGElement, SimNode>("g.node")
      .data(nodes, (d) => d.id)
      .join("g")
      .attr("class", "node")
      .style("cursor", (d) => (isClickableIdea(d) ? "pointer" : "default"))
      .on("click", (_event, d) => {
        if (!isClickableIdea(d)) return; // tags + other idea types do nothing
        setSelected(d);
      })
      .on("mouseenter", (event, d) => showTooltip(event as MouseEvent, d))
      .on("mousemove", (event, d) => moveTooltip(event as MouseEvent, d))
      .on("mouseleave", () => hideTooltip());

    nodeSel
      .append("circle")
      .attr("r", (d) => (d.nodeKind === "tag" ? 7 : 10))
      .attr("fill", (d) => {
        if (d.nodeKind === "tag") return "rgba(255,255,255,0.12)";
        return ideaFill((d as IdeaNode).type);
      })
      .attr("stroke", (d) => {
        if (d.nodeKind === "tag") return "rgba(255,255,255,0.35)";
        return ideaStroke((d as IdeaNode).type);
      })
      .attr("stroke-width", (d) => (d.nodeKind === "tag" ? 1.2 : 2))
      .style("filter", (d) => {
        if (d.nodeKind === "tag") return "none";
        return ideaGlow((d as IdeaNode).type);
      });

    nodeSel
      .append("text")
      .text((d) => d.label)
      .attr("x", (d) => (d.nodeKind === "tag" ? 10 : 14))
      .attr("y", 4)
      .attr("fill", (d) =>
        d.nodeKind === "tag"
          ? "rgba(255,255,255,0.8)"
          : "rgba(255,255,255,0.92)",
      )
      .attr("font-size", (d) => (d.nodeKind === "tag" ? 8 : 16))
      .attr(
        "font-family",
        "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      )
      .attr("paint-order", "stroke")
      .attr("stroke", "rgba(0,0,0,0.65)")
      .attr("stroke-width", 3);

    // Drag (pin after drag)
    const drag: d3.DragBehavior<SVGGElement, SimNode, DragSubject> = d3
      .drag<SVGGElement, SimNode>()
      .on("start", (event, d) => {
        hideTooltip(); // avoid weirdness while dragging
        if (!event.active) sim.alphaTarget(0.2).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event) => {
        if (!event.active) sim.alphaTarget(0);
      });

    nodeSel.call(drag);

    // Responsive sizing + center force update
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(300, rect.width);
      const height = Math.max(300, rect.height);

      svg.attr("width", width).attr("height", height);
      sim.force("center", d3.forceCenter(width / 2, height / 2));
      sim.alpha(0.6).restart();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    // Tick updates
    sim.on("tick", () => {
      linkSel
        .attr("x1", (d) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimNode).y ?? 0);

      nodeSel.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      ro.disconnect();
      sim.stop();
      tooltip.remove();
    };
  }, [nodes, links]);

  // Right panel content: only concept/resource ideas
  const panel = useMemo(() => {
    if (!selected) return null;

    // No tag click effects / no tag details
    if (selected.nodeKind === "tag") return null;

    const idea = selected as IdeaNode & { nodeKind: "idea" };

    // Only concepts/resources show panel content
    if (idea.type !== "concept" && idea.type !== "resource") return null;

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

      <aside
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          width: 360,
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
        }}
      >
        {panel ? (
          <>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
              {panel.title}
            </div>
            <div style={{ opacity: 0.92, lineHeight: 1.5, marginBottom: 12 }}>
              {panel.description}
            </div>

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
                  marginBottom: 14,
                }}
              >
                Open link ↗
              </a>
            ) : null}

            {panel.tags.length ? (
              <>
                <div style={{ opacity: 0.8, fontSize: 13, marginBottom: 6 }}>
                  Tags
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {panel.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: 12,
                        padding: "6px 10px",
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.18)",
                        background: "rgba(255,255,255,0.05)",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </>
            ) : null}
          </>
        ) : (
          <div style={{ opacity: 0.85, lineHeight: 1.5 }}>
            Explore the graph by hovering over concept and resource nodes to
            preview descriptions, clicking any to see full details in the right
            panel.
          </div>
        )}
      </aside>
    </div>
  );
}
