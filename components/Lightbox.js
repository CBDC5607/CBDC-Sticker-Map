'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Lightbox({ sticker, onClose, onDeleted, onToast }) {
  const [deleting, setDeleting] = useState(false);

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

  async function handleDelete() {
    setDeleting(true);
    try {
      const { error: deleteRowError } = await supabase
        .from('stickers')
        .delete()
        .eq('id', sticker.id);
      if (deleteRowError) throw deleteRowError;

      if (sticker.storage_path) {
        // Best-effort — an orphaned file isn't worth failing the whole action over.
        await supabase.storage.from('sticker-photos').remove([sticker.storage_path]);
      }

      onDeleted(sticker.id);
      onToast('Sighting removed.');
      onClose();
    } catch (err) {
      console.error('Delete failed', err);
      onToast(
        'Could not remove that pin. If public deletion is disabled in Supabase, ' +
          'that\'s expected — see the README.'
      );
      setDeleting(false);
    }
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
          {sticker.caption && <div className="cbdc-lightbox-caption">{sticker.caption}</div>}
          <div className="cbdc-lightbox-meta">
            {sticker.lat.toFixed(5)}, {sticker.lng.toFixed(5)}
            {dateStr ? `  ·  ${dateStr}` : ''}
          </div>
          <div className="cbdc-btn-row">
            <button className="cbdc-btn cbdc-btn-ghost" onClick={onClose}>
              Close
            </button>
            <button className="cbdc-btn cbdc-btn-danger" disabled={deleting} onClick={handleDelete}>
              {deleting ? 'Removing…' : 'Remove pin'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
