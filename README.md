# Notebook

Mobil notesbog bygget i **React Native (Expo)** med **Supabase** som backend. 
Afleveringsprojekt til faget *Mobile Development – Native React*.

## Funktioner

- **Noter:** opret, læs, rediger og slet noter (CRUD mod Supabase).
- **Billeder:** tilføj billede til en note fra kamera eller Photos; uploades til Supabase Storage.
- **Kort:** se noter med lokation som markers på et kort.
  - Long-press på kortet → opret note der.
  - "Note her (GPS)"-knap → opret note på aktuel lokation.
  - App'en spørger om tilladelse til lokation ved opstart.

## Features fra opgavens liste (uge 7)

Følgende features fra opgavebeskrivelsen er implementeret:

- ✅ Appen viser et map
- ✅ Brugeren kan tilføje en Map Marker ved at long-presse på kortet
- ✅ Marker gemmes i Supabase (i stedet for Firebase Firestore)
- ✅ Map viser alle Markers, som er gemt i Supabase
- ✅ Spørg bruger om tilladelse til at se lokation
- ✅ Brug aktuel lokation for at oprette ny note lige der

## Projekt-struktur

```
Notebook/
├── App.js              # Navigation (stack med 3 skærme)
├── supabase.js         # Supabase-klient + billede-upload
├── screens/
│   ├── ListScreen.js   # Liste af noter + opret
│   ├── DetailScreen.js # Rediger / gem note
│   └── MapScreen.js    # Kort med markers
└── app.json            # Expo-konfiguration
```

## Supabase-opsætning

**Tabel `notes`:**

| Kolonne     | Type                     |
|-------------|--------------------------|
| id          | uuid (primary key)       |
| text        | text                     |
| latitude    | double precision (null)  |
| longitude   | double precision (null)  |
| image_url   | text (null)              |
| created_at  | timestamptz (default now)|

**Storage:** public bucket `note-images` med en policy der tillader `INSERT/SELECT`.

## Kør projektet

```bash
npm install
npx expo start --tunnel
```

Scan QR-koden med **Expo Go** på en fysisk mobil (kamera og lokation kræver fysisk enhed).
