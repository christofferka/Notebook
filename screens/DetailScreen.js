// DetailScreen: viser én note i fuld størrelse.
// Brugeren kan redigere teksten og gemme ændringen i databasen.

import { useState } from 'react';
import { View, TextInput, Button, Image, StyleSheet } from 'react-native';
import { supabase } from '../supabase';

export default function DetailScreen({ route, navigation }) {
  // Noten sendes med fra ListScreen via navigation.navigate('Detail', { note }).
  const { note } = route.params;

  // Lokal state til redigering. Starter med notens nuværende tekst.
  const [text, setText] = useState(note.text);

  // Opdaterer noten i Supabase og går tilbage til listen.
  const save = async () => {
    await supabase.from('notes').update({ text }).eq('id', note.id);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Vis billedet hvis noten har et */}
      {note.image_url && (
        <Image source={{ uri: note.image_url }} style={styles.image} />
      )}

      {/* multiline = flere linjers tekst (som et textarea) */}
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        multiline
      />

      <Button title="Gem" onPress={save} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  image: { width: '100%', height: 200, marginBottom: 16, borderRadius: 4 },
  input: {
    borderWidth: 1, padding: 8, minHeight: 120, borderRadius: 4,
    marginBottom: 16, textAlignVertical: 'top',
  },
});
