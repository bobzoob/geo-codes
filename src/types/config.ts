export type Operator =
  | "eq"
  | "neq"
  | "gt"
  | "lt"
  | "contains"
  | "in"
  | "isNull"
  | "isNotNull";

// 1. A single condition MUST have a field and an operator
export interface SingleFilter {
  field: string;
  operator: Operator;
  value?: any;

  // Explicitly forbid logical properties here
  logic?: never;
  conditions?: never;
}

// 2. A logical group MUST have logic and conditions
export interface LogicalFilter {
  logic: "AND" | "OR";
  conditions: BaseFilter[];

  // Explicitly forbid single condition properties here
  field?: never;
  operator?: never;
  value?: never;
}
// 3. The BaseFilter is strictly ONE of the above
export type BaseFilter = SingleFilter | LogicalFilter;

/**
 * Translator: Maps data keys to framework concepts
 */
export interface FieldMapping {
  id: string; // Unique identifier key
  title: string; // Key for the main display name
  dateStart: string | string[]; // Key for temporal start
  dateEnd?: string | string[]; // Key for temporal end
  // Generic categories for filtering
  textSearch: string[]; // Keys to look into for text search
  entityRefs: string[]; // Keys containing IDs for dictionary lookup
  children?: string; // key for nested data
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
