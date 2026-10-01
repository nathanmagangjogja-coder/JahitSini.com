export interface LatLng {
  lat: number;
  lng: number;
}

function inRange(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

function parsePlainPair(text: string): LatLng | null {
  const m = text.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  return inRange(lat, lng) ? { lat, lng } : null;
}

/** Pola koordinat yang muncul di berbagai bentuk URL Google Maps. */
function parseFromUrlText(text: string): LatLng | null {
  const patterns = [
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/, // .../@-6.2,106.8,17z
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/, // link "place" (lat lalu lng)
    /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/, // ?q=-6.2,106.8
    /[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/, // ?ll=-6.2,106.8
    /[?&]destination=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const lat = Number(m[1]);
      const lng = Number(m[2]);
      if (inRange(lat, lng)) return { lat, lng };
    }
  }
  return null;
}

/** Link pendek (maps.app.goo.gl / goo.gl/maps) tidak memuat koordinat di URL-nya sendiri,
 *  jadi harus diikuti redirect-nya dulu di server (lihat /api/secure/admin/maps-resolve). */
export function isShortGoogleMapsLink(text: string): boolean {
  return /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps)\//i.test(text.trim());
}

/** Coba ambil koordinat langsung dari teks (tanpa perlu ke server). */
export function parseCoordsFromText(text: string): LatLng | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  return parsePlainPair(trimmed) || parseFromUrlText(trimmed);
}
