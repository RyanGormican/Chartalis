"use client";

import { Project, ComponentItem, LineProps, Link } from "./types";

/**
 * Compute approximate width/height of a node based on its attributes and operations.
 */
function getNodeSize(comp: ComponentItem) {
  const lineHeight = 16;
  const sectionPadding = 8;
  const nameHeight = lineHeight + sectionPadding;
  const attributesHeight =
    (comp.attributes?.length || 1) * lineHeight + sectionPadding;
  const operationsHeight =
    (comp.operations?.length || 1) * lineHeight + sectionPadding;
  const width = 120;
  const height = nameHeight + attributesHeight + operationsHeight;
  return { width, height };
}

/**
 * Compute the intersection point on the edge of a rectangular node
 * where a line toward a given target should exit/enter.
 */
function getEdgePoint(
  boxX: number,
  boxY: number,
  boxWidth: number,
  boxHeight: number,
  targetX: number,
  targetY: number
) {
  const cx = boxX + boxWidth / 2;
  const cy = boxY + boxHeight / 2;
  const dx = targetX - cx;
  const dy = targetY - cy;

  if (dx === 0 && dy === 0) return { x: cx, y: cy };

  const w2 = boxWidth / 2;
  const h2 = boxHeight / 2;
  const scaleX = dx !== 0 ? w2 / Math.abs(dx) : Infinity;
  const scaleY = dy !== 0 ? h2 / Math.abs(dy) : Infinity;
  const t = Math.min(scaleX, scaleY);

  return { x: cx + dx * t, y: cy + dy * t };
}

/**
 * ProjectLines renders SVG connectors between nodes in the project diagram.
 */
export default function ProjectLines({ project, positions }: LineProps) {
  const DIAMOND_SIZE = 24;
  const elements: JSX.Element[] = [];

  // Iterate over all components in the project
  Object.entries(project.content ?? {}).forEach(([key, comp]) => {
    const component = comp as ComponentItem;

    component.links?.forEach((link: Link) => {
      const linkedId = link.id;
      const type = link.type;
      const wholeEnd = link.wholeEnd;

      // Skip if missing positions or if this link was already drawn
      if (!positions[key] || !positions[linkedId] || key > linkedId) return;

      const fromPos = positions[key];
      const toPos = positions[linkedId];
      const { width: fromW, height: fromH } = getNodeSize(component);

      const toComp = project.content?.[linkedId] as ComponentItem | undefined;
      if (!toComp) return; // Guard: linked component may not exist
      const { width: toW, height: toH } = getNodeSize(toComp);

      const fromEdge = getEdgePoint(
        fromPos.x,
        fromPos.y,
        fromW,
        fromH,
        toPos.x + toW / 2,
        toPos.y + toH / 2
      );
      const toEdge = getEdgePoint(
        toPos.x,
        toPos.y,
        toW,
        toH,
        fromPos.x + fromW / 2,
        fromPos.y + fromH / 2
      );

      // Base line connecting nodes
      elements.push(
        <line
          key={`line-${key}-${linkedId}`}
          x1={fromEdge.x}
          y1={fromEdge.y}
          x2={toEdge.x}
          y2={toEdge.y}
          stroke="#888"
          strokeWidth={2}
        />
      );

      // Diamond marker for Aggregation/Composition links
      if (type === "Aggregation" || type === "Composition") {
        const dx = toEdge.x - fromEdge.x;
        const dy = toEdge.y - fromEdge.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0) return;

        const ux = dx / length;
        const uy = dy / length;

        const centerX = wholeEnd
          ? fromEdge.x + ux * DIAMOND_SIZE
          : toEdge.x - ux * DIAMOND_SIZE;
        const centerY = wholeEnd
          ? fromEdge.y + uy * DIAMOND_SIZE
          : toEdge.y - uy * DIAMOND_SIZE;

        const half = DIAMOND_SIZE / 2;
        const angle = Math.atan2(dy, dx);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const points = [
          { x: 0, y: -half },
          { x: half, y: 0 },
          { x: 0, y: half },
          { x: -half, y: 0 },
        ]
          .map(
            (p) =>
              `${centerX + p.x * cos - p.y * sin},${
                centerY + p.x * sin + p.y * cos
              }`
          )
          .join(" ");

        elements.push(
          <polygon
            key={`diamond-${key}-${linkedId}`}
            points={points}
            fill={type === "Composition" ? "#000" : "#fff"}
            stroke="#000"
            strokeWidth={2}
          />
        );
      }
    });
  });

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      {elements}
    </svg>
  );
}
