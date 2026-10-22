import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CartLine } from '../types/drug';
import { useCartStore } from '../stores/cartStore';

export default function CartItem({ line }: { line: CartLine }) {
  const remove = useCartStore((state) => state.remove);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  return (
    <View style={styles.row}>
      <View style={styles.iconBox}><Text style={styles.icon}>✚</Text></View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{line.drug.name}</Text>
        <Text style={styles.substance}>{line.drug.dosage} · {line.drug.form}</Text>
        <View style={styles.controls}>
          <Pressable accessibilityLabel="Уменьшить количество" style={styles.qtyBtn} onPress={() => decrement(line.drug.id)}><Text style={styles.qtyText}>−</Text></Pressable>
          <Text style={styles.qty}>{line.quantity}</Text>
          <Pressable accessibilityLabel="Увеличить количество" disabled={line.quantity >= line.drug.stock} style={[styles.qtyBtn, line.quantity >= line.drug.stock && styles.disabled]} onPress={() => increment(line.drug.id)}><Text style={styles.qtyText}>+</Text></Pressable>
          <Pressable onPress={() => remove(line.drug.id)} style={styles.remove}><Text style={styles.removeText}>Удалить</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', padding: 13, marginHorizontal: 12, marginVertical: 6, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e5eee9' },
  iconBox: { width: 50, height: 50, borderRadius: 14, backgroundColor: '#e7f6ef', alignItems: 'center', justifyContent: 'center' },
  icon: { color: '#16845b', fontSize: 25, fontWeight: '700' },
  info: { flex: 1, marginLeft: 12 },
  name: { color: '#18342b', fontSize: 14, fontWeight: '700', marginBottom: 3 },
  substance: { color: '#718078', fontSize: 12, marginBottom: 9 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  qtyBtn: { width: 29, height: 29, borderRadius: 10, backgroundColor: '#e7f6ef', alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.4 },
  qtyText: { fontSize: 18, fontWeight: '700', color: '#16845b' },
  qty: { fontSize: 15, fontWeight: '800', minWidth: 20, textAlign: 'center', color: '#18342b' },
  remove: { marginLeft: 'auto' },
  removeText: { color: '#bf4141', fontSize: 12, fontWeight: '600' },
});
