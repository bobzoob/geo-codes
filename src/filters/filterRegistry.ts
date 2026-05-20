import type { FilterModule } from "../types/filter";
import { resolveMappedField } from "../filters/filterUtils";
import TextFilterUI from "../components/filters/TextFilter";
import DateFilterUI from "../components/filters/DateFilter";
import EntityFilter from "../components/filters/EntityFilter";
import PlaceFilterUI from "../components/filters/PlaceFilter";
import ToggleFilter from "../components/filters/ToggleFilter";

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
    predicate: (feature, value, _entities, mapping) => {
      const { start, end } = value;

      // Use the helper to resolve the fallback chains!
      const featStart = resolveMappedField(feature, mapping.dateStart);
      const featEnd = resolveMappedField(feature, mapping.dateEnd) || featStart;

      // 3. Standard date comparison
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
    predicate: (feature, value, entities) => {
      const { searchTerm, onlyResolved } = value;

      // if no filter is active, show everything
      if (!searchTerm && !onlyResolved) return true;

      const term = searchTerm.toLowerCase();
      const props = feature.properties;

      // SPECIFIC RESTRICTION: Only check these two fields
      const fieldsToSearch = ["origin_id", "target_id"];

      return fieldsToSearch.some((field) => {
        const id = props[field];
        if (!id) return false;

        const entity = entities[id];

        // ensure the entity exists and is a Place
        if (!entity || entity.type !== "Place") return false;

        // apply "Resolved Only" logic
        // checks if the entity has a geonames_resolved ID in the dictionary
        if (onlyResolved && !entity.authority?.geonames_resolved) {
          return false;
        }

        // Apply "Search Term" logic
        if (searchTerm && !entity.name.toLowerCase().includes(term)) {
          return false;
        }

        return true;
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

  // TOGGLE OPTION
  // data status or special field
  dataStatus: {
    id: "dataStatus",
    label: "Quality Filter",
    defaultValue: {},
    component: ToggleFilter,
    formatValue: (val) => {
      const activeCount = Object.values(val).filter(Boolean).length;
      if (activeCount === 0) return "None";
      return activeCount === 1
        ? "1 filter active"
        : `${activeCount} filters active`;
    },
    predicate: (feature, toggles, entities) => {
      const activeToggles = Object.entries(toggles).filter(
        ([_, active]) => active
      );
      if (activeToggles.length === 0) return true;

      const props = feature.properties;
      // focus on the geographic reliability
      const geoFields = ["origin_id", "target_id"];

      return activeToggles.every(([toggleId]) => {
        // verified_gnd_machine OR verified_gnd_manual
        if (toggleId === "gndOnly") {
          return geoFields.every((field) => {
            const status = entities[props[field]]?.status;
            return (
              status === "verified_gnd_machine" ||
              status === "verified_gnd_manual"
            );
          });
        }

        // hide the least secure value
        if (toggleId === "excludeInternal") {
          return !geoFields.some((field) => {
            return (
              entities[props[field]]?.status === "verified_internal_manual"
            );
          });
        }

        // human researcher has personally confirmed
        if (toggleId === "manualOnly") {
          return geoFields.every((field) => {
            return entities[props[field]]?.status === "verified_gnd_manual";
          });
        }

        return true;
      });
    },
  },
};
