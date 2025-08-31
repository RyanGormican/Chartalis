import { useState } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Box, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Icon } from "@iconify/react";
import { ComponentItem, Field } from "./types";

type Props = {
  component: ComponentItem;
  updateComponent: (updates: Partial<ComponentItem>) => void;
  onDelete: () => void;
  translate: any;
};

export default function Details({ component, updateComponent, onDelete, translate }: Props) {
  const [name, setName] = useState(component?.name);
  const [type, setType] = useState(component?.type || "class");

  const handleNameChange = (value: string) => {
    setName(value);
    updateComponent({ name: value });
  };

  const handleTypeChange = (value: string) => {
    setType(value);
    updateComponent({ type: value });
  };

  const handleColorChange = (value: string) => {
    updateComponent({ color: value });
  };

  return (
    <Accordion>
      <AccordionSummary>
        <Typography variant="subtitle1">
          {translate("component_details")} <Icon icon="material-symbols:info" />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TextField
          fullWidth
          label={translate("component_name")}
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>{translate("component_type")}</InputLabel>
          <Select value={type} onChange={(e) => handleTypeChange(e.target.value)}>
            <MenuItem value="class">{translate("class")}</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2">{translate("component_color")}</Typography>
          <input
            type="color"
            value={component?.color || "#FFFFFF"}
            onChange={(e) => handleColorChange(e.target.value)}
            style={{ width: "100%", height: "36px", border: "none", marginTop: "8px", cursor: "pointer" }}
          />
        </Box>

        <Button variant="contained" color="error" fullWidth onClick={onDelete}>
          {translate("delete_component")}
        </Button>
      </AccordionDetails>
    </Accordion>
  );
}
