// MapScreen: viser et kort med alle noter som markers.
// Features:
//   1. Spørger om tilladelse til lokation ved opstart og centrerer kortet.
//   2. Henter noter med lokation fra Supabase og viser dem som markers.
//   3. Long-press på kortet → modal → opret note på det punkt.
//   4. "Note her (GPS)"-knap → bruger aktuel lokation → modal → opret note.
//   5. Tryk på marker → callout med notens tekst.

import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, Modal, StyleSheet, Alert,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '../supabase';

export default function MapScreen() {
  // State: noter med lokation (til markers)
  const [notes, setNotes] = useState([]);

  // State: kortets synlige område. Starter på København som fallback.
  // latitudeDelta/longitudeDelta styrer zoom-niveauet.
  const [region, setRegion] = useState({
    latitude: 55.6761, longitude: 12.5683,
    latitudeDelta: 0.1, longitudeDelta: 0.1,
  });

  // State: hvis sat, viser vi modal'en til at skrive tekst for en ny note på disse koordinater.
  const [modalCoord, setModalCoord] = useState(null);
  const [text, setText] = useState('');

  // Henter kun noter der har lokation (latitude ikke null) — det er dem der skal på kortet.
  const loadNotes = async () => {
    const { data } = await supabase
      .from('notes')
      .select('*')
      .not('latitude', 'is', null);
    setNotes(data || []);
  };

  // Kører én gang når skærmen åbnes:
  // - Beder om lokationstilladelse
  // - Hvis tilladt: centrer kortet på brugerens position
  // - Hent noter til markers
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05, longitudeDelta: 0.05,
        });
      }
      loadNotes();
    })();
  }, []);

  // "Note her (GPS)"-knap: find aktuel lokation og åbn modal'en til at skrive tekst.
  const addHere = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lokationstilladelse mangler');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setModalCoord({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
  };

  // Gemmer en ny note (med lokation) i Supabase og lukker modal'en.
  const saveNote = async () => {
    if (!text) return;
    const { error } = await supabase.from('notes').insert({
      text,
      latitude: modalCoord.latitude,
      longitude: modalCoord.longitude,
    });
    if (error) {
      Alert.alert('Fejl ved gem', error.message);
      return;
    }
    setModalCoord(null);
    setText('');
    loadNotes();
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        region={region}
        onRegionChangeComplete={setRegion}
        // Viser den blå prik på brugerens aktuelle position
        showsUserLocation={true}
        showsMyLocationButton={true}
        // Long-press på kortet giver os koordinaterne i e.nativeEvent.coordinate
        onLongPress={(e) => setModalCoord(e.nativeEvent.coordinate)}
      >
        {/* Én <Marker> pr. note med lokation */}
        {notes.map((n, i) => (
          <Marker
            key={n.id ?? `m-${i}`}
            coordinate={{ latitude: n.latitude, longitude: n.longitude }}
          >
            {/* Callout = lille popup der vises når man trykker på markeren */}
            <Callout>
              <Text>{n.text}</Text>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Knap flydende i bunden */}
      <View style={styles.btn}>
        <Button title="Note her (GPS)" onPress={addHere} />
      </View>

      {/* Modal til at skrive tekst for ny note. Vises når modalCoord er sat. */}
      <Modal visible={!!modalCoord} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalBox}>
            <Text style={styles.title}>Ny note</Text>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Tekst..."
            />
            <Button title="Gem" onPress={saveNote} />
            <Button
              title="Annuller"
              onPress={() => { setModalCoord(null); setText(''); }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  modal: { flex: 1, justifyContent: 'center', backgroundColor: '#0008' },
  modalBox: {
    backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 8,
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  input: {
    borderWidth: 1, padding: 8, marginVertical: 8, borderRadius: 4,
  },
});
