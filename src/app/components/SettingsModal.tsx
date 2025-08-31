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
import { useTranslate } from "./translate/TranslateContext";

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { language, setLanguage, availableLanguages, translate } = useTranslate();

  const currentLanguageName =
    availableLanguages.find((name) => {
      return { English: "en", French: "fr" }[name] === language;
    }) || "English";

  const download_data = () => {
    const data = localStorage.getItem("Chartalis");
    if (!data) return;

    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Chartalis.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{translate("Settings")}</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
              <Button variant="contained" onClick={download_data}>
          {translate("download_data")}
        </Button>
        <Typography variant="subtitle1" gutterBottom>
          {translate("Language")}
        </Typography>
        <FormControl fullWidth>
          <Select
            value={currentLanguageName}
            onChange={(e) => setLanguage(e.target.value)}
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
