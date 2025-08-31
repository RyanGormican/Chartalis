import { useState } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Stack, TextField, FormControl, Select, MenuItem, Button, IconButton } from "@mui/material";
import { Icon } from "@iconify/react";
import { ComponentItem, Field } from "./types";

type Props = {
  component: ComponentItem;
  updateComponent: (updates: Partial<ComponentItem>) => void;
  translate: any;
};

export default function Attributes({ component, updateComponent, translate }: Props) {
  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrType, setNewAttrType] = useState<Field["type"]>("string");

  const addAttribute = () => {
    if (!newAttrName) return;
    updateComponent({
      attributes: [...(component.attributes || []), { name: newAttrName, type: newAttrType }],
    });
    setNewAttrName("");
  };

  const removeAttribute = (name: string) => {
    updateComponent({
      attributes: component.attributes?.filter(attr => attr.name !== name) || [],
    });
  };

  return (
    <Accordion sx={{ mt: 2 }}>
      <AccordionSummary>
        <Typography variant="subtitle1">{translate("component_attributes")}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1}>
          {(component?.attributes || []).map(attr => (
            <Stack key={attr.name} direction="row" justifyContent="space-between" alignItems="center">
              <Typography>{`${attr.name}: ${attr.type}`}</Typography>
              <IconButton size="small" onClick={() => removeAttribute(attr.name)}>
                <Icon icon="tabler:trash" width="20" height="20" />
              </IconButton>
            </Stack>
          ))}

          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Name"
              value={newAttrName}
              onChange={(e) => setNewAttrName(e.target.value)}
            />
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select value={newAttrType} onChange={(e) => setNewAttrType(e.target.value as Field["type"])}>
                <MenuItem value="string">string</MenuItem>
                <MenuItem value="int">int</MenuItem>
                <MenuItem value="float">float</MenuItem>
                <MenuItem value="boolean">boolean</MenuItem>
                <MenuItem value="void">void</MenuItem>
              </Select>
            </FormControl>
            <Button size="small" variant="outlined" onClick={addAttribute}>{translate("add")}</Button>
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
