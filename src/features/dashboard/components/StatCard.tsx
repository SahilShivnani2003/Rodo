import { Colors, Radius, Shadow } from '@/theme';
import { View, Text, StyleSheet } from 'react-native';

export default function StatCard({
    emoji,
    label,
    value,
    sub,
    accent,
}: {
    emoji: string;
    label: string;
    value: string;
    sub?: string;
    accent?: boolean;
}) {
    return (
        <View style={[styles.statCard, accent && styles.statCardAccent]}>
            <Text style={styles.statEmoji}>{emoji}</Text>
            <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
            <Text style={[styles.statLabel, accent && styles.statLabelAccent]}>{label}</Text>
            {sub && <Text style={styles.statSub}>{sub}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    statCard: {
        flex: 1,
        minWidth: '44%',
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.md,
        padding: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.card,
    },
    statCardAccent: { backgroundColor: Colors.amber, borderColor: Colors.amber },
    statEmoji: { fontSize: 20, marginBottom: 6 },
    statValue: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary },
    statValueAccent: { color: '#fff' },
    statLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', marginTop: 2 },
    statLabelAccent: { color: 'rgba(255,255,255,0.85)' },
    statSub: { fontSize: 10, color: Colors.textMuted, marginTop: 1 },
});
