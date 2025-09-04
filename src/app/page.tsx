"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { Icon } from "@iconify/react";
import { useTranslate } from "./components/translate/TranslateContext";
import Projects from "./components/project/Projects";
import Glossary from "./components/glossary/Glossary";
import Settings from "./components/settings/Settings";
import Feedback from "./components/feedback/Feedback";
import { Button, Stack, Box } from "@mui/material";

export default function Home() {
  const [mode, setMode] = useState<"Projects" | "Glossary" | "Settings" | "Feedback">("Projects");
  const { translate } = useTranslate();

  const sidebarButtons = [
    { label: translate("projects"), modeName: "Projects", icon: "mdi:folder" },
    { label: translate("glossary"), modeName: "Glossary", icon: "mdi:book" },
    { label: translate("settings"), modeName: "Settings", icon: "mdi:cog" },
    { label: translate("feedback"), modeName: "Feedback", icon: "mdi:message" },
  ];

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <Stack
          direction="column"
          sx={{
            height: "100%",
            justifyContent: "space-between",
            pt: 0,
            px: 2,
          }}
        >
          <Box>
            <h1
              style={{
                margin: 0,
                paddingBottom: "1.5rem",
                fontSize: "1.9rem",
                fontWeight: 300,
              }}
            >
              Diagramo
            </h1>

            {sidebarButtons.map((item) => {
              const isActive = mode === item.modeName;
              return (
                <Box
                  key={item.modeName}
                  sx={{ display: "flex", alignItems: "center", mb: 1.5, position: "relative" }}
                >
                  <Button
                    onClick={() => setMode(item.modeName as any)}
                    fullWidth
                    startIcon={<Icon icon={item.icon} />}
                    sx={{
                      pl: 3,
                      py: 1.8,
                      borderRadius: 2.5,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      color: isActive ? "white" : "primary.dark",
                      backgroundColor: isActive ? "primary.main" : "primary.lighter",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: isActive ? "primary.dark" : "primary.light",
                        transform: "translateY(-1px)",
                        boxShadow: isActive ? 3 : 1,
                      },
                    }}
                  >
                    {item.label}
                    {isActive && (
                      <Box
                        sx={{
                          position: "absolute",
                          left: 0,
                          top: 4,
                          bottom: 4,
                          width: 6,
                          borderRadius: "0 4px 4px 0",
                          bgcolor: "#ADD8E6",
                        }}
                      />
                    )}
                  </Button>
                </Box>
              );
            })}
          </Box>

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
        </Stack>
      </aside>


      <main className={styles.main}>
        {mode === "Projects" && <Projects />}
        {mode === "Glossary" && <Glossary />}
        {mode === "Settings" && <Settings />}
        {mode === "Feedback" && <Feedback />}
      </main>
    </div>
  );
}
