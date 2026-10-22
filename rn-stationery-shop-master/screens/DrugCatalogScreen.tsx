import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchDrugs } from '../api/mockDrugsAPI';
import { Drug } from '../types/drug';
import { RootStackParamList } from '../types/navigation';
import DrugListItem from '../components/DrugListItem';
import EmptyState from '../components/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList, 'DrugCatalog'>;

export default function DrugCatalogScreen() {
  const navigation = useNavigation<Nav>();
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');

  useEffect(() => {
    let alive = true;
    fetchDrugs().then((data) => { if (alive) setDrugs(data); })
      .catch(() => { if (alive) setError('Не удалось загрузить каталог лекарств.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const categories = useMemo(() => ['Все', ...Array.from(new Set(drugs.map((drug) => drug.category))).sort()], [drugs]);
  const filteredDrugs = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('ru');
    return drugs.filter((drug) => {
      const matchesCategory = selectedCategory === 'Все' || drug.category === selectedCategory;
      const searchable = [drug.name, drug.latin_name, drug.active_substance, drug.manufacturer, drug.form].join(' ').toLocaleLowerCase('ru');
      return matchesCategory && (!query || searchable.includes(query));
    });
  }, [drugs, search, selectedCategory]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#16845b" /><Text style={styles.hint}>Загружаем лекарства…</Text></View>;
  if (error) return <EmptyState title="Ошибка загрузки" subtitle={error} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.eyebrow}>ЗАБОТА О ЗДОРОВЬЕ</Text><Text style={styles.heading}>Аптечный каталог</Text><Text style={styles.subtitle}>Найдите нужное лекарство</Text></View>
      <TextInput value={search} onChangeText={setSearch} placeholder="Название, вещество или производитель" placeholderTextColor="#87958d" style={styles.search} clearButtonMode="while-editing" accessibilityLabel="Поиск лекарств" />
      <FlatList horizontal data={categories} keyExtractor={(item) => item} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList} renderItem={({ item }) => <Pressable onPress={() => setSelectedCategory(item)} style={[styles.chip, selectedCategory === item && styles.chipActive]}><Text style={[styles.chipText, selectedCategory === item && styles.chipTextActive]}>{item}</Text></Pressable>} />
      <View style={styles.resultsRow}><Text style={styles.resultsTitle}>Лекарства</Text><Text style={styles.resultsCount}>{filteredDrugs.length} поз.</Text></View>
      {filteredDrugs.length === 0 ? <EmptyState title="Ничего не найдено" subtitle="Измените запрос или выберите другую категорию." /> : <FlatList data={filteredDrugs} keyExtractor={(drug) => drug.id} contentContainerStyle={styles.list} renderItem={({ item }) => <DrugListItem drug={item} onPress={() => navigation.navigate('DrugDetails', { drugId: item.id })} />} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5faf7' },
  header: { backgroundColor: '#e1f4e9', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 18, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  eyebrow: { color: '#16845b', fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  heading: { color: '#18342b', fontSize: 28, fontWeight: '800', marginTop: 6 },
  subtitle: { color: '#60756a', fontSize: 14, marginTop: 4 },
  search: { marginHorizontal: 14, marginTop: 14, marginBottom: 10, paddingHorizontal: 15, paddingVertical: 13, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e1ece5', color: '#18342b', fontSize: 14 },
  categoryList: { paddingHorizontal: 14, paddingBottom: 12, gap: 7 },
  chip: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#dce9e0' },
  chipActive: { backgroundColor: '#16845b', borderColor: '#16845b' },
  chipText: { color: '#4d6257', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  resultsRow: { paddingHorizontal: 18, paddingTop: 2, paddingBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultsTitle: { color: '#18342b', fontSize: 17, fontWeight: '800' },
  resultsCount: { color: '#718078', fontSize: 12 },
  list: { paddingTop: 2, paddingBottom: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5faf7' },
  hint: { marginTop: 8, color: '#60756a' },
});
