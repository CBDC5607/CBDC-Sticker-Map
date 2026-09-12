'use client';

export default function Lightbox({ sticker, onClose }) {
  let dateStr = '';
  try {
    dateStr = new Date(sticker.created_at).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    /* ignore */
  }

  return (
    <div className="cbdc-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cbdc-card">
        <div className="cbdc-card-head">
          <div className="title">Sighting</div>
          <button className="cbdc-close-btn" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div>
          <img className="cbdc-lightbox-img" src={sticker.image_url} alt="Sticker sighting photo" />
        </div>
        <div className="cbdc-card-body">
          {sticker.name && <div className="cbdc-lightbox-caption">{sticker.name}</div>}
          {sticker.caption && <div className="cbdc-lightbox-caption">{sticker.caption}</div>}
          <div className="cbdc-lightbox-meta">
            {sticker.lat.toFixed(5)}, {sticker.lng.toFixed(5)}
            {dateStr ? `  ·  ${dateStr}` : ''}
          </div>
          <div className="cbdc-btn-row">
            <button className="cbdc-btn cbdc-btn-ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}