import type { PopupFieldConfig } from "../types/state";

/**
 * POPUP TEMPLATE REGISTRY
 * here you define reusable UI layouts for different types of data
 */

export const popupTemplates: Record<string, PopupFieldConfig[]> = {
  // letter related feature
  "letter-detail": [
    // custom type for "Sender to Recipient" header
    {
      type: "composite",
      label: "Correspondence",
      fields: ["sender_ids", "recipient_ids"], // these field will be concatinated
      separator: " → ", // with this seperator
      resolveEntities: true,
      isHeader: true, // the result is treated as a header
      field: "id", // dummy field for the loop
    },

    { field: "date_start", label: "Date", type: "text" },
    { field: "date_reliability", label: "Reliability", type: "tags" },

    {
      field: "sender_ids",
      label: "Sender",
      type: "list",
      resolveEntities: true,
    },
    {
      field: "recipient_ids",
      label: "Recipient",
      type: "list",
      resolveEntities: true,
    },

    {
      field: "origin_id",
      label: "Sent from",
      type: "text",
      resolveEntities: true,
    },
    {
      field: "target_id",
      label: "Sent to",
      type: "text",
      resolveEntities: true,
    },

    // we use entityTypeFilter to split one field into multiple UI sections
    {
      field: "mention_ids",
      label: "Mentioned People",
      type: "tags",
      resolveEntities: true,
      entityTypeFilter: "Person",
    },
    {
      field: "mention_ids",
      label: "Mentioned Places",
      type: "tags",
      resolveEntities: true,
      entityTypeFilter: "Place",
    },

    { field: "full_text", type: "long-text" },

    // include button
    {
      field: "linked_id",
      label: "Read Full Text",
      type: "link-button",
      isLinkable: true,
      linkTemplate: "fud", // you must references keys in AUTHORITY_MAP
    },
  ],

  // template for Aggregated views
  "city-detail": [
    { field: "title", type: "header" },
    // { field: "image_url", type: "image",  captionField: "image_copyright" }, // uncomment if you have image_urls in your data
    { field: "count", label: "Letters in this city", type: "text" },
    {
      field: "children",
      label: "Letters List",
      type: "feature-list",
      listLabelField: "date_start", // title
      listSecondaryField: "sender_ids", // subtitle
      // we tell the engine: when clicking an item in the list
      // we use the letter-detail template:
      detailTemplateId: "letter-detail",
    },
  ],

  "place-biography": [
    { field: "title", type: "header" },
    { field: "born", label: "Born", type: "list", resolveEntities: true },
    { field: "died", label: "Died", type: "list", resolveEntities: true },
    {
      field: "gnd_activity",
      label: "Activ",
      type: "list",
      resolveEntities: true,
    },
    {
      field: "activity_log",
      label: "Timeline of Activity",
      type: "timed-list",
      resolveEntities: true,
    },
  ],

  "polygon-detail": [
    { field: "title", type: "header" },
    { field: "source", label: "Source", type: "text" },
    { field: "full_text", label: "Description", type: "text" },
  ],

  "generic-info": [
    { field: "title", type: "header" },
    { field: "description", type: "long-text" },
  ],
};
