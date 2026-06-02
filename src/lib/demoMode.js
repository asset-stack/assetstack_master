// Returns true when the current browser session was opened via a /demo/<slug>
// link. Demo sessions are locked to a single ClientAccount AND are read-only,
// so prospects can explore without ever mutating real data.
export function isDemoSession() {
  try {
    return !!sessionStorage.getItem('demo_slug');
  } catch {
    return false;
  }
}

export function getDemoSlug() {
  try {
    return sessionStorage.getItem('demo_slug') || null;
  } catch {
    return null;
  }
}