"use client";
import { Drawer, Box, Typography } from "@mui/material";
import { useTranslate } from "../../translate/TranslateContext";
import { Project, ComponentItem, Field } from "./types";
import Details from "./Details";
import Relationships from "./Relationships";
import Attributes from "./Attributes";
import Operations from "./Operations";

type ProjectDrawerProps = {
  open: boolean;
  onClose: () => void;
  project: Project;
  selectedComponentKey: string | null;
  setProject: (project: Project) => void;
  updateLocalStorage: (project: Project) => void;
};

export default function ProjectDrawer({
  open,
  onClose,
  project,
  selectedComponentKey,
  setProject,
  updateLocalStorage,
}: ProjectDrawerProps) {
  const { translate } = useTranslate();

  if (!selectedComponentKey) return null;
  const component = project.content![selectedComponentKey];

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

  return (
    <Drawer anchor="right" open={open} onClose={onClose} BackdropProps={{ invisible: true }}>
      <Box sx={{ width: 500, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {component?.name || translate("component_details")}
        </Typography>

        <Details component={component} updateComponent={updateComponent} onDelete={() => {
          const updatedContent = { ...project.content! };
          Object.values(updatedContent).forEach(c => {
            c.links = c.links?.filter(id => id !== selectedComponentKey);
          });
          delete updatedContent[selectedComponentKey];
          const updatedProject = { ...project, content: updatedContent };
          setProject(updatedProject);
          updateLocalStorage(updatedProject);
          onClose();
        }} translate={translate} />

        <Relationships
          component={component}
          project={project}
          selectedComponentKey={selectedComponentKey}
          setProject={setProject}
          updateLocalStorage={updateLocalStorage}
          translate={translate}
        />

        <Attributes component={component} updateComponent={updateComponent} translate={translate} />

        <Operations component={component} updateComponent={updateComponent} translate={translate} />
      </Box>
    </Drawer>
  );
}
