import type { StoryConfig } from "../types/state";

/**
 * THIS IS WHERE YOU SET UP YOUR STORIES
 */

export const availableStories: StoryConfig[] = [
  {
    id: "story-1",
    title: "The Jena Network",
    author: "DH Research Team",
    frames: [
      {
        id: "frame-0",
        title: "The Beginnings",
        text: "In the early 1790s, a network formed arround the Schlegel Brothers Romantic movement.",
        timeRange: [1790, 1796],
        visibleLayers: ["letters-lines", "local-letter-hubs"],
        highlights: [],
      },
      {
        id: "frame-1",
        title: "Introduction to Jena",
        text: "In the late 1790s, [Jena](https://de.wikipedia.org/wiki/Jena) became the center of the early Romantic movement. Notice the concentration of local letters.",
        timeRange: [1796, 1799],
        visibleLayers: ["letters-lines", "local-letter-hubs"],
        highlights: [
          { layerId: "local-letter-hubs", featureId: "gnd:4028557-1" },
        ],
      },
      {
        id: "frame-2",
        title: "The Network Expands",
        text: "By 1801, the correspondence network expanded significantly towards Berlin.",
        timeRange: [1800, 1802],
        visibleLayers: ["letters-lines", "local-letter-hubs"],
        highlights: [
          { layerId: "local-letter-hubs", featureId: "gnd:4028557-1" },
          { layerId: "local-letter-hubs", featureId: "gnd:2004272-3" },
        ],
      },
    ],
  },
  {
    id: "story-2",
    title: "The Schlegel Brothers",
    author: "August & Friedrich",
    frames: [
      {
        id: "frame-0",
        title: "Early Correspondence",
        text: "This story focuses specifically on the letters exchanged between the Schlegel brothers before 1800.",
        timeRange: [1790, 1799],
        visibleLayers: ["letters-lines"],
        highlights: [
          // highlight the specific letter line using its GeoJSON ID
          { layerId: "letters-lines", featureId: "AWS-aw-0002" },
          { layerId: "letters-lines", featureId: "AWS-aw-07k6" },
        ],
      },
      {
        id: "frame-1",
        title: "The Network Expands",
        text: "By 1801, the correspondence network expanded significantly towards Berlin.",
        timeRange: [1800, 1802],
        visibleLayers: ["letters-lines", "local-letter-hubs"],
        highlights: [{ layerId: "letters-lines", featureId: "gnd:4005728-8" }],
      },
    ],
  },
];
