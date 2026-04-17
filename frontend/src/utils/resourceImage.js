const TYPE_COLOR_MAP = {
  LAB: ['#1d4ed8', '#0891b2'],
  AUDITORIUM: ['#7c3aed', '#2563eb'],
  CLASSROOM: ['#0f766e', '#1d4ed8'],
  MEETING_ROOM: ['#1e40af', '#0f766e'],
  LIBRARY: ['#14532d', '#0f766e'],
  SPORTS: ['#b45309', '#ea580c']
};

const DEFAULT_COLORS = ['#1e3a8a', '#0f766e'];

const getInitials = (name) => {
  if (!name) return 'RC';

  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'RC';

  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('');
};

export const buildResourceImageDataUrl = (name, type) => {
  const [c1, c2] = TYPE_COLOR_MAP[type] || DEFAULT_COLORS;
  const initials = getInitials(name);
  const label = (type || 'RESOURCE').replaceAll('_', ' ');

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="540" viewBox="0 0 900 540" role="img" aria-label="${name || 'Resource'} image">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}" />
      <stop offset="100%" stop-color="${c2}" />
    </linearGradient>
  </defs>
  <rect width="900" height="540" fill="url(#bg)" />
  <circle cx="740" cy="110" r="120" fill="rgba(255,255,255,.08)" />
  <circle cx="110" cy="460" r="160" fill="rgba(255,255,255,.06)" />
  <text x="60" y="110" fill="rgba(255,255,255,.82)" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="34">${label}</text>
  <text x="60" y="430" fill="white" font-family="Inter, Arial, sans-serif" font-weight="800" font-size="180">${initials}</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const getResourceImageUrl = (resource) => {
  const imageUrl = resource?.imageUrl?.trim();
  if (imageUrl) {
    return imageUrl;
  }

  return buildResourceImageDataUrl(resource?.name, resource?.type);
};
