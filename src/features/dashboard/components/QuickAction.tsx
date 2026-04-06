import { Radius, Colors, Shadow } from '@/theme';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

export default function QuickAction({
    emoji,
    label,
    onPress,
}: {
    emoji: string;
    label: string;
    onPress?: () => void;
}) {
    return (
        <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.75}>
            <View style={styles.quickActionIcon}>
                <Text style={{ fontSize: 20 }}>{emoji}</Text>
            </View>
            <Text style={styles.quickActionLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    quickAction: { flex: 1, alignItems: 'center', gap: 6 },
    quickActionIcon: {
        width: 54,
        height: 54,
        borderRadius: Radius.md,
        backgroundColor: Colors.bgCard,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.card,
    },
    quickActionLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.textSecondary,
        textAlign: 'center',
    },
});
