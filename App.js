// App.js er app'ens rod. Her sætter vi navigation op.
// Vi bruger en Stack Navigator: skærme lægges "oven på" hinanden,
// og man kan gå tilbage med back-pilen.

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListScreen from './screens/ListScreen';
import DetailScreen from './screens/DetailScreen';
import MapScreen from './screens/MapScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    // NavigationContainer skal altid være yderst — den styrer navigations-state.
    <NavigationContainer>
      <Stack.Navigator initialRouteName="List">
        {/* Liste over noter — appens startskærm */}
        <Stack.Screen name="List" component={ListScreen} options={{ title: 'Noter' }} />
        {/* Detalje: fuld tekst + rediger */}
        <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Note' }} />
        {/* Kort med markers */}
        <Stack.Screen name="Map" component={MapScreen} options={{ title: 'Kort' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
