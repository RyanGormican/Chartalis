import { useState, useEffect } from "react";
import { Project, ComponentItem } from "../ProjectDrawer";

const PADDING = 120; // base spacing between nodes
const REPULSION_SCALE = 4; // repulsion factor for overlapping nodes
const LINE_AVOIDANCE_SCALE = 11; // perpendicular push for line avoidance
const ATTRACTION_SCALE = 0.1; // weak attraction along edges
const DESIRED_EDGE_LENGTH = 25; // preferred distance for connected nodes
const MAX_ITERATIONS = 1000;

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

function rectsOverlap(a: { x: number, y: number, w: number, h: number }, b: { x: number, y: number, w: number, h: number }) {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

function lineIntersectsRect(x1: number, y1: number, x2: number, y2: number, rect: { x: number, y: number, w: number, h: number }) {
  const rx1 = rect.x, ry1 = rect.y, rx2 = rect.x + rect.w, ry2 = rect.y + rect.h;
  return !(Math.max(x1, x2) < rx1 || Math.min(x1, x2) > rx2 || Math.max(y1, y2) < ry1 || Math.min(y1, y2) > ry2);
}

export function useLayout(project: Project) {
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [worldSize, setWorldSize] = useState({ width: 2000, height: 2000 });

  useEffect(() => {
    const keys = Object.keys(project.content || {});
    if (!keys.length) return;

    const sizes: Record<string, { width: number; height: number }> = {};
    keys.forEach(k => sizes[k] = getNodeSize(project.content![k]));

    // Initial grid placement with small random offsets to prevent uniform direction
    const pos: Record<string, { x: number, y: number }> = {};
    const cols = Math.ceil(Math.sqrt(keys.length));
    keys.forEach((k, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      pos[k] = { 
        x: PADDING + col * (sizes[k].width + PADDING) + (Math.random() - 0.5) * PADDING * 0.25, // slightly randomize x
        y: PADDING + row * (sizes[k].height + PADDING) + (Math.random() - 0.5) * PADDING * 0.25  // slightly randomize y
      };
    });

    for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
      let moved = false;

      // Repulsion between overlapping nodes
      keys.forEach(k1 => {
        keys.forEach(k2 => {
          if (k1 === k2) return;
          const b1 = { ...pos[k1], w: sizes[k1].width, h: sizes[k1].height };
          const b2 = { ...pos[k2], w: sizes[k2].width, h: sizes[k2].height };
          if (rectsOverlap(b1, b2)) {
            const dx = (b1.x + b1.w/2) - (b2.x + b2.w/2);
            const dy = (b1.y + b1.h/2) - (b2.y + b2.h/2);
            const dist = Math.sqrt(dx*dx + dy*dy) || 1;

            // Push nodes apart proportionally to overlap
            const overlapX = Math.max(0, (b1.w + b2.w)/2 - Math.abs(dx));
            const overlapY = Math.max(0, (b1.h + b2.h)/2 - Math.abs(dy));
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

      // Avoid lines crossing other boxes
      keys.forEach(k1 => {
        keys.forEach(k2 => {
          if (k1 === k2) return;
          const start = { x: pos[k1].x + sizes[k1].width/2, y: pos[k1].y + sizes[k1].height/2 };
          const end = { x: pos[k2].x + sizes[k2].width/2, y: pos[k2].y + sizes[k2].height/2 };
          keys.forEach(k3 => {
            if (k3 === k1 || k3 === k2) return;
            const b3 = { ...pos[k3], w: sizes[k3].width, h: sizes[k3].height };
            if (lineIntersectsRect(start.x, start.y, end.x, end.y, b3)) {
              const dx = end.x - start.x;
              const dy = end.y - start.y;
              const norm = Math.sqrt(dx*dx + dy*dy) || 1;
              const pushX = (dy / norm) * LINE_AVOIDANCE_SCALE * PADDING;
              const pushY = (-dx / norm) * LINE_AVOIDANCE_SCALE * PADDING;
              pos[k1].x += pushX;
              pos[k1].y += pushY;
              pos[k2].x += pushX;
              pos[k2].y += pushY;
              moved = true;
            }
          });
        });
      });

      // Soft attraction along edges
      keys.forEach(k1 => {
        keys.forEach(k2 => {
          if (k1 === k2) return;
          const start = { x: pos[k1].x + sizes[k1].width/2, y: pos[k1].y + sizes[k1].height/2 };
          const end = { x: pos[k2].x + sizes[k2].width/2, y: pos[k2].y + sizes[k2].height/2 };
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const dist = Math.sqrt(dx*dx + dy*dy) || 1;
          const attraction = (dist - DESIRED_EDGE_LENGTH) * ATTRACTION_SCALE;
          pos[k1].x += (dx / dist) * attraction;
          pos[k1].y += (dy / dist) * attraction;
          pos[k2].x -= (dx / dist) * attraction;
          pos[k2].y -= (dy / dist) * attraction;
          moved = true;
        });
      });

      if (!moved) break; // stop if no node moved
    }

    // Normalize positions to top-left corner
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    keys.forEach(k => {
      const p = pos[k];
      const { width, height } = sizes[k];
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x + width);
      maxY = Math.max(maxY, p.y + height);
    });

    const normalized: Record<string, { x: number; y: number }> = {};
    keys.forEach(k => normalized[k] = { x: pos[k].x - minX, y: pos[k].y - minY });

    setPositions(normalized);
    setWorldSize({ width: Math.max(800, maxX - minX), height: Math.max(600, maxY - minY) });
  }, [project]);

  return { positions, worldSize };
}
