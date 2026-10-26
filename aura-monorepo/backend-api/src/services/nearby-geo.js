const EARTH_RADIUS_METERS = 6371000;
export function haversineMeters(lat1, lng1, lat2, lng2) {
  const rad = (n) => n * Math.PI / 180;
  const dLat = rad(lat2 - lat1), dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(a)));
}
export function snapToGrid(lat, lng, gridM = 250) {
  const latStep = gridM / 111320;
  const lngStep = gridM / (111320 * Math.max(0.01, Math.cos(lat * Math.PI / 180)));
  return { areaLat: Math.round(lat / latStep) * latStep, areaLng: Math.round(lng / lngStep) * lngStep };
}
export function distanceBand(distance) {
  if (distance < 500) return 'under 500 m';
  if (distance <= 1000) return '500 m to 1 km';
  return '1 to 2 km';
}

export function isUnderCap(currentCount, maximum) { return Number.isInteger(currentCount) && Number.isInteger(maximum) && currentCount >= 0 && maximum > 0 && currentCount < maximum; }
