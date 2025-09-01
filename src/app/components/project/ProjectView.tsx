"use client";
import React, { useState, useRef } from "react";
import { Box } from "@mui/material";
import { useTranslate } from "../translate/TranslateContext";
import ProjectDrawer from "./drawer/ProjectDrawer";
import ProjectToolbar from "./ProjectToolbar";
import ProjectCanvas, { ProjectCanvasHandle } from "./ProjectCanvas";
import { Project, ProjectDrawerProps, ComponentItem, Field, Link, Operation } from "./types";

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

  const [selectedComponentKey, setSelectedComponentKey] = useState<string | null>(
    project.content ? Object.keys(project.content)[0] || null : null
  );

  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  const canvasHandleRef = useRef<ProjectCanvasHandle>(null);

  const addNewComponent = (linkTo?: string) => {
    const key = crypto.randomUUID();
    const newComponent: ComponentItem = {
      id: key,
      name: `${translate("component")} ${Object.keys(currentProject.content!).length + 1}`,
      links: [],
      type: "class",
      color: "#ffffff"
    };

    const updatedContent: Record<string, ComponentItem> = {
      ...currentProject.content!,
      [key]: newComponent
    };

    const updatedProject: Project = { ...currentProject, content: updatedContent };
    setCurrentProject(updatedProject);
    updateLocalStorage(updatedProject);
  };

  const openRenameMenu = (key: string) => {
    setSelectedComponentKey(key);
    setSideMenuOpen(true);
  };

  return (
    <Box sx={{ height: "90vh", display: "flex", flexDirection: "column", p: 2 }}>
      <ProjectToolbar
        project={currentProject}
        goBack={goBack}
        selectedComponentKey={selectedComponentKey}
        setSelectedComponentKey={setSelectedComponentKey}
        addNewComponent={addNewComponent}
        canvasRef={canvasHandleRef}
        worldSize={canvasHandleRef.current?.worldSize || { width: 0, height: 0 }}
      />

      <ProjectCanvas
        ref={canvasHandleRef}
        project={currentProject}
        selectedComponentKey={selectedComponentKey}
        setSelectedComponentKey={setSelectedComponentKey}
        addNewComponent={addNewComponent}
        openRenameMenu={openRenameMenu}
      />

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
