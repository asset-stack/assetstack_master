// Minimal EXIF extractor — pulls DateTimeOriginal + GPS from a JPEG file.
// No external library. Returns { date, lat, lng } (any may be undefined).

function readUInt(view, offset, length, littleEndian) {
  if (length === 2) return view.getUint16(offset, littleEndian);
  if (length === 4) return view.getUint32(offset, littleEndian);
  return view.getUint8(offset);
}

function dmsToDecimal(dms, ref) {
  if (!dms || dms.length < 3) return undefined;
  const [d, m, s] = dms;
  let dec = d + m / 60 + s / 3600;
  if (ref === 'S' || ref === 'W') dec = -dec;
  return dec;
}

export async function readExif(file) {
  try {
    const buf = await file.slice(0, 128 * 1024).arrayBuffer(); // first 128KB is plenty for EXIF
    const view = new DataView(buf);
    if (view.getUint16(0) !== 0xffd8) return {}; // not a JPEG

    let offset = 2;
    while (offset < view.byteLength) {
      const marker = view.getUint16(offset);
      offset += 2;
      if (marker === 0xffe1) {
        // APP1 = EXIF
        const size = view.getUint16(offset);
        offset += 2;
        // "Exif\0\0"
        if (view.getUint32(offset) !== 0x45786966) return {};
        const tiffStart = offset + 6;
        const littleEndian = view.getUint16(tiffStart) === 0x4949;
        const ifd0Offset = readUInt(view, tiffStart + 4, 4, littleEndian);
        const tags = readIFD(view, tiffStart, tiffStart + ifd0Offset, littleEndian);

        let date;
        let lat;
        let lng;

        // ExifOffset = 0x8769
        if (tags[0x8769]) {
          const exifIFD = readIFD(view, tiffStart, tiffStart + tags[0x8769].valueOffset, littleEndian);
          // DateTimeOriginal = 0x9003
          if (exifIFD[0x9003]) date = exifIFD[0x9003].asString;
        }
        // GPSInfo = 0x8825
        if (tags[0x8825]) {
          const gpsIFD = readIFD(view, tiffStart, tiffStart + tags[0x8825].valueOffset, littleEndian);
          const latRef = gpsIFD[0x0001]?.asString;
          const latArr = gpsIFD[0x0002]?.asRationals;
          const lngRef = gpsIFD[0x0003]?.asString;
          const lngArr = gpsIFD[0x0004]?.asRationals;
          if (latArr && latRef) lat = dmsToDecimal(latArr, latRef);
          if (lngArr && lngRef) lng = dmsToDecimal(lngArr, lngRef);
        }

        // EXIF date format: "YYYY:MM:DD HH:MM:SS"
        let isoDate;
        if (date) {
          const m = date.match(/^(\d{4}):(\d{2}):(\d{2})/);
          if (m) isoDate = `${m[1]}-${m[2]}-${m[3]}`;
        }
        return { date: isoDate, lat, lng };
      }
      const size = view.getUint16(offset);
      offset += size;
    }
    return {};
  } catch {
    return {};
  }
}

function readIFD(view, tiffStart, ifdOffset, littleEndian) {
  const tags = {};
  const entries = view.getUint16(ifdOffset, littleEndian);
  for (let i = 0; i < entries; i++) {
    const entryOffset = ifdOffset + 2 + i * 12;
    const tag = view.getUint16(entryOffset, littleEndian);
    const type = view.getUint16(entryOffset + 2, littleEndian);
    const count = view.getUint32(entryOffset + 4, littleEndian);
    const valueOffset = view.getUint32(entryOffset + 8, littleEndian);

    const entry = { tag, type, count, valueOffset };

    // Type 2 = ASCII string
    if (type === 2 && count > 0) {
      const start = count <= 4 ? entryOffset + 8 : tiffStart + valueOffset;
      let s = '';
      for (let j = 0; j < count - 1; j++) s += String.fromCharCode(view.getUint8(start + j));
      entry.asString = s;
    }
    // Type 5 = RATIONAL (two uint32s)
    if (type === 5 && count > 0) {
      const start = tiffStart + valueOffset;
      const rationals = [];
      for (let j = 0; j < count; j++) {
        const num = view.getUint32(start + j * 8, littleEndian);
        const den = view.getUint32(start + j * 8 + 4, littleEndian);
        rationals.push(den === 0 ? 0 : num / den);
      }
      entry.asRationals = rationals;
    }
    tags[tag] = entry;
  }
  return tags;
}

// Haversine distance in km
export function haversineKm(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some((v) => v == null || isNaN(v))) return Infinity;
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Find nearest location to a coordinate; returns the location or null if all > maxKm away
export function nearestLocation(locations, lat, lng, maxKm = 50) {
  if (lat == null || lng == null) return null;
  let best = null;
  let bestKm = Infinity;
  for (const loc of locations) {
    if (loc.lat == null || loc.lng == null) continue;
    const km = haversineKm(lat, lng, loc.lat, loc.lng);
    if (km < bestKm) {
      bestKm = km;
      best = loc;
    }
  }
  return best && bestKm <= maxKm ? { location: best, distance_km: bestKm } : null;
}