import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import DrugCatalogScreen from '../screens/DrugCatalogScreen';
import DrugDetailsScreen from '../screens/DrugDetailsScreen';
import CartScreen from '../screens/CartScreen';
import HeaderCartButton from '../components/HeaderCartButton';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#e1f4e9' }, headerTintColor: '#18342b', headerTitleStyle: { fontWeight: '800' }, contentStyle: { backgroundColor: '#f5faf7' } }}>
      <Stack.Screen name="DrugCatalog" component={DrugCatalogScreen} options={{ title: 'MedStore', headerRight: () => <HeaderCartButton /> }} />
      <Stack.Screen name="DrugDetails" component={DrugDetailsScreen} options={{ title: 'О лекарстве', headerRight: () => <HeaderCartButton /> }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Корзина' }} />
    </Stack.Navigator>
  </NavigationContainer>;
}
