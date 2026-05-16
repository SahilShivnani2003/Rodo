import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    StatusBar,
    ActivityIndicator,
    Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { Colors, Radius, Shadow } from '@theme/index';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList } from '@/types/MainTabParamList';
import { Order, OrderRestaurant, OrderStatus } from '@/features/orders/types/Order';
import { useQueryClient } from '@tanstack/react-query';
import { useGetMyOrderDetail, useGetMyOrders, orderKeys } from '../hooks/hooks';
import { useGetResById } from '@/features/menu/hooks/useGetResById';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_STEPS: {
    id: OrderStatus;
    label: string;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
    desc: string;
}[] = [
    {
        id: 'pending',
        label: 'Order Sent',
        icon: <MaterialIcon name="send" size={16} color={Colors.textMuted} />,
        activeIcon: <MaterialIcon name="send" size={16} color={Colors.amber} />,
        desc: 'Restaurant received your order',
    },
    {
        id: 'confirmed',
        label: 'Confirmed',
        icon: <Icon name="checkmark-circle-outline" size={16} color={Colors.textMuted} />,
        activeIcon: <Icon name="checkmark-circle" size={16} color={Colors.amber} />,
        desc: 'Restaurant confirmed your order',
    },
    {
        id: 'preparing',
        label: 'Preparing',
        icon: <MaterialCommunityIcon name="chef-hat" size={16} color={Colors.textMuted} />,
        activeIcon: <MaterialCommunityIcon name="chef-hat" size={16} color={Colors.amber} />,
        desc: 'Chef is preparing your food',
    },
    {
        id: 'ready',
        label: 'Ready to Serve',
        icon: (
            <MaterialCommunityIcon
                name="silverware-fork-knife"
                size={16}
                color={Colors.textMuted}
            />
        ),
        activeIcon: (
            <MaterialCommunityIcon name="silverware-fork-knife" size={16} color={Colors.amber} />
        ),
        desc: 'Food is ready, come on in!',
    },
    {
        id: 'completed',
        label: 'Completed',
        icon: <MaterialIcon name="celebration" size={16} color={Colors.textMuted} />,
        activeIcon: <MaterialIcon name="celebration" size={16} color={Colors.amber} />,
        desc: 'Enjoy your meal!',
    },
];

// Statuses where we should stop polling
const TERMINAL_STATUSES: OrderStatus[] = ['completed', 'cancelled', 'rejected'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const getRestaurantInfo = (restaurant?: string | OrderRestaurant): OrderRestaurant | null => {
    if (!restaurant) return null;
    if (typeof restaurant === 'object') return restaurant;
    return null;
};

// ─── Screen ───────────────────────────────────────────────────────────────────

type OrderProps = NativeStackScreenProps<MainTabParamList, 'orders'>;

export default function OrderTrackingScreen({ navigation, route }: OrderProps) {
    const orderId = route.params?.orderId;

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
    const [isRefreshing, setIsRefreshing] = useState(false);

    const orderRestaurant = getRestaurantInfo(order?.restaurant);
    const restaurantId = orderRestaurant?._id;

    const {
        data: restaurantData,
        isLoading: restaurantLoading,
        refetch: refetchRestaurant,
    } = useGetResById(restaurantId ?? '');
    // Resolve restaurant info (populated object or null)
    const restaurant = restaurantData?.data?.restaurant;

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
    }, [isTerminal, order, orderId, refetchDetail, queryClient]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([refetchDetail(), refetchRestaurant()]);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleNavigate = () => {
        const coords = restaurant?.location?.coordinates;
        if (!coords || coords.length < 2) return;
        const [lng, lat] = coords; // GeoJSON order: [longitude, latitude]
        Linking.openURL(`google.navigation:q=${lat},${lng}&mode=d`);
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (isLoading || isRefreshing) {
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
                <MaterialCommunityIcon
                    name="cart-outline"
                    size={56}
                    color={Colors.textMuted}
                    style={{ marginBottom: 16 }}
                />
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
    const etaDisplay = order.customerETA ? formatTime(order.customerETA) : `${etaMinutes} min`;

    const paymentLabel =
        order.paymentMethod === 'cash'
            ? 'Pay at Restaurant'
            : order.paymentMethod === 'upi_at_restaurant'
            ? 'UPI at Restaurant'
            : 'Online Payment';

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.bgCard} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => navigation?.goBack?.()}>
                    <Icon name="arrow-back" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Tracking Order</Text>
                    <Text style={styles.headerSub}>#{order.orderNumber ?? '—'}</Text>
                </View>
                <TouchableOpacity
                    style={styles.headerBtn}
                    onPress={handleRefresh}
                    disabled={isRefreshing}
                >
                    {isRefreshing ? (
                        <ActivityIndicator size="small" color={Colors.brandRed} />
                    ) : (
                        <Icon name="refresh" size={20} color={Colors.textPrimary} />
                    )}
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
                        <MaterialIcon
                            name={order.status === 'rejected' ? 'cancel' : 'block'}
                            size={24}
                            color={Colors.redPin}
                        />
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
                        <MaterialCommunityIcon
                            name="silverware-fork-knife"
                            size={22}
                            color={Colors.amber}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.restName}>{restaurant?.name ?? 'Restaurant'}</Text>
                        <View style={styles.restSubRow}>
                            {!!restaurant?.address?.city && (
                                <>
                                    <Icon
                                        name="location-sharp"
                                        size={11}
                                        color={Colors.textSecondary}
                                    />
                                    <Text style={styles.restSub}>{restaurant.address.city}</Text>
                                    <Text style={styles.restSubDot}>·</Text>
                                </>
                            )}
                            <MaterialCommunityIcon
                                name={order.orderType === 'dine-in' ? 'silverware' : 'shopping'}
                                size={11}
                                color={Colors.textSecondary}
                            />
                            <Text style={styles.restSub}>
                                {order.orderType === 'dine-in' ? 'Dine-in' : 'Takeaway'}
                            </Text>
                            {!!order.createdAt && (
                                <>
                                    <Text style={styles.restSubDot}>·</Text>
                                    <Text style={styles.restSub}>
                                        Placed {formatTime(order.createdAt)}
                                    </Text>
                                </>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity style={styles.navBtn} onPress={handleNavigate}>
                        <Icon name="navigate" size={16} color={Colors.amber} />
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
                                            {state === 'done' ? (
                                                <Icon name="checkmark" size={18} color="#FFFFFF" />
                                            ) : state === 'active' ? (
                                                step.activeIcon
                                            ) : (
                                                step.icon
                                            )}
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
                            <MaterialIcon name="payments" size={13} color={Colors.textSecondary} />
                            <Text style={styles.payText}>{paymentLabel}</Text>
                        </View>
                        <View style={styles.payBadge}>
                            <MaterialCommunityIcon
                                name={order.orderType === 'dine-in' ? 'silverware' : 'shopping'}
                                size={13}
                                color={Colors.textSecondary}
                            />
                            <Text style={styles.payText}>
                                {order.orderType === 'dine-in' ? 'Dine-in' : 'Takeaway'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Support */}
                <View style={styles.supportRow}>
                    <TouchableOpacity style={styles.supportBtn}>
                        <FontAwesome5Icon name="whatsapp" size={22} color="#25D366" />
                        <Text style={styles.supportText}>WhatsApp</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.supportBtn}>
                        <MaterialIcon name="mail-outline" size={22} color={Colors.textSecondary} />
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
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
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
    restSubRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 4,
        marginTop: 3,
    },
    restSub: { fontSize: 11, color: Colors.textSecondary },
    restSubDot: { fontSize: 11, color: Colors.textMuted },
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
