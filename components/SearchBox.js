'use client';

import { useState, useEffect, useRef } from 'react';

const COFFIN_BAY = { lat: -34.6167, lng: 135.4667 };

export default function SearchBox({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        const url =
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
          `?access_token=${token}&proximity=${COFFIN_BAY.lng},${COFFIN_BAY.lat}&country=AU&limit=5`;
        const res = await fetch(url);
        const data = await res.json();
        setResults(data.features || []);
        setOpen(true);
      } catch (err) {
        console.error('Search failed', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handlePick(feature) {
    const [lng, lat] = feature.center;
    onSelect(lng, lat, feature.place_name);
    setQuery(feature.place_name);
    setOpen(false);
  }

  return (
    <div className="cbdc-search" ref={wrapperRef}>
      <input
        type="text"
        className="cbdc-search-input"
        placeholder="Search a town or landmark…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {open && (loading || results.length > 0) && (
        <div className="cbdc-search-results">
          {loading && <div className="cbdc-search-loading">Searching…</div>}
          {!loading &&
            results.map((r) => (
              <button
                key={r.id}
                className="cbdc-search-result"
                onClick={() => handlePick(r)}
              >
                {r.place_name}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}