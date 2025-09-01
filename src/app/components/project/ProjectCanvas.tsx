"use client";
import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import { Box, Button } from "@mui/material";
import ProjectNode from "./ProjectNode";
import ProjectLines from "./ProjectLines";
import { Project, ComponentItem, Link, CanvasProps, ProjectCanvasHandle } from "./types";
import { useLayout } from "./hooks/useLayout";



const ProjectCanvas = forwardRef<ProjectCanvasHandle, CanvasProps>(
  (
    { project, selectedComponentKey, setSelectedComponentKey, addNewComponent, openRenameMenu },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLDivElement | null>(null);

    const isPanningRef = useRef(false);
    const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

    const [offset, setOffset] = useState({ x: 100, y: 100 });
    const [scale, setScale] = useState(1);

    const { positions, worldSize } = useLayout(project);

    // Expose canvasRef and worldSize to parent
    useImperativeHandle(ref, () => ({
      canvasRef: canvasRef.current,
      worldSize,
    }));

    // Center selected component in viewport
    useEffect(() => {
      if (!selectedComponentKey || !positions[selectedComponentKey] || !containerRef.current) return;
      const box = positions[selectedComponentKey];
      const containerRect = containerRef.current.getBoundingClientRect();
      setOffset({
        x: containerRect.width / 2 - box.x * scale - 60,
        y: containerRect.height / 2 - box.y * scale - 20,
      });
    }, [selectedComponentKey, positions, scale]);

    // Panning handlers
    const onPointerDown = (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      isPanningRef.current = true;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      (e.target as Element).setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: React.PointerEvent) => {
      if (!isPanningRef.current || !lastPointerRef.current) return;
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e?: React.PointerEvent) => {
      isPanningRef.current = false;
      lastPointerRef.current = null;
      if (e) (e.target as Element).releasePointerCapture?.(e.pointerId);
    };

    // Zoom handler
    const onWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;
      const worldX = (pointerX - offset.x) / scale;
      const worldY = (pointerY - offset.y) / scale;
      const zoomFactor = Math.exp(-e.deltaY * 0.0012);
      const newScale = Math.max(0.2, Math.min(5, scale * zoomFactor));
      setOffset({
        x: pointerX - worldX * newScale,
        y: pointerY - worldY * newScale,
      });
      setScale(newScale);
    };

    const safeContent: Record<string, ComponentItem> = {};

    if (project.content) {
      // Ensure every component has a string color
      Object.entries(project.content).forEach(([key, comp]) => {
        safeContent[key] = { color: "#ffffff", ...comp };
      });
    }

    const contentEmpty = Object.keys(safeContent).length === 0;

    return (
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
          cursor: isPanningRef.current ? "grabbing" : "grab",
        }}
      >
        <Box
          ref={canvasRef}
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            width: `${worldSize.width}px`,
            height: `${worldSize.height}px`,
            transform: `translate(${offset.x}px,${offset.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            willChange: "transform",
          }}
        >
          <svg
            width={worldSize.width}
            height={worldSize.height}
            style={{ position: "absolute", left: 0, top: 0 }}
          >
            <ProjectLines project={{ ...project, content: safeContent }} positions={positions} />
          </svg>

          {contentEmpty ? (
            <Button
              variant="outlined"
              onClick={() => addNewComponent()}
              sx={{
                position: "absolute",
                left: worldSize.width / 2 - 60,
                top: worldSize.height / 2 - 20,
              }}
            >
              New Component
            </Button>
          ) : (
            Object.entries(safeContent).map(([key, comp]) => (
              <ProjectNode
    key={key}
    comp={{ ...comp, color: comp.color || "#ffffff" }} 
    position={positions[key] || { x: 0, y: 0 }}
    openRenameMenu={openRenameMenu}
  />
            ))
          )}
        </Box>
      </Box>
    );
  }
);

ProjectCanvas.displayName = "ProjectCanvas";

export default ProjectCanvas;
