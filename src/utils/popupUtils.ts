import type { EntityMap } from "../types/geojson";
import type { PopupFieldConfig } from "../types/state";

import { AUTHORITY_MAP } from "../config/authorities";
import type { SourceConfig } from "../types/config";

export interface ResolvedEntity {
  name: string;
  url?: string;
}
export interface ProcessedField {
  label?: string;
  value: any;
  type: string;
  url?: string;
  componentId?: string;
  params?: Record<string, any>;
  meta?: {
    listLabelField?: string;
    listSecondaryField?: string;
    detailTemplateId?: string;
    caption?: string;
  };
}

export interface GenericPopupData {
  fields: ProcessedField[];
  url?: string;
}

/**
 * Helper to resolve IDs to Names and optionally filter by Entity Type
 * generate Authority URLs
 */
const resolveAndFilter = (
  ids: any,
  entities: EntityMap,
  typeFilter?: string,
  isLinkable?: boolean
): ResolvedEntity[] => {
  if (!ids) return [];

  const list: string[] = Array.isArray(ids)
    ? ids
    : typeof ids === "string" && ids.startsWith("[")
    ? JSON.parse(ids)
    : [ids];

  return list
    .map((id) => {
      const entity = entities[String(id).trim()];
      if (!entity) return { name: String(id) }; // fallback to raw ID

      // apply type filter (here: only show "Place" entities)
      if (
        typeFilter &&
        entity.type?.toLowerCase() !== typeFilter.toLowerCase()
      ) {
        return null;
      }

      // Gwe generate URL based on authority configuration
      let url = undefined;
      if (isLinkable !== false && entity.authority) {
        const authKey = Object.keys(entity.authority).find(
          (key) => AUTHORITY_MAP[key]
        );
        if (authKey) {
          url = `${AUTHORITY_MAP[authKey]}${entity.authority[authKey]}`;
        }
      }

      return { name: entity.name, url };
    })
    .filter((item): item is ResolvedEntity => item !== null);
};

/**
 *  we use SourceConfig to find fetures
 * when lists have nested children we like to process
 */
export const findFeatureGenerically = (
  layerId: string,
  featureId: string,
  processedData: any,
  sourceConfig: SourceConfig
) => {
  const features = processedData[layerId]?.features || [];
  const childKey = sourceConfig.mapping.children;

  // Check top level
  let found = features.find(
    (f: { id: any }) => String(f.id) === String(featureId)
  );
  if (found) return found;

  //if the source has a children mapping, check nested levels
  if (childKey) {
    for (const parent of features) {
      const children = parent.properties[childKey];
      if (Array.isArray(children)) {
        found = children.find((c) => String(c.id) === String(featureId));
        if (found) return found;
      }
    }
  }
  return null;
};

/**
 * Helper: MapLibre stringifies arrays/objects in properties.
 * This safely parses them back into JS objects if needed.
 */
const parseIfStringifiedJSON = (val: any) => {
  if (typeof val === "string" && (val.startsWith("[") || val.startsWith("{"))) {
    try {
      return JSON.parse(val);
    } catch (e) {
      return val; // fallback to original string if parsing fails
    }
  }
  return val;
};

/**
 * Main Extraction Engine
 * Transforms raw feature properties into UI-ready fields
 */
export const extractGenericPopupData = (
  feature: any,
  config: PopupFieldConfig[],
  entities: EntityMap = {}
): GenericPopupData => {
  const props = feature.properties || {};
  const fields: ProcessedField[] = [];

  config.forEach((conf) => {
    // CUSTOM COMPONENTS
    if (conf.type === "custom") {
      fields.push({
        type: "custom",
        componentId: conf.componentId,
        params: conf.params,
        value: props[conf.field],
      });
      return;
    }

    // COMPOSITE FIELDS (here: combined headers)
    if (conf.type === "composite" && conf.fields) {
      const resolvedParts = conf.fields.map((fieldName) => {
        const rawValue = props[fieldName];
        if (!rawValue) return "Unknown";

        if (conf.resolveEntities) {
          const resolved = resolveAndFilter(
            rawValue,
            entities,
            conf.entityTypeFilter,
            false
          );
          return resolved.length > 0
            ? resolved.map((r) => r.name).join(", ")
            : String(rawValue);
        }
        return String(rawValue);
      });

      fields.push({
        type: conf.isHeader ? "header" : "text",
        label: conf.label,
        value: resolvedParts.join(conf.separator || " "),
      });
      return;
    }

    // LINK BUTTONS
    if (conf.type === "link-button") {
      const rawId = props[conf.field] ?? feature[conf.field];
      let url = "";

      if (rawId && conf.linkTemplate && AUTHORITY_MAP[conf.linkTemplate]) {
        url = `${AUTHORITY_MAP[conf.linkTemplate]}${rawId}`;
      }

      fields.push({
        label: conf.label,
        type: "link-button",
        value: rawId,
        url,
      });
      return;
    }

    // FEATURE LISTS (Aggregated children)
    if (conf.type === "feature-list") {
      const listValue = parseIfStringifiedJSON(props[conf.field]);
      if (!Array.isArray(listValue)) return;

      fields.push({
        label: conf.label,
        type: "feature-list",
        value: listValue,
        meta: {
          listLabelField: conf.listLabelField,
          listSecondaryField: conf.listSecondaryField,
          detailTemplateId: conf.detailTemplateId,
        },
      });
      return;
    }

    // STANDARD DATA EXTRACTION (Text, Tags, Lists, etc.)
    let rawValue = props[conf.field] ?? feature[conf.field];
    if (rawValue === undefined || rawValue === null) return;

    // apply the MapLibre stringification fix globally
    rawValue = parseIfStringifiedJSON(rawValue);

    let processedValue = rawValue;
    let fieldUrl: string | undefined = undefined;

    // resolve entities if requested
    if (conf.resolveEntities) {
      if (conf.type === "timed-list") {
        const listData = Array.isArray(rawValue) ? rawValue : [rawValue];

        processedValue = listData.map((entry: any) => {
          // Handle nested arrays like["gnd:123", "1801"]
          if (Array.isArray(entry)) {
            return {
              label: entities[entry[0]]?.name || entry[0],
              subLabel: entry[1],
            };
          }
          // fallback if data is flat
          return { label: entities[entry]?.name || entry, subLabel: "" };
        });
      } else {
        const resolved = resolveAndFilter(
          rawValue,
          entities,
          conf.entityTypeFilter,
          conf.isLinkable
        );
        if (resolved.length === 0) return;

        // if its a simple text field but we resolved it, take the first one
        if (conf.type === "text") {
          processedValue = resolved[0].name;
          fieldUrl = resolved[0].url;
        } else {
          processedValue = resolved;
        }
      }
    }
    let captionText = undefined;
    if (conf.captionField) {
      captionText = props[conf.captionField] ?? feature[conf.captionField];
    }

    fields.push({
      label: conf.label,
      type: conf.type,
      value: processedValue,
      url: fieldUrl,
      meta: { caption: captionText },
    });
  });

  return {
    fields,
    url: props.url || props.source_url, // fallback for external links
  };
};
