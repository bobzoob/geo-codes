// declaring a "module" for any import that ends in .geojson * for wildcard
declare module "*.geojson" {
  // telling TypeScript that the default export of this module
  // will have the shape of HistoricalFeatureCollection interface
  const value: import("./geojson").HistoricalFeatureCollection;
  export default value;
}
