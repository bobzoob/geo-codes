/**
 * THIS IS WHERE YOU SET UP BOUNDARIES FOR
 * TIMELINE AND MAP
 */

export const PROJECT_SETTINGS = {
  title: "Example Map", // should use this in Dashbord!
  // initial view state
  map: {
    style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    defaultCenter: [50.92878, 11.5899], // map location
    defaultZoom: 5,
    minZoom: 3,
    maxZoom: 18,
  },
  // global Time constraints
  timeRange: {
    min: 1790, // start
    max: 1802, // end
  },
  animation: {
    speed: 1000, // miliseconds
    step: 1, // optional: units per tick
    defaultWindow: 1, // size of rendered unit, when "play" is hit
  },
};
