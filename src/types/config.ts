export type Operator =
  | "eq"
  | "neq"
  | "gt"
  | "lt"
  | "contains"
  | "in"
  | "isNull"
  | "isNotNull";

// FILTERING
// single condition MUST have a field and an operator
export interface SingleFilter {
  field: string;
  operator: Operator;
  value?: any;
  matchReferenceField?: string; // we want to pull values dynamically from clicked features for our group highlighting

  // therefore we explicitly forbid logical properties here
  logic?: never;
  conditions?: never;
}

// group MUST have logic and conditions
export interface LogicalFilter {
  logic: "AND" | "OR";
  conditions: BaseFilter[];

  // therefore we explicitly forbid single condition properties here
  field?: never;
  operator?: never;
  value?: never;
}
// aseFilter is strictly ONE of the above
export type BaseFilter = SingleFilter | LogicalFilter;

/**
 * Translator: Maps data keys to framework concepts
 */
export interface FieldMapping {
  id: string; // Unique identifier key
  title: string; // key for the main display name
  dateStart: string | string[]; // Key for temporal start
  dateEnd?: string | string[]; // Key for temporal end
  // generic categories for filtering
  textSearch: string[]; // keys to look into for text search
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
  dictionaryId?: string; // default dictionary for this source
}

/**
 * Layer: How a source is visualized
 */
export interface LayerConfig {
  id: string;
  sourceId: string; // reference to a SourceConfig
  templateId: string; // reference to a PopupTemplate
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
