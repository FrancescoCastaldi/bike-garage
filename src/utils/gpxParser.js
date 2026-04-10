// GPX Parser utility for parsing activity files
// Extracts distance, elevation, heart rate, power data from GPX files

export function parseGPX(gpxContent) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxContent, 'text/xml');

    // Check for parse errors
    if (xmlDoc.querySelector('parsererror')) {
      throw new Error('Invalid GPX file format');
    }

    const trkpts = xmlDoc.querySelectorAll('trkpt');
    if (trkpts.length === 0) {
      throw new Error('No track points found in GPX file');
    }

    const points = [];
    const coords = [];
    const elevations = [];
    const heartRates = [];
    const powers = [];
    let totalDistance = 0;
    let prevPoint = null;

    trkpts.forEach((trkpt, idx) => {
      const lat = parseFloat(trkpt.getAttribute('lat'));
      const lon = parseFloat(trkpt.getAttribute('lon'));
      const ele = trkpt.querySelector('ele');
      const time = trkpt.querySelector('time');
      const hr = trkpt.querySelector('ns3\\:hr, hr'); // Handle namespaces
      const power = trkpt.querySelector('ns3\\:power, power');

      const point = {
        lat,
        lon,
        elevation: ele ? parseFloat(ele.textContent) : null,
        time: time ? new Date(time.textContent) : null,
        hr: hr ? parseInt(hr.textContent) : null,
        power: power ? parseInt(power.textContent) : null,
      };

      coords.push([lat, lon]);
      if (point.elevation !== null) elevations.push(point.elevation);
      if (point.hr !== null) heartRates.push(point.hr);
      if (point.power !== null) powers.push(point.power);

      // Calculate distance from previous point using Haversine formula
      if (prevPoint) {
        const dist = haversineDistance(prevPoint.lat, prevPoint.lon, lat, lon);
        totalDistance += dist;
      }

      points.push({ ...point, distance: totalDistance });
      prevPoint = point;
    });

    // Get track name
    const nameEl = xmlDoc.querySelector('trk > name');
    const name = nameEl ? nameEl.textContent : 'Imported Activity';

    // Get date from first time point
    const date = points[0]?.time || new Date();

    // Calculate duration
    let duration_sec = 0;
    if (points[0]?.time && points[points.length - 1]?.time) {
      duration_sec = Math.floor(
        (points[points.length - 1].time - points[0].time) / 1000
      );
    }

    // Calculate stats
    const elevation_m = elevations.length > 0
      ? elevations[elevations.length - 1] - elevations[0]
      : 0;

    const avg_hr = heartRates.length > 0
      ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length)
      : null;

    const max_hr = heartRates.length > 0 ? Math.max(...heartRates) : null;

    const avg_watts = powers.length > 0
      ? Math.round(powers.reduce((a, b) => a + b, 0) / powers.length)
      : null;

    const max_watts = powers.length > 0 ? Math.max(...powers) : null;

    const avg_speed = duration_sec > 0 ? (totalDistance / 1000) / (duration_sec / 3600) : null;
    const max_speed = null; // Would need time intervals to calculate properly

    return {
      name,
      date: date.toISOString().split('T')[0],
      distance_km: Math.round(totalDistance / 1000 * 100) / 100,
      duration_sec,
      elevation_m: Math.round(elevation_m),
      avg_hr,
      max_hr,
      avg_watts,
      max_watts,
      avg_speed: avg_speed ? Math.round(avg_speed * 10) / 10 : null,
      max_speed,
      coords,
      pointsCount: coords.length,
    };
  } catch (error) {
    console.error('GPX parsing error:', error);
    throw new Error(`Failed to parse GPX: ${error.message}`);
  }
}

// Haversine formula to calculate distance between two GPS coordinates
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

// Helper function to format duration
export function formatDuration(seconds) {
  if (!seconds) return '--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
