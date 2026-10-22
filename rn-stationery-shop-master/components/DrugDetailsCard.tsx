import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Drug } from '../types/drug';

function DetailRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>;
}

export default function DrugDetailsCard({ drug }: { drug: Drug }) {
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.hero}><Text style={styles.heroIcon}>✚</Text><Text style={styles.heroCaption}>КАТАЛОГ ЛЕКАРСТВ</Text></View>
      <Text style={styles.category}>{drug.category}</Text>
      <Text style={styles.name}>{drug.name}</Text>
      <Text style={styles.latin}>{drug.latin_name}</Text>
      <Text style={styles.description}>{drug.description}</Text>
      <View style={styles.panel}>
        <DetailRow label="Действующее вещество" value={drug.active_substance} />
        <DetailRow label="Форма выпуска" value={drug.form} />
        <DetailRow label="Дозировка" value={drug.dosage} />
        <DetailRow label="Производитель" value={drug.manufacturer} />
        <DetailRow label="Наличие" value={drug.stock > 0 ? `${drug.stock} упаковок` : 'Нет в наличии'} />
        <DetailRow label="Отпуск" value={drug.prescription_required ? 'По рецепту' : 'Без рецепта'} />
      </View>
      <Text style={styles.notice}>Информация представлена для учебного проекта и не заменяет консультацию медицинского специалиста.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, paddingBottom: 32, backgroundColor: '#f5faf7' },
  hero: { height: 140, borderRadius: 22, backgroundColor: '#dff3e9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  heroIcon: { fontSize: 54, color: '#16845b', fontWeight: '700' },
  heroCaption: { color: '#16845b', fontSize: 10, fontWeight: '800', letterSpacing: 2, marginTop: 4 },
  category: { color: '#16845b', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  name: { color: '#18342b', fontSize: 27, fontWeight: '800', marginTop: 5 },
  latin: { color: '#718078', fontSize: 14, fontStyle: 'italic', marginTop: 4 },
  description: { color: '#43574d', fontSize: 15, lineHeight: 22, marginTop: 16, marginBottom: 20 },
  panel: { backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 15, borderWidth: 1, borderColor: '#e1ece5' },
  detailRow: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#edf2ee' },
  detailLabel: { color: '#75837b', fontSize: 12, marginBottom: 4 },
  detailValue: { color: '#203b2f', fontSize: 14, fontWeight: '600' },
  notice: { color: '#7b8780', fontSize: 11, lineHeight: 16, marginTop: 16 },
});
