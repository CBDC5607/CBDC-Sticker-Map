'use client';

import dynamic from 'next/dynamic';

// Mapbox GL touches `window`, so it can only run in the browser —
// ssr: false keeps it out of the server render entirely.
const MapView = dynamic(() => import('../components/MapView'), { ssr: false });

export default function Page() {
  return <MapView />;
}
