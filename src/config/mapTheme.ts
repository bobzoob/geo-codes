import { createTheme } from "@mui/material/styles";

export const mapTheme = createTheme({
  // TYPOGRAPHY
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h6: {
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      fontSize: "1rem",
      lineHeight: 1.3,
      color: "#ff9800",
    },
    subtitle2: {
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      fontSize: "0.75rem",
      color: "#ffffff",
      marginTop: "8px",
    },
    body1: { fontSize: "0.95rem", letterSpacing: "0.02em" },
    body2: { fontSize: "0.85rem", lineHeight: 1.6, color: "#eeeeee" },
    caption: { fontSize: "0.75rem", fontWeight: 500, color: "#bdbdbd" },
    button: {
      fontWeight: 700,
      textTransform: "none",
      letterSpacing: "0.02em",
    },
  },

  // COLORS
  palette: {
    mode: "dark",
    primary: {
      main: "#757575",
      dark: "#212121",
      light: "#bdbdbd",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ff9800",
      contrastText: "#000000",
    },
    background: {
      paper: "#1e1e1e",
      default: "#121212",
    },
    text: {
      primary: "#ffffff",
      secondary: "#e0e0e0",
    },
  },

  components: {
    // GLOBAL OVERRIDES (MapLibre Popup)
    MuiCssBaseline: {
      styleOverrides: {
        ".maplibregl-popup-content": {
          backgroundColor: "rgba(25, 25, 25, 0.98) !important",
          backdropFilter: "none !important",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "6px !important",
          padding: "0 !important",
          boxShadow: "0 6px 16px rgba(0,0,0,0.6) !important",
          color: "#ffffff",
        },
        ".maplibregl-popup-tip": {
          borderTopColor: "rgba(25, 25, 25, 0.98) !important",
        },
        ".maplibregl-popup-close-button": {
          color: "#ffffff",
          fontSize: "16px",
          right: "6px",
          top: "6px",
          padding: "4px",
          borderRadius: "50%",
          transition: "background 0.2s",
          "&:hover": {
            color: "#ff9800",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          },
          "&:focus": { outline: "none" },
        },
        "::-webkit-scrollbar": { width: "6px", height: "6px" },
        "::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderRadius: "3px",
          "&:hover": { backgroundColor: "#ff9800" },
        },
      },
    },

    // PAPER (The Panels)
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          // transparent panel
          // CRITICAL: we must disable the white elevation overlay
          backgroundImage: "none",
          backgroundColor: "rgba(20, 20, 20, 0.75)",
          backdropFilter: "blur(3px)",

          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#ffffff",

          // Specific style for Layer Cards inside the panel
          "&.LayerCard": {
            padding: theme.spacing(1, 2),
            marginBottom: theme.spacing(1),
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            borderWidth: "1px",
            borderStyle: "solid",
            // Darker card background
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderColor: "rgba(255, 255, 255, 0.15)",

            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              borderColor: theme.palette.secondary.main,
            },
            "&.active": {
              borderColor: theme.palette.secondary.main,
              backgroundColor: "rgba(255, 152, 0, 0.1)",
              boxShadow: "0 0 8px rgba(255, 152, 0, 0.3)",
              "& .MuiTypography-root": {
                color: theme.palette.secondary.main,
              },
            },
          },
        }),
      },
    },

    // BUTTONS
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700,
          whiteSpace: "nowrap",
          boxShadow: "0 3px 5px 2px rgba(0, 0, 0, .3)",
        },
        contained: {
          backgroundColor: "#424242",
          color: "#ff9800",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          "&:hover": {
            backgroundColor: "#616161",
            color: "#ffffff",
            borderColor: "#ffffff",
            boxShadow: "0 0 8px rgba(255, 255, 255, 0.3)",
          },
        },
      },
    },

    // ICON BUTTONS
    MuiIconButton: {
      styleOverrides: {
        root: {
          backgroundColor: "#424242",
          color: "#ff9800",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 3px 5px 2px rgba(0, 0, 0, .3)",
          "&:hover": {
            backgroundColor: "#616161",
            color: "#ffffff",
            borderColor: "#ffffff",
          },
        },
        sizeSmall: {
          padding: "5px",
        },
      },
    },

    // CHIPS
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#ffffff",
          fontWeight: 500,
          "&:hover": {
            backgroundColor: "rgba(255, 152, 0, 0.2)",
            borderColor: "#ff9800",
            color: "#ff9800",
          },
        },
        sizeSmall: { height: "22px", fontSize: "0.75rem" },
      },
    },

    // LISTS
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          marginBottom: "2px",
          "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.08)" },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: { color: "#ffffff" },
        secondary: { color: "#bdbdbd" },
      },
    },

    // LINKS
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#ff9800",
          textDecoration: "none",
          fontWeight: 600,
          "&:hover": { color: "#ffcc80", textDecoration: "underline" },
        },
      },
    },

    // Switch/Slider
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          color: "#bdbdbd",
          "&.Mui-checked": { color: "#ff9800" },
          "&.Mui-checked + .MuiSwitch-track": { backgroundColor: "#ff9800" },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: { color: "#ff9800" },
      },
    },
  },
});
