"use client";
import { useState, useEffect, useRef } from "react";
import { Box, Typography, Stack, Button } from "@mui/material";
import { useTranslate } from "../translate/TranslateContext";
import ProjectDrawer, { Project, ComponentItem } from "./ProjectDrawer";

type ProjectViewProps = {
  project: Project;
  goBack: () => void;
  updateLocalStorage: (updatedProject: Project) => void;
};

export default function ProjectView({ project, goBack, updateLocalStorage }: ProjectViewProps) {
  const { translate } = useTranslate();
  const [currentProject, setCurrentProject] = useState<Project>({ ...project, content: project.content || {} });
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [selectedComponentKey, setSelectedComponentKey] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number; vx: number; vy: number }>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize positions
  useEffect(() => {
    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;
    const initPos: Record<string, { x: number; y: number; vx: number; vy: number }> = {};
    Object.keys(currentProject.content || {}).forEach((key) => {
      initPos[key] = { x: width / 2 + Math.random() * 50, y: height / 2 + Math.random() * 50, vx: 0, vy: 0 };
    });
    setPositions(initPos);
  }, [currentProject.content]);

  // Force-directed layout with collision padding
  useEffect(() => {
    const interval = setInterval(() => {
      const keys = Object.keys(currentProject.content || {});
      const newPos = { ...positions };
      const width = containerRef.current?.clientWidth || 800;
      const height = containerRef.current?.clientHeight || 600;

      keys.forEach((key) => {
        keys.forEach((otherKey) => {
          if (key === otherKey) return;

          const dx = newPos[key].x - newPos[otherKey].x;
          const dy = newPos[key].y - newPos[otherKey].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          // Minimum distance based on box size (120x40) plus padding
          const minDistX = 120 + 20;
          const minDistY = 40 + 20;

          const overlapX = minDistX - Math.abs(dx);
          const overlapY = minDistY - Math.abs(dy);

          if (overlapX > 0 && overlapY > 0) {
            const pushX = (dx / dist) * overlapX * 0.05;
            const pushY = (dy / dist) * overlapY * 0.05;
            newPos[key].vx += pushX;
            newPos[key].vy += pushY;
          }
        });
      });

      // Links attraction
      keys.forEach((key) => {
        (currentProject.content![key].links || []).forEach((linkId) => {
          if (!positions[linkId]) return;
          const dx = newPos[linkId].x - newPos[key].x;
          const dy = newPos[linkId].y - newPos[key].y;
          newPos[key].vx += dx * 0.001;
          newPos[key].vy += dy * 0.001;
        });
      });

      // Update positions with damping
      keys.forEach((key) => {
        newPos[key].vx *= 0.9;
        newPos[key].vy *= 0.9;
        newPos[key].x += newPos[key].vx;
        newPos[key].y += newPos[key].vy;

        // Keep inside container
        newPos[key].x = Math.max(0, Math.min(width - 120, newPos[key].x));
        newPos[key].y = Math.max(0, Math.min(height - 40, newPos[key].y));
      });

      setPositions(newPos);
    }, 30);

    return () => clearInterval(interval);
  }, [positions, currentProject.content]);

  const addNewComponent = (linkTo?: string) => {
    const key = crypto.randomUUID();
    const newComponent: ComponentItem = {
      id: key,
      name: `Component ${Object.keys(currentProject.content!).length + 1}`,
      links: linkTo ? [linkTo] : []
    };
    const updatedContent: Record<string, ComponentItem> = { ...currentProject.content!, [key]: newComponent };
    if (linkTo) updatedContent[linkTo] = { ...updatedContent[linkTo], links: [...(updatedContent[linkTo].links || []), key] };
    const updatedProject: Project = { ...currentProject, content: updatedContent };
    setCurrentProject(updatedProject);
    updateLocalStorage(updatedProject);
    setPositions((prev) => ({ ...prev, [key]: { x: 400 + Math.random() * 50, y: 300 + Math.random() * 50, vx: 0, vy: 0 } }));
  };

  const openRenameMenu = (key: string) => {
    setSelectedComponentKey(key);
    setSideMenuOpen(true);
  };

  const renderLines = () => {
    const lines: JSX.Element[] = [];
    Object.entries(currentProject.content || {}).forEach(([key, comp]) => {
      (comp.links || []).forEach((linkedId) => {
        if (positions[key] && positions[linkedId] && key < linkedId) {
          const from = positions[key];
          const to = positions[linkedId];
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const angle = Math.atan2(dy, dx);
          const x1 = from.x + 120 / 2 + Math.cos(angle) * 60;
          const y1 = from.y + 40 / 2 + Math.sin(angle) * 20;
          const x2 = to.x + 120 / 2 - Math.cos(angle) * 60;
          const y2 = to.y + 40 / 2 - Math.sin(angle) * 20;
          lines.push(<line key={`${key}-${linkedId}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#888" strokeWidth={2} />);
        }
      });
    });
    return lines;
  };

  const contentEmpty = !currentProject.content || Object.keys(currentProject.content).length === 0;

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Button variant="contained" onClick={goBack}>{translate("back")}</Button>
        <Typography variant="h4">{currentProject.name}</Typography>
        <Box ref={containerRef} sx={{ border: "2px solid #ccc", borderRadius: 1, minHeight: 600, position: "relative", p: 2 }}>
          <svg style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0 }}>
            {renderLines()}
          </svg>
          {contentEmpty ? (
            <Button
              variant="outlined"
              onClick={() => addNewComponent()}
              sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
            >
              {translate("new_component")}
            </Button>
          ) : (
            Object.entries(currentProject.content!).map(([key, comp]) => (
              <Box
                key={key}
                sx={{
                  position: "absolute",
                  left: positions[key]?.x,
                  top: positions[key]?.y,
                  border: "1px solid #999",
                  borderRadius: 1,
                  p: 2,
                  minWidth: 120,
                  minHeight: 40,
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                }}
                onClick={() => openRenameMenu(key)}
              >
                <Typography>{comp.name}</Typography>
              </Box>
            ))
          )}
        </Box>
      </Stack>

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
