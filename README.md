# GEOCODES | Multilayer-Interactive-Map | Framework for DH Data

## 1. Introduction

This application is a specialized **Digital Humanities (DH) framework** designed to visualize complex, multi-perspective historical datasets in a multilayered and interactive map. The system focuses on revealing overlapping narratives through dynamic filtering and data aggregation. The application uses a **reactive data pipeline** where raw GeoJSON data is filtered, sanitized, and aggregated in real-time before reaching the map interface.

## Live Demo

**[View the live application here](https://historic-interactive-map.vercel.app/)**

---

**Tech Stack:**

- **Core:** React 18+ with TypeScript.
- **Build Tool:** Vite.
- **Mapping:** MapLibre GL via `react-map-gl`.
- **UI/UX:** Material UI (MUI) v5.
- **Data:** GeoJSON (for spatial data) and JSON (entity dictionaries).

---

## Run the Project Locally

To set up and run this project on your own machine, follow these steps:

### Prerequisites

- Node.js
- npm or yarn

### Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/bobzoob/historic-interactive-map.git
    ```

2.  **Navigate into the project directory:**

    ```bash
    cd historic-interactive-map
    ```

3.  **Install the dependencies:**

    ```bash
    npm install
    ```

4.  **Start the development server:**
    ```bash
    npm run dev
    ```

The application should now be running on `http://localhost:5173`.

---

## 2. Architecture

### Reactive Pipeline

Data flows in a unidirectional stream. The map never reads raw data, it only reads data processed by the **Selectors**. The pipline works like this:

[Raw GeoJSON] → [Context State] → [Selectors (Engine)]
→ [Processed Data] → [Map Layers / UI]

### Core Classes & Files

1.  **Data Loading (`appContext.tsx`)**: On startup, GeoJSON data sources (defined in `layers.ts`) and an entity dictionary (`final_manifest.json`) are fetched asynchronously.
2.  **State Management (`appReducer.ts`)**: User actions (e.g., toggling a layer, moving the timeline slider) dispatch actions to the central reducer, which updates the application's "raw" state ( `committedTimeRange`, `filterValues`).
3.  **The Engine (`selectors.ts`)**: The core function `computeProcessedData` listens for changes in the raw state. When a change occurs, it re-runs the entire pipeline for each layer:
    - **Filter**: It applies all active filters (date, text, entity) to the raw GeoJSON data using predicates from the `FilterRegistry`.
    - **Sanitize**: It ensures every feature has a unique root-level `id` for reliable interaction with MapLibre.
    - **Process**: If a layer has a processor (`aggregateByProperty`), it transforms the filtered data. For example, it can group hundreds of individual letter features into single city "hubs."
4.  **Rendering (`LayerManager.tsx`, `MapPopup.tsx`)**: UI components listen only to the final `processedData` from the state. When this data changes, React efficiently re-renders the map layers and updates the content of any open popup instantly.

### Registry Pattern

The application's logic is modular and extensible through a "Registry" pattern. Instead of hardcoding functionality, the core engine looks up logic in centralized objects.

- **`layerRegistry.ts`**: Maps a layer `type` (e.g., `"point"`, `"line"`) to a React component (`PointLayer`, `ArrowLayer`) responsible for rendering it.
- **`filterRegistry.ts`**: Contains the logic for all filters. Each entry defines a UI component (`TextFilter`, `EntityFilter`), a `predicate` function that returns `true` or `false` for each feature, and a default value.
- **`processorRegistry.ts`**: Holds data transformation functions. For example, `aggregateByProperty` converts an array of features into a new, aggregated FeatureCollection.

---

## 3. Developer Guide: Extending the Application

### How to Add a New Layer

1.  **Add Data:** Place your GeoJSON file in `public`.
2.  **Configure:** Add an entry to `src/config/layers.ts`.

````typescript
{
  id: "my-new-layer",
  type: "point", // Must exist in layerRegistry
  source: "/my-data.geojson",
  visible: tr```ue,
  activeFilters: [
     { moduleId: "dateRange", placement: "timeline-area" }
  ],
  popupConfig: [
     { field: "title", type: "header" }
  ]
}
````

### How to Add a New Filter

1.  **Define Logic:** Add the predicate to `src/filters/filterRegistry.ts`.

```typescript
myNewFilter: {
  id: "myNewFilter",
  label: "My Filter",
  component: TextFilterUI, // Or create a new component in src/components/filters
  defaultValue: "",
  predicate: (feature, value, entities) => {
     return feature.properties.someField === value;
  }
}
```

2.  **Activate:** Add `{ moduleId: "myNewFilter", ... }` to the `activeFilters` array in `layers.ts`.

### How to Add Custom Data Processing

( Heatmaps or Network Lines)

1.  **Define Logic:** Add a function to `src/processors/processorRegistry.ts`.
    - Input: `HistoricalFeature[]`
    - Output: `HistoricalFeatureCollection`
2.  **Activate:** Add the `processor` config to your layer in `layers.ts`.

```typescript
processor: {
  type: "myNewProcessor",
  params: { param1: "value" }
}
```

### How to Style the Popup

Modify `src/config/mapTheme.ts`.

- Target `.maplibregl-popup-content` for container styles (height, background).
- Target `MuiChip` or `MuiTypography` for internal element styles.

---

## 4. GeoJSON Data Contract

Every feature in your source files should adhere to this loose contract (`HistoricalFeatureProperties`):

```json
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
```

---
