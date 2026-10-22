import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useCartLines, useCartStore } from '../stores/cartStore';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import EmptyState from '../components/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Cart'>;

export default function CartScreen() {
  const navigation = useNavigation<Nav>();
  const lines = useCartLines();
  const clear = useCartStore((state) => state.clear);

  const handleOrder = () => {
    const currentLines = Object.values(useCartStore.getState().lines);
    const count = currentLines.reduce((sum, line) => sum + line.quantity, 0);
    Alert.alert('Заказ оформлен', `В учебном заказе ${count} упаковок лекарств. Это демонстрация интерфейса, заказ не отправляется в аптеку.`, [
      { text: 'Продолжить', onPress: () => { clear(); navigation.popToTop(); } },
    ]);
  };

  if (lines.length === 0) return <View style={styles.empty}><EmptyState title="Корзина пока пуста" subtitle="Добавьте лекарства из каталога, чтобы собрать учебный заказ." /><Pressable style={styles.catalogBtn} onPress={() => navigation.popToTop()}><Text style={styles.catalogBtnText}>Перейти в каталог</Text></Pressable></View>;

  return <View style={styles.container}>
    <FlatList data={lines} keyExtractor={(line) => line.drug.id} renderItem={({ item }) => <CartItem line={item} />} contentContainerStyle={styles.list} />
    <View style={styles.footer}><CartSummary /><Pressable style={styles.button} onPress={handleOrder}><Text style={styles.buttonText}>Оформить учебный заказ</Text></Pressable><Text style={styles.disclaimer}>Учебный проект. Не является сервисом продажи лекарств.</Text></View>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5faf7' },
  empty: { flex: 1, backgroundColor: '#f5faf7', paddingBottom: 30 },
  list: { paddingVertical: 8 },
  footer: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e1ece5' },
  button: { backgroundColor: '#16845b', marginHorizontal: 16, marginBottom: 10, paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  disclaimer: { color: '#87958d', fontSize: 10, textAlign: 'center', marginBottom: 14, marginHorizontal: 12 },
  catalogBtn: { alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#16845b', borderRadius: 12 },
  catalogBtnText: { color: '#fff', fontWeight: '700' },
});
