"use client";
import React, { useState, useEffect } from "react";
import { Stack, Button, Typography, IconButton, Select, MenuItem, TextField } from "@mui/material";
import { Icon } from "@iconify/react";
import * as htmlToImage from "html-to-image";
import { useTranslate } from "../translate/TranslateContext";
import { Project, ToolbarProps } from "./types";
import GitHubImport from "./GithubImport";

export default function ProjectToolbar({
  project,
  goBack,
  selectedComponentKey,
  setSelectedComponentKey,
  addNewComponent,
  canvasRef,
  worldSize,
  updateLocalStorage
}: ToolbarProps & { updateLocalStorage: (updated: Project) => void }) {
  const { translate } = useTranslate();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [Name, setName] = useState(project.name);

  useEffect(() => {
    setName(project.name);
  }, [project.name]);

  const downloadPng = (dataUrl: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${Date.now()}.png`;
    link.click();
  };

  const exportFullProject = async () => {
    const node = canvasRef.current?.canvasRef;
    if (!node) return;
    const prevTransform = node.style.transform;
    node.style.transform = `translate(0,0) scale(1)`;
    try {
      const dataUrl = await htmlToImage.toPng(node, {
        width: worldSize.width,
        height: worldSize.height,
        style: { width: `${worldSize.width}px`, height: `${worldSize.height}px`, transformOrigin: "0 0" }
      });
      downloadPng(dataUrl);
    } finally {
      node.style.transform = prevTransform;
    }
  };

  const exportViewport = async () => {
    const node = canvasRef.current?.canvasRef;
    if (!node) return;
    try {
      const dataUrl = await htmlToImage.toPng(node);
      downloadPng(dataUrl);
    } catch (err) {
      console.error("Viewport export failed:", err);
    }
  };

  const saveName = () => {
    const trimmed = Name.trim();
    if (!trimmed) {
      setName(project.name);
      setIsEditingName(false);
      return;
    }

    if (trimmed !== project.name) {
      const updatedProject = { ...project, name: trimmed };
      updateLocalStorage(updatedProject); 
    }
    setIsEditingName(false);
  };

  return (
    <>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button variant="contained" onClick={goBack}>{translate("back")}</Button>

        {isEditingName ? (
          <TextField
            value={Name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => e.key === "Enter" && saveName()}
            size="small"
            sx={{ flex: 1 }}
            autoFocus
          />
        ) : (
          <Typography
            variant="h5"
            sx={{ flex: 1, cursor: "pointer" }}
            onClick={() => setIsEditingName(true)}
          >
            {Name}
          </Typography>
        )}

        <Button variant="contained" onClick={addNewComponent}>{translate("new_component")}</Button>

        <IconButton style={{display:"none"}} title={translate("import_from_github")} onClick={() => setImportDialogOpen(true)}>
          <Icon icon="mdi:github" width={28} height={28} />
        </IconButton>

        <IconButton title={translate("export_full_project")} onClick={exportFullProject}>
          <Icon icon="mdi:perimeter" width={24} height={24} />
        </IconButton>
        <IconButton title={translate("export_viewport")} onClick={exportViewport}>
          <Icon icon="material-symbols:camera" width={24} height={24} />
        </IconButton>

        <Select
          size="small"
          displayEmpty
          value={selectedComponentKey || ""}
          onChange={e => setSelectedComponentKey(e.target.value)}
        >
          <MenuItem value="" disabled>{translate("go_to_component")}</MenuItem>
          {project.content &&
            Object.entries(project.content).map(([key, comp]) => (
              <MenuItem key={key} value={key}>{comp.name}</MenuItem>
            ))}
        </Select>
      </Stack>

      <GitHubImport
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        project={project}
        updateLocalStorage={updateLocalStorage}
      />
    </>
  );
}
