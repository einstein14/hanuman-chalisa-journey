# Hanuman Chalisa content notes

## Edition

Verse text in `hanuman_chalisa.json` follows the **traditional Hanuman Chalisa** as commonly printed (Gita Press / Bhaktaraj-style Awadhi spellings), for example **बिद्यावान**, **कबि कोबिद**, **तुम रच्छक**, and **राम लखन**.

Do not alter the Devanagari verses in the app UI.

## Transliteration and meanings

- **English transliteration** uses widely used IAST-style romanization for learning pronunciation.
- **Telugu transliteration** uses Telugu script as a pronunciation aid for Telugu-speaking families.
- **English and Telugu meanings** are simplified for children aged 5–8. A Telugu-reading parent or teacher should review Telugu wording before classroom or temple use.

## Audio

Audio paths in JSON point to files under `static/audio/`. Recordings are **not bundled**; add your own licensed or original recordings using the filenames in `static/audio/README.md`. The app shows a calm placeholder when files are missing.

## Verification checklist

- 2 introductory dohas (ids 1–2)
- 40 chaupais (ids 3–42)
- 1 concluding doha (id 43)
