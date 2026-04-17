import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Colors, Radius, Shadow } from '@theme/index';
import { Order, OrderStatus } from '../types/Order';
import { useGetAllOrders, useUpdateOrderStatus } from '../hooks/hooks';
import { useMyOrders } from '@/features/dashboard/hooks/useMyOrders';

// ─── Config ───────────────────────────────────────────────────────────────────

const ALL_STATUS: (OrderStatus | 'all')[] = [
    'all',
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'completed',
    'cancelled',
];

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    pending: { label: 'Pending', color: '#D97706', bg: '#FEF3C7', icon: '⏳' },
    confirmed: { label: 'Confirmed', color: '#2563EB', bg: '#EFF6FF', icon: '✅' },
    preparing: { label: 'Preparing', color: '#7C3AED', bg: '#EDE9FE', icon: '🍳' },
    ready: { label: 'Ready', color: '#059669', bg: '#ECFDF5', icon: '✔️' },
    completed: { label: 'Completed', color: '#15803D', bg: '#DCFCE7', icon: '🎉' },
    cancelled: { label: 'Cancelled', color: '#DC2626', bg: '#FEE2E2', icon: '❌' },
    rejected: { label: 'Rejected', color: '#DC2626', bg: '#FEE2E2', icon: '🚫' },
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
    pending: 'confirmed',
    confirmed: 'preparing',
    preparing: 'ready',
    ready: 'completed',
};

const ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
    pending: '✅ Accept',
    confirmed: '🍳 Start Preparing',
    preparing: '✔️ Mark Ready',
    ready: '🎉 Complete',
};

const PAYMENT_ICON: Record<string, string> = {
    cash: '💵',
    upi_at_restaurant: '📱',
    online: '💳',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** The API may return either a plain string ID or a populated object for `restaurant`. */
function orderId(order: Order): string {
    // The API uses MongoDB _id; cast to any because the shared Order type omits it
    return (order as any)._id ?? order.orderNumber ?? '';
}

function customerName(order: Order): string {
    // If the server populates customer name, expose it; otherwise fall back
    return (order as any).customerName ?? 'Customer';
}

// ─── Order card ──────────────────────────────────────────────────────────────

function OrderCard({
    order,
    onStatusChange,
    isUpdating,
}: {
    order: Order;
    onStatusChange: (id: string, status: OrderStatus, reason?: string) => void;
    isUpdating: boolean;
}) {
    const meta = STATUS_META[order.status] ?? STATUS_META.pending;
    const nextSt = NEXT_STATUS[order.status];
    const actionLbl = ACTION_LABELS[order.status];
    const id = orderId(order);

    const handleReject = () => {
        Alert.alert('Reject Order', 'Are you sure you want to reject this order?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Reject',
                style: 'destructive',
                onPress: () => onStatusChange(id, 'rejected', 'Rejected by restaurant'),
            },
        ]);
    };

    const etaStr = new Date(order.customerETA).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
    });
    const createdStr = new Date(order.createdAt ?? '').toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const terminalStatuses: OrderStatus[] = ['completed', 'cancelled', 'rejected'];
    const isTerminal = terminalStatuses.includes(order.status);

    return (
        <View style={styles.orderCard}>
            {/* Top row */}
            <View style={styles.orderTop}>
                <View style={styles.orderTopLeft}>
                    <Text style={styles.orderNum}>{order.orderNumber}</Text>
                    <Text style={styles.orderCustomer}>{customerName(order)}</Text>
                </View>
                <View style={styles.orderTopRight}>
                    <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                        <Text style={[styles.statusText, { color: meta.color }]}>
                            {meta.icon} {meta.label}
                        </Text>
                    </View>
                    <Text style={styles.orderTotal}>
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                    </Text>
                </View>
            </View>

            {/* Meta strip */}
            <View style={styles.metaStrip}>
                <Text style={styles.metaChip}>
                    {order.orderType === 'dine-in' ? '🍽 Dine-in' : '🛍 Takeaway'}
                </Text>
                <Text style={styles.metaChip}>
                    {PAYMENT_ICON[order.paymentMethod] ?? '💰'}{' '}
                    {order.paymentMethod.replace(/_/g, ' ')}
                </Text>
                <Text style={styles.metaChip}>🕐 ETA {etaStr}</Text>
                {order.createdAt && <Text style={styles.metaChip}>📥 {createdStr}</Text>}
            </View>

            {/* Items */}
            <View style={styles.itemsList}>
                {order.items.map((item, i) => (
                    <View key={`${item.menuItemId}-${i}`} style={styles.itemRow}>
                        <View
                            style={[
                                styles.foodDotSmall,
                                {
                                    backgroundColor:
                                        item.foodType === 'veg' ? Colors.vegGreen : Colors.brandRed,
                                },
                            ]}
                        />
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemQty}>×{item.quantity}</Text>
                        <Text style={styles.itemPrice}>
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Totals */}
            <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Subtotal</Text>
                <Text style={styles.totalsValue}>₹{order.subtotal.toLocaleString('en-IN')}</Text>
            </View>
            {order.discount > 0 && (
                <View style={styles.totalsRow}>
                    <Text style={[styles.totalsLabel, { color: Colors.successGreen }]}>
                        Discount
                    </Text>
                    <Text style={[styles.totalsValue, { color: Colors.successGreen }]}>
                        −₹{order.discount.toLocaleString('en-IN')}
                    </Text>
                </View>
            )}
            <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>GST ({order.gstRate}%)</Text>
                <Text style={styles.totalsValue}>₹{order.gstAmount.toFixed(2)}</Text>
            </View>
            <View style={[styles.totalsRow, styles.totalsFinal]}>
                <Text style={styles.totalsFinalLabel}>Total</Text>
                <Text style={styles.totalsFinalValue}>
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                </Text>
            </View>

            {/* Payment status */}
            <View
                style={[
                    styles.paymentBadge,
                    order.paymentStatus === 'paid'
                        ? styles.paymentPaid
                        : order.paymentStatus === 'refunded'
                        ? styles.paymentRefunded
                        : styles.paymentPending,
                ]}
            >
                <Text style={styles.paymentText}>
                    {order.paymentStatus === 'paid'
                        ? '✅ Payment Received'
                        : order.paymentStatus === 'refunded'
                        ? '↩️ Refunded'
                        : '⏳ Payment Pending'}
                </Text>
            </View>

            {/* Action buttons — only for non-terminal statuses */}
            {!isTerminal && actionLbl && nextSt && (
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.rejectBtn, isUpdating && styles.btnDisabled]}
                        onPress={handleReject}
                        disabled={isUpdating}
                    >
                        <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.acceptBtn, isUpdating && styles.btnDisabled]}
                        onPress={() => onStatusChange(id, nextSt)}
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.acceptBtnText}>{actionLbl}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {order.rejectionReason && (
                <View style={styles.rejectReason}>
                    <Text style={styles.rejectReasonText}>Reason: {order.rejectionReason}</Text>
                </View>
            )}
        </View>
    );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function OwnerOrdersScreen() {
    const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');
    
    // Fix 1: use the correct hook for restaurant owner view
    const { data: orderData, isLoading } = useMyOrders();

    // Fix 2: derive orders from API response; keep local copy for optimistic updates
    const [orders, setOrders] = useState<Order[]>([]);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Fix 3: add missing useEffect (was referenced but not imported in original)
    useEffect(() => {
        if (orderData?.data) {
            setOrders(orderData.data);
        }
    }, [orderData]);

    // Fix 4: wire mutation for real API calls
    const { mutateAsync: updateStatus } = useUpdateOrderStatus();

    const filtered = useMemo(() => {
        if (activeFilter === 'all') return orders;
        return orders.filter(o => o.status === activeFilter);
    }, [orders, activeFilter]);

    const counts = useMemo(() => {
        const map: Record<string, number> = { all: orders.length };
        orders.forEach(o => {
            map[o.status] = (map[o.status] ?? 0) + 1;
        });
        return map;
    }, [orders]);

    // Fix 5: call the mutation and do optimistic update; revert on error
    const handleStatusChange = async (id: string, status: OrderStatus, rejectionReason = '') => {
        // Optimistic update
        const prev = orders;
        setOrders(p => p.map(o => (orderId(o) === id ? { ...o, status, rejectionReason } : o)));
        setUpdatingId(id);
        try {
            await updateStatus({ id, data: { status, rejectionReason } });
        } catch {
            // Revert on error
            setOrders(prev);
            Alert.alert('Error', 'Failed to update order status. Please try again.');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <View style={styles.root}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Orders</Text>
                <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>Live</Text>
                </View>
            </View>

            {/* ── Filter tabs ── */}
            <FlatList
                horizontal
                data={ALL_STATUS}
                keyExtractor={s => s}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterTabs}
                renderItem={({ item: st }) => {
                    const meta = st === 'all' ? null : STATUS_META[st];
                    const count = counts[st] ?? 0;
                    const active = activeFilter === st;
                    return (
                        <TouchableOpacity
                            style={[
                                styles.filterTab,
                                active && {
                                    backgroundColor: meta?.bg ?? Colors.amberGlow,
                                    borderColor: meta?.color ?? Colors.amber,
                                },
                            ]}
                            onPress={() => setActiveFilter(st as OrderStatus | 'all')}
                        >
                            {meta && <Text style={{ fontSize: 12 }}>{meta.icon}</Text>}
                            <Text
                                style={[
                                    styles.filterTabText,
                                    active && {
                                        color: meta?.color ?? Colors.amber,
                                        fontWeight: '800',
                                    },
                                ]}
                            >
                                {st === 'all' ? 'All' : meta?.label}
                            </Text>
                            {count > 0 && (
                                <View
                                    style={[
                                        styles.countBubble,
                                        active && { backgroundColor: meta?.color ?? Colors.amber },
                                    ]}
                                >
                                    <Text style={[styles.countText, active && { color: '#fff' }]}>
                                        {count}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                }}
            />

            {/* ── Loading state ── */}
            {isLoading && (
                <View style={styles.loadingState}>
                    <ActivityIndicator color={Colors.amber} size="large" />
                </View>
            )}

            {/* ── Order list ── */}
            {!isLoading && (
                <FlatList
                    data={filtered}
                    // Fix 6: use helper to safely access _id
                    keyExtractor={o => orderId(o)}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyEmoji}>📭</Text>
                            <Text style={styles.emptyText}>No orders here</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <OrderCard
                            order={item}
                            onStatusChange={handleStatusChange}
                            isUpdating={updatingId === orderId(item)}
                        />
                    )}
                />
            )}
        </View>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 28 : 60,
        paddingBottom: 14,
    },
    headerTitle: { fontSize: 26, fontWeight: '900', color: Colors.textPrimary },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#DCFCE7',
        borderRadius: Radius.full,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.successGreen },
    liveText: { fontSize: 11, fontWeight: '800', color: Colors.successGreen },

    filterTabs: { paddingHorizontal: 20, gap: 8, marginBottom: 12, height: 42 },
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: Radius.full,
        backgroundColor: Colors.bgCard,
        borderWidth: 1.5,
        borderColor: Colors.border,
    },
    filterTabText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
    countBubble: {
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    countText: { fontSize: 10, fontWeight: '800', color: Colors.textSecondary },

    list: { paddingHorizontal: 20, gap: 14, paddingBottom: 100 },

    loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    // Order card
    orderCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
        ...Shadow.card,
    },
    orderTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 14,
        paddingBottom: 10,
    },
    orderTopLeft: { gap: 2 },
    orderTopRight: { alignItems: 'flex-end', gap: 6 },
    orderNum: { fontSize: 12, fontWeight: '800', color: Colors.amber },
    orderCustomer: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
    orderTotal: { fontSize: 18, fontWeight: '900', color: Colors.textPrimary },
    statusBadge: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
    statusText: { fontSize: 11, fontWeight: '700' },

    metaStrip: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        paddingHorizontal: 14,
        paddingBottom: 12,
    },
    metaChip: {
        fontSize: 10,
        fontWeight: '600',
        color: Colors.textSecondary,
        backgroundColor: Colors.bgInput,
        borderRadius: Radius.full,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    itemsList: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        gap: 6,
    },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    foodDotSmall: { width: 8, height: 8, borderRadius: 2 },
    itemName: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
    itemQty: {
        fontSize: 12,
        color: Colors.textMuted,
        fontWeight: '600',
        width: 28,
        textAlign: 'right',
    },
    itemPrice: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.textPrimary,
        width: 56,
        textAlign: 'right',
    },

    totalsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 3,
    },
    totalsLabel: { fontSize: 12, color: Colors.textSecondary },
    totalsValue: { fontSize: 12, color: Colors.textPrimary, fontWeight: '600' },
    totalsFinal: {
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        marginTop: 4,
        paddingTop: 8,
        marginBottom: 4,
    },
    totalsFinalLabel: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
    totalsFinalValue: { fontSize: 16, fontWeight: '900', color: Colors.textPrimary },

    paymentBadge: {
        marginHorizontal: 14,
        marginBottom: 12,
        borderRadius: Radius.sm,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    paymentPaid: { backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#86EFAC' },
    paymentRefunded: { backgroundColor: '#EDE9FE', borderWidth: 1, borderColor: '#C4B5FD' },
    paymentPending: { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A' },
    paymentText: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },

    actionRow: {
        flexDirection: 'row',
        gap: 10,
        padding: 14,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    rejectBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: Radius.md,
        borderWidth: 1.5,
        borderColor: '#FECACA',
        alignItems: 'center',
        backgroundColor: '#FFF1F2',
    },
    rejectBtnText: { fontSize: 13, fontWeight: '700', color: '#DC2626' },
    acceptBtn: {
        flex: 2,
        paddingVertical: 12,
        borderRadius: Radius.md,
        backgroundColor: Colors.amber,
        alignItems: 'center',
        ...Shadow.amber,
    },
    acceptBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },
    btnDisabled: { opacity: 0.6 },

    rejectReason: {
        marginHorizontal: 14,
        marginBottom: 12,
        backgroundColor: '#FEE2E2',
        borderRadius: Radius.sm,
        padding: 8,
    },
    rejectReasonText: { fontSize: 11, color: '#DC2626', fontWeight: '600' },

    emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
    emptyEmoji: { fontSize: 44 },
    emptyText: { fontSize: 15, color: Colors.textMuted, fontWeight: '600' },
});
