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
    let totalElevationGain = 0;
    let prevPoint = null;
    let prevElevation = null;

    trkpts.forEach((trkpt, idx) => {
      const lat = parseFloat(trkpt.getAttribute('lat'));
      const lon = parseFloat(trkpt.getAttribute('lon'));
      const ele = trkpt.querySelector('ele');
      const time = trkpt.querySelector('time');

      // Fix: handle HR/Power with multiple namespace strategies
      // Garmin uses gpxtpx:hr or ns3:hr; try textContent-based search
      const hrEl = _findExtensionElement(trkpt, ['hr', 'HeartRateBpm']);
      const powerEl = _findExtensionElement(trkpt, ['power', 'Watts']);

      const elevation = ele ? parseFloat(ele.textContent) : null;

      const point = {
        lat,
        lon,
        elevation,
        time: time ? new Date(time.textContent) : null,
        hr: hrEl ? parseInt(hrEl.textContent) : null,
        power: powerEl ? parseInt(powerEl.textContent) : null,
      };

      coords.push([lat, lon]);
      if (elevation !== null) elevations.push(elevation);
      if (point.hr !== null && !isNaN(point.hr)) heartRates.push(point.hr);
      if (point.power !== null && !isNaN(point.power)) powers.push(point.power);

      // Elevation gain: accumulate only positive climbs
      if (prevElevation !== null && elevation !== null) {
        const diff = elevation - prevElevation;
        if (diff > 0) totalElevationGain += diff;
      }
      if (elevation !== null) prevElevation = elevation;

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
    const name = nameEl ? nameEl.textContent.trim() : 'Imported Activity';

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
    const avg_hr = heartRates.length > 0
      ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length)
      : null;
    const max_hr = heartRates.length > 0 ? Math.max(...heartRates) : null;
    const avg_watts = powers.length > 0
      ? Math.round(powers.reduce((a, b) => a + b, 0) / powers.length)
      : null;
    const max_watts = powers.length > 0 ? Math.max(...powers) : null;
    const distKm = totalDistance / 1000;
    const avg_speed = duration_sec > 0 ? distKm / (duration_sec / 3600) : null;

    return {
      name,
      date: date instanceof Date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      distance_km: Math.round(distKm * 100) / 100,
      duration_sec,
      elevation_m: Math.round(totalElevationGain), // total positive gain
      avg_hr,
      max_hr,
      avg_watts,
      max_watts,
      avg_speed: avg_speed ? Math.round(avg_speed * 10) / 10 : null,
      max_speed: null,
      coords,
      pointsCount: coords.length,
    };
  } catch (error) {
    console.error('GPX parsing error:', error);
    throw new Error(`Failed to parse GPX: ${error.message}`);
  }
}

/**
 * Find an extension element by local name, regardless of namespace prefix.
 * Tries multiple strategies: querySelector with escaping, then manual DOM walk.
 */
function _findExtensionElement(trkpt, localNames) {
  const extensions = trkpt.querySelector('extensions');
  if (!extensions) return null;

  // Walk all descendant elements and match by localName
  const allEls = extensions.querySelectorAll('*');
  for (const el of allEls) {
    const lname = el.localName.toLowerCase();
    for (const name of localNames) {
      if (lname === name.toLowerCase()) return el;
    }
  }
  return null;
}

// Haversine formula to calculate distance between two GPS coordinates
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
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
