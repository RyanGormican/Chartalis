"use client";

import React, { useState } from "react";
import { firestore } from "./firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useTranslate } from "../translate/TranslateContext";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
} from "@mui/material";

export default function Feedback() {
  const { translate } = useTranslate();
  const [name, setName] = useState(translate("anonymous"));
  const [suggestion, setSuggestion] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(firestore, "suggestions"), {
        name: name.trim(),
        topic: "Diagramo",
        suggestion: suggestion.trim(),
        timestamp: serverTimestamp(),
        status: "incomplete",
      });
      setName(translate("anonymous"));
      setSuggestion("");
    } catch (error) {
      console.error("Error adding suggestion: ", error);
    }
  };

  const handleProjectClick = async () => {
    try {
      await addDoc(collection(firestore, "feedback"), {
        project: "Diagramo",
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {translate("feedback")}
      </Typography>

      <Button
        variant="outlined"
        color="secondary"
        onClick={handleProjectClick}
        sx={{ mb: 3 }}
      >
        {translate("signal_improvement")}
      </Button>

      <Typography variant="h6" gutterBottom>
        {translate("leave_suggestion")}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            id="name"
            label={translate("name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={translate("name_optional")}
            fullWidth
          />

          <TextField
            id="suggestion"
            label={translate("suggestion")}
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder={translate("suggestion_placeholder")}
            required
            fullWidth
            multiline
            rows={4}
          />

          <Button type="submit" variant="contained" color="primary">
            {translate("submit")}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}



