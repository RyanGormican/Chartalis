import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: '"Chivo", sans-serif',
    allVariants: {
      fontWeight: 100,
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          fontFamily: '"Amarante", serif',
        },
      },
    },
  },
});

export default theme;
