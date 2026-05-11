import { Box, Container, Typography, Button, Paper, Link } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAppState } from "../../state/appContext";
import ReactMarkdown from "react-markdown";

const currentYear = new Date().getFullYear();

const licenseMarkdown = `
# License & Terms of Use

Copyright (c) ${currentYear} geocodes

Permission is granted as [CC BY-SA 4.0](https://de.wikipedia.org/wiki/Creative_Commons).
You can copy and use this software free of charge. You are allowed to copy, share, modify, and even commercially use this work. You must always give proper attribution to the original creator and release any modified versions under the same [CC BY-SA 4.0](https://de.wikipedia.org/wiki/Creative_Commons) license.

## Citation
Author Name: *geocodes. Framework designed to visualize historical datasets in a multilayered and interactive map*, University City 2026, licensed under CC BY-SA 4.0. Source: [https://historic-interactive-map.vercel.app/](https://historic-interactive-map.vercel.app/) 

You must specify if original source was modified.

## Third-Party Data Sources
The live demo of this project utilizes data from several external authorities:
* **[GND (Gemeinsame Normdatei)](https://gnd.network/)**: Data is provided under CC0 1.0.
* **[GeoNames](https://www.geonames.org/)**: Data is licensed under a Creative Commons Attribution 4.0 License.
* **[Correspondences of Early Romanticism](https://zenodo.org/records/17468426)**: Suárez Cronauer, E., Fath, L., Strobel, J., Weyand, S., Burch, T., & Deicke, A. (2025). Correspondences of Early Romanticism – RDF-serialisation [Data set]. Zenodo. [https://doi.org/10.5281/zenodo.17468426](https://doi.org/10.5281/zenodo.17468426)
`;

export default function LicenseView() {
  const { dispatch } = useAppState();

  return (
    <Box
      sx={{ height: "100%", overflowY: "auto", bgcolor: "background.default" }}
    >
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => dispatch({ type: "SET_VIEW", payload: "dashboard" })}
          sx={{ mb: 3 }}
        >
          Back to Dashboard
        </Button>

        <Paper sx={{ p: 4, bgcolor: "background.paper" }}>
          {/* 2. Render the Markdown and map tags to MUI components */}
          <ReactMarkdown
            components={{
              // Map # to Typography h4
              h1: ({ node, ...props }) => (
                <Typography
                  variant="h4"
                  color="secondary"
                  gutterBottom
                  {...props}
                />
              ),
              // Map ## to Typography h5
              h2: ({ node, ...props }) => (
                <Typography
                  variant="h5"
                  color="secondary"
                  sx={{ mt: 4, mb: 2 }}
                  {...props}
                />
              ),
              // Map paragraphs to Typography body1
              p: ({ node, ...props }) => (
                <Typography
                  variant="body2"
                  paragraph
                  sx={{ color: "text.secondary" }}
                  {...props}
                />
              ),
              // Map links to MUI Link
              a: ({ node, ...props }) => (
                <Link
                  color="secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),
              // Map list items
              li: ({ node, ...props }) => (
                <Typography
                  component="li"
                  variant="body2"
                  sx={{ color: "text.secondary", ml: 2, mb: 1 }}
                  {...props}
                />
              ),
            }}
          >
            {licenseMarkdown}
          </ReactMarkdown>
        </Paper>
      </Container>
    </Box>
  );
}
