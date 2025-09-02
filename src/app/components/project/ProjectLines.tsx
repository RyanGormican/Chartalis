"use client";

import { Project, ComponentItem, LineProps, Link } from "./types";

/**
 * Compute size of a UML node based on its content
 */
function getNodeSize(comp: ComponentItem) {
  const lineHeight = 16;
  const sectionPadding = 8;
  const nameHeight = lineHeight + sectionPadding;
  const attributesHeight = (comp.attributes?.length || 1) * lineHeight + sectionPadding;
  const operationsHeight = (comp.operations?.length || 1) * lineHeight + sectionPadding;
  const width = 120;
  const height = nameHeight + attributesHeight + operationsHeight;
  return { width, height };
}

/**
 * Compute the edge point of a box for a line towards a target
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
 * Draw a straight line
 */
function drawLine(fromX: number, fromY: number, toX: number, toY: number, dashed = false, key = "") {
  return (
    <line
      key={`line-${key}`}
      x1={fromX}
      y1={fromY}
      x2={toX}
      y2={toY}
      stroke="#000"
      strokeWidth={2}
      strokeDasharray={dashed ? "6,4" : undefined}
      strokeLinecap="butt"
    />
  );
}

/**
 * Draw a triangular arrow or V-shaped arrow
 */
function drawArrow(
  tipX: number,
  tipY: number,
  ux: number,
  uy: number,
  size: number,
  type: "filled" | "hollow" | "open",
  key = ""
) {
  if (type === "open") {
    // V-shaped arrow
    const backX = tipX - ux * size;
    const backY = tipY - uy * size;
    const perpX = -uy * (size / 2);
    const perpY = ux * (size / 2);
    return (
      <>
        <line
          key={`arrow-${key}-1`}
          x1={backX + perpX}
          y1={backY + perpY}
          x2={tipX}
          y2={tipY}
          stroke="#000"
          strokeWidth={2}
        />
        <line
          key={`arrow-${key}-2`}
          x1={backX - perpX}
          y1={backY - perpY}
          x2={tipX}
          y2={tipY}
          stroke="#000"
          strokeWidth={2}
        />
      </>
    );
  } else {
    // Filled or hollow triangle
    const baseX = tipX - ux * size;
    const baseY = tipY - uy * size;
    const perpX = -uy * (size / 2);
    const perpY = ux * (size / 2);
    let fill = type === "hollow" ? "#fff" : "#000";
    return (
      <polygon
        key={`arrow-${key}`}
        points={[`${tipX},${tipY}`, `${baseX + perpX},${baseY + perpY}`, `${baseX - perpX},${baseY - perpY}`].join(",")}
        fill={fill}
        stroke="#000"
        strokeWidth={2}
      />
    );
  }
}

/**
 * Draw a diamond for aggregation/composition
 */
function drawDiamond(
  centerX: number,
  centerY: number,
  ux: number,
  uy: number,
  size: number,
  filled: boolean,
  key = ""
) {
  const half = size / 2;
  const angle = Math.atan2(uy, ux);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const points = [
    { x: 0, y: -half },
    { x: half, y: 0 },
    { x: 0, y: half },
    { x: -half, y: 0 },
  ]
    .map(p => `${centerX + p.x * cos - p.y * sin},${centerY + p.x * sin + p.y * cos}`)
    .join(" ");

  return (
    <polygon
      key={`diamond-${key}`}
      points={points}
      fill={filled ? "#000" : "#fff"}
      stroke="#000"
      strokeWidth={2}
    />
  );
}

/**
 * Render all lines/arrows/diamonds for UML relationships
 */
export default function ProjectLines({ project, positions }: LineProps) {
  const DIAMOND_SIZE = 24;
  const ARROW_SIZE = 12;
  const TRIANGLE_SIZE = 12;

  const elements: JSX.Element[] = [];

  Object.entries(project.content ?? {}).forEach(([key, comp]) => {
    const component = comp as ComponentItem;
    const fromPos = positions[key];
    if (!fromPos) return;
    const { width: fromW, height: fromH } = getNodeSize(component);

    component.links?.forEach((link: Link) => {
      const linkedId = link.id;
      const type = link.type;
      const wholeEnd = link.wholeEnd;
      const toPos = positions[linkedId];
      if (!toPos) return;
      const toComp = project.content?.[linkedId] as ComponentItem | undefined;
      if (!toComp) return;
      const { width: toW, height: toH } = getNodeSize(toComp);

      const fromEdge = getEdgePoint(fromPos.x, fromPos.y, fromW, fromH, toPos.x + toW / 2, toPos.y + toH / 2);
      const toEdge = getEdgePoint(toPos.x, toPos.y, toW, toH, fromPos.x + fromW / 2, fromPos.y + fromH / 2);

      const dx = toEdge.x - fromEdge.x;
      const dy = toEdge.y - fromEdge.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length === 0) return;
      const ux = dx / length;
      const uy = dy / length;

      const isDashed = type === "Realization" || type === "Dependency";

      // --- Draw line ---
      elements.push(drawLine(fromEdge.x, fromEdge.y, toEdge.x, toEdge.y, isDashed, `${key}-${linkedId}`));

      // --- Draw arrows / diamonds ---
      if (wholeEnd) {
        if (type === "Association") {
          elements.push(drawArrow(toEdge.x, toEdge.y, ux, uy, ARROW_SIZE, "filled", `${key}-${linkedId}`));
        } else if (type === "Aggregation") {
          const diamondX = fromEdge.x + ux * DIAMOND_SIZE;
          const diamondY = fromEdge.y + uy * DIAMOND_SIZE;
          elements.push(drawDiamond(diamondX, diamondY, ux, uy, DIAMOND_SIZE, false, `${key}-${linkedId}`));
        } else if (type === "Composition") {
          const diamondX = fromEdge.x + ux * DIAMOND_SIZE;
          const diamondY = fromEdge.y + uy * DIAMOND_SIZE;
          elements.push(drawDiamond(diamondX, diamondY, ux, uy, DIAMOND_SIZE, true, `${key}-${linkedId}`));
        } else if (type === "Inheritance" || type === "Realization") {
          elements.push(drawArrow(toEdge.x, toEdge.y, ux, uy, TRIANGLE_SIZE, "hollow", `${key}-${linkedId}`));
        } else if (type === "Dependency") {
          elements.push(drawArrow(toEdge.x, toEdge.y, ux, uy, ARROW_SIZE, "open", `${key}-${linkedId}`));
        }
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
