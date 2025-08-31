"use client";
import { Box, Typography, Divider } from "@mui/material";
import { ComponentItem } from "./ProjectDrawer";

type Props = {
  comp: ComponentItem;
  position: { x: number; y: number };
  openRenameMenu: (key: string) => void;
};

export default function ProjectNode({ comp, position, openRenameMenu }: Props) {
  return (
    <Box
      onClick={() => openRenameMenu(comp.id)}
      sx={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: 120,
        minHeight: 60,
        border: "1px solid #999",
        borderRadius: 1,
        backgroundColor: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Name Section */}
      <Box sx={{ p: 1, backgroundColor: comp.color }}>
        <Typography sx={{ fontSize: 15, fontWeight: "bold" }}>{comp.name}</Typography>
      </Box>

      <Divider />

      {/* Attributes Section */}
      <Box sx={{ p: 1 }}>
        {comp.attributes?.length ? (
          comp.attributes.map((attr, idx) => (
            <Typography key={idx} sx={{ fontSize: 13 }}>
              {typeof attr === "string" ? attr : `${attr.name}: ${attr.type}`}
            </Typography>
          ))
        ) : (
          <Typography sx={{ fontSize: 13, fontStyle: "italic" }}> -</Typography>
        )}
      </Box>

      <Divider />

      {/* Operations Section */}
      <Box sx={{ p: 1 }}>
        {comp.operations?.length ? (
          comp.operations.map((op, idx) => (
            <Typography key={idx} sx={{ fontSize: 13 }}>
              {typeof op === "string" ? op : `${op.name}(): ${op.type || "void"}`}
            </Typography>
          ))
        ) : (
          <Typography sx={{ fontSize: 13, fontStyle: "italic" }}> - </Typography>
        )}
      </Box>
    </Box>
  );
}
