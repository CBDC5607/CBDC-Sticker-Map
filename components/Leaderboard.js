'use client';

import { useMemo, useState } from 'react';
import { CBDC_ORIGIN } from '../lib/originPoint';
import { distanceKm } from '../lib/distance';

function rankStickers(stickers, range) {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const filtered =
    range === 'week'
      ? stickers.filter(
          (s) => s.created_at && now - new Date(s.created_at).getTime() <= weekMs
        )
      : stickers;

  return filtered
    .map((s) => ({ ...s, distance: distanceKm(CBDC_ORIGIN, { lat: s.lat, lng: s.lng }) }))
    .sort((a, b) => b.distance - a.distance);
}

export default function Leaderboard({ stickers }) {
  const [showFull, setShowFull] = useState(false);
  const [range, setRange] = useState('all'); // 'all' | 'week'

  const top5 = useMemo(() => rankStickers(stickers, 'all').slice(0, 5), [stickers]);
  const ranked = useMemo(() => rankStickers(stickers, range), [stickers, range]);

  return (
    <>
      <div className="cbdc-leaderboard-mini">
        <div className="cbdc-leaderboard-mini-head">Furthest Sightings</div>
        <ol className="cbdc-leaderboard-mini-list">
          {top5.length === 0 && (
            <li className="cbdc-leaderboard-empty">No sightings yet</li>
          )}
          {top5.map((s, i) => (
            <li key={s.id}>
              <span className="rank">{i + 1}</span>
              <span className="cap">{s.name || 'Anonymous'}</span>
              <span className="dist">{s.distance.toFixed(1)} km</span>
            </li>
          ))}
        </ol>
        <button className="cbdc-leaderboard-btn" onClick={() => setShowFull(true)}>
          View full leaderboard
        </button>
      </div>

      {showFull && (
        <div
          className="cbdc-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowFull(false)}
        >
          <div className="cbdc-card cbdc-leaderboard-card">
            <div className="cbdc-card-head">
              <div className="title">Furthest Sightings Leaderboard</div>
              <button
                className="cbdc-close-btn"
                onClick={() => setShowFull(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="cbdc-card-body">
              <div className="cbdc-leaderboard-toggle">
                <button
                  className={range === 'all' ? 'active' : ''}
                  onClick={() => setRange('all')}
                >
                  All-time
                </button>
                <button
                  className={range === 'week' ? 'active' : ''}
                  onClick={() => setRange('week')}
                >
                  This week
                </button>
              </div>
              <ol className="cbdc-leaderboard-full-list">
                {ranked.length === 0 && (
                  <li className="cbdc-leaderboard-empty">
                    No sightings in this range yet
                  </li>
                )}
                {ranked.map((s, i) => (
                  <li key={s.id}>
                    <span className="rank">{i + 1}</span>
                    <img src={s.image_url} alt="" />
                    <div className="info">
                      <div className="name">{s.name || 'Anonymous'}</div>
                      {s.caption && <div className="cap">{s.caption}</div>}
                      <div className="dist">
                        {s.distance.toFixed(1)} km from Coffin Bay Design Co
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  );
}