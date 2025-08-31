"use client";
import { useEffect, useState } from "react";
import { useTranslate } from "../translate/TranslateContext";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { Icon } from "@iconify/react";
import ProjectView from "./ProjectView";

type Project = {
  id: string;
  name: string;
  owner: string;
  content?: Record<string, any>;
};

export default function Projects() {
  const { translate } = useTranslate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [mode, setMode] = useState<"view" | "manage">("view");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const chartalisData = localStorage.getItem("Chartalis");
    if (chartalisData) {
      try {
        const parsed = JSON.parse(chartalisData);
        setProjects(parsed.projects || []);
      } catch {}
    }
  }, []);

  const updateLocalStorage = (updatedProject: Project) => {
    const chartalisData = localStorage.getItem("Chartalis");
    let parsed = { projects: [] as Project[] };
    if (chartalisData) {
      try {
        parsed = JSON.parse(chartalisData);
        if (!parsed.projects) parsed.projects = [];
      } catch {
        parsed.projects = [];
      }
    }

    const idx = parsed.projects.findIndex((p) => p.id === updatedProject.id);
    if (idx !== -1) {
      parsed.projects[idx] = updatedProject;
    } else {
      parsed.projects.push(updatedProject);
    }

    localStorage.setItem("Chartalis", JSON.stringify(parsed));
    setProjects(parsed.projects);
  };

  const saveNewProject = () => {
    if (!newProjectName.trim()) return;
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: newProjectName.trim(),
      owner: "current_user",
    };
    updateLocalStorage(newProject);
    setNewProjectName("");
    setDialogOpen(false);
  };

  if (mode === "manage" && selectedProjectId) {
    const project = projects.find((p) => p.id === selectedProjectId);
    if (!project) {
      setMode("view");
      setSelectedProjectId(null);
    } else {
      return <ProjectView project={project} goBack={() => setMode("view")} updateLocalStorage={updateLocalStorage} />;
    }
  }

  return (
    <>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={project.id}>
            <Card
              sx={{ minHeight: 100, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              onClick={() => {
                setSelectedProjectId(project.id);
                setMode("manage");
              }}
            >
              <CardContent>
                <Typography variant="h6" align="center">
                  {project.name}
                  <Typography>{project.owner}</Typography>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card
            sx={{ minHeight: 100, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderStyle: "dashed" }}
            onClick={() => setDialogOpen(true)}
          >
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                <Icon icon="mdi:folder-add" width="24" height="24" />
                <Typography variant="h6">{translate("new_project")}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{translate("new_project")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label={translate("project_name")}
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{translate("cancel")}</Button>
          <Button onClick={saveNewProject} variant="contained">{translate("confirm")}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
