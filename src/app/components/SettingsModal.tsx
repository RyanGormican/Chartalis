"use client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { useTranslate, languageMap} from "./translate/TranslateContext";

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{translate("Settings")}</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
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
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", p: 2 }}>
        <Button variant="contained" onClick={onClose}>
          {translate("close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
