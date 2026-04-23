import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    StatusBar,
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Modal,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
} from 'react-native';
import { Colors, Radius, Shadow } from '@theme/index';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Order, OrderStatus } from '@/features/orders/types/Order';
import { useGetMyOrders, useRateOrder } from '../hooks/hooks';
import { RootStackParamList } from '@/types/RootStackParamList';

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'active' | 'completed' | 'cancelled';
type OrderHistoryProps = NativeStackScreenProps<RootStackParamList, 'orderHistory'>;

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_TABS: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All Orders' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
];

const ACTIVE_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready'];
const CANCELLED_STATUSES: OrderStatus[] = ['cancelled', 'rejected'];

const STATUS_CONFIG: Record<
    OrderStatus,
    { label: string; icon: string; color: string; bg: string }
> = {
    pending: { label: 'Order Sent', icon: '📨', color: '#D97706', bg: '#FEF3C7' },
    confirmed: { label: 'Confirmed', icon: '✅', color: '#059669', bg: '#D1FAE5' },
    preparing: { label: 'Preparing', icon: '🧑‍🍳', color: '#D97706', bg: '#FEF3C7' },
    ready: { label: 'Ready', icon: '🍽️', color: '#7C3AED', bg: '#EDE9FE' },
    completed: { label: 'Completed', icon: '🎉', color: '#15803D', bg: '#DCFCE7' },
    cancelled: { label: 'Cancelled', icon: '🚫', color: '#B91C1C', bg: '#FEE2E2' },
    rejected: { label: 'Rejected', icon: '❌', color: '#B91C1C', bg: '#FEE2E2' },
};

const STAR_LABELS: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Great',
    5: 'Excellent!',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso?: string): string => {
    if (!iso) return '';
    try {
        const d = new Date(iso);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return '';
    }
};

const formatTime = (iso?: string): string => {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
};

const getRestaurantName = (order: Order): string => {
    if (!order.restaurant) return 'Restaurant';
    if (typeof order.restaurant === 'object') return order.restaurant.name;
    return 'Restaurant';
};

const getItemsSummary = (order: Order): string => {
    const total = order.items.reduce((sum, i) => sum + i.quantity, 0);
    const first = order.items[0];
    if (!first) return '';
    if (order.items.length === 1) return `${first.name} × ${first.quantity}`;
    return `${first.name} × ${first.quantity} + ${total - first.quantity} more`;
};

const groupOrdersByDate = (orders: Order[]): { date: string; data: Order[] }[] => {
    const map = new Map<string, Order[]>();
    for (const order of orders) {
        const key = formatDate(order.createdAt);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(order);
    }
    return Array.from(map.entries()).map(([date, data]) => ({ date, data }));
};

const filterOrders = (orders: Order[], filter: FilterTab): Order[] => {
    switch (filter) {
        case 'active':
            return orders.filter(o => ACTIVE_STATUSES.includes(o.status));
        case 'completed':
            return orders.filter(o => o.status === 'completed');
        case 'cancelled':
            return orders.filter(o => CANCELLED_STATUSES.includes(o.status));
        default:
            return orders;
    }
};

// ─── Rating Modal ─────────────────────────────────────────────────────────────

interface RatingModalProps {
    order: Order | null;
    onClose: () => void;
    onSubmit: (stars: number, comment: string) => void;
    isSubmitting: boolean;
}

const RatingModal = ({ order, onClose, onSubmit, isSubmitting }: RatingModalProps) => {
    const [stars, setStars] = useState(0);
    const [comment, setComment] = useState('');

    const handleClose = () => {
        setStars(0);
        setComment('');
        onClose();
    };

    const handleSubmit = () => {
        if (stars === 0) return;
        onSubmit(stars, comment);
    };

    if (!order) return null;

    const restaurantName = getRestaurantName(order);
    const summary = getItemsSummary(order);

    return (
        <Modal
            visible={!!order}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <Pressable style={styles.backdrop} onPress={handleClose} />

                <View style={styles.sheet}>
                    {/* Handle */}
                    <View style={styles.sheetHandle} />

                    {/* Header */}
                    <View style={styles.sheetHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.sheetTitle}>Rate your order</Text>
                            <Text style={styles.sheetSubtitle} numberOfLines={1}>
                                {restaurantName} · #{order.orderNumber ?? '—'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={handleClose}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.closeBtnText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Items summary chip */}
                    <View style={styles.orderChip}>
                        <Text style={{ fontSize: 14 }}>🍽️</Text>
                        <Text style={styles.orderChipText} numberOfLines={1}>
                            {summary}
                        </Text>
                        <Text style={styles.orderChipAmount}>₹{order.totalAmount}</Text>
                    </View>

                    {/* Stars */}
                    <View style={styles.starsSection}>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map(n => (
                                <TouchableOpacity
                                    key={n}
                                    onPress={() => setStars(n)}
                                    activeOpacity={0.7}
                                    style={styles.starBtn}
                                >
                                    <Text
                                        style={[
                                            styles.starIcon,
                                            n <= stars && styles.starIconActive,
                                        ]}
                                    >
                                        ★
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {stars > 0 && <Text style={styles.starLabel}>{STAR_LABELS[stars]}</Text>}
                    </View>

                    {/* Comment */}
                    <View style={styles.commentWrap}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Share your experience (optional)…"
                            placeholderTextColor={Colors.textMuted}
                            multiline
                            numberOfLines={3}
                            maxLength={300}
                            value={comment}
                            onChangeText={setComment}
                            textAlignVertical="top"
                        />
                        <Text style={styles.charCount}>{comment.length}/300</Text>
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        style={[
                            styles.submitBtn,
                            (stars === 0 || isSubmitting) && styles.submitBtnDisabled,
                        ]}
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                        disabled={stars === 0 || isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.submitBtnText}>
                                {stars === 0 ? 'Select a rating to continue' : 'Submit Rating'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

// ─── Order Card ───────────────────────────────────────────────────────────────

interface OrderCardProps {
    order: Order;
    onPress: () => void;
}

const OrderCard = ({ order, onPress }: OrderCardProps) => {
    const status = STATUS_CONFIG[order.status];
    const isActive = ACTIVE_STATUSES.includes(order.status);
    const isCompleted = order.status === 'completed';
    const restaurantName = getRestaurantName(order);
    const summary = getItemsSummary(order);

    return (
        <TouchableOpacity
            style={[styles.card, isActive && styles.cardActive]}
            onPress={onPress}
            activeOpacity={0.75}
        >
            {isActive && <View style={styles.activeBar} />}

            {/* Top row */}
            <View style={styles.cardHeader}>
                <View style={styles.restIconWrap}>
                    <Text style={{ fontSize: 20 }}>🍽️</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.restName} numberOfLines={1}>
                        {restaurantName}
                    </Text>
                    <Text style={styles.orderMeta}>
                        #{order.orderNumber ?? '—'}
                        {'  ·  '}
                        {order.orderType === 'dine-in' ? 'Dine-in' : 'Takeaway'}
                        {'  ·  '}
                        {formatTime(order.createdAt)}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={{ fontSize: 11 }}>{status.icon}</Text>
                    <Text style={[styles.statusLabel, { color: status.color }]}>
                        {status.label}
                    </Text>
                </View>
            </View>

            <View style={styles.cardDivider} />

            {/* Footer */}
            <View style={styles.cardFooter}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.itemsSummary} numberOfLines={1}>
                        {summary}
                    </Text>
                    <View style={styles.payRow}>
                        <Text style={styles.payInfo}>
                            {order.paymentMethod === 'cash'
                                ? '💵 Pay at restaurant'
                                : order.paymentMethod === 'upi_at_restaurant'
                                ? '📱 UPI at restaurant'
                                : '🔒 Online'}
                        </Text>
                    </View>
                </View>
                <View style={styles.totalBlock}>
                    <Text style={styles.totalAmount}>₹{order.totalAmount}</Text>

                    {/* Active → Track pill */}
                    {isActive && (
                        <View style={styles.trackPill}>
                            <View style={styles.trackDot} />
                            <Text style={styles.trackText}>Track</Text>
                        </View>
                    )}

                    {/* Completed → Rate pill */}
                    {isCompleted && (
                        <View style={styles.ratePill}>
                            <Text style={styles.rateText}>⭐ Rate</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ filter }: { filter: FilterTab }) => {
    const config = {
        all: { icon: '🛒', title: 'No orders yet', sub: 'Your order history will appear here.' },
        active: { icon: '⏳', title: 'No active orders', sub: 'Place an order to track it live.' },
        completed: {
            icon: '🎉',
            title: 'No completed orders',
            sub: 'Your completed meals will show here.',
        },
        cancelled: { icon: '🚫', title: 'No cancelled orders', sub: "You're on a good streak!" },
    };
    const { icon, title, sub } = config[filter];
    return (
        <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>{icon}</Text>
            <Text style={styles.emptyTitle}>{title}</Text>
            <Text style={styles.emptySub}>{sub}</Text>
        </View>
    );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OrderHistoryScreen({ navigation }: OrderHistoryProps) {
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
    const [ratingOrder, setRatingOrder] = useState<Order | null>(null);

    const { data: listData, isLoading, refetch, isRefetching } = useGetMyOrders();
    const { mutate: rateOrder, isPending: isRating } = useRateOrder();

    const allOrders: Order[] = useMemo(() => {
        const raw: Order[] = listData?.data ?? listData ?? [];
        return [...raw].sort(
            (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
        );
    }, [listData]);

    const filtered = useMemo(
        () => filterOrders(allOrders, activeFilter),
        [allOrders, activeFilter],
    );
    const grouped = useMemo(() => groupOrdersByDate(filtered), [filtered]);
    const activeCount = allOrders.filter(o => ACTIVE_STATUSES.includes(o.status)).length;

    const handleCardPress = (order: Order) => {
        if (order.status === 'completed') {
            setRatingOrder(order);
        } else if (ACTIVE_STATUSES.includes(order.status)) {
            (navigation as any)?.navigate?.('orders', { orderId: order.orderNumber });
        }
        // cancelled/rejected — no action
    };

    const handleRatingSubmit = (stars: number, comment: string) => {
        if (!ratingOrder) return;
        rateOrder(
            {
                id: ratingOrder._id ?? ratingOrder.orderNumber ?? '',
                data: { stars: String(stars), comment },
            },
            {
                onSuccess: () => {
                    setRatingOrder(null);
                    refetch();
                },
                onError: () => {
                    // keep modal open so user can retry
                },
            },
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.root, styles.centered]}>
                <StatusBar barStyle="dark-content" backgroundColor={Colors.bgCard} />
                <ActivityIndicator size="large" color={Colors.brandRed} />
                <Text style={[styles.restName, { marginTop: 14 }]}>Loading your orders…</Text>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.bgCard} />

            {/* ── Header ──────────────────────────────────────────────────── */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Order History</Text>
                    {allOrders.length > 0 && (
                        <Text style={styles.headerSub}>{allOrders.length} orders total</Text>
                    )}
                </View>
                <View style={styles.activeBadgeWrap}>
                    {activeCount > 0 ? (
                        <TouchableOpacity
                            style={styles.activeBadge}
                            onPress={() => setActiveFilter('active')}
                        >
                            <View style={styles.activeBadgeDot} />
                            <Text style={styles.activeBadgeText}>{activeCount} live</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 40 }} />
                    )}
                </View>
            </View>

            {/* ── Filter tabs ──────────────────────────────────────────────── */}
            <View style={styles.tabsWrap}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsContent}
                >
                    {FILTER_TABS.map(tab => {
                        const isActive = activeFilter === tab.id;
                        return (
                            <TouchableOpacity
                                key={tab.id}
                                style={[styles.tab, isActive && styles.tabActive]}
                                onPress={() => setActiveFilter(tab.id)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* ── Orders list ──────────────────────────────────────────────── */}
            {filtered.length === 0 ? (
                <EmptyState filter={activeFilter} />
            ) : (
                <FlatList
                    data={grouped}
                    keyExtractor={item => item.date}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetch}
                            tintColor={Colors.amber}
                            colors={[Colors.amber]}
                        />
                    }
                    renderItem={({ item: group }) => (
                        <View>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionDate}>{group.date}</Text>
                                <View style={styles.sectionLine} />
                                <Text style={styles.sectionCount}>{group.data.length}</Text>
                            </View>
                            {group.data.map(order => (
                                <OrderCard
                                    key={order.orderNumber ?? order.createdAt}
                                    order={order}
                                    onPress={() => handleCardPress(order)}
                                />
                            ))}
                        </View>
                    )}
                />
            )}

            {/* ── Rating Modal ─────────────────────────────────────────────── */}
            <RatingModal
                order={ratingOrder}
                onClose={() => setRatingOrder(null)}
                onSubmit={handleRatingSubmit}
                isSubmitting={isRating}
            />
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },
    centered: { alignItems: 'center', justifyContent: 'center' },

    // Header
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
    headerSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
    activeBadgeWrap: { width: 60, alignItems: 'flex-end' },
    activeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#FEF9C3',
        borderRadius: Radius.full,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    activeBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.amber },
    activeBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.amber },

    // Filter tabs
    tabsWrap: {
        backgroundColor: Colors.bgCard,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    tabsContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: Radius.full,
        backgroundColor: Colors.bgElevated,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    tabActive: { backgroundColor: Colors.amberGlow, borderColor: Colors.borderActive },
    tabLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
    tabLabelActive: { color: Colors.amber },

    // List
    listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },

    // Section header
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 16,
        marginBottom: 8,
    },
    sectionDate: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.textMuted,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    sectionLine: { flex: 1, height: 1, backgroundColor: Colors.border },
    sectionCount: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textMuted,
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.full,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },

    // Order card
    card: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.md,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
        ...Shadow.card,
    },
    cardActive: { borderColor: Colors.borderActive, ...Shadow.amber },
    activeBar: { height: 3, backgroundColor: Colors.amber },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 14,
        paddingBottom: 12,
    },
    restIconWrap: {
        width: 44,
        height: 44,
        borderRadius: Radius.sm,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    restName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.2 },
    orderMeta: { fontSize: 11, color: Colors.textMuted, marginTop: 2, fontWeight: '500' },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: Radius.full,
        flexShrink: 0,
    },
    statusLabel: { fontSize: 11, fontWeight: '700' },
    cardDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 14 },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 12,
    },
    itemsSummary: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500', marginBottom: 4 },
    payRow: { flexDirection: 'row', alignItems: 'center' },
    payInfo: { fontSize: 11, color: Colors.textMuted },
    totalBlock: { alignItems: 'flex-end', gap: 6 },
    totalAmount: { fontSize: 16, fontWeight: '800', color: Colors.amber, letterSpacing: -0.5 },
    trackPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: Colors.amberGlow,
        borderRadius: Radius.full,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: Colors.borderActive,
    },
    trackDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.amber },
    trackText: { fontSize: 11, fontWeight: '700', color: Colors.amber },
    ratePill: {
        backgroundColor: '#FEF9C3',
        borderRadius: Radius.full,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    rateText: { fontSize: 11, fontWeight: '700', color: '#B45309' },

    // Empty state
    emptyWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingBottom: 60,
    },
    emptyIcon: { fontSize: 56, marginBottom: 16 },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.3,
        marginBottom: 8,
    },
    emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },

    // Rating Modal
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
    sheet: {
        backgroundColor: Colors.bgCard,
        borderTopLeftRadius: Radius.xl,
        borderTopRightRadius: Radius.xl,
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 28,
        ...Shadow.amber,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.border,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    sheetTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },
    sheetSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 3 },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        marginLeft: 12,
    },
    closeBtnText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '700' },

    orderChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: Colors.bg,
        borderRadius: Radius.sm,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 24,
    },
    orderChipText: { flex: 1, fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
    orderChipAmount: { fontSize: 13, fontWeight: '800', color: Colors.amber },

    starsSection: { alignItems: 'center', marginBottom: 20 },
    starsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    starBtn: { padding: 4 },
    starIcon: { fontSize: 38, color: Colors.border },
    starIconActive: { color: Colors.amber },
    starLabel: { fontSize: 14, fontWeight: '700', color: Colors.amber, letterSpacing: -0.2 },

    commentWrap: {
        backgroundColor: Colors.bgInput,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 16,
        overflow: 'hidden',
    },
    commentInput: {
        fontSize: 14,
        color: Colors.textPrimary,
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 8,
        minHeight: 80,
        fontWeight: '500',
    },
    charCount: {
        fontSize: 11,
        color: Colors.textMuted,
        textAlign: 'right',
        paddingHorizontal: 14,
        paddingBottom: 8,
    },

    submitBtn: {
        backgroundColor: Colors.amber,
        borderRadius: Radius.md,
        paddingVertical: 15,
        alignItems: 'center',
        ...Shadow.amber,
    },
    submitBtnDisabled: {
        backgroundColor: Colors.bgElevated,
        shadowOpacity: 0,
        elevation: 0,
    },
    submitBtnText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },
});
