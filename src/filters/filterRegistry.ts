import type { FilterModule } from "../types/filter";
import TextFilterUI from "../components/filters/TextFilter";
import DateFilterUI from "../components/filters/DateFilter";
import EntityFilter from "../components/filters/EntityFilter";
import PlaceFilterUI from "../components/filters/PlaceFilter";

/**
 * WHEN IMPLEMENTING A NEW FILTER/SEARCH LOGIC HERE
 * YOU HAVE TO UPDATE layers.ts TO LET IT SHOW ON THE
 * OPTIONSPANEL
 */

export const filterRegistry: Record<string, FilterModule> = {
  // TEXT SEARCH
  plainText: {
    id: "plainText",
    label: "Text Search",
    defaultValue: "",
    component: TextFilterUI,
    predicate: (feature, value, entities) => {
      if (!value) return true;
      const term = value.toLowerCase();
      const props = feature.properties;

      // title and full text (properties)
      // SET PROPS NAMES HERE
      const textProperties = [props.title, props.full_text, props.text_preview];
      for (const propValue of textProperties) {
        if (propValue && String(propValue).toLowerCase().includes(term)) {
          return true;
        }
      }

      // mentions
      // we collect them into a set, to avoid duplicates
      const allEntityIds = new Set<string>();

      // SET FIELD NAMES HERE
      const idFields = [
        "sender_ids",
        "recipient_ids",
        "mention_ids",
        "origin_id",
        "target_id",
        "born",
        "died",
      ];

      idFields.forEach((field) => {
        const ids = props[field];
        if (Array.isArray(ids)) {
          ids.forEach((id) => id && allEntityIds.add(String(id)));
        } else if (ids) {
          allEntityIds.add(String(ids));
        }
      });

      // if search term matches any resolved entity name
      for (const id of allEntityIds) {
        const entity = entities[id];
        if (entity && entity.name.toLowerCase().includes(term)) {
          return true;
        }
      }

      // Fallback
      return false;
    },
  },

  // DATE RANGE
  dateRange: {
    id: "dateRange",
    label: "Date Range",
    defaultValue: { start: "", end: "" },
    component: DateFilterUI,
    predicate: (feature, value) => {
      const { start, end } = value;
      const props = feature.properties;
      const featStart = props.date_start;
      const featEnd = props.date_end || featStart;

      if (start && featEnd && featEnd < start) return false;
      if (end && featStart && featStart > end) return false;
      return true;
    },
  },

  // ENTITY FILTER (searches ONLY Entities)
  entitySearch: {
    id: "entitySearch",
    label: "Entity Filter",
    defaultValue: "",
    component: EntityFilter,
    predicate: (feature, value, entities) => {
      if (!value) return true;
      const term = value.toLowerCase();
      const props = feature.properties;

      if (
        props.mention_ids &&
        props.mention_ids.some((id: string) =>
          entities[id]?.name.toLowerCase().includes(term)
        )
      )
        return true;

      if (
        props.sender_ids &&
        props.sender_ids.some((id: string) =>
          entities[id]?.name.toLowerCase().includes(term)
        )
      )
        return true;
      if (
        props.recipient_ids &&
        props.recipient_ids.some((id: string) =>
          entities[id]?.name.toLowerCase().includes(term)
        )
      )
        return true;

      return false;
    },
  },

  // SENDER FILTER (specific usagefor entities)
  sender: {
    id: "sender",
    label: "Sender",
    component: EntityFilter, // reusing the generic input
    defaultValue: "",
    predicate: (feature, value, entities) => {
      if (!value) return true;
      const term = value.toLowerCase();

      // as my ids are an array
      const ids = feature.properties.sender_ids;
      if (!ids || !Array.isArray(ids)) return false;

      return ids.some((id) => {
        const entity = entities[id];
        return entity && entity.name.toLowerCase().includes(term);
      });
    },
  },

  // RECIPIENT
  recipient: {
    id: "recipient",
    label: "Recipient",
    component: EntityFilter,
    defaultValue: "",
    predicate: (feature, value, entities) => {
      if (!value) return true;
      const term = value.toLowerCase();

      const ids = feature.properties.recipient_ids;
      if (!ids || !Array.isArray(ids)) return false;

      return ids.some((id) => {
        const entity = entities[id];
        return entity && entity.name.toLowerCase().includes(term);
      });
    },
  },

  // TOPIC
  topic: {
    id: "topic",
    label: "Topic",
    component: TextFilterUI, // reuse
    defaultValue: "",
    predicate: (feature, value) => {
      if (!value) return true;
      const term = value.toLowerCase();

      // if topics array contains search term
      const topics = feature.properties.topics;
      if (!topics || !Array.isArray(topics)) return false;

      return topics.some((t) => t.toLowerCase().includes(term));
    },
  },

  // PLACE
  placeFilter: {
    id: "placeFilter",
    label: "Places",
    defaultValue: { searchTerm: "", onlyResolved: false },
    component: PlaceFilterUI,
    predicate: (feature, value, entities) => {
      const { searchTerm, onlyResolved } = value;
      if (!searchTerm && !onlyResolved) return true;

      const props = feature.properties;
      const term = searchTerm.toLowerCase();

      // getting enteties for origin /target
      const origin = entities[props.origin_id];
      const target = entities[props.target_id];

      const relevantEntities = [origin, target].filter(Boolean);

      // filter logic
      return relevantEntities.some((entity) => {
        // must be a place
        if (entity.type !== "Place") return false;
        // here i like to check the geonames_resolved flag for research
        if (onlyResolved && !entity.authority?.geonames_resolved) {
          return false;
        }
        if (searchTerm && !entity.name.toLowerCase().includes(term)) {
          return false;
        }

        return true;
      });
    },
  },

  // IS_LOCAL (Hidden)
  localOnly: {
    id: "localOnly",
    label: "Local Only",
    defaultValue: true,
    component: () => null, // Hidden logic filter
    predicate: (f) => f.properties.is_local === true,
  },

  excludeLocal: {
    id: "excludeLocal",
    label: "Exclude Local",
    defaultValue: true,
    component: () => null, // Hidden logic filter
    predicate: (f) => f.properties.is_local !== true,
  },
};
