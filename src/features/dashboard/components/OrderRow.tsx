import { View, Text, StyleSheet } from 'react-native';
import { RECENT_ORDERS } from '../data/data';
import { Colors, Radius, Shadow } from '@/theme';

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pending', color: '#D97706', bg: '#FEF3C7' },
    confirmed: { label: 'Confirmed', color: '#2563EB', bg: '#EFF6FF' },
    preparing: { label: 'Preparing', color: '#7C3AED', bg: '#EDE9FE' },
    ready: { label: 'Ready', color: '#059669', bg: '#ECFDF5' },
    completed: { label: 'Completed', color: Colors.successGreen, bg: '#DCFCE7' },
    cancelled: { label: 'Cancelled', color: '#DC2626', bg: '#FEE2E2' },
    rejected: { label: 'Rejected', color: '#DC2626', bg: '#FEE2E2' },
};

export default function OrderRow({ order }: { order: (typeof RECENT_ORDERS)[0] }) {
    const meta = STATUS_META[order.status] ?? STATUS_META.pending;

    function formatCurrency(n: number) {
        return `₹${n.toLocaleString('en-IN')}`;
    }

    return (
        <View style={styles.orderRow}>
            <View style={styles.orderRowLeft}>
                <Text style={styles.orderNum}>{order.orderNumber}</Text>
                <Text style={styles.orderCustomer}>{order.customerName}</Text>
                <Text style={styles.orderItems} numberOfLines={1}>
                    {order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                </Text>
            </View>
            <View style={styles.orderRowRight}>
                <Text style={styles.orderAmount}>{formatCurrency(order.totalAmount)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                    <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
                </View>
                <Text style={styles.orderType}>
                    {order.orderType === 'dine-in' ? '🍽 Dine-in' : '🛍 Takeaway'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    
    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 14,
    },
    orderRowLeft: { flex: 1, gap: 2 },
    orderRowRight: { alignItems: 'flex-end', gap: 4, marginLeft: 10 },
    
    orderNum: { fontSize: 12, fontWeight: '800', color: Colors.amber },
    orderCustomer: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
    orderItems: { fontSize: 11, color: Colors.textMuted, maxWidth: 180 },
    orderAmount: { fontSize: 14, fontWeight: '900', color: Colors.textPrimary },
    orderType: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },
    statusBadge: { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
    statusText: { fontSize: 10, fontWeight: '700' },
});
