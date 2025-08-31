"use client";
import { useState } from "react";
import styles from "./page.module.css";
import { Icon } from "@iconify/react";
import SettingsModal from "./components/SettingsModal";
import { useTranslate } from "./components/translate/TranslateContext";
import Projects from "./components/project/Projects"; 
import { Button, Stack } from "@mui/material";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"Projects">("Projects"); 
  const { translate } = useTranslate();

  const renderContent = () => {
    switch (mode) {
      case "Projects":
      default:
        return <Projects />;
    }
  };

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <h2>Chartalis</h2>
        <Stack direction="column" spacing={1}>
          <Button
            variant={mode === "Projects" ? "contained" : "outlined"}
            onClick={() => setMode("Projects")}
          >
            {translate("Projects")}
          </Button>
          <Icon
            icon="material-symbols:settings"
            width="2rem"
            height="2rem"
            style={{ cursor: "pointer" }}
            onClick={() => setModalOpen(true)}
          />
        </Stack>
      </aside>

      <main className={styles.main}>
        {renderContent()}
      </main>

      <SettingsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
