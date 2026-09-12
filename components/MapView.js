'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../lib/supabaseClient';
import UploadModal from './UploadModal';
import Lightbox from './Lightbox';
import SearchBox from './SearchBox';
import Leaderboard from './Leaderboard';

const COFFIN_BAY = { lat: -34.6167, lng: 135.4667 };

export default function MapView() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({}); // id -> mapboxgl.Marker

  const [count, setCount] = useState(0);
  const [stickers, setStickers] = useState([]); // full sticker data, for the leaderboard
  const [booting, setBooting] = useState(true);
  const [pendingLatLng, setPendingLatLng] = useState(null);
  const [activeSticker, setActiveSticker] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2600);
  }, []);

  const addMarker = useCallback((sticker) => {
    const el = document.createElement('div');
    el.className = 'sticker-dot';
    el.addEventListener('click', (ev) => {
      ev.stopPropagation();
      setActiveSticker(sticker);
    });

    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat([sticker.lng, sticker.lat])
      .addTo(mapRef.current);

    markersRef.current[sticker.id] = marker;
    setCount(Object.keys(markersRef.current).length);
  }, []);

  const removeMarker = useCallback((id) => {
    const marker = markersRef.current[id];
    if (marker) {
      marker.remove();
      delete markersRef.current[id];
      setCount(Object.keys(markersRef.current).length);
    }
  }, []);

  useEffect(() => {
    if (mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error('NEXT_PUBLIC_MAPBOX_TOKEN is not set — the map cannot render.');
    }
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [COFFIN_BAY.lng, COFFIN_BAY.lat],
      zoom: 14,
      maxZoom: 20,
    });
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('click', (e) => {
      setPendingLatLng({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    mapRef.current = map;

    (async () => {
      try {
        const { data, error } = await supabase
          .from('stickers')
          .select('*')
          .order('created_at', { ascending: true });
        if (error) throw error;
        (data || []).forEach(addMarker);
        setStickers(data || []);
        if (!data || data.length === 0) {
          showToast('No sightings yet — click the map to add the first one.');
        }
      } catch (err) {
        console.error('Failed to load stickers', err);
        showToast('Could not load existing sightings — check your Supabase setup.');
      } finally {
        setBooting(false);
      }
    })();

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="cbdc-app">
      <div ref={mapContainerRef} className="cbdc-map" />

      {booting && (
        <div className="cbdc-boot-loading">
          <div className="word">
            Coffin Bay Design <span>Co.</span>
          </div>
          <div className="spin-text">Charting known sightings…</div>
        </div>
      )}

      <div className="cbdc-header">
        <div className="cbdc-brand">
          <img src="/cbdc_wordmark_navy.png" alt="Coffin Bay Design Co." className="cbdc-logo" />
          <div className="sub">Sticker sighting map</div>
        </div>
        <SearchBox
          onSelect={(lng, lat) => {
            mapRef.current?.flyTo({ center: [lng, lat], zoom: 15, essential: true });
          }}
        />
        <div className="cbdc-hint">
          Click anywhere on the map to log a <b>sticker sighting</b>. Click a pin to view it.
        </div>
      </div>

      <div className="cbdc-count-chip">
        <b>{count}</b> sightings logged
      </div>

      <Leaderboard stickers={stickers} />

      {pendingLatLng && (
        <UploadModal
          lat={pendingLatLng.lat}
          lng={pendingLatLng.lng}
          onClose={() => setPendingLatLng(null)}
          onSaved={(row) => {
            addMarker(row);
            setStickers((prev) => [...prev, row]);
            showToast('Sighting pinned.');
          }}
          onError={() => showToast('Could not save this sighting — please try again.')}
        />
      )}

      {activeSticker && (
        <Lightbox
          sticker={activeSticker}
          onClose={() => setActiveSticker(null)}
          onDeleted={(id) => {
            removeMarker(id);
            setStickers((prev) => prev.filter((s) => s.id !== id));
          }}
          onToast={showToast}
        />
      )}

      <div className={`cbdc-toast${toastVisible ? ' show' : ''}`}>{toastMsg}</div>
    </div>
  );
}