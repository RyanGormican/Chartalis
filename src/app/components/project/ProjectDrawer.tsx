"use client";
import { useState } from "react";
import { Box, Typography, Stack, Button, Drawer, TextField, Select, MenuItem, FormControl, InputLabel, Accordion, AccordionSummary, AccordionDetails, IconButton } from "@mui/material";
import { Icon } from "@iconify/react";
import { useTranslate } from "../translate/TranslateContext";

export type ComponentItem = {
  id: string;
  name: string;
  links?: string[];
};

export type Project = {
  id: string;
  name: string;
  owner: string;
  content?: Record<string, ComponentItem>;
};

type ProjectDrawerProps = {
  open: boolean;
  onClose: () => void;
  project: Project;
  selectedComponentKey: string | null;
  setProject: (project: Project) => void;
  addNewComponent: (linkTo?: string) => void;
  updateLocalStorage: (project: Project) => void;
};

export default function ProjectDrawer({ open, onClose, project, selectedComponentKey, setProject, addNewComponent, updateLocalStorage }: ProjectDrawerProps) {
  const { translate } = useTranslate();
  const [renameValue, setRenameValue] = useState("");
  const [selectedRelation, setSelectedRelation] = useState("");

  if (!selectedComponentKey) return null;
  const component = project.content![selectedComponentKey];

  const saveRename = () => {
    const updatedProject = {
      ...project,
      content: { ...project.content!, [selectedComponentKey]: { ...component, name: renameValue } },
    };
    setProject(updatedProject);
    updateLocalStorage(updatedProject);
  };

  const addRelationship = () => {
    if (!selectedRelation) return;
    const updatedContent = { ...project.content! };
    if (!updatedContent[selectedComponentKey].links) updatedContent[selectedComponentKey].links = [];
    if (!updatedContent[selectedRelation].links) updatedContent[selectedRelation].links = [];
    if (!updatedContent[selectedComponentKey].links.includes(selectedRelation)) updatedContent[selectedComponentKey].links.push(selectedRelation);
    if (!updatedContent[selectedRelation].links.includes(selectedComponentKey)) updatedContent[selectedRelation].links.push(selectedComponentKey);

    const updatedProject = { ...project, content: updatedContent };
    setProject(updatedProject);
    updateLocalStorage(updatedProject);
  };

  const removeRelationship = (linkId: string) => {
    const updatedContent = { ...project.content! };
    updatedContent[selectedComponentKey].links = updatedContent[selectedComponentKey].links?.filter((id) => id !== linkId);
    updatedContent[linkId].links = updatedContent[linkId].links?.filter((id) => id !== selectedComponentKey);
    const updatedProject = { ...project, content: updatedContent };
    setProject(updatedProject);
    updateLocalStorage(updatedProject);
  };

 return (
  <Drawer anchor="right" open={open} onClose={onClose} BackdropProps={{ invisible: true }}>
    <Box sx={{ width: 300, p: 2 }}>

      {/* Component Label */}
      <Typography variant="h6" gutterBottom>
        {component?.name || translate("component_details")}
      </Typography>

      {/* Component Details Accordion */}
      <Accordion>
        <AccordionSummary>
          <Typography variant="subtitle1">{translate("component_details")} <Icon icon="material-symbols:info" /></Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            fullWidth
            sx={{ mt: 2 }}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            label={translate("rename_component")}
          />
          <Button variant="contained" sx={{ mt: 2 }} onClick={saveRename}>
            {translate("confirm")}
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Component Relationships */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary>
          <Typography variant="subtitle1">{translate("component_relationships")} <Icon icon="material-symbols:link" /> </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {/* Add / Link Component */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>{translate("select_component")}</InputLabel>
            <Select
              value={selectedRelation}
              onChange={(e) => setSelectedRelation(e.target.value)}
            >
              <MenuItem value="">
                <em>{translate("new_component")}</em>
              </MenuItem>
              {Object.entries(project.content!)
                .filter(([k]) => k !== selectedComponentKey)
                .map(([k, comp]) => (
                  <MenuItem key={k} value={k}>{comp.name}</MenuItem>
                ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => { selectedRelation ? addRelationship() : addNewComponent(selectedComponentKey); }}
          >
            {translate("add_new_relationship")}
          </Button>

          {/* Linked Components Nested Accordion */}
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary>
              <Typography variant="subtitle2">{translate("linked_components")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {(component?.links || []).map((id) => (
                  <Box
                    key={id}
                    sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  >
                    <Typography>{project.content![id]?.name}</Typography>
                    <IconButton size="small" onClick={() => removeRelationship(id)}>
                      <Icon icon="tabler:unlink" width="24" height="24" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </AccordionDetails>
      </Accordion>

    </Box>
  </Drawer>
);
}