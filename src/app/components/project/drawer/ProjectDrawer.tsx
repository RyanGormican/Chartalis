"use client";
import { Drawer, Box, Typography } from "@mui/material";
import { useTranslate } from "../../translate/TranslateContext";
import { Project, ComponentItem, ProjectDrawerProps, Link } from "../types";
import Details from "./Details";
import Relationships from "./Relationships";
import Attributes from "./Attributes";
import Operations from "./Operations";

export default function ProjectDrawer({
  open,
  onClose,
  project,
  selectedComponentKey,
  setProject,
  updateLocalStorage,
}: ProjectDrawerProps) {
  const { translate: rawTranslate } = useTranslate();

  const translate = (key: string) => rawTranslate(key as any);

  if (!selectedComponentKey) return null;

  const component = project.content![selectedComponentKey];

  // Update project content and persist
  const saveUpdatedContent = (updatedContent: Project["content"]) => {
    const updatedProject = { ...project, content: updatedContent };
    setProject(updatedProject);
    updateLocalStorage(updatedProject);
  };

  // Update a single component
  const updateComponent = (updates: Partial<ComponentItem>) => {
    const updatedProject = {
      ...project,
      content: {
        ...project.content!,
        [selectedComponentKey]: { ...component, ...updates },
      },
    };
    setProject(updatedProject);
    updateLocalStorage(updatedProject);
  };

  // Delete component and clean up links
  const handleDelete = () => {
    const updatedContent = { ...project.content! };

    Object.values(updatedContent).forEach((c) => {
      c.links = c.links?.filter((l: Link) => l.id !== selectedComponentKey) || [];
    });

    delete updatedContent[selectedComponentKey];

    saveUpdatedContent(updatedContent);
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} BackdropProps={{ invisible: true }}>
      <Box sx={{ width: 500, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {component?.name || translate("component_details")}
        </Typography>

        {/* Component Details */}
        <Details
          component={component}
          updateComponent={updateComponent}
          onDelete={handleDelete}
          translate={translate}
        />

        {/* Relationships */}
        <Relationships
          component={component}
          project={project}
          selectedComponentKey={selectedComponentKey}
          setProject={setProject}
          updateLocalStorage={updateLocalStorage}
          translate={translate}
        />

        {/* Attributes */}
        <Attributes
          component={component}
          updateComponent={updateComponent}
          translate={translate}
        />

        {/* Operations */}
        <Operations
          component={component}
          updateComponent={updateComponent}
          translate={translate}
        />
      </Box>
    </Drawer>
  );
}
