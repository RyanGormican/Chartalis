"use client";

import {
  Button,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Box,
} from "@mui/material";
import { useTranslate, languageMap } from "../translate/TranslateContext";

export default function Settings() {
  const { language, setLanguage, availableLanguages, translate } = useTranslate();

  const currentLanguageName =
    Object.keys(languageMap).find((name) => languageMap[name] === language) || "English";

  const downloadData = () => {
    const data = localStorage.getItem("Diagramo");
    if (!data) return;

    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Diagramo.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {translate("settings")}
      </Typography>

      <Button variant="contained" onClick={downloadData} sx={{ mb: 2 }}>
        {translate("download_data")}
      </Button>

      <Typography variant="subtitle1" gutterBottom>
        {translate("Language")}
      </Typography>
      <FormControl fullWidth>
        <Select
          value={currentLanguageName}
          onChange={(e) => setLanguage(e.target.value as string)}
        >
          {availableLanguages.map((lang) => (
            <MenuItem key={lang} value={lang}>
              {lang}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
