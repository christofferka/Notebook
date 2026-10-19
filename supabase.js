// Supabase-klient + hjælpefunktion til billede-upload.
// Alle filer importerer herfra, så der kun er ét sted vi taler med Supabase.

// Polyfill er nødvendigt i React Native fordi Supabase bruger URL-API'en,
// som ikke findes native i RN. Skal importeres FØR createClient kaldes.
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Project URL + publishable (anon) key fra Supabase dashboard.
// Publishable key er sikker at have i klient-kode — den respekterer RLS.
const SUPABASE_URL = 'https://oqmvnupgjqatqqvluphm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5chjUrzn0PQf70xuhYq0aA_FHriBusl';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Uploader et billede fra en lokal uri (fra kamera/photos) til Supabase Storage
// og returnerer en public URL, som vi gemmer på noten.
export async function uploadImage(uri) {
  // Hent billedet som binært data (ArrayBuffer), så Supabase kan uploade det.
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  // Unikt filnavn baseret på tidsstempel, så vi aldrig overskriver andre billeder.
  const fileName = `${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from('note-images')
    .upload(fileName, arrayBuffer, { contentType: 'image/jpeg' });
  if (error) throw error;

  // Hent public URL så vi kan vise billedet direkte i <Image source={{ uri }} />.
  const { data } = supabase.storage.from('note-images').getPublicUrl(fileName);
  return data.publicUrl;
}
