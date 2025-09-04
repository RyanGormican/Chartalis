"use client";

import { useEffect, useState, useMemo } from "react";
import { useTranslate } from "../translate/TranslateContext";
import {
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import ProjectView from "./ProjectView";
import { Project } from "./types";

export default function Projects() {
  const { translate } = useTranslate();

  // ----------------------
  // State variables
  // ----------------------
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "manage">("view");

  // Dialog state for creating new project
  const [newProject, setNewProject] = useState({ open: false, name: "" });

  // Search and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "lastEdited">("lastEdited");

  // ----------------------
  // Load projects from localStorage on mount
  // ----------------------
  useEffect(() => {
    const stored = localStorage.getItem("Diagramo");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { projects: Project[] };
        setProjects(parsed.projects || []);
      } catch {
        setProjects([]);
      }
    }
  }, []);

  // ----------------------
  // Update localStorage & state
  // Adds/updates project and sets lastEdited timestamp
  // ----------------------
  const updateLocalStorage = (updatedProject: Project) => {
    const stored = localStorage.getItem("Diagramo");
    let parsed: { projects: Project[] } = { projects: [] };

    if (stored) {
      try {
        parsed = JSON.parse(stored) as { projects: Project[] };
        if (!parsed.projects) parsed.projects = [];
      } catch {
        parsed.projects = [];
      }
    }

    // Update timestamp
    updatedProject = { ...updatedProject, lastEdited: new Date().toISOString() };

    const idx = parsed.projects.findIndex((p) => p.id === updatedProject.id);
    if (idx !== -1) parsed.projects[idx] = updatedProject;
    else parsed.projects.push(updatedProject);

    localStorage.setItem("Diagramo", JSON.stringify(parsed));
    setProjects(parsed.projects);
  };

  // ----------------------
  // Save new project
  // ----------------------
  const saveNewProject = () => {
    const name = newProject.name.trim();
    if (!name) return;

    const project: Project = {
      id: crypto.randomUUID(),
      name,
      owner: "current_user",
      content: {},
      lastEdited: new Date().toISOString(),
    };

    updateLocalStorage(project);
    setNewProject({ open: false, name: "" });
  };

  // ----------------------
  // Get selected project if in manage mode
  // ----------------------
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // If selected project is deleted or missing, revert to view mode
  useEffect(() => {
    if (mode === "manage" && !selectedProject) {
      setMode("view");
      setSelectedProjectId(null);
    }
  }, [mode, selectedProject]);

  // ----------------------
  // Filter & sort projects based on searchTerm and sortBy
  // ----------------------
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return new Date(b.lastEdited || 0).getTime() - new Date(a.lastEdited || 0).getTime();
      });
  }, [projects, searchTerm, sortBy]);

  // ----------------------
  // Card style for reusability
  // ----------------------
  const cardStyle = {
    minHeight: "20vh",
    minWidth: "20vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };

  // ----------------------
  // Render
  // ----------------------
  return (
    <>
      {/* If in manage mode and project exists, render ProjectView */}
      {mode === "manage" && selectedProject ? (
        <ProjectView
          project={selectedProject}
          goBack={() => setMode("view")}
          updateLocalStorage={updateLocalStorage}
        />
      ) : (
        <>
          {/* Search and sort controls */}
          <Stack direction="row" spacing={2} mt={2} alignItems="center">
            <TextField
              placeholder={translate("search_projects")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FormControl>
              <InputLabel>{translate("sort_by")}</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "lastEdited")}
                size="small"
              >
                <MenuItem value="lastEdited">{translate("last_edited")}</MenuItem>
                <MenuItem value="name">{translate("name")}</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* Project cards */}
          <Grid container spacing={2} mt={2}>
            {/* New project card */}
            <Grid>
              <Card
                sx={{ ...cardStyle, borderStyle: "dashed" }}
                onClick={() => setNewProject({ ...newProject, open: true })}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Typography variant="h6">{translate("new_project")}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Existing projects */}
            {filteredProjects.map((project) => (
              <Grid key={project.id}>
                <Card
                  sx={cardStyle}
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setMode("manage");
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" align="center">
                      {project.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* New Project Dialog */}
          <Dialog
            open={newProject.open}
            onClose={() => setNewProject({ ...newProject, open: false })}
          >
            <DialogTitle>{translate("new_project")}</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                fullWidth
                label={translate("project_name")}
                value={newProject.name}
                onChange={(e) =>
                  setNewProject({ ...newProject, name: e.target.value })
                }
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setNewProject({ ...newProject, open: false })}
              >
                {translate("cancel")}
              </Button>
              <Button onClick={saveNewProject} variant="contained">
                {translate("confirm")}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
}
