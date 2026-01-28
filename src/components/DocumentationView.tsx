import { Box, Button, Container, Paper, Link, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { useAppState } from "../state/appContext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useMemo } from "react";

const markdownContent = `
# geocodes | Documentation

## 1. Overview
This application is a specialized **Digital Humanities (DH) framework** designed to visualize complex, multi-perspective historical datasets (such as movement, correspondence, events, entities etc.). The system focuses on revealing overlapping narratives through dynamic filtering and data aggregation. The application uses a **reactive data pipeline** where raw GeoJSON data is filtered, sanitized, and aggregated in real-time before reaching the map interface.

**Tech Stack:** 
- **Core:** React 18+ with TypeScript.
- **Build Tool:** Vite.
- **Mapping:** MapLibre GL via \`react-map-gl\`.
- **UI/UX:** Material UI (MUI) v5.
- **Data:** GeoJSON (for spatial data) and JSON (entity dictionaries).
---

## 2. Architecture 

### Reactive Pipeline
Data flows in a unidirectional stream. The map never reads raw data, it only reads data processed by the **Selectors**. The pipline works like this:

\`\`\`
                                  [Active Filters & Timeline]
                                            |
                                            ↓
[Raw GeoJSON] → [Context State] → [Selectors (Engine)] 
→ [Processed Data] → [Map Layers / UI]
                                    
\`\`\`

### Core Classes & Files

1.  **Data Loading (\`appContext.tsx\`)**: On startup, GeoJSON data sources (defined in \`layers.ts\`) and an entity dictionary (\`final_manifest.json\`) are fetched asynchronously.
2.  **State Management (\`appReducer.ts\`)**: User actions (e.g., toggling a layer, moving the timeline slider) dispatch actions to the central reducer, which updates the application's "raw" state (e.g., \`committedTimeRange\`, \`filterValues\`).
3.  **The Engine (\`selectors.ts\`)**: The core function \`computeProcessedData\` listens for changes in the raw state. When a change occurs, it re-runs the entire pipeline for each layer:
    - **Filter**: It applies all active filters (date, text, entity) to the raw GeoJSON data using predicates from the \`FilterRegistry\`.
    - **Sanitize**: It ensures every feature has a unique root-level \`id\` for reliable interaction with MapLibre.
    - **Process**: If a layer has a processor (e.g., \`aggregateByProperty\`), it transforms the filtered data. For example, it can group hundreds of individual letter features into single city "hubs."
4.  **Rendering (\`LayerManager.tsx\`, \`MapPopup.tsx\`)**: UI components listen only to the final \`processedData\` from the state. When this data changes, React efficiently re-renders the map layers and updates the content of any open popup instantly.

### Registry Pattern

The application's logic is modular and extensible through a "Registry" pattern. Instead of hardcoding functionality, the core engine looks up logic in centralized objects.

- **\`layerRegistry.ts\`**: Maps a layer \`type\` (e.g., \`"point"\`, \`"line"\`) to a React component (\`PointLayer\`, \`ArrowLayer\`) responsible for rendering it.
- **\`filterRegistry.ts\`**: Contains the logic for all filters. Each entry defines a UI component (\`TextFilter\`, \`EntityFilter\`), a \`predicate\` function that returns \`true\` or \`false\` for each feature, and a default value.
- **\`processorRegistry.ts\`**: Holds data transformation functions. For example, \`aggregateByProperty\` converts an array of features into a new, aggregated FeatureCollection.

---

## 4. Developer Guide: Extending the Application

### How to Add a New Layer

1.  **Add Data:** Place your GeoJSON file in \`public/\`.
2.  **Configure:** Add an entry to \`src/config/layers.ts\`.
\`\`\`typescript
{
  id: "my-new-layer",
  type: "point", // Must exist in layerRegistry
  source: "/my-data.geojson",
  visible: true,
  activeFilters: [
     { moduleId: "dateRange", placement: "timeline-area" }
  ],
  popupConfig: [
     { field: "title", type: "header" }
  ]
}
\`\`\`

### How to Add a New Filter

1.  **Define Logic:** Add the predicate to \`src/filters/filterRegistry.ts\`.
\`\`\`typescript
myNewFilter: {
  id: "myNewFilter",
  label: "My Filter",
  component: TextFilterUI, // Or create a new component in src/components/filters
  defaultValue: "",
  predicate: (feature, value, entities) => {
     return feature.properties.someField === value;
  }
}
\`\`\`
2.  **Activate:** Add \`{ moduleId: "myNewFilter", ... }\` to the \`activeFilters\` array in \`layers.ts\`.

### How to Add Custom Data Processing

(e.g., Heatmaps or Network Lines)

1.  **Define Logic:** Add a function to \`src/processors/processorRegistry.ts\`.
    - Input: \`HistoricalFeature[]\`
    - Output: \`HistoricalFeatureCollection\`
2.  **Activate:** Add the \`processor\` config to your layer in \`layers.ts\`.
\`\`\`typescript
processor: {
  type: "myNewProcessor",
  params: { param1: "value" }
}
\`\`\`

### How to Style the Popup

Modify \`src/config/mapTheme.ts\`.

- Target \`.maplibregl-popup-content\` for container styles (height, background).
- Target \`MuiChip\` or \`MuiTypography\` for internal element styles.

---

## 5. GeoJSON Data Contract

Every feature in your source files should adhere to this loose contract (\`HistoricalFeatureProperties\`):

\`\`\`json
{
  "type": "Feature",
  "properties": {
    "id": "unique_string",     // Required for MapLibre interaction
    "title": "Display Title",  // Used in tooltips
    "date_start": "YYYY-MM-DD",// Required for Time Slider
    "sender_ids": ["id_1"],    // Optional: For Entity Resolution
    "origin_id": "id_2"        // Optional: For Aggregation
  },
  "geometry": { ... }
}
\`\`\`
`;

// Helper function to create IDs from heading text
const generateSlug = (text: string) => {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, ""); // Remove all non-word chars
};

function DocumentationView() {
  const { dispatch } = useAppState();

  // PARSE HEADINGS FROM MARKDOWN
  // useMemo: only runs once
  const headings = useMemo(() => {
    const headingRegex = /^(##|###)\s+(.*)/gm;
    const matches = Array.from(markdownContent.matchAll(headingRegex));
    return matches.map((match) => {
      const level = match[1].length; // ## -> 2, ### -> 3
      const text = match[2];
      const slug = generateSlug(text);
      return { level, text, slug };
    });
  }, []);

  // CREATE CUSTOM RENDERERS TO INJECT ANCHOR IDs
  const components = {
    h2: ({ node, ...props }: any) => {
      const slug = generateSlug(props.children);
      return <h2 id={slug} {...props} />;
    },
    h3: ({ node, ...props }: any) => {
      const slug = generateSlug(props.children);
      return <h3 id={slug} {...props} />;
    },
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "dashboard" })}
        sx={{ mb: 3 }}
      >
        Back to Dashboard
      </Button>

      {/* FLEX LAYOUT */}
      <Box
        sx={{
          display: "flex",
          gap: 5,
          alignItems: "flex-start",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* SIDEBAR MENU */}
        <Box
          sx={{
            width: { xs: "100%", md: 260 },
            flexShrink: 0,
            position: { md: "sticky" },
            top: 40,
            maxHeight: { md: "calc(100vh - 120px)" },
            overflowY: { md: "auto" },
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            geocodes | Documentation
          </Typography>

          {headings.map(({ level, text, slug }) => (
            <Link
              key={slug}
              href={`#${slug}`}
              underline="hover"
              variant="body2"
              sx={{
                display: "block",
                py: 0.5,
                pl: (level - 2) * 2,
                color: "text.secondary",
                "&:hover": { color: "text.primary" },
              }}
            >
              {text}
            </Link>
          ))}
        </Box>

        {/* MAIN DOCUMENTATION CONTENT */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Paper
            sx={{
              p: { xs: 2, sm: 4 },
              "& h1, & h2, & h3, & h4": {
                scrollMarginTop: "40px",
              },
              "& h2, & h3": {
                borderBottom: 1,
                borderColor: "divider",
                pb: 1,
                mb: 2,
              },
            }}
          >
            <ReactMarkdown components={components}>
              {markdownContent}
            </ReactMarkdown>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}

export default DocumentationView;
