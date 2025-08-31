import { useState, useEffect } from "react";
import { Project, ComponentItem } from "../ProjectDrawer";

const REPULSION_SCALE = 6;
const ATTRACTION_SCALE = 0.1;
const BASE_EDGE_LENGTH = 300;
const MAX_ITERATIONS = 500;

function getNodeSize(comp: ComponentItem) {
  const lineHeight = 16;
  const sectionPadding = 8;
  const nameHeight = lineHeight + sectionPadding;
  const attributesHeight = (comp.attributes?.length || 1) * lineHeight + sectionPadding;
  const operationsHeight = (comp.operations?.length || 1) * lineHeight + sectionPadding;
  const width = 120;
  const height = nameHeight + attributesHeight + operationsHeight + 2;
  return { width, height };
}

function rectsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number }
) {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

export function useLayout(project: Project) {
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [worldSize, setWorldSize] = useState({ width: 2000, height: 2000 });

  useEffect(() => {
    const keys = Object.keys(project.content || {}).sort();
    if (!keys.length) return;

    const sizes: Record<string, { width: number; height: number }> = {};
    keys.forEach((k) => (sizes[k] = getNodeSize(project.content![k])));

    // Initialize positions for all nodes
    const pos: Record<string, { x: number; y: number }> = {};
    keys.forEach((k) => (pos[k] = { x: 0, y: 0 }));

    const placed = new Set<string>();
    const queue: string[] = [];

    const startNode = keys[0];
    pos[startNode] = { x: 0, y: 0 };
    placed.add(startNode);
    queue.push(startNode);

    while (queue.length > 0) {
      const currentKey = queue.shift()!;
      const currentComp = project.content![currentKey];

      const linkedKeys =
        currentComp.links?.map((l) => l.id).filter((k) => !placed.has(k)) || [];

      const n = linkedKeys.length;
      linkedKeys.forEach((k, i) => {
        const angle = (i / n) * Math.PI * 2;
        const distance = BASE_EDGE_LENGTH + (i % 2) * 40;
        pos[k] = {
          x: pos[currentKey].x + Math.cos(angle) * distance,
          y: pos[currentKey].y + Math.sin(angle) * distance,
        };
        placed.add(k);
        queue.push(k);
      });
    }

    for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
      let moved = false;

      // Repulsion between all pairs
      keys.forEach((k1) => {
        keys.forEach((k2) => {
          if (k1 >= k2) return;
          if (!pos[k1] || !pos[k2]) return;

          const b1 = { ...pos[k1], w: sizes[k1].width, h: sizes[k1].height };
          const b2 = { ...pos[k2], w: sizes[k2].width, h: sizes[k2].height };

          if (rectsOverlap(b1, b2)) {
            const dx = (b1.x + b1.w / 2) - (b2.x + b2.w / 2);
            const dy = (b1.y + b1.h / 2) - (b2.y + b2.h / 2);
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const overlapX = Math.max(0, (b1.w + b2.w) / 2 - Math.abs(dx));
            const overlapY = Math.max(0, (b1.h + b2.h) / 2 - Math.abs(dy));
            const pushX = (dx / dist) * overlapX * REPULSION_SCALE;
            const pushY = (dy / dist) * overlapY * REPULSION_SCALE;

            pos[k1].x += pushX;
            pos[k1].y += pushY;
            pos[k2].x -= pushX;
            pos[k2].y -= pushY;
            moved = true;
          }
        });
      });

      // Attraction along links
      keys.forEach((k1) => {
        const comp = project.content![k1];
        (comp.links || []).forEach(({ id }) => {
          const k2 = id;
          if (!pos[k2]) return;

          const dx = pos[k2].x - pos[k1].x;
          const dy = pos[k2].y - pos[k1].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const attraction = (dist - BASE_EDGE_LENGTH) * ATTRACTION_SCALE;
          pos[k1].x += (dx / dist) * attraction;
          pos[k1].y += (dy / dist) * attraction;
          pos[k2].x -= (dx / dist) * attraction;
          pos[k2].y -= (dy / dist) * attraction;
          moved = true;
        });
      });

      if (!moved) break;
    }

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    keys.forEach((k) => {
      const p = pos[k];
      const { width, height } = sizes[k];
      if (!p) return;
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x + width);
      maxY = Math.max(maxY, p.y + height);
    });

    const normalized: Record<string, { x: number; y: number }> = {};
    keys.forEach((k) => {
      const p = pos[k];
      if (!p) return;
      normalized[k] = { x: p.x - minX, y: p.y - minY };
    });

    setPositions(normalized);
    setWorldSize({ width: Math.max(800, maxX - minX), height: Math.max(600, maxY - minY) });
  }, [project]);

  return { positions, worldSize };
}
