import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { Colors, Radius, Shadow } from '@theme/index';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList } from '@/types/MainTabParamList';
import { Order, OrderRestaurant, OrderStatus } from '@/features/orders/types/Order';
import { useQueryClient } from '@tanstack/react-query';
import { useGetMyOrderDetail, useGetMyOrders, orderKeys } from '../hooks/hooks';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_STEPS: { id: OrderStatus; label: string; icon: string; desc: string }[] = [
    { id: 'pending', label: 'Order Sent', icon: '📨', desc: 'Restaurant received your order' },
    { id: 'confirmed', label: 'Confirmed', icon: '✅', desc: 'Restaurant confirmed your order' },
    { id: 'preparing', label: 'Preparing', icon: '🧑‍🍳', desc: 'Chef is preparing your food' },
    { id: 'ready', label: 'Ready to Serve', icon: '🍽️', desc: 'Food is ready, come on in!' },
    { id: 'completed', label: 'Completed', icon: '🎉', desc: 'Enjoy your meal!' },
];

// Statuses where we should stop polling
const TERMINAL_STATUSES: OrderStatus[] = ['completed', 'cancelled', 'rejected'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns 'done' | 'active' | 'pending' relative to the current order status */
const getStepState = (stepId: OrderStatus, currentStatus: OrderStatus) => {
    const order: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
    const stepIdx = order.indexOf(stepId);
    const currentIdx = order.indexOf(currentStatus);
    if (stepIdx < currentIdx) return 'done';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
};

const formatTime = (iso?: string) => {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
};

/**
 * The API returns `restaurant` as a populated object { _id, name, coverImage, address }.
 * This helper safely extracts it regardless of whether it's a string ID or a populated object.
 */
const getRestaurantInfo = (restaurant?: string | OrderRestaurant): OrderRestaurant | null => {
    if (!restaurant) return null;
    if (typeof restaurant === 'object') return restaurant;
    return null;
};

// ─── Screen ───────────────────────────────────────────────────────────────────

type OrderProps = NativeStackScreenProps<MainTabParamList, 'orders'>;

export default function OrderTrackingScreen({ navigation, route }: OrderProps) {
    // Support both receiving a fresh orderId from CartScreen and
    // falling back to the most recent order from the list endpoint.
    const orderId = (route?.params as any)?.orderId as string | undefined;

    const {
        data: detailData,
        isLoading: detailLoading,
        refetch: refetchDetail,
    } = useGetMyOrderDetail(orderId ?? '');

    const { data: listData, isLoading: listLoading } = useGetMyOrders();

    const queryClient = useQueryClient();
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Resolve the order to display
    const order: Order | undefined = orderId
        ? detailData?.data ?? detailData
        : (() => {
              const orders: Order[] = listData?.data ?? listData ?? [];
              return [...orders].sort(
                  (a, b) =>
                      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
              )[0];
          })();

    const isLoading = orderId ? detailLoading : listLoading;
    const isTerminal = order ? TERMINAL_STATUSES.includes(order.status) : false;

    // Resolve restaurant info (populated object or null)
    const restaurant = order ? getRestaurantInfo(order.restaurant) : null;

    // ── Poll every 15s until a terminal status is reached ────────────────────
    useEffect(() => {
        if (isTerminal || !order) return;

        pollingRef.current = setInterval(() => {
            if (orderId) {
                refetchDetail();
            } else {
                queryClient.invalidateQueries({ queryKey: orderKeys.myOrders() });
            }
        }, 15_000);

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [isTerminal, order, orderId]);

    // ── Loading state ─────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
                <StatusBar barStyle="dark-content" backgroundColor={Colors.bgCard} />
                <ActivityIndicator size="large" color={Colors.brandRed} />
                <Text style={[styles.cardTitle, { marginTop: 16 }]}>Loading order…</Text>
            </View>
        );
    }

    // ── No order found ────────────────────────────────────────────────────────
    if (!order) {
        return (
            <View
                style={[
                    styles.root,
                    { alignItems: 'center', justifyContent: 'center', padding: 32 },
                ]}
            >
                <StatusBar barStyle="dark-content" backgroundColor={Colors.bgCard} />
                <Text style={{ fontSize: 48, marginBottom: 16 }}>🛒</Text>
                <Text style={styles.cardTitle}>No active orders</Text>
                <Text style={[styles.sumLabel, { textAlign: 'center', marginTop: 8 }]}>
                    Place an order from a restaurant to track it here.
                </Text>
            </View>
        );
    }

    // ── Derived display values ────────────────────────────────────────────────
    const displaySteps =
        order.status === 'cancelled' || order.status === 'rejected'
            ? []
            : STATUS_STEPS.filter(s => s.id !== 'cancelled' && s.id !== 'rejected');

    const etaMinutes = order.etaMinutes ?? 30;
    const distance = order.customerLocation?.distanceFromRestaurantKm
        ? `${order.customerLocation.distanceFromRestaurantKm} km`
        : '—';

    const isFailed = order.status === 'cancelled' || order.status === 'rejected';

    // Format customerETA for display
    const etaDisplay = order.customerETA ? formatTime(order.customerETA) : `${etaMinutes} min`;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.bgCard} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Tracking Order</Text>
                    <Text style={styles.headerSub}>#{order.orderNumber ?? '—'}</Text>
                </View>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() =>
                        orderId
                            ? refetchDetail()
                            : queryClient.invalidateQueries({ queryKey: orderKeys.myOrders() })
                    }
                >
                    <Text style={{ fontSize: 16 }}>↻</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Cancelled / Rejected banner */}
                {isFailed && (
                    <View style={styles.failedBanner}>
                        <Text style={styles.failedIcon}>
                            {order.status === 'rejected' ? '❌' : '🚫'}
                        </Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.failedTitle}>
                                Order {order.status === 'rejected' ? 'Rejected' : 'Cancelled'}
                            </Text>
                            {order.rejectionReason && (
                                <Text style={styles.failedReason}>{order.rejectionReason}</Text>
                            )}
                        </View>
                    </View>
                )}

                {/* Restaurant row */}
                <View style={styles.restRow}>
                    <View style={styles.restIcon}>
                        <Text style={{ fontSize: 22 }}>🍽️</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.restName}>{restaurant?.name ?? 'Restaurant'}</Text>
                        <Text style={styles.restSub}>
                            {restaurant?.address?.city ? `📍 ${restaurant.address.city}` : ''}
                            {restaurant?.address?.city ? ' · ' : ''}
                            {order.orderType === 'dine-in' ? '🍽️ Dine-in' : '🛍️ Takeaway'}
                            {order.createdAt ? ` · Placed ${formatTime(order.createdAt)}` : ''}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.navBtn}>
                        <Text style={{ fontSize: 16 }}>🗺️</Text>
                        <Text style={styles.navBtnText}>Navigate</Text>
                    </TouchableOpacity>
                </View>

                {/* ETA card */}
                {!isFailed && (
                    <View style={styles.etaCard}>
                        <View style={styles.etaGlow} />
                        {[
                            { val: `${etaMinutes} min`, label: 'Food Ready In' },
                            { val: etaDisplay, label: 'Your Arrival' },
                            { val: distance, label: 'Distance' },
                        ].map((m, i) => (
                            <React.Fragment key={m.label}>
                                {i > 0 && <View style={styles.etaSep} />}
                                <View style={styles.etaItem}>
                                    <Text style={styles.etaVal}>{m.val}</Text>
                                    <Text style={styles.etaLabel}>{m.label}</Text>
                                </View>
                            </React.Fragment>
                        ))}
                    </View>
                )}

                {/* Status timeline */}
                {!isFailed && (
                    <View style={styles.card}>
                        <View style={styles.cardTitleRow}>
                            <Text style={styles.cardTitle}>Order Status</Text>
                            {!isTerminal && (
                                <View style={styles.livePill}>
                                    <View style={styles.liveDot} />
                                    <Text style={styles.liveText}>Live</Text>
                                </View>
                            )}
                        </View>
                        {displaySteps.map((step, i) => {
                            const state = getStepState(step.id, order.status);
                            const historyEntry = order.statusHistory?.find(
                                h => h.status === step.id,
                            );
                            return (
                                <View key={step.id}>
                                    {i > 0 && (
                                        <View
                                            style={[
                                                styles.tlConnector,
                                                state !== 'pending' && styles.tlConnectorDone,
                                            ]}
                                        />
                                    )}
                                    <View style={styles.tlStep}>
                                        <View
                                            style={[
                                                styles.tlIconWrap,
                                                state === 'done' && styles.tlDone,
                                                state === 'active' && styles.tlActive,
                                                state === 'pending' && styles.tlPending,
                                            ]}
                                        >
                                            <Text style={styles.tlIcon}>
                                                {state === 'done' ? '✓' : step.icon}
                                            </Text>
                                        </View>
                                        <View style={styles.tlText}>
                                            <View style={styles.tlLabelRow}>
                                                <Text
                                                    style={[
                                                        styles.tlLabel,
                                                        state === 'active' && styles.tlLabelActive,
                                                        state === 'pending' &&
                                                            styles.tlLabelPending,
                                                    ]}
                                                >
                                                    {step.label}
                                                </Text>
                                                {historyEntry && (
                                                    <Text style={styles.tlTime}>
                                                        {formatTime(historyEntry.timestamp)}
                                                    </Text>
                                                )}
                                            </View>
                                            {state !== 'pending' && (
                                                <Text style={styles.tlDesc}>
                                                    {historyEntry?.note || step.desc}
                                                </Text>
                                            )}
                                            {state === 'active' && (
                                                <View style={styles.activePill}>
                                                    <View style={styles.activeDot} />
                                                    <Text style={styles.activeText}>
                                                        In progress
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Order summary */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Order Summary</Text>
                    {order.items.map((item, i) => (
                        <View key={i} style={styles.sumRow}>
                            <Text style={styles.sumItem}>
                                {item.name} × {item.quantity}
                            </Text>
                            <Text style={styles.sumValue}>₹{item.price * item.quantity}</Text>
                        </View>
                    ))}
                    <View style={styles.sumDivider} />
                    <View style={styles.sumRow}>
                        <Text style={styles.sumLabel}>GST ({order.gstRate}%)</Text>
                        <Text style={styles.sumValue}>₹{order.gstAmount}</Text>
                    </View>
                    {order.discount > 0 && (
                        <View style={styles.sumRow}>
                            <Text style={[styles.sumLabel, { color: Colors.vegGreen }]}>
                                Discount {order.couponCode ? `(${order.couponCode})` : ''}
                            </Text>
                            <Text style={[styles.sumValue, { color: Colors.vegGreen }]}>
                                −₹{order.discount}
                            </Text>
                        </View>
                    )}
                    <View style={[styles.sumDivider, { height: 2 }]} />
                    <View style={styles.sumRow}>
                        <Text style={styles.sumTotalLabel}>Total</Text>
                        <Text style={styles.sumTotalValue}>₹{order.totalAmount}</Text>
                    </View>
                    <View style={styles.paymentRow}>
                        <View style={styles.payBadge}>
                            <Text style={{ fontSize: 12 }}>💵</Text>
                            <Text style={styles.payText}>
                                {order.paymentMethod === 'cash'
                                    ? 'Pay at Restaurant'
                                    : order.paymentMethod === 'upi_at_restaurant'
                                    ? 'UPI at Restaurant'
                                    : 'Online Payment'}
                            </Text>
                        </View>
                        <View style={styles.payBadge}>
                            <Text style={styles.payText}>
                                {order.orderType === 'dine-in' ? 'Dine-in' : 'Takeaway'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Support */}
                <View style={styles.supportRow}>
                    <TouchableOpacity style={styles.supportBtn}>
                        <Text style={{ fontSize: 22 }}>💬</Text>
                        <Text style={styles.supportText}>WhatsApp</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.supportBtn}>
                        <Text style={{ fontSize: 22 }}>✉️</Text>
                        <Text style={styles.supportText}>Email Support</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },
    scroll: { flex: 1 },
    scrollContent: { padding: 20 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 24 : 56,
        paddingBottom: 14,
        backgroundColor: Colors.bgCard,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: { fontSize: 18, color: Colors.textPrimary, fontWeight: '700' },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.3,
    },
    headerSub: { fontSize: 11, color: Colors.textSecondary },

    failedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#FEF2F2',
        borderRadius: Radius.md,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FCA5A5',
    },
    failedIcon: { fontSize: 24 },
    failedTitle: { fontSize: 14, fontWeight: '700', color: Colors.redPin },
    failedReason: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

    restRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.md,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.card,
    },
    restIcon: {
        width: 48,
        height: 48,
        borderRadius: Radius.sm,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    restName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.2 },
    restSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
    navBtn: {
        backgroundColor: Colors.amberGlow,
        borderRadius: Radius.sm,
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignItems: 'center',
        gap: 3,
        borderWidth: 1,
        borderColor: Colors.borderActive,
    },
    navBtnText: { fontSize: 10, color: Colors.amber, fontWeight: '700' },

    etaCard: {
        flexDirection: 'row',
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.md,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1.5,
        borderColor: Colors.borderActive,
        overflow: 'hidden',
        ...Shadow.amber,
    },
    etaGlow: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.amberGlow,
    },
    etaItem: { flex: 1, alignItems: 'center', gap: 4 },
    etaVal: { fontSize: 20, fontWeight: '800', color: Colors.amber, letterSpacing: -0.5 },
    etaLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center' },
    etaSep: { width: 1, height: 36, backgroundColor: Colors.border },

    card: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.md,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.card,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    cardTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
    livePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#FEF9C3',
        borderRadius: Radius.full,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.amber },
    liveText: { fontSize: 10, fontWeight: '700', color: Colors.amber },

    tlConnector: {
        width: 2,
        height: 20,
        backgroundColor: Colors.border,
        marginLeft: 19,
        marginVertical: 2,
    },
    tlConnectorDone: { backgroundColor: Colors.amber },
    tlStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
    tlIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        flexShrink: 0,
    },
    tlDone: { backgroundColor: Colors.successGreen, borderColor: Colors.successGreen },
    tlActive: { backgroundColor: Colors.amberGlow, borderColor: Colors.amber },
    tlPending: { backgroundColor: Colors.bgElevated, borderColor: Colors.border, opacity: 0.5 },
    tlIcon: { fontSize: 16 },
    tlText: { flex: 1, paddingTop: 8 },
    tlLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    tlLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.2 },
    tlLabelActive: { color: Colors.amber },
    tlLabelPending: { color: Colors.textMuted },
    tlTime: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
    tlDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
    activePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
        backgroundColor: Colors.amberGlow,
        alignSelf: 'flex-start',
        borderRadius: Radius.full,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: Colors.borderActive,
    },
    activeDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.amber },
    activeText: { fontSize: 11, color: Colors.amber, fontWeight: '700' },

    sumRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
    sumItem: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
    sumLabel: { fontSize: 13, color: Colors.textSecondary },
    sumValue: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
    sumDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
    sumTotalLabel: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
    sumTotalValue: { fontSize: 16, fontWeight: '800', color: Colors.amber },
    paymentRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
    payBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.full,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    payText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },

    supportRow: { flexDirection: 'row', gap: 10 },
    supportBtn: {
        flex: 1,
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.md,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 5,
        ...Shadow.card,
    },
    supportText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
});
