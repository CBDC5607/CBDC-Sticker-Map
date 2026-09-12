import 'mapbox-gl/dist/mapbox-gl.css';
import './globals.css';

export const metadata = {
  title: 'Coffin Bay Design Co. — Sticker Sightings',
  description: 'Spot a CBDC sticker in the wild? Pin it on the map.',
  openGraph: {
    title: 'Coffin Bay Design Co. — Sticker Sightings',
    description: 'Spot a CBDC sticker in the wild? Pin it on the map.',
    siteName: 'Coffin Bay Design Co.',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#16262b',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}