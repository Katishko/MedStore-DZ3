import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchDrugById } from '../api/mockDrugsAPI';
import { Drug } from '../types/drug';
import { RootStackParamList } from '../types/navigation';
import DrugDetailsCard from '../components/DrugDetailsCard';
import EmptyState from '../components/EmptyState';
import { useCartStore } from '../stores/cartStore';

type RouteT = RouteProp<RootStackParamList, 'DrugDetails'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'DrugDetails'>;

export default function DrugDetailsScreen() {
  const { params } = useRoute<RouteT>();
  const navigation = useNavigation<Nav>();
  const add = useCartStore((state) => state.add);
  const [drug, setDrug] = useState<Drug | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchDrugById(params.drugId).then((result) => { if (alive) setDrug(result ?? null); })
      .catch(() => { if (alive) setDrug(null); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [params.drugId]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#16845b" /></View>;
  if (!drug) return <EmptyState title="Лекарство не найдено" />;

  const outOfStock = drug.stock <= 0;
  return <View style={styles.container}>
    <View style={styles.content}><DrugDetailsCard drug={drug} /></View>
    <View style={styles.footer}>
      <Pressable disabled={outOfStock} style={[styles.button, outOfStock && styles.disabled]} onPress={() => { add(drug); navigation.navigate('Cart'); }}>
        <Text style={styles.buttonText}>{outOfStock ? 'Нет в наличии' : 'Добавить в корзину'}</Text>
      </Pressable>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5faf7' },
  content: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  footer: { padding: 14, borderTopWidth: 1, borderTopColor: '#e1ece5', backgroundColor: '#fff' },
  button: { backgroundColor: '#16845b', paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  disabled: { backgroundColor: '#aab7b1' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
