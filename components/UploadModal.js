'use client';

import { useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { compressImage } from '../lib/compressImage';

export default function UploadModal({ lat, lng, onClose, onSaved, onError }) {
  const [imageBlob, setImageBlob] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [name, setName] = useState('');
  const [caption, setCaption] = useState('');
  const [wantsEntry, setWantsEntry] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setProcessing(true);
    try {
      const blob = await compressImage(file, 1200, 0.78);
      setImageBlob(blob);
      setImagePreview(URL.createObjectURL(blob));
    } catch (err) {
      setError(err.message || 'Could not process that image. Try another file.');
    } finally {
      setProcessing(false);
    }
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function handleSave() {
    if (!imageBlob) return;

    if (wantsEntry && !isValidEmail(email.trim())) {
      setError('Enter a valid email to be entered in the draw, or untick that box.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('sticker-photos')
        .upload(fileName, imageBlob, { contentType: 'image/jpeg' });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('sticker-photos')
        .getPublicUrl(fileName);

      const { data: inserted, error: insertError } = await supabase
        .from('stickers')
        .insert({
          lat,
          lng,
          name: name.trim() || null,
          caption: caption.trim(),
          image_url: publicUrlData.publicUrl,
          storage_path: fileName,
        })
        .select()
        .single();
      if (insertError) throw insertError;

      if (wantsEntry) {
        const { error: entryError } = await supabase.from('entries').insert({
          sticker_id: inserted.id,
          name: name.trim() || null,
          email: email.trim(),
        });
        if (entryError) {
          console.error('Entry save failed', entryError);
          onError?.(entryError, 'sticker-saved-entry-failed');
        }
      }

      onSaved(inserted);
      onClose();
    } catch (err) {
      console.error('Save failed', err);
      setError('Could not save this sighting — please try again.');
      onError?.(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="cbdc-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cbdc-card">
        <div className="cbdc-card-head">
          <div className="title">Log a sighting</div>
          <button className="cbdc-close-btn" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="cbdc-card-body">
          <label className="cbdc-field-label">Location</label>
          <div className="cbdc-coords">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </div>

          <label className="cbdc-field-label">Photo</label>
          <div
            className={`cbdc-drop-zone${imagePreview ? ' has-image' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            {processing ? (
              <div className="cbdc-dz-text">Processing photo…</div>
            ) : imagePreview ? (
              <img src={imagePreview} alt="Selected sticker photo" />
            ) : (
              <div className="cbdc-dz-text">
                Click to choose a photo
                <small>of the sticker in the wild</small>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <label className="cbdc-field-label">
            Name <span style={{ opacity: 0.6 }}>(optional — shown on the leaderboard)</span>
          </label>
          <input
            type="text"
            className="cbdc-input"
            placeholder="e.g. Sam"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="cbdc-field-label">
            Caption <span style={{ opacity: 0.6 }}>(optional)</span>
          </label>
          <textarea
            className="cbdc-textarea"
            placeholder="Where'd you spot it? e.g. lamppost outside the Oyster Farm Shop"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />

          <label className="cbdc-checkbox-row">
            <input
              type="checkbox"
              checked={wantsEntry}
              onChange={(e) => setWantsEntry(e.target.checked)}
            />
            <span>Enter this sighting into the prize draw</span>
          </label>

          {wantsEntry && (
            <div className="cbdc-entry-fields">
              <label className="cbdc-field-label">Email</label>
              <input
                type="email"
                className="cbdc-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="cbdc-consent-text">
                Your email is used only to contact you if you win, and won't be
                shown on the public map. See our{' '}
                <a href="/privacy" target="_blank" rel="noreferrer">
                  privacy policy
                </a>
                .
              </div>
            </div>
          )}

          {error && <div className="cbdc-error-msg">{error}</div>}

          <div className="cbdc-btn-row">
            <button className="cbdc-btn cbdc-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              className="cbdc-btn cbdc-btn-primary"
              disabled={!imageBlob || saving}
              onClick={handleSave}
            >
              {saving ? 'Pinning…' : 'Pin sighting'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}