// Stock reference photos for component types. Inspectors compare these against on-site reality.
// All URLs from Unsplash (free use).

export const PHOTO_LIBRARY = {
  'Spa Surrounding Tiles': 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=600',
  'Toilet Suite': 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600',
  'Hand Basin': 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=600',
  'Paint Finish': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600',
  'Ceiling Tiles': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600',
  'Carpet': 'https://images.unsplash.com/photo-1581083716242-ad77ba2c7d40?w=600',
  'Door Hardware': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
  'Air Conditioning': 'https://images.unsplash.com/photo-1631545806609-cb70f7676ad6?w=600',
  'Lighting': 'https://images.unsplash.com/photo-1565636192335-ee5b21d2f33b?w=600',
  'Fire Extinguisher': 'https://images.unsplash.com/photo-1583912267550-d6c2ac3196c0?w=600',
  'Roof Sheeting': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600',
  'Gutter': 'https://images.unsplash.com/photo-1572731273050-c4e9da4cf5c2?w=600',
  'Window Glazing': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
  'Pump': 'https://images.unsplash.com/photo-1606937295547-bc0f668d09b1?w=600',
  'Motor': 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600',
  'Elevator': 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600',
  '__default__': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600',
};

export function getReferencePhoto(componentType) {
  if (!componentType) return PHOTO_LIBRARY.__default__;
  return PHOTO_LIBRARY[componentType] || PHOTO_LIBRARY.__default__;
}

export function listAllReferenceTypes() {
  return Object.keys(PHOTO_LIBRARY).filter((k) => !k.startsWith('__'));
}