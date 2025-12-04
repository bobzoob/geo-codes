import type { FilterModule } from "../types/filter";
import TextFilterUI from "../components/filters/TextFilter";
import DateFilterUI from "../components/filters/DateFilter";
import EntityFilter from "../components/filters/EntityFilter";

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

      // title and full text
      if (props.title?.toLowerCase().includes(term)) return true;
      if (props.full_text?.toLowerCase().includes(term)) return true;

      // mentions
      if (props.mentions) {
        return props.mentions.some((id) =>
          entities[id]?.label.toLowerCase().includes(term)
        );
      }
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

      // mentions
      if (props.mentions) {
        const match = props.mentions.some((id) =>
          entities[id]?.label.toLowerCase().includes(term)
        );
        if (match) return true;
      }

      // Sender/Recipient explicitly (if not already in mentions)
      if (
        props.senderId &&
        entities[props.senderId]?.label.toLowerCase().includes(term)
      )
        return true;
      if (
        props.recipientId &&
        entities[props.recipientId]?.label.toLowerCase().includes(term)
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

      const senderId = feature.properties.senderId;

      // if letter has no sender
      if (!senderId) return false;

      // look up in dictionary
      const entity = entities[senderId];

      // safety check, maybe id missing
      if (!entity) return false;

      return entity.label.toLowerCase().includes(term);
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

      const recipientId = feature.properties.recipientId;

      if (!recipientId) return false;
      const entity = entities[recipientId];

      if (!entity) return false;

      return entity.label.toLowerCase().includes(term);
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
};
