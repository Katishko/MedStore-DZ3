import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Drug } from '../types/drug';
import { useCartStore } from '../stores/cartStore';

interface Props { drug: Drug; onPress: () => void; }

export default function DrugListItem({ drug, onPress }: Props) {
  const add = useCartStore((state) => state.add);
  const outOfStock = drug.stock <= 0;
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.iconBox}><Text style={styles.icon}>✚</Text></View>
      <View style={styles.info}>
        <Text style={styles.category}>{drug.category}</Text>
        <Text style={styles.name} numberOfLines={2}>{drug.name}</Text>
        <Text style={styles.substance} numberOfLines={1}>{drug.active_substance} · {drug.dosage}</Text>
        <Text style={[styles.stock, outOfStock && styles.outOfStock]}>{outOfStock ? 'Нет в наличии' : `В наличии: ${drug.stock} уп.`}</Text>
        {drug.prescription_required && <Text style={styles.rx}>По рецепту</Text>}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Добавить ${drug.name} в корзину`}
        disabled={outOfStock}
        style={[styles.addBtn, outOfStock && styles.disabledBtn]}
        onPress={(event) => { event.stopPropagation(); add(drug); }}
      >
        <Text style={styles.addBtnText}>+</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, marginHorizontal: 14, marginVertical: 6, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#e5eee9' },
  iconBox: { width: 54, height: 54, borderRadius: 16, backgroundColor: '#e7f6ef', alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 27, color: '#16845b', fontWeight: '700' },
  info: { flex: 1, marginLeft: 12, marginRight: 8 },
  category: { color: '#16845b', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 3 },
  name: { color: '#18342b', fontSize: 15, fontWeight: '700', marginBottom: 3 },
  substance: { color: '#65756e', fontSize: 12 },
  stock: { color: '#16845b', fontSize: 11, marginTop: 5 },
  outOfStock: { color: '#bf4141' },
  rx: { color: '#8a5c17', fontSize: 10, fontWeight: '700', marginTop: 4 },
  addBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#16845b', alignItems: 'center', justifyContent: 'center' },
  disabledBtn: { backgroundColor: '#aab7b1' },
  addBtnText: { color: '#fff', fontSize: 24, lineHeight: 27, fontWeight: '600' },
});
