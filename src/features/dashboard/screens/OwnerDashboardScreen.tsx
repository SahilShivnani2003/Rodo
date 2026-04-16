import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    Switch,
} from 'react-native';
import { Colors, Radius, Shadow, Fonts } from '@theme/index';
import OrderRow from '../components/OrderRow';
import QuickAction from '../components/QuickAction';
import StatCard from '../components/StatCard';
import { useOwnerRestaurant } from '../hooks/useOwnerRestaurant';
import { useMyOrders } from '../hooks/useMyOrders';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEY } from '@/utils/queryKeys';

export default function OwnerDashboardScreen() {
    const { data, isLoading, error } = useOwnerRestaurant();
    const qc = useQueryClient();
    console.log('Cached data:', qc.getQueryData([QUERY_KEY.OWNER_RESTAURANT]));
    const { data: orders } = useMyOrders();
    console.log('Owner restaurant data:', data);
    const [isOpen, setIsOpen] = useState(data?.isOpen || false);
    const r = data;
    const recetOrders = orders?.slice(0, 5) || [];

    const todayOrders = 38;
    const todayEarnings = 8_420;
    const pendingCount = recetOrders.filter((o: any) => o.status === 'pending').length;

    function formatCurrency(n: number) {
        return `₹${n.toLocaleString('en-IN')}`;
    }

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
                        <Text style={styles.avatarText}>
                            {r.name
                                .split(' ')
                                .slice(0, 2)
                                .map((w: any) => w[0])
                                .join('')}
                        </Text>
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
                            ? `Orders until ${r.openingHours.close}`
                            : 'Toggle to start accepting orders'}
                    </Text>
                </View>
                <Switch
                    value={isOpen}
                    onValueChange={setIsOpen}
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
                    <Text style={styles.allTimeValue}>{r.totalOrders.toLocaleString('en-IN')}</Text>
                    <Text style={styles.allTimeLabel}>Total Orders</Text>
                </View>
                <View style={styles.allTimeDivider} />
                <View style={styles.allTimeStat}>
                    <Text style={styles.allTimeValue}>{formatCurrency(r.totalEarnings)}</Text>
                    <Text style={styles.allTimeLabel}>Total Earnings</Text>
                </View>
                <View style={styles.allTimeDivider} />
                <View style={styles.allTimeStat}>
                    <Text style={styles.allTimeValue}>{r.avgPrepTimeMinutes}m</Text>
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
            <View style={styles.ordersCard}>
                {recetOrders.map((o: any, i: any) => (
                    <React.Fragment key={o.orderNumber}>
                        <OrderRow order={o} />
                        {i < recetOrders.length - 1 && <View style={styles.orderDivider} />}
                    </React.Fragment>
                ))}
            </View>

            {/* ── Restaurant info strip ── */}
            <View style={styles.infoStrip}>
                <Text style={styles.infoChip}>📍 {r.address.city}</Text>
                <Text style={styles.infoChip}>
                    🕐 {r.openingHours.open}–{r.openingHours.close}
                </Text>
                <Text style={styles.infoChip}>
                    {r.isVerified ? '✅ Verified' : '⚠️ Unverified'}
                </Text>
            </View>

            <View style={{ height: 32 }} />
        </ScrollView>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },
    content: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 28 : 60 },

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
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 14,
    },

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
