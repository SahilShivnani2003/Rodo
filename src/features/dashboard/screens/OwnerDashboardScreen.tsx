import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    Switch,
    ActivityIndicator,
} from 'react-native';
import { Colors, Radius, Shadow, Fonts } from '@theme/index';
import OrderRow from '../components/OrderRow';
import QuickAction from '../components/QuickAction';
import StatCard from '../components/StatCard';
import { useOwnerRestaurant } from '../hooks/useOwnerRestaurant';
import { useMyOrders } from '../hooks/useMyOrders';
import { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import { OwnerTabParamList } from '@/types/OwnerTabParamList';
import { useRestaurantEarnings } from '../hooks/useRestaurantEarnings';
import { useUpdateStatus } from '../hooks/useUpdateStatus';

type ownerDashboardProps = NativeBottomTabScreenProps<OwnerTabParamList, 'dashboard'>;

// ─── Skeleton Block ───────────────────────────────────────────────────────────
function SkeletonBlock({
    width = '100%',
    height = 16,
    borderRadius = 8,
    style,
}: {
    width?: string | number;
    height?: number;
    borderRadius?: number;
    style?: object;
}) {
    return (
        <View
            style={[
                {
                    width: width as any,
                    height,
                    borderRadius,
                    backgroundColor: Colors.border,
                    opacity: 0.6,
                },
                style,
            ]}
        />
    );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function DashboardSkeleton() {
    return (
        <ScrollView
            style={styles.root}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
        >
            {/* Header skeleton */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <SkeletonBlock width={46} height={46} borderRadius={23} />
                    <View style={{ gap: 6 }}>
                        <SkeletonBlock width={90} height={12} />
                        <SkeletonBlock width={150} height={15} />
                    </View>
                </View>
                <SkeletonBlock width={32} height={32} borderRadius={16} />
            </View>

            {/* Status banner skeleton */}
            <SkeletonBlock height={74} borderRadius={Radius.lg} style={{ marginBottom: 24 }} />

            {/* Section title */}
            <SkeletonBlock width={140} height={16} style={{ marginBottom: 12 }} />

            {/* Stats grid skeleton */}
            <View style={styles.statsGrid}>
                {[...Array(4)].map((_, i) => (
                    <SkeletonBlock key={i} width={'47%'} height={80} borderRadius={Radius.lg} />
                ))}
            </View>

            {/* All-time card skeleton */}
            <SkeletonBlock height={74} borderRadius={Radius.lg} style={{ marginBottom: 24 }} />

            {/* Quick actions skeleton */}
            <SkeletonBlock width={140} height={16} style={{ marginBottom: 12 }} />
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
                {[...Array(4)].map((_, i) => (
                    <SkeletonBlock key={i} width={70} height={70} borderRadius={Radius.lg} />
                ))}
            </View>

            {/* Recent orders skeleton */}
            <SkeletonBlock width={140} height={16} style={{ marginBottom: 12 }} />
            <View style={styles.ordersCard}>
                {[...Array(3)].map((_, i) => (
                    <React.Fragment key={i}>
                        <View style={{ padding: 14, gap: 8 }}>
                            <SkeletonBlock width={'60%'} height={13} />
                            <SkeletonBlock width={'40%'} height={11} />
                        </View>
                        {i < 2 && <View style={styles.orderDivider} />}
                    </React.Fragment>
                ))}
            </View>
        </ScrollView>
    );
}

// ─── Error State ──────────────────────────────────────────────────────────────
function DashboardError({ onRetry }: { onRetry: () => void }) {
    return (
        <View style={styles.centerState}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
            <Text style={styles.errorTitle}>Couldn't load dashboard</Text>
            <Text style={styles.errorSub}>Check your connection and try again.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
                <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function OwnerDashboardScreen({ navigation }: ownerDashboardProps) {
    const { data, isLoading, error, refetch } = useOwnerRestaurant();
    const { data: orders } = useMyOrders();
    const {data: earnings} = useRestaurantEarnings();
    const {mutate: toggleStatus} = useUpdateStatus();
    // ✅ Fix: don't initialise from data (it's undefined on mount)
    const [isOpen, setIsOpen] = useState(false);

    // ✅ Fix: sync toggle once data arrives
    useEffect(() => {
        if (data?.data?.restaurant?.isOpen !== undefined) {
            setIsOpen(data.data.restaurant.isOpen);
        }
    }, [data?.data?.restaurant?.isOpen]);

    // ── Loading ──
    if (isLoading) return <DashboardSkeleton />;

    // ── Error ──
    if (error || !data) return <DashboardError onRetry={refetch} />;

    // ── Safe to destructure ──
    const r = data?.data?.restaurant;
    const recentOrders = orders?.data?.slice(0, 5) ?? [];

    const todayOrders = recentOrders.length; 
    const todayEarnings = earnings?.data?.today?.total ?? 0;
    const pendingCount = recentOrders.filter((o: any) => o.status === 'pending').length;

    function formatCurrency(n: number) {
        return `₹${n.toLocaleString('en-IN')}`;
    }

    const handleToggleStatus = () => {
        toggleStatus();
        setIsOpen(prev => !prev);
    }
    const initials = r.name
        .split(' ')
        .slice(0, 2)
        .map((w: string) => w[0])
        .join('');

    return (
        <ScrollView
            style={styles.root}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* ── Header ── */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <View>
                        <Text style={styles.greeting}>Good morning 👋</Text>
                        <Text style={styles.restaurantName} numberOfLines={1}>
                            {r.name}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.notifBtn}>
                    <Text style={{ fontSize: 20 }}>🔔</Text>
                    <View style={styles.notifDot} />
                </TouchableOpacity>
            </View>

            {/* ── Open/Close toggle ── */}
            <View
                style={[
                    styles.statusBanner,
                    isOpen ? styles.statusBannerOpen : styles.statusBannerClosed,
                ]}
            >
                <View>
                    <Text style={styles.statusBannerTitle}>
                        {isOpen ? '🟢  Restaurant is Open' : '🔴  Restaurant is Closed'}
                    </Text>
                    <Text style={styles.statusBannerSub}>
                        {isOpen
                            ? `Orders until ${r.openingHours?.close ?? '--'}`
                            : 'Toggle to start accepting orders'}
                    </Text>
                </View>
                <Switch
                    value={isOpen}
                    onValueChange={handleToggleStatus}
                    trackColor={{ false: '#FECACA', true: '#86EFAC' }}
                    thumbColor={isOpen ? Colors.successGreen : '#EF4444'}
                />
            </View>

            {/* ── Today's stats ── */}
            <Text style={styles.sectionTitle}>Today's Overview</Text>
            <View style={styles.statsGrid}>
                <StatCard
                    emoji="🧾"
                    label="Orders"
                    value={String(todayOrders)}
                    sub="Today"
                    accent
                />
                <StatCard
                    emoji="💰"
                    label="Earnings"
                    value={formatCurrency(todayEarnings)}
                    sub="Today"
                />
                <StatCard
                    emoji="⏳"
                    label="Pending"
                    value={String(pendingCount)}
                    sub="Need action"
                />
                <StatCard
                    emoji="⭐"
                    label="Rating"
                    value={`${r.rating}`}
                    sub={`${r.totalRatings} reviews`}
                />
            </View>

            {/* ── All-time stats ── */}
            <View style={styles.allTimeCard}>
                <View style={styles.allTimeStat}>
                    <Text style={styles.allTimeValue}>
                        {r.totalOrders?.toLocaleString('en-IN') ?? '–'}
                    </Text>
                    <Text style={styles.allTimeLabel}>Total Orders</Text>
                </View>
                <View style={styles.allTimeDivider} />
                <View style={styles.allTimeStat}>
                    <Text style={styles.allTimeValue}>
                        {r.totalEarnings != null ? formatCurrency(r.totalEarnings) : '–'}
                    </Text>
                    <Text style={styles.allTimeLabel}>Total Earnings</Text>
                </View>
                <View style={styles.allTimeDivider} />
                <View style={styles.allTimeStat}>
                    <Text style={styles.allTimeValue}>
                        {r.avgPrepTimeMinutes != null ? `${r.avgPrepTimeMinutes}m` : '–'}
                    </Text>
                    <Text style={styles.allTimeLabel}>Avg Prep Time</Text>
                </View>
            </View>

            {/* ── Quick actions ── */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
                <QuickAction emoji="➕" label="Add Item" />
                <QuickAction emoji="📋" label="View Menu" />
                <QuickAction emoji="🏷" label="New Coupon" />
                <QuickAction emoji="📊" label="Reports" />
            </View>

            {/* ── Recent orders ── */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Orders</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAll}>See all →</Text>
                </TouchableOpacity>
            </View>

            {recentOrders.length === 0 ? (
                <View style={styles.emptyOrders}>
                    <Text style={styles.emptyOrdersText}>🛒 No orders yet today</Text>
                </View>
            ) : (
                <View style={styles.ordersCard}>
                    {recentOrders.map((o: any, i: number) => (
                        <React.Fragment key={o.orderNumber}>
                            <OrderRow order={o} />
                            {i < recentOrders.length - 1 && <View style={styles.orderDivider} />}
                        </React.Fragment>
                    ))}
                </View>
            )}

            {/* ── Restaurant info strip ── */}
            <View style={styles.infoStrip}>
                <Text style={styles.infoChip}>📍 {r.address?.city ?? '–'}</Text>
                <Text style={styles.infoChip}>
                    🕐 {r.openingHours?.open ?? '–'}–{r.openingHours?.close ?? '–'}
                </Text>
                <Text style={styles.infoChip}>
                    {r.isVerified ? '✅ Verified' : '⚠️ Unverified'}
                </Text>
            </View>

            <View style={{ height: 32 }} />
        </ScrollView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },
    content: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 28 : 60 },

    // Center states (loading fallback / error)
    centerState: {
        flex: 1,
        backgroundColor: Colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    errorTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
    errorSub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginBottom: 20 },
    retryBtn: {
        backgroundColor: Colors.amber,
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: Radius.full,
    },
    retryBtnText: { fontSize: 14, fontWeight: '800', color: Colors.textOnAmber },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    avatarCircle: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: Colors.amber,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadow.amber,
    },
    avatarText: { fontSize: 16, fontWeight: '900', color: Colors.textOnAmber },
    greeting: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
    restaurantName: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, maxWidth: 200 },
    notifBtn: { position: 'relative', padding: 4 },
    notifDot: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.brandRed,
        borderWidth: 1.5,
        borderColor: Colors.bg,
    },

    // Status banner
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: Radius.lg,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
    },
    statusBannerOpen: { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' },
    statusBannerClosed: { backgroundColor: '#FFF1F2', borderColor: '#FECACA' },
    statusBannerTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    statusBannerSub: { fontSize: 12, color: Colors.textSecondary },

    // Section
    sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    seeAll: { fontSize: 13, color: Colors.amber, fontWeight: '700' },

    // Stats grid
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },

    // Orders
    ordersCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
        ...Shadow.card,
        marginBottom: 20,
    },
    orderDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 14 },
    emptyOrders: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyOrdersText: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },

    // Quick actions
    quickActions: { flexDirection: 'row', gap: 10, marginBottom: 24 },

    // All-time
    allTimeCard: {
        flexDirection: 'row',
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 24,
        ...Shadow.card,
    },
    allTimeStat: { flex: 1, alignItems: 'center' },
    allTimeDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },
    allTimeValue: { fontSize: 16, fontWeight: '900', color: Colors.textPrimary },
    allTimeLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600', marginTop: 3 },

    // Info strip
    infoStrip: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    infoChip: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.textSecondary,
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.full,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: Colors.border,
    },
});
