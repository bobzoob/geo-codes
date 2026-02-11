export type Operator = "eq" | "neq" | "gt" | "lt" | "contains" | "in";

export interface BaseFilter {
  field: string;
  operator: Operator;
  value: any;
}

/**
 * Translator: Maps data keys to framework concepts
 */
export interface FieldMapping {
  id: string; // Unique identifier key
  title: string; // Key for the main display name
  dateStart: string; // Key for temporal start
  dateEnd?: string; // Key for temporal end
  // Generic categories for filtering
  textSearch: string[]; // Keys to look into for text search
  entityRefs: string[]; // Keys containing IDs for dictionary lookup
}

/**
 * Data source: Where data lives and how it is structured
 */
export interface SourceConfig {
  id: string;
  url: string;
  type: "geojson" | "json" | "csv";
  mapping: FieldMapping;
  dictionaryId?: string; // Default dictionary for this source
}

/**
 * Layer: How a source is visualized
 */
export interface LayerConfig {
  id: string;
  sourceId: string; // Reference to a SourceConfig
  templateId: string; // Reference to a PopupTemplate
  name: string;
  visible: boolean;
  type: string; // "point", "line", etc. (from registry)

  // "Data splitter"
  baseFilter?: BaseFilter;

  // UI Configuration
  activeFilters: {
    moduleId: string;
    placement: "timeline-area" | "search-area";
  }[];

  processor?: {
    type: string;
    params: Record<string, any>;
  };

  styleConfig?: any;
}
