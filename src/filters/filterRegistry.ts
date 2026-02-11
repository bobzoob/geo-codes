import type { FilterModule } from "../types/filter";
import TextFilterUI from "../components/filters/TextFilter";
import DateFilterUI from "../components/filters/DateFilter";
import EntityFilter from "../components/filters/EntityFilter";
import PlaceFilterUI from "../components/filters/PlaceFilter";

/**
 * GENERIC FILTER REGISTRY
 * registry provides the logic (predicate) and the UI type (component)
 * which field to search, whether to show suggestions
 * is passed via mapping from "source" or "layer"
 */

export const filterRegistry: Record<string, FilterModule> = {
  // TEXT SEARCH (all text fields, all entities)
  plainText: {
    id: "plainText",
    label: "Text Search",
    defaultValue: "",
    component: TextFilterUI,
    formatValue: (val) => `"${val}"`,
    predicate: (feature, value, entities, mapping) => {
      if (!value) return true;
      const term = value.toLowerCase();
      const props = feature.properties;

      // text props
      const textFields = mapping.textSearch || [];
      if (
        textFields.some((f) =>
          String(props[f] || "")
            .toLowerCase()
            .includes(term)
        )
      )
        return true;

      // mapped entities
      const entityFields = mapping.entityRefs || [];
      return entityFields.some((field) => {
        const ids = Array.isArray(props[field]) ? props[field] : [props[field]];
        return ids.some((id) =>
          entities[id]?.name.toLowerCase().includes(term)
        );
      });
    },
  },

  // DATE RANGE
  dateRange: {
    id: "dateRange",
    label: "Date Range",
    defaultValue: { start: "", end: "" },
    component: DateFilterUI,
    formatValue: (val) => {
      if (val.start && val.end) return `${val.start} - ${val.end}`;
      return val.start ? `After ${val.start}` : `Before ${val.end}`;
    },
    // _enteties: marked here as intentionally unused
    predicate: (feature, value, _entities, mapping) => {
      const { start, end } = value;

      // find date fields
      const startKey = mapping.dateStart;
      const endKey = mapping.dateEnd || startKey;

      const featStart = feature.properties[startKey];
      const featEnd = feature.properties[endKey] || featStart;

      if (start && featEnd && featEnd < start) return false;
      if (end && featStart && featStart > end) return false;
      return true;
    },
  },

  // ENTITIE FILTER (only entities)
  entitySearch: {
    id: "entitySearch",
    label: "Entity Filter",
    defaultValue: "",
    component: EntityFilter,
    formatValue: (val) => `"${val}"`,
    predicate: (feature, value, entities, mapping, _layer, params) => {
      if (!value) return true;
      const term = value.toLowerCase();

      // if param.property is provided we search only that field
      // otherwise we search all fields
      const fieldsToSearch = params?.property
        ? [params.property]
        : mapping.entityRefs || [];

      return fieldsToSearch.some((field) => {
        const ids = Array.isArray(feature.properties[field])
          ? feature.properties[field]
          : [feature.properties[field]];
        return ids.some((id) =>
          entities[id]?.name.toLowerCase().includes(term)
        );
      });
    },
  },

  // ROLE-SPECIFIC FILTER (sender, recipiant, ..)
  // if you want to use them,
  // your data must contain the keys
  sender: {
    id: "sender",
    label: "Sender",
    defaultValue: "",
    component: EntityFilter,
    formatValue: (val) => `Sender: ${val}`,
    predicate: (f, v, e, m, l, p) =>
      filterRegistry.entitySearch.predicate(f, v, e, m, l, {
        ...p,
        property: "sender_ids",
      }),
  },

  recipient: {
    id: "recipient",
    label: "Recipient",
    defaultValue: "",
    component: EntityFilter,
    formatValue: (val) => `Recipient: ${val}`,
    predicate: (f, v, e, m, l, p) =>
      filterRegistry.entitySearch.predicate(f, v, e, m, l, {
        ...p,
        property: "recipient_ids",
      }),
  },

  // PLACE FILTER

  placeFilter: {
    id: "placeFilter",
    label: "Places",
    defaultValue: { searchTerm: "", onlyResolved: false },
    component: PlaceFilterUI,
    formatValue: (val) => {
      const parts = [];
      if (val.searchTerm) parts.push(`"${val.searchTerm}"`);
      if (val.onlyResolved) parts.push("Resolved Only");
      return parts.join(" + ");
    },
    predicate: (feature, value, entities, mapping) => {
      const { searchTerm, onlyResolved } = value;
      if (!searchTerm && !onlyResolved) return true;

      const term = searchTerm.toLowerCase();
      const entityFields = mapping.entityRefs || [];

      return entityFields.some((field) => {
        const ids = Array.isArray(feature.properties[field])
          ? feature.properties[field]
          : [feature.properties[field]];
        return ids.some((id) => {
          const entity = entities[id];
          if (!entity || entity.type !== "Place") return false;
          if (onlyResolved && !entity.authority?.geonames_resolved)
            return false;
          if (searchTerm && !entity.name.toLowerCase().includes(term))
            return false;
          return true;
        });
      });
    },
  },

  // BOOLEAN TOGGLE
  // the is_flagged problem
  booleanToggle: {
    id: "booleanToggle",
    label: "Toggle Filter",
    defaultValue: false,
    component: () => null,
    formatValue: (value, params) => {
      return value
        ? params?.activeLabel || "Enabled"
        : params?.inactiveLabel || "Disabled";
    },
    predicate: (feature, value, _entities, _mapping, _layer, params) => {
      if (!value) return true; // if toggle is off we show everything

      const property = params?.property;
      if (!property) return true;

      //if property matches target value (default is true)
      const targetValue = params?.targetValue ?? true;
      return feature.properties[property] === targetValue;
    },
  },
};
