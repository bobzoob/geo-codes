import { createTheme } from "@mui/material/styles";

export const mapTheme = createTheme({
  palette: {
    mode: "dark", // turns text white and inputs light
    background: {
      paper: "rgba(30, 30, 30, 0.55)",
      default: "transparent",
    },
  },
  components: {
    // override for all Paper components
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "rgba(30, 30, 30, 0.75)",
          backdropFilter: "blur(1.5px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#ffffff",
        },
        outlined: {
          backgroundColor: "transparent", // inner cards like SearchForms
          backgroundImage: "none",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: "#e0e0e0", // Light Grey
          color: "#333333", // Dark Text (for contrast)
          fontWeight: "bold",
          "&:hover": {
            backgroundColor: "#bdbdbd", // Darker Grey on hover
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          backgroundColor: "#e0e0e0", // Light Grey
          color: "#333333", // Dark Icon
          "&:hover": {
            backgroundColor: "#bdbdbd", // Darker Grey on hover
          },
        },
      },
    },
    // override for TextFields
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: "rgba(255, 255, 255, 0.4)",
        },
        root: {
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffffff",
          },
        },
      },
    },
    // override for input labels
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
    },
  },
});
