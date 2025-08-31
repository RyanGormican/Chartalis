import { useState } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Stack, TextField, FormControl, Select, MenuItem, Button, IconButton } from "@mui/material";
import { Icon } from "@iconify/react";
import { ComponentItem, Field } from "./types";

type Props = {
  component: ComponentItem;
  updateComponent: (updates: Partial<ComponentItem>) => void;
  translate: any;
};

export default function Operations({ component, updateComponent, translate }: Props) {
  const [newOpName, setNewOpName] = useState("");
  const [newOpType, setNewOpType] = useState<Field["type"]>("void");

  const addOperation = () => {
    if (!newOpName) return;
    updateComponent({
      operations: [...(component.operations || []), { name: newOpName, type: newOpType }],
    });
    setNewOpName("");
  };

  const removeOperation = (name: string) => {
    updateComponent({
      operations: component.operations?.filter(op => op.name !== name) || [],
    });
  };

  return (
    <Accordion sx={{ mt: 2 }}>
      <AccordionSummary>
        <Typography variant="subtitle1">{translate("component_operations")}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1}>
          {(component?.operations || []).map(op => (
            <Stack key={op.name} direction="row" justifyContent="space-between" alignItems="center">
              <Typography>{`${op.name}(): ${op.type}`}</Typography>
              <IconButton size="small" onClick={() => removeOperation(op.name)}>
                <Icon icon="tabler:trash" width="20" height="20" />
              </IconButton>
            </Stack>
          ))}

          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Name"
              value={newOpName}
              onChange={(e) => setNewOpName(e.target.value)}
            />
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select value={newOpType} onChange={(e) => setNewOpType(e.target.value as Field["type"])}>
                <MenuItem value="string">string</MenuItem>
                <MenuItem value="int">int</MenuItem>
                <MenuItem value="float">float</MenuItem>
                <MenuItem value="boolean">boolean</MenuItem>
                <MenuItem value="void">void</MenuItem>
              </Select>
            </FormControl>
            <Button size="small" variant="outlined" onClick={addOperation}>{translate("add")}</Button>
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
