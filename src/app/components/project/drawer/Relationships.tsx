"use client";

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
import { ComponentItem, Project, Link } from "../types";

type Props = {
  component: ComponentItem;
  project: Project;
  selectedComponentKey: string;
  setProject: (project: Project) => void;
  updateLocalStorage: (project: Project) => void;
  translate: (key: string) => string;
};

// All supported UML relationship types
const relationTypes = [
  "Association",
  "Aggregation",
  "Composition",
  "Dependency",
  "Inheritance",
  "Realization"
];

export default function ComponentRelationships({
  component,
  project,
  selectedComponentKey,
  setProject,
  updateLocalStorage,
  translate
}: Props) {
  const [selectedRelation, setSelectedRelation] = useState<string>("");
  const [selectedRelationType, setSelectedRelationType] = useState<string>(relationTypes[0]);
  const [wholeEndAtSelected, setWholeEndAtSelected] = useState<boolean>(true);

  // Components that are eligible for a new relationship
  const availableRelations = Object.entries(project.content || {}).filter(
    ([k]) =>
      k !== selectedComponentKey &&
      !((component.links || []).map((l) => l.id).includes(k))
  );

  // Save updated project state and persist to local storage
  const saveProject = (updatedContent: Project["content"]) => {
    const updatedProject = { ...project, content: updatedContent };
    setProject(updatedProject);
    updateLocalStorage(updatedProject);
  };

  /**
   * Add a new relationship between the selected component and another component.
   * Creates reciprocal link for the linked component according to UML rules.
   */
  const addRelationship = () => {
    if (!selectedRelation) return;

    const updatedContent = { ...project.content } as Record<string, ComponentItem>;
    updatedContent[selectedComponentKey].links = updatedContent[selectedComponentKey].links || [];
    updatedContent[selectedRelation].links = updatedContent[selectedRelation].links || [];

    // Relationship from the selected component to the linked component
    const linkData: Link = {
      id: selectedRelation,
      type: selectedRelationType,
      wholeEnd: selectedRelationType === "Association" ? wholeEndAtSelected : true
    };

    // Reciprocal relationship from linked component
    const reciprocalLinkData: Link = {
      id: selectedComponentKey,
      type: selectedRelationType,
      wholeEnd: selectedRelationType === "Association" ? false : false // always mirror the rule for non-Association
    };

    // Add if it does not exist
    if (!updatedContent[selectedComponentKey].links.some((l) => l.id === selectedRelation)) {
      updatedContent[selectedComponentKey].links.push(linkData);
    }
    if (!updatedContent[selectedRelation].links.some((l) => l.id === selectedComponentKey)) {
      updatedContent[selectedRelation].links.push(reciprocalLinkData);
    }

    saveProject(updatedContent);

    // Reset creation fields
    setSelectedRelation("");
    setSelectedRelationType(relationTypes[0]);
    setWholeEndAtSelected(true);
  };

  /**
   * Remove a relationship from both sides
   */
  const removeRelationship = (linkId: string) => {
    const updatedContent = { ...project.content } as Record<string, ComponentItem>;
    updatedContent[selectedComponentKey].links = updatedContent[selectedComponentKey].links?.filter(
      (l) => l.id !== linkId
    );
    updatedContent[linkId].links = updatedContent[linkId].links?.filter(
      (l) => l.id !== selectedComponentKey
    );
    saveProject(updatedContent);
  };

  /**
   * Update a relationship and ensure both sides are mirrored correctly.
   * Association: only update the `wholeEnd` on the selected component.
   * Other types: mirror type and set `wholeEnd` true/false on each side.
   */
  const updateRelationship = (linkId: string, updatedLink: { type: string; wholeEnd: boolean }) => {
    const updatedContent = { ...project.content } as Record<string, ComponentItem>;

    // Update selected component link
    const links = updatedContent[selectedComponentKey].links || [];
    const linkIndex = links.findIndex((l) => l.id === linkId);
    if (linkIndex !== -1) {
      links[linkIndex] = { id: linkId, ...updatedLink };
      updatedContent[selectedComponentKey].links = links;
    }

    // Update reciprocal link
    const reciprocalLinks = updatedContent[linkId].links || [];
    const reciprocalIndex = reciprocalLinks.findIndex((l) => l.id === selectedComponentKey);

    if (reciprocalIndex !== -1) {
      // Associations: only one side controls wholeEnd
      // All others: type is mirrored, wholeEnd flips automatically
      reciprocalLinks[reciprocalIndex] = {
        id: selectedComponentKey,
        type: updatedLink.type,
        wholeEnd:
          updatedLink.type === "Association"
            ? reciprocalLinks[reciprocalIndex].wholeEnd // do not change
            : !updatedLink.wholeEnd
      };
      updatedContent[linkId].links = reciprocalLinks;
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
        {/* Add new relationship section */}
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
                {relationTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {translate(type.toLowerCase())}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Only Aggregation & Composition require wholeEnd toggle */}
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

        {/* Edit/remove existing relationships */}
        <Stack spacing={1}>
          {(component.links || []).map(({ id, type, wholeEnd }) => (
            <Box
              key={id}
              sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography>{project.content?.[id]?.name}</Typography>

                <FormControl sx={{ minWidth: 120 }}>
                  <Select
                    value={type}
                    onChange={(e) => updateRelationship(id, { type: e.target.value, wholeEnd })}
                  >
                    {relationTypes.map((rt) => (
                      <MenuItem key={rt} value={rt}>{translate(rt.toLowerCase())}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={wholeEnd}
                      onChange={(e) => updateRelationship(id, { type, wholeEnd: e.target.checked })}
                    />
                  }
                  label=""
                />
              </Box>

              <IconButton size="small" onClick={() => removeRelationship(id)}>
                <Icon icon="tabler:unlink" width={24} height={24} />
              </IconButton>
            </Box>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
