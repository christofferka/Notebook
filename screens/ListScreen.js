// ListScreen: appens hovedskærm.
// - Opretter nye noter (tekst + evt. billede)
// - Viser alle noter i en liste (de første 25 tegn)
// - Slet-knap pr. note
// - Knap til at åbne kort-skærmen

import { useState, useCallback } from 'react';
import {
  View, Text, TextInput, Button, FlatList, TouchableOpacity, Image, StyleSheet, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { supabase, uploadImage } from '../supabase';

export default function ListScreen({ navigation }) {
  // State: alle noter fra databasen
  const [notes, setNotes] = useState([]);
  // State: tekst som brugeren skriver i input-feltet
  const [text, setText] = useState('');
  // State: lokal uri til valgt billede (før upload)
  const [imageUri, setImageUri] = useState(null);

  // Henter alle noter fra Supabase, nyeste øverst
  const loadNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.log('loadNotes error:', error);
      Alert.alert('Fejl ved hentning', error.message);
      return;
    }
    console.log('loadNotes fik', data?.length, 'noter');
    setNotes(data || []);
  };

  // useFocusEffect kører hver gang skærmen bliver aktiv —
  // også når man kommer tilbage fra Detail eller Map, så listen altid er opdateret.
  useFocusEffect(useCallback(() => { loadNotes(); }, []));

  // Vælg et billede fra telefonens Photos-bibliotek
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  // Tag et nyt billede med kameraet (spørger om tilladelse første gang)
  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.5 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  // Opretter en ny note i databasen. Hvis der er et billede, uploades det først.
  const addNote = async () => {
    if (!text) return;
    let image_url = null;
    if (imageUri) image_url = await uploadImage(imageUri);
    await supabase.from('notes').insert({ text, image_url });
    // Nulstil input + reload liste
    setText('');
    setImageUri(null);
    loadNotes();
  };

  // Sletter en note fra databasen og opdaterer listen
  const deleteNote = async (id) => {
    console.log('deleteNote kaldt med id:', id);
    const { error, count } = await supabase
      .from('notes')
      .delete({ count: 'exact' })
      .eq('id', id);
    if (error) {
      console.log('deleteNote error:', error);
      Alert.alert('Fejl ved sletning', error.message);
      return;
    }
    console.log('deleteNote slettede', count, 'rækker');
    loadNotes();
  };

  return (
    <View style={styles.container}>
      {/* Knap til kort-skærmen */}
      <Button title="Åbn kort" onPress={() => navigation.navigate('Map')} />
      <Text style={styles.count}>Antal noter: {notes.length}</Text>

      {/* Input til ny note */}
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Skriv note..."
      />

      {/* Knapper: vælg billede / tag billede / tilføj note */}
      <View style={styles.row}>
        <Button title="Vælg billede" onPress={pickImage} />
        <Button title="Tag billede" onPress={takePhoto} />
        <Button title="Tilføj" onPress={addNote} />
      </View>

      {/* Preview af valgt billede inden upload */}
      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

      {/* Liste af noter. FlatList er optimeret til lange lister. */}
      <FlatList
        data={notes}
        keyExtractor={(item, i) => String(item.id ?? i)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('Detail', { note: item })}
          >
            {/* Thumbnail hvis noten har et billede */}
            {item.image_url && (
              <Image source={{ uri: item.image_url }} style={styles.thumb} />
            )}
            {/* Vis kun de første 25 tegn + "..." hvis teksten er længere */}
            <Text style={styles.text}>
              {item.text.length > 25 ? item.text.slice(0, 25) + '...' : item.text}
            </Text>
            <Button title="Slet" onPress={() => deleteNote(item.id)} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  count: { textAlign: 'center', marginVertical: 4, color: '#666' },
  input: { borderWidth: 1, padding: 8, marginVertical: 8, borderRadius: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  preview: { width: 80, height: 80, marginVertical: 8 },
  item: {
    flexDirection: 'row', alignItems: 'center', padding: 8,
    borderBottomWidth: 1, borderColor: '#eee',
  },
  thumb: { width: 40, height: 40, marginRight: 8, borderRadius: 4 },
  text: { flex: 1 },
});
