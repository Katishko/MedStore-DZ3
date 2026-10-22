import { StyleSheet, Text, View } from 'react-native';
import { selectCartCount, useCartStore } from '../stores/cartStore';

export default function CartSummary() {
  const count = useCartStore(selectCartCount);
  const distinct = useCartStore((state) => Object.keys(state.lines).length);
  return <View style={styles.wrap}>
    <View style={styles.row}><Text style={styles.label}>Разных препаратов</Text><Text style={styles.value}>{distinct}</Text></View>
    <View style={styles.row}><Text style={styles.totalLabel}>Всего упаковок</Text><Text style={styles.totalValue}>{count}</Text></View>
  </View>;
}

const styles = StyleSheet.create({
  wrap: { padding: 16, backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 14, color: '#66766d' },
  value: { fontSize: 14, fontWeight: '600', color: '#18342b' },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#18342b' },
  totalValue: { fontSize: 20, fontWeight: '800', color: '#16845b' },
});
