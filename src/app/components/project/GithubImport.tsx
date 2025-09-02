"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Stack,
  Typography
} from "@mui/material";
import * as ts from "typescript";
import { Project, ComponentItem, Attribute, Operation, Link, GithubImportProps } from "./types";
import { useTranslate } from "../translate/TranslateContext";

export default function GitHubImport({ open, onClose, project, updateLocalStorage }: GithubImportProps) {
  const { translate } = useTranslate();
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseRepoUrl = (url: string) => {
    const cleaned = url.replace("https://github.com/", "").replace(/\/$/, "");
    const parts = cleaned.split("/");
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  };

  const fetchAllFiles = async (owner: string, repo: string, path = ""): Promise<any[]> => {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
    if (!response.ok) throw new Error(`${translate("failed_fetch_repo")}: ${response.status}`);
    const items = await response.json();
    const files: any[] = [];
    for (const item of items) {
      if (item.type === "file" && (item.name.endsWith(".ts") || item.name.endsWith(".tsx"))) files.push(item);
      else if (item.type === "dir") files.push(...(await fetchAllFiles(owner, repo, item.path)));
    }
    return files;
  };

  const fetchFileContent = async (downloadUrl: string) => {
    const response = await fetch(downloadUrl);
    if (!response.ok) throw new Error(`${translate("failed_fetch_file")}: ${response.status}`);
    return await response.text();
  };

  const parseTypescriptFile = (code: string): ComponentItem[] => {
    const sourceFile = ts.createSourceFile("temp.ts", code, ts.ScriptTarget.Latest);
    const components: ComponentItem[] = [];
    const visit = (node: ts.Node) => {
      if (ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node)) {
        if (!node.name) return;
        const id = crypto.randomUUID();
        const name = node.name.text;
        const attributes: Attribute[] = [];
        const operations: Operation[] = [];
        const links: Link[] = [];
        node.members.forEach(member => {
          if (ts.isPropertyDeclaration(member) || ts.isPropertySignature(member)) {
            const propName = member.name?.getText() || "unknown";
            const propType = (member as any).type?.getText() || "any";
            attributes.push({ name: propName, type: propType });
            links.push({ id: propType, type: "composition", wholeEnd: null });
          } else if (ts.isMethodDeclaration(member) || ts.isMethodSignature(member)) {
            const methodName = member.name?.getText() || "unknown";
            const returnType = (member as any).type?.getText() || "void";
            operations.push({ name: methodName, type: returnType });
          }
        });
        if (node.heritageClauses) {
          node.heritageClauses.forEach(clause => {
            clause.types.forEach(type => {
              links.push({
                id: type.expression.getText(),
                type: clause.token === ts.SyntaxKind.ExtendsKeyword ? "extends" : "implements",
                wholeEnd: null
              });
            });
          });
        }
        components.push({ id, name, type: ts.isClassDeclaration(node) ? "class" : "interface", attributes, operations, links });
      }
      ts.forEachChild(node, visit);
    };
    ts.forEachChild(sourceFile, visit);
    return components;
  };

  const resolveLinks = (components: Record<string, ComponentItem>) => {
    Object.values(components).forEach(component => {
      component.links?.forEach(link => {
        const target = Object.values(components).find(c => c.name === link.id);
        link.id = target ? target.id : "";
      });
    });
  };

  const handleImport = async () => {
    setError(null);
    setLoading(true);
    try {
      const repoInfo = parseRepoUrl(repoUrl);
      if (!repoInfo) throw new Error(translate("invalid_github_url"));

      const files = await fetchAllFiles(repoInfo.owner, repoInfo.repo);
      const newContent: Record<string, ComponentItem> = { ...(project.content || {}) };

      for (const file of files) {
        const code = await fetchFileContent(file.download_url);
        parseTypescriptFile(code).forEach(c => { newContent[c.id] = c; });
      }

      resolveLinks(newContent);

      const updatedProject = { ...project, content: newContent };
      updateLocalStorage(updatedProject);

      onClose();
    } catch (err: any) {
      setError(err.message || translate("unknown_import_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{translate("import_github_repo")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label={translate("github_repo_url")}
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
          />
          {loading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={20} />
              <Typography>{translate("importing_repository")}</Typography>
            </Stack>
          )}
          {error && <Typography color="error">{error}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>{translate("cancel")}</Button>
        <Button onClick={handleImport} variant="contained" disabled={loading || !repoUrl}>{translate("import")}</Button>
      </DialogActions>
    </Dialog>
  );
}
