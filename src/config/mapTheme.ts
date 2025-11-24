import { createTheme } from "@mui/material/styles";

export const mapTheme = createTheme({
  // 1. TYPOGRAPHY CONFIGURATION
  typography: {
    // Standard System Font Stack (No Google Fonts required)
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),

    // Panel Titles (e.g. "LAYERS", "OPTIONS")
    h6: {
      fontWeight: 700,
      textTransform: "uppercase", // Forces ALL CAPS
      letterSpacing: "0.12em", // Spaced out letters for readability
      fontSize: "0.9rem", // Slightly smaller to balance the caps
      lineHeight: 1.4,
      color: "#ff9800",
    },

    // Sub-headers (e.g. "Search Filters", "Global Timeline")
    subtitle2: {
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      fontSize: "0.75rem",
      color: "rgba(255, 255, 255, 0.7)", // Muted white
    },

    // Body text (Layer Names, etc.)
    body1: {
      fontSize: "0.95rem",
      letterSpacing: "0.02em",
    },
    button: {
      fontWeight: 700,
      letterSpacing: "0.05em", // Buttons look better with slight spacing
    },
  },
  palette: {
    mode: "dark",
    primary: {
      main: "#757575",
      dark: "#212121",
      light: "#bdbdbd",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ff9800", // Orange
      contrastText: "#000000",
    },
    background: {
      paper: "rgba(30, 30, 30, 0.55)",
      default: "transparent",
    },
  },
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#ff9800", // Default to Orange
          textDecoration: "none",
          fontWeight: 600, // Medium-Bold
          transition: "color 0.2s ease-in-out",
          cursor: "pointer",
          "&:hover": {
            color: "#ffffff", // Turn White on hover
            textDecoration: "underline",
            textDecorationColor: "#ff9800", // Orange underline
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: "none",
          backgroundColor: "rgba(30, 30, 30, 0.75)",
          backdropFilter: "blur(1.5px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#ffffff",

          // --- .LayerCard ---
          "&.LayerCard": {
            padding: theme.spacing(1, 2),
            marginBottom: theme.spacing(1),
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            borderWidth: "1px",
            borderStyle: "solid",

            // default
            backgroundColor: "rgba(40, 40, 40, 0.6)",
            borderColor: "rgba(255, 255, 255, 0.3)",

            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: theme.palette.secondary.main,
            },

            // active
            "&.active": {
              // backgroundColor: "rgba(255, 152, 0, 0.15)",
              borderColor: theme.palette.secondary.main,
              boxShadow: theme.shadows[4],

              "&:hover": {
                backgroundColor: "rgba(255, 152, 0, 0.25)",
              },

              //  CHILD ELEMENTS: Change text color when card is active
              "& .MuiTypography-root": {
                color: theme.palette.secondary.main,
                transition: "color 0.2s",
              },
            },
          },
        }),
        outlined: {
          backgroundColor: "transparent",
          backgroundImage: "none",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: "#424242",
          color: "#ff9800",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          fontWeight: "bold",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "#616161",
            color: "#ffffff",
            borderColor: "#ffffff",
            boxShadow: "0 0 8px rgba(255, 255, 255, 0.3)",
          },
        },
        outlined: {
          borderColor: "rgba(255, 255, 255, 0.5)",
          color: "#ffffff",
          "&:hover": {
            borderColor: "#ff9800",
            color: "#ff9800",
            backgroundColor: "rgba(255, 152, 0, 0.08)",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          backgroundColor: "#424242",
          color: "#ff9800",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          "&:hover": {
            backgroundColor: "#616161",
            color: "#ffffff",
            borderColor: "#ffffff",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: "rgba(255, 255, 255, 0.4)",
        },
        root: {
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffffff",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ff9800",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "rgba(255, 255, 255, 0.7)",
          "&.Mui-focused": {
            color: "#ff9800",
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          color: "#bdbdbd",
          "&.Mui-checked": {
            color: "#ff9800",
          },
          "&.Mui-checked + .MuiSwitch-track": {
            backgroundColor: "#ff9800",
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "rgba(255, 255, 255, 0.7)",
          "&.Mui-checked": {
            color: "#ff9800",
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: "#ff9800",
        },
      },
    },
  },
});
