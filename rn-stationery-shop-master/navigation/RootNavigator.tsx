import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import DrugCatalogScreen from '../screens/DrugCatalogScreen';
import DrugDetailsScreen from '../screens/DrugDetailsScreen';
import CartScreen from '../screens/CartScreen';
import HeaderCartButton from '../components/HeaderCartButton';
import LoginScreen from '../screens/LoginScreen';
import { useAuthStore } from '../stores/authStore';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

function HeaderLogoutButton() {
  const logout = useAuthStore((state) => state.logout);
  return (
    <Pressable accessibilityRole="button" onPress={logout} style={styles.logoutButton}>
      <Text style={styles.logoutText}>Выйти</Text>
    </Pressable>
  );
}

export default function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.username !== null);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#e1f4e9' }, headerTintColor: '#18342b', headerTitleStyle: { fontWeight: '800' }, contentStyle: { backgroundColor: '#f5faf7' } }}>
      <Stack.Screen name="DrugCatalog" component={DrugCatalogScreen} options={{ title: 'MedStore', headerRight: () => <View style={styles.headerActions}><HeaderCartButton /><HeaderLogoutButton /></View> }} />
      <Stack.Screen name="DrugDetails" component={DrugDetailsScreen} options={{ title: 'О лекарстве', headerRight: () => <View style={styles.headerActions}><HeaderCartButton /><HeaderLogoutButton /></View> }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Корзина', headerRight: () => <HeaderLogoutButton /> }} />
    </Stack.Navigator>
  </NavigationContainer>;
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  logoutButton: { paddingHorizontal: 8, paddingVertical: 10 },
  logoutText: { color: '#16845b', fontSize: 13, fontWeight: '700' },
});
