import { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Box,
  Switch,
  FormControlLabel
} from "@mui/material";
import { Icon } from "@iconify/react";
import { ComponentItem, Project } from "./types";

type Props = {
  component: ComponentItem;
  project: Project;
  selectedComponentKey: string;
  setProject: (project: Project) => void;
  updateLocalStorage: (project: Project) => void;
  translate: any;
};

const relationTypes = ["Association", "Aggregation", "Composition"];

export default function ComponentRelationships({
  component,
  project,
  selectedComponentKey,
  setProject,
  updateLocalStorage,
  translate
}: Props) {
  const [selectedRelation, setSelectedRelation] = useState("");
  const [selectedRelationType, setSelectedRelationType] = useState(relationTypes[0]);
  const [wholeEndAtSelected, setWholeEndAtSelected] = useState(true);

  const availableRelations = Object.entries(project.content!).filter(
    ([k]) =>
      k !== selectedComponentKey &&
      !(component?.links || []).map(l => l.id).includes(k)
  );

  const saveProject = (updatedContent: Project["content"]) => {
    const updatedProject = { ...project, content: updatedContent };
    setProject(updatedProject);
    updateLocalStorage(updatedProject);
  };

  const addRelationship = () => {
    if (!selectedRelation) return;
    const updatedContent = { ...project.content! };

    if (!updatedContent[selectedComponentKey].links) updatedContent[selectedComponentKey].links = [];
    if (!updatedContent[selectedRelation].links) updatedContent[selectedRelation].links = [];

    const linkData = {
      id: selectedRelation,
      type: selectedRelationType,
      wholeEnd: wholeEndAtSelected
    };

    const reciprocalLinkData = {
      id: selectedComponentKey,
      type: selectedRelationType,
      wholeEnd: !wholeEndAtSelected
    };

    if (!updatedContent[selectedComponentKey].links.some(l => l.id === selectedRelation)) {
      updatedContent[selectedComponentKey].links.push(linkData);
    }

    if (!updatedContent[selectedRelation].links.some(l => l.id === selectedComponentKey)) {
      updatedContent[selectedRelation].links.push(reciprocalLinkData);
    }

    saveProject(updatedContent);

    setSelectedRelation("");
    setSelectedRelationType(relationTypes[0]);
    setWholeEndAtSelected(true);
  };

  const removeRelationship = (linkId: string) => {
    const updatedContent = { ...project.content! };
    updatedContent[selectedComponentKey].links = updatedContent[selectedComponentKey].links?.filter(l => l.id !== linkId);
    updatedContent[linkId].links = updatedContent[linkId].links?.filter(l => l.id !== selectedComponentKey);
    saveProject(updatedContent);
  };

  const updateRelationship = (linkId: string, updatedLink: { type: string; wholeEnd: boolean }) => {
    const updatedContent = { ...project.content! };

    const linkIndex = updatedContent[selectedComponentKey].links.findIndex(l => l.id === linkId);
    if (linkIndex !== -1) {
      updatedContent[selectedComponentKey].links[linkIndex] = {
        id: linkId,
        ...updatedLink
      };
    }

    const reciprocalIndex = updatedContent[linkId].links.findIndex(l => l.id === selectedComponentKey);
    if (reciprocalIndex !== -1) {
      updatedContent[linkId].links[reciprocalIndex] = {
        id: selectedComponentKey,
        type: updatedLink.type,
        wholeEnd: !updatedLink.wholeEnd
      };
    }

    saveProject(updatedContent);
  };

  return (
    <Accordion sx={{ mt: 2 }}>
      <AccordionSummary>
        <Typography variant="subtitle1">
          {translate("component_relationships")} <Icon icon="material-symbols:link" />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {availableRelations.length > 0 && (
          <Stack spacing={1} sx={{ mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{translate("select_component")}</InputLabel>
              <Select
                value={selectedRelation}
                onChange={(e) => setSelectedRelation(e.target.value)}
              >
                {availableRelations.map(([k, comp]) => (
                  <MenuItem key={k} value={k}>{comp.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{translate("select_relation_type")}</InputLabel>
              <Select
                value={selectedRelationType}
                onChange={(e) => setSelectedRelationType(e.target.value)}
              >
                {relationTypes.map(type => (
                  <MenuItem key={type} value={type}>{translate(type.toLowerCase())}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {(selectedRelationType === "Aggregation" || selectedRelationType === "Composition") && (
              <FormControlLabel
                control={
                  <Switch
                    checked={wholeEndAtSelected}
                    onChange={(e) => setWholeEndAtSelected(e.target.checked)}
                  />
                }
                label={translate("whole_end")}
              />
            )}

            <Button
              variant="outlined"
              fullWidth
              onClick={addRelationship}
              disabled={!selectedRelation}
            >
              {translate("add_new_relationship")}
            </Button>
          </Stack>
        )}

        <Stack spacing={1}>
          {(component?.links || []).map(({ id, type, wholeEnd }) => (
            <Box
              key={id}
              sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography>{project.content![id]?.name}</Typography>

                <FormControl sx={{ minWidth: 120 }}>
                  <Select
                    value={type}
                    onChange={(e) => updateRelationship(id, { type: e.target.value, wholeEnd })}
                  >
                    {relationTypes.map(rt => (
                      <MenuItem key={rt} value={rt}>{translate(rt.toLowerCase())}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {(type === "Aggregation" || type === "Composition") && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={wholeEnd}
                        onChange={(e) => updateRelationship(id, { type, wholeEnd: e.target.checked })}
                      />
                    }
                  />
                )}
              </Box>

              <IconButton size="small" onClick={() => removeRelationship(id)}>
                <Icon icon="tabler:unlink" width="24" height="24" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
