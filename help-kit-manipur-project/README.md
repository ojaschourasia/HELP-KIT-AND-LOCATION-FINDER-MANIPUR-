# Help Kit Manipur

Files (keep them side by side at the root of your repo / upload):

    index.html  manifest.json  sw.js  icon.svg
    css/style.css
    js/data.js   js/app.js
    README.md    BUSINESS.md

## Deploy (fastest): Netlify Drop
Unzip, go to https://app.netlify.com/drop, drag the folder onto the page.

## Deploy on Render (Static Site)
Files at the ROOT of your GitHub repo. Build Command: blank. Publish Directory: `.`
If unstyled: F12 > Network > reload; `/css/style.css`, `/js/data.js`, `/js/app.js` must be 200.

## Local preview
Run `python -m http.server 8000` in this folder, open http://localhost:8000
(root-relative paths mean double-clicking index.html may show no styling).

## BEFORE YOU GO LIVE (important)
1. Business enquiries go to WhatsApp +91 94257 05016 and ojaschourasia@gmail.com (Ojas Chourasia). The visitor's own
   WhatsApp/Gmail opens pre-filled and THEY press Send, so it lands on your phone. Nothing is stored on the site.
   To change contacts edit `CONTACT_WHATSAPP` / `CONTACT_EMAIL` in js/app.js and the contact card in index.html.
2. Replace estimated hotel prices / sample bus times with real data before charging anyone.
3. Place data came from Google Places. For a commercial product, use the licensed API or your own verified database.

## New in this version
- Visitor info & permits (ILP link, 2026 festival dates, weather/road links)
- List your business (enquiry opens your own email/WhatsApp; nothing stored)
- Safety Guide: SOS location message (WhatsApp/SMS, user sends it themselves), emergency numbers, nearest police/hospital
- "Verified" and "Sponsored" badges: add `verified:true` and/or `sponsored:true` to a place in js/data.js.
  Sponsored places are listed first and are always labelled.
- Offline mode (service worker): works after the first visit, on https or localhost only.

## Honest notes
- Bus times/fares are samples; hotel prices are estimates.
- Reviews are shared only on the original Claude-hosted link; on your hosting they save per-browser.
  The sign-in is a name gate, not verified login. Real accounts/payments/bookings need a backend
  (e.g. Firebase or Supabase) and are NOT included.
- Festival dates and ILP rules can change: confirm on manipurtourism.gov.in and manipurilponline.mn.gov.in.

## Tie-up partners (public list)
After you agree a tie-up, set `verified:true` (and `sponsored:true` if paid) on that place in js/data.js. It then appears under
"Our tie-up partners" on the business page. Enquiries themselves are never shown publicly. A business not yet in the data needs a new place object.
For fully automatic delivery (no Send tap) you'd need a form service such as Formspree or Web3Forms (free signup, not included).

## Pharmacies, banks & ATMs (Explore nearby)
Each listing shows "Open now / Closed" computed from the hours stored in js/data.js (`hrs`: Mon..Sun), a per-day hours list,
and holiday notes. Banks are treated as closed on Sundays and the 2nd & 4th Saturdays (RBI rule) - public holidays vary, so a
link searches this month's bank holidays. Phone numbers are labelled "Branch counter" when it is a local branch number and
"Bank helpline" when it is a toll-free/central number (`hl:true`). Hours/phones come from Google listings and can be out of date:
confirm before relying on them. ATMs can be out of cash or closed; some reviews report specific machines out of order.

## Sign-in on the business page
Listing a business needs the same quick sign-in as reviews (name + email or mobile). It is a name gate, not verified login.

## Photos button
Every place card (and each tourist spot) has a "Photos" button that opens real photos on Google Maps / Google Images.
The site does not copy third-party photos (copyright). To show your own photos inline, put them in /photos and list them in js/data.js
as `photos:["/photos/name.jpg"]` for that place (see photos/README.txt). Good use: partner businesses that give you their pictures.
