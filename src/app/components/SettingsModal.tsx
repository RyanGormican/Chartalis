"use client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
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
  const { language, setLanguage, availableLanguages,translate } = useTranslate();


  const currentLanguageName =
    availableLanguages.find((name) => {
      return { English: "en", French: "fr" }[name] === language;
    }) || "English";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{translate("Settings")}</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
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
      <DialogActions>
      </DialogActions>
    </Dialog>
  );
}
