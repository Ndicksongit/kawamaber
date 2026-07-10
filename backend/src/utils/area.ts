import area from "@turf/area";
// geojson -> hectares
export function geojsonToHectares(geojson: any): number {
  const sqm = area(geojson); // turf returns area in square meters
  return +(sqm / 10000).toFixed(4);
}
