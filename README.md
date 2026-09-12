# CBDC Sticker Sightings Map

A Next.js + Mapbox + Supabase map for Coffin Bay Design Co. Visitors click
anywhere on the map to drop a pin with a photo of a spotted sticker; clicking
a pin opens the photo full-size. Deploy it on its own subdomain, then embed
it in your Squarespace site with an `<iframe>`.

Real street-level zoom is Mapbox's standard map style, so this is the same
accuracy as Google/Apple Maps.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account/project.
2. Once the project is ready, open **SQL Editor** in the left sidebar.
3. Paste in the entire contents of `supabase/schema.sql` from this project and click **Run**.
4. Open **Storage** in the left sidebar → **New bucket** → name it exactly
   `sticker-photos` → toggle **Public bucket** ON → **Create bucket**.
   (The storage policies for this bucket were already created by the SQL script in step 3.)
5. Open **Project Settings → API**. You'll need two values from here in step 4 below:
   - **Project URL**
   - **anon public** key

## 2. Get a Mapbox token

1. Create a free account at [mapbox.com](https://mapbox.com).
2. Go to your [Tokens page](https://account.mapbox.com/access-tokens/) — the
   default public token works fine, or create a new one scoped to your domain.

## 3. Run it locally (optional, but good for testing before deploying)

```bash
npm install
cp .env.local.example .env.local
# now paste your Supabase URL/key and Mapbox token into .env.local
npm run dev
```

Visit `http://localhost:3000` — you should see the map centered on Coffin Bay.

## 4. Deploy to Vercel

1. Push this project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import that repo.
3. Before deploying, add three **Environment Variables** in the Vercel project
   settings (same names as in `.env.local.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_MAPBOX_TOKEN`
4. Click **Deploy**. You'll get a `*.vercel.app` URL once it finishes.

## 5. Point it at your own subdomain

1. In the Vercel project → **Settings → Domains**, add
   `map.coffinbaydesignco.com.au` (or whichever subdomain/path you prefer).
2. Vercel will show you a CNAME record to add. Add that record wherever
   `coffinbaydesignco.com.au`'s DNS is managed (your domain registrar, or
   Squarespace Domains if that's where it lives).
3. Wait for DNS to propagate (usually minutes, sometimes a few hours), then
   confirm `https://map.coffinbaydesignco.com.au` loads the map directly.
4. Open `next.config.js` and replace the placeholder domain in the
   `frame-ancestors` line with your real Squarespace domain — this is what
   allows Squarespace to embed the map in an iframe at all. Redeploy after
   changing it.

## 6. Embed in Squarespace

Squarespace only renders custom HTML/JS on the **Business plan or higher**
(Personal-tier plans will show the raw code as text instead of running it).

1. Edit the page where you want the map (e.g. a `/stickers` page).
2. Click the **+** insert button → **Code** (under "More" if it's not in the
   short list).
3. Set the block to **HTML** mode and paste:

```html
<div style="position:relative;width:100%;padding-bottom:70%;overflow:hidden;">
  <iframe
    src="https://map.coffinbaydesignco.com.au"
    style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"
    loading="lazy"
    allow="clipboard-write"
  ></iframe>
</div>
```

4. Adjust `padding-bottom` to change the map's aspect ratio (70% ≈ a wide
   landscape box; use a larger number for a taller map, e.g. 100% for square).
5. Save and preview the live page (not the editor preview) to confirm it renders.

---

## Notes

**Public deletion is off by default.** Anyone can add a pin (matches the
original prototype), but the "Remove pin" button will fail silently unless
you uncomment the two delete policies in `supabase/schema.sql` and re-run
them. That's deliberate — this is a live public website now, not a private
prototype, so letting any visitor delete any pin is worth a second thought.
If you want moderation instead of open deletion, the next step would be adding
simple admin auth (Supabase Auth handles this well) and scoping the delete
policy to logged-in admins only.

**Costs at low-to-moderate traffic:** Supabase and Vercel free tiers cover
this comfortably. Mapbox's free tier includes 50,000 map loads/month before
any charge.

**Image sizes:** photos are resized to a 1200px longest edge and compressed
to JPEG in the visitor's browser before upload, so storage and load times
stay reasonable even with a lot of sightings.
