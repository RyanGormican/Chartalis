"use client";
import { useEffect, useRef, useState } from "react";
import { Box, Typography, Stack, Button, IconButton, Select, MenuItem } from "@mui/material";
import { Icon } from "@iconify/react";
import * as htmlToImage from "html-to-image";
import { useTranslate } from "../translate/TranslateContext";
import ProjectDrawer, { Project, ComponentItem } from "./ProjectDrawer";

type ProjectViewProps = {
  project: Project;
  goBack: () => void;
  updateLocalStorage: (updatedProject: Project) => void;
};

export default function ProjectView({ project, goBack, updateLocalStorage }: ProjectViewProps) {
  const { translate } = useTranslate();

  const [currentProject, setCurrentProject] = useState<Project>({
    ...project,
    content: project.content || {}
  });

  const [selectedComponentKey, setSelectedComponentKey] = useState<string | null>(null);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [worldSize, setWorldSize] = useState({ width: 2000, height: 2000 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

  const BOX_WIDTH = 120;
  const BOX_HEIGHT = 40;
  const PADDING = 40;

  // --- Line / rectangle intersection ---
  const lineIntersectsRect = (
    x1: number, y1: number, x2: number, y2: number,
    rx: number, ry: number, rw: number, rh: number
  ) => {
    const left = rx, right = rx + rw, top = ry, bottom = ry + rh;
    const intersects = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) => {
      const det = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
      if (det === 0) return false;
      const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / det;
      const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / det;
      return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
    };
    return (
      intersects(x1, y1, x2, y2, left, top, right, top) ||
      intersects(x1, y1, x2, y2, right, top, right, bottom) ||
      intersects(x1, y1, x2, y2, right, bottom, left, bottom) ||
      intersects(x1, y1, x2, y2, left, bottom, left, top)
    );
  };

  // --- Layout with force-based collision + line avoidance ---
  const computeLayout = () => {
    const keys = Object.keys(currentProject.content || {});
    if (keys.length === 0) return;

    let pos: Record<string, { x: number; y: number }> = {};
    const cols = Math.ceil(Math.sqrt(keys.length));
    keys.forEach((k, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      pos[k] = { x: PADDING + col * (BOX_WIDTH + PADDING), y: PADDING + row * (BOX_HEIGHT + PADDING) };
    });

    const iterations = 500;
    const repulsion = 15;
    const linePush = 20;

    for (let iter = 0; iter < iterations; iter++) {
      let moved = false;

      // 1) Repulsion between boxes
      keys.forEach((k1) => {
        keys.forEach((k2) => {
          if (k1 === k2) return;
          const b1 = pos[k1], b2 = pos[k2];
          const dx = b1.x - b2.x, dy = b1.y - b2.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
          if (dist < BOX_WIDTH) {
            const push = (BOX_WIDTH - dist) / 2;
            b1.x += (dx / dist) * push;
            b1.y += (dy / dist) * push;
            b2.x -= (dx / dist) * push;
            b2.y -= (dy / dist) * push;
            moved = true;
          }
        });
      });

      // 2) Avoid lines crossing boxes
      keys.forEach((fromId) => {
        (currentProject.content![fromId].links || []).forEach((toId) => {
          const from = pos[fromId], to = pos[toId];
          const x1 = from.x + BOX_WIDTH / 2, y1 = from.y + BOX_HEIGHT / 2;
          const x2 = to.x + BOX_WIDTH / 2, y2 = to.y + BOX_HEIGHT / 2;

          keys.forEach((otherId) => {
            if (otherId === fromId || otherId === toId) return;
            const other = pos[otherId];
            if (lineIntersectsRect(x1, y1, x2, y2, other.x, other.y, BOX_WIDTH, BOX_HEIGHT)) {
              const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2;
              const dx = other.x + BOX_WIDTH / 2 - midX;
              const dy = other.y + BOX_HEIGHT / 2 - midY;
              const len = Math.sqrt(dx * dx + dy * dy) || 0.1;
              other.x += (dx / len) * linePush;
              other.y += (dy / len) * linePush;
              moved = true;
            }
          });
        });
      });

      if (!moved) break;
    }

    // compute world bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    Object.values(pos).forEach((p) => {
      minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x + BOX_WIDTH); maxY = Math.max(maxY, p.y + BOX_HEIGHT);
    });

    minX -= PADDING; minY -= PADDING; maxX += PADDING; maxY += PADDING;
    const normalized: Record<string, { x: number; y: number }> = {};
    Object.entries(pos).forEach(([k, p]) => { normalized[k] = { x: p.x - minX, y: p.y - minY }; });
    setPositions(normalized);
    setWorldSize({ width: Math.max(800, maxX - minX), height: Math.max(600, maxY - minY) });

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      setOffset({ x: containerRect.width / 2 - (maxX - minX) / 2, y: containerRect.height / 2 - (maxY - minY) / 2 });
    } else {
      setOffset({ x: 100, y: 100 });
    }
  };

  useEffect(() => { computeLayout(); }, [currentProject.content]);

  // --- Pointer Pan ---
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isPanningRef.current = true;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch { }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isPanningRef.current || !lastPointerRef.current) return;
    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e?: React.PointerEvent) => {
    isPanningRef.current = false;
    lastPointerRef.current = null;
    if (e) try { (e.target as Element).releasePointerCapture?.(e.pointerId); } catch { }
  };

  // --- Wheel Zoom ---
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const containerRect = containerRef.current!.getBoundingClientRect();
    const pointerX = e.clientX - containerRect.left;
    const pointerY = e.clientY - containerRect.top;
    const worldX = (pointerX - offset.x) / scale;
    const worldY = (pointerY - offset.y) / scale;

    const delta = -e.deltaY;
    const zoomFactor = Math.exp(delta * 0.0012);
    const newScale = Math.max(0.2, Math.min(5, scale * zoomFactor));
    setOffset({ x: pointerX - worldX * newScale, y: pointerY - worldY * newScale });
    setScale(newScale);
  };

  // --- Export ---
  const downloadPng = (dataUrl: string) => { const link = document.createElement("a"); link.href = dataUrl; link.download = `${Date.now()}.png`; link.click(); };
  const exportFullProject = async () => {
    if (!canvasRef.current) return;
    const node = canvasRef.current;
    const prevTransform = node.style.transform;
    node.style.transform = `translate(0,0) scale(1)`;
    try {
      const dataUrl = await htmlToImage.toPng(node, { width: worldSize.width, height: worldSize.height, style: { width: `${worldSize.width}px`, height: `${worldSize.height}px`, transformOrigin: "0 0" } });
      downloadPng(dataUrl);
    } finally { node.style.transform = prevTransform; }
  };
  const exportViewport = async () => {
    if (!containerRef.current) return;
    const dataUrl = await htmlToImage.toPng(containerRef.current, { style: { transformOrigin: "0 0" } });
    downloadPng(dataUrl);
  };

  // --- Add / select component ---
  const addNewComponent = (linkTo?: string) => {
    const key = crypto.randomUUID();
    const newComponent: ComponentItem = { id: key, name: `Component ${Object.keys(currentProject.content!).length + 1}`, links: linkTo ? [linkTo] : [], color: "#fff" };
    const updatedContent: Record<string, ComponentItem> = { ...currentProject.content!, [key]: newComponent };
    if (linkTo) updatedContent[linkTo] = { ...updatedContent[linkTo], links: [...(updatedContent[linkTo].links || []), key] };
    const updatedProject: Project = { ...currentProject, content: updatedContent };
    setCurrentProject(updatedProject);
    updateLocalStorage(updatedProject);
  };
  const openRenameMenu = (key: string) => { setSelectedComponentKey(key); setSideMenuOpen(true); };

  const renderLines = () => {
    const lines: JSX.Element[] = [];
    Object.entries(currentProject.content || {}).forEach(([key, comp]) => {
      (comp.links || []).forEach(linkedId => {
        if (positions[key] && positions[linkedId] && key < linkedId) {
          const from = positions[key], to = positions[linkedId];
          lines.push(<line key={`${key}-${linkedId}`} x1={from.x + BOX_WIDTH / 2} y1={from.y + BOX_HEIGHT / 2} x2={to.x + BOX_WIDTH / 2} y2={to.y + BOX_HEIGHT / 2} stroke="#888" strokeWidth={2} />);
        }
      });
    });
    return lines;
  };

  const contentEmpty = !currentProject.content || Object.keys(currentProject.content).length === 0;

  return (
    <Box sx={{ height: "90vh", display: "flex", flexDirection: "column", p: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button variant="contained" onClick={goBack}>{translate("back")}</Button>
        <Typography variant="h5" sx={{ flex: 1 }}>{currentProject.name}</Typography>
        <IconButton onClick={exportFullProject} title="Export full project"><Icon icon="mdi:perimeter" width="24" height="24" /></IconButton>
        <IconButton onClick={exportViewport} title="Export viewport"><Icon icon="material-symbols:camera" width="24" height="24" /></IconButton>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
  <Select
    size="small"
    displayEmpty
    value={selectedComponentKey || ""}
    onChange={(e) => {
      const key = e.target.value;
      setSelectedComponentKey(key);
      if (key && positions[key] && containerRef.current) {
        const box = positions[key];
        const containerRect = containerRef.current.getBoundingClientRect();
        // Center the selected box
        setOffset({
          x: containerRect.width / 2 - (box.x + BOX_WIDTH / 2) * scale,
          y: containerRect.height / 2 - (box.y + BOX_HEIGHT / 2) * scale
        });
      }
    }}
  >
    <MenuItem value="" disabled>
      {translate("go_to_component")}
    </MenuItem>
    {Object.entries(currentProject.content || {}).map(([key, comp]) => (
      <MenuItem key={key} value={key}>
        {comp.name}
      </MenuItem>
    ))}
  </Select>
</Stack>
      </Stack>

      <Box
        ref={containerRef}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        sx={{
          flex: 1,
          mt: 2,
          border: "2px solid #ccc",
          borderRadius: 1,
          backgroundColor: "#f9f9f9",
          position: "relative",
          overflow: "hidden",
          touchAction: "none",
          cursor: isPanningRef.current ? "grabbing" : "grab"
        }}
      >
        <Box ref={canvasRef} sx={{
          position: "absolute",
          left: 0, top: 0,
          width: `${worldSize.width}px`, height: `${worldSize.height}px`,
          transform: `translate(${offset.x}px,${offset.y}px) scale(${scale})`,
          transformOrigin: "0 0",
          willChange: "transform"
        }}>
          <svg width={worldSize.width} height={worldSize.height} style={{ display: "block", position: "absolute", left: 0, top: 0 }}>
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.15" />
              </filter>
            </defs>
            {renderLines()}
          </svg>

          {contentEmpty ? (
            <Button variant="outlined" onClick={() => addNewComponent()} sx={{ position: "absolute", left: worldSize.width / 2 - 60, top: worldSize.height / 2 - 20 }}>
              {translate("new_component")}
            </Button>
          ) : (
            Object.entries(currentProject.content!).map(([key, comp]) => {
              const p = positions[key] || { x: 0, y: 0 };
              return (
                <Box key={key} onClick={() => openRenameMenu(key)}
                  sx={{
                    position: "absolute",
                    left: p.x,
                    top: p.y,
                    width: BOX_WIDTH,
                    minHeight: BOX_HEIGHT,
                    border: "1px solid #999",
                    borderRadius: 1,
                    p: 1,
                    textAlign: "center",
                    backgroundColor: comp.color || "#fff",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                    userSelect: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}>
                  <Typography sx={{ fontSize: 13 }}>{comp.name}</Typography>
                </Box>
              );
            })
          )}
        </Box>
      </Box>

      <ProjectDrawer
        open={sideMenuOpen}
        onClose={() => setSideMenuOpen(false)}
        project={currentProject}
        selectedComponentKey={selectedComponentKey}
        setProject={setCurrentProject}
        addNewComponent={addNewComponent}
        updateLocalStorage={updateLocalStorage}
      />
    </Box>
  );
}
