"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { Icon } from "@iconify/react";
import SettingsModal from "./components/SettingsModal";
import Feedback from "./components/feedback/Feedback";
import { useTranslate } from "./components/translate/TranslateContext";
import Projects from "./components/project/Projects";
import { Button, Stack, Box } from "@mui/material";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
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
        <Stack direction="column" sx={{ height: "100%", justifyContent: "space-between", p: 2 }}>
          <Box>
            <h1 style={{ marginBottom: "1.5rem" }}>Diagramo</h1>
            <Button
              variant={mode === "Projects" ? "contained" : "outlined"}
              onClick={() => setMode("Projects")}
              fullWidth
            >
              {translate("projects" as any)}
            </Button>
          </Box>

          <Stack direction="column" spacing={2} alignItems="center">
            <Stack direction="row" spacing={3} sx={{ fontSize: "2.5rem" }}>
              <a href="https://www.linkedin.com/in/ryangormican/">
                <Icon icon="mdi:linkedin" color="#0e76a8" />
              </a>
              <a href="https://github.com/RyanGormican/Diagramo/">
                <Icon icon="mdi:github" color="#e8eaea" />
              </a>
              <a href="https://ryangormicanportfoliohub.vercel.app/">
                <Icon icon="teenyicons:computer-outline" color="#199c35" />
              </a>
            </Stack>

            <Stack direction="row" spacing={2} justifyContent="space-between" width="100%" sx={{ fontSize: "2.5rem" }}>
              <Icon
                icon="material-symbols:settings"
                style={{ cursor: "pointer" }}
                onClick={() => setModalOpen(true)}
              />
              <Icon
                icon="material-symbols:feedback"
                style={{ cursor: "pointer" }}
                onClick={() => setFeedbackOpen(true)}
              />
            </Stack>
          </Stack>
        </Stack>
      </aside>

      <main className={styles.main}>
        {renderContent()}
      </main>

      <SettingsModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <Feedback isModalOpen={feedbackOpen} setIsModalOpen={setFeedbackOpen} />
    </div>
  );
}
