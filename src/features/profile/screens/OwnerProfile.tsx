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
import { Colors, Radius, Shadow } from '@theme/index';
import { Restaurant } from '@/features/restaurant/types/Restaurant';
import { useAuthStore } from '@/store/useAuthStore';
import { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import { OwnerTabParamList } from '@/types/OwnerTabParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_RESTAURANT: Restaurant = {
    owner: 'u1',
    name: 'Highway Grill & Bar-B-Q',
    description: 'Authentic highway-side grills and BBQ platters served fresh since 2019',
    phone: '8800000005',
    email: 'hgbbq@rodo.in',
    address: { street: 'NH-46 Bypass, Near Toll', city: 'Sehore', state: 'MP', pincode: '466001' },
    location: { type: 'Point', coordinates: [77.085, 23.201] },
    foodType: 'non-veg',
    cuisines: ['North Indian', 'BBQ', 'Mughlai'],
    rating: 4.3,
    totalRatings: 218,
    isOpen: true,
    isActive: true,
    isVerified: true,
    openingHours: { open: '10:00', close: '23:00' },
    gstNumber: '23AABCH1234Q1ZX',
    gstRate: 5,
    avgPrepTimeMinutes: 18,
    totalOrders: 1342,
    totalEarnings: 284600,
    routes: ['Bhopal–Sehore', 'Sehore–Ashta'],
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2025-04-01T08:00:00Z',
};

// ─── Sub-components ──────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>{icon}</Text>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );
}

function SettingRow({
    icon,
    label,
    sub,
    value,
    onValueChange,
    onPress,
    danger,
}: {
    icon: string;
    label: string;
    sub?: string;
    value?: boolean;
    onValueChange?: (v: boolean) => void;
    onPress?: () => void;
    danger?: boolean;
}) {
    return (
        <TouchableOpacity
            style={styles.settingRow}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={[styles.settingIconWrap, danger && { backgroundColor: '#FEE2E2' }]}>
                <Text style={{ fontSize: 16 }}>{icon}</Text>
            </View>
            <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, danger && { color: '#DC2626' }]}>{label}</Text>
                {sub && <Text style={styles.settingSub}>{sub}</Text>}
            </View>
            {onValueChange !== undefined ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: Colors.border, true: '#86EFAC' }}
                    thumbColor={value ? Colors.successGreen : Colors.textMuted}
                />
            ) : (
                <Text style={styles.settingChevron}>›</Text>
            )}
        </TouchableOpacity>
    );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={styles.sectionCard}>
            <Text style={styles.sectionCardTitle}>{title}</Text>
            {children}
        </View>
    );
}

type ownerProfileProps = NativeBottomTabScreenProps<OwnerTabParamList, 'profile'>;
// ─── Screen ──────────────────────────────────────────────────────────────────
export default function OwnerProfileScreen({navigation}: ownerProfileProps) {
    const {removeAuth, user} = useAuthStore();
    const r = MOCK_RESTAURANT;
    const o = user;

    const [notifOrders, setNotifOrders] = useState(true);
    const [notifReviews, setNotifReviews] = useState(true);
    const [autoAccept, setAutoAccept] = useState(false);

    const FOOD_TYPE_COLOR = {
        veg: Colors.vegGreen,
        'non-veg': Colors.brandRed,
        both: Colors.amber,
    };
    const foodColor = FOOD_TYPE_COLOR[r.foodType] ?? Colors.amber;

    const joinDate = new Date(r.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    const handleLogOut = async() =>{
        await removeAuth();

        navigation.getParent<NativeStackNavigationProp<RootStackParamList>>().reset({
            index: 0,
            routes: [{name: 'login'}]
        })
    }
    return (
        <ScrollView
            style={styles.root}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* ── Hero ── */}
            <View style={styles.hero}>
                {/* Cover gradient */}
                <View style={styles.coverBg}>
                    <View style={styles.coverCircle1} />
                    <View style={styles.coverCircle2} />
                </View>

                {/* Avatar */}
                <View style={styles.avatarWrap}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {r.name
                                .split(' ')
                                .slice(0, 2)
                                .map(w => w[0])
                                .join('')}
                        </Text>
                    </View>
                    {r.isVerified && (
                        <View style={styles.verifiedBadge}>
                            <Text style={{ fontSize: 12 }}>✅</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.heroName}>{r.name}</Text>
                <Text style={styles.heroDesc} numberOfLines={2}>
                    {r.description}
                </Text>

                {/* Food type chip */}
                <View
                    style={[
                        styles.foodTypeChip,
                        { backgroundColor: foodColor + '20', borderColor: foodColor },
                    ]}
                >
                    <Text style={[styles.foodTypeText, { color: foodColor }]}>
                        {r.foodType === 'veg' ? '🟢' : r.foodType === 'non-veg' ? '🔴' : '🟡'}{' '}
                        {r.foodType.replace('-', ' ').toUpperCase()}
                    </Text>
                </View>

                {/* Cuisines */}
                <View style={styles.cuisineRow}>
                    {r.cuisines?.map(c => (
                        <View key={c} style={styles.cuisineChip}>
                            <Text style={styles.cuisineText}>{c}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* ── Stats bar ── */}
            <View style={styles.statsBar}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{r.rating}</Text>
                    <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{r.totalRatings}</Text>
                    <Text style={styles.statLabel}>Reviews</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{r.totalOrders.toLocaleString('en-IN')}</Text>
                    <Text style={styles.statLabel}>Orders</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>₹{(r.totalEarnings / 1000).toFixed(0)}K</Text>
                    <Text style={styles.statLabel}>Earnings</Text>
                </View>
            </View>

            {/* ── Owner info ── */}
            <SectionCard title="👤 Owner">
                <InfoRow icon="🙍" label="Name" value={o?.name || ''} />
                <InfoRow icon="📞" label="Phone" value={`+91 ${o?.phone}`} />
                <InfoRow icon="✉️" label="Email" value={o?.email ||''} />
                <InfoRow
                    icon="🕐"
                    label="Last Login"
                    value={new Date(o?.lastLogin || '').toLocaleString('en-IN')}
                />
            </SectionCard>

            {/* ── Restaurant info ── */}
            <SectionCard title="🏪 Restaurant">
                <InfoRow
                    icon="📍"
                    label="Address"
                    value={[r.address.street, r.address.city, r.address.state, r.address.pincode]
                        .filter(Boolean)
                        .join(', ')}
                />
                <InfoRow icon="📞" label="Phone" value={`+91 ${r.phone}`} />
                {r.email && <InfoRow icon="✉️" label="Email" value={r.email} />}
                <InfoRow
                    icon="🕐"
                    label="Opening Hours"
                    value={`${r.openingHours.open} – ${r.openingHours.close}`}
                />
                <InfoRow icon="⏱" label="Avg Prep Time" value={`${r.avgPrepTimeMinutes} minutes`} />
                <InfoRow icon="📅" label="Member Since" value={joinDate} />
            </SectionCard>

            {/* ── GST ── */}
            <SectionCard title="🧾 GST & Tax">
                {r.gstNumber && <InfoRow icon="📋" label="GST Number" value={r.gstNumber} />}
                <InfoRow icon="💰" label="GST Rate" value={`${r.gstRate}%`} />
            </SectionCard>

            {/* ── Routes ── */}
            {r.routes && r.routes.length > 0 && (
                <SectionCard title="🛣 Active Routes">
                    {r.routes.map(route => (
                        <View key={route} style={styles.routeRow}>
                            <Text style={styles.routeIcon}>📍</Text>
                            <Text style={styles.routeText}>{route}</Text>
                            <View style={styles.routeActivePill}>
                                <Text style={styles.routeActiveText}>Active</Text>
                            </View>
                        </View>
                    ))}
                </SectionCard>
            )}

            {/* ── Notifications ── */}
            <SectionCard title="🔔 Notifications">
                <SettingRow
                    icon="🧾"
                    label="New Orders"
                    sub="Get notified when a new order arrives"
                    value={notifOrders}
                    onValueChange={setNotifOrders}
                />
                <View style={styles.settingDivider} />
                <SettingRow
                    icon="⭐"
                    label="Reviews & Ratings"
                    sub="Get notified on new customer reviews"
                    value={notifReviews}
                    onValueChange={setNotifReviews}
                />
            </SectionCard>

            {/* ── Preferences ── */}
            <SectionCard title="⚙️ Preferences">
                <SettingRow
                    icon="⚡"
                    label="Auto-Accept Orders"
                    sub="Automatically confirm incoming orders"
                    value={autoAccept}
                    onValueChange={setAutoAccept}
                />
                <View style={styles.settingDivider} />
                <SettingRow icon="🖊" label="Edit Restaurant Info" onPress={() => {}} />
                <View style={styles.settingDivider} />
                <SettingRow icon="📸" label="Update Cover Photo" onPress={() => {}} />
                <View style={styles.settingDivider} />
                <SettingRow icon="🔑" label="Change Phone Number" onPress={() => {}} />
            </SectionCard>

            {/* ── Support ── */}
            <SectionCard title="💬 Support">
                <SettingRow icon="❓" label="Help & FAQ" onPress={() => {}} />
                <View style={styles.settingDivider} />
                <SettingRow icon="📞" label="Contact Rodo Team" onPress={() => {}} />
                <View style={styles.settingDivider} />
                <SettingRow icon="📄" label="Terms & Privacy" onPress={() => {}} />
            </SectionCard>

            {/* ── Danger ── */}
            <SectionCard title="⚠️ Account">
                <SettingRow
                    icon="🚫"
                    label="Deactivate Restaurant"
                    sub="Temporarily pause all orders"
                    onPress={() => {}}
                    danger
                />
                <View style={styles.settingDivider} />
                <SettingRow icon="🚪" label="Sign Out" onPress={handleLogOut} danger />
            </SectionCard>

            {/* Version */}
            <Text style={styles.version}>Rodo Restaurant v1.0.0 · Built with ❤️</Text>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },
    content: { paddingTop: Platform.OS === 'android' ? 28 : 60, gap: 16, paddingBottom: 20 },

    // Hero
    hero: {
        alignItems: 'center',
        paddingBottom: 20,
        position: 'relative',
        paddingHorizontal: 20,
    },
    coverBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 120,
        backgroundColor: Colors.amberGlow,
        overflow: 'hidden',
        borderBottomLeftRadius: Radius.xl,
        borderBottomRightRadius: Radius.xl,
    },
    coverCircle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,195,0,0.12)',
        top: -60,
        right: -40,
    },
    coverCircle2: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255,195,0,0.12)',
        bottom: -50,
        left: -20,
    },

    avatarWrap: { marginTop: 40, position: 'relative', marginBottom: 12 },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: Colors.amber,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: Colors.bg,
        ...Shadow.amber,
    },
    avatarText: { fontSize: 28, fontWeight: '900', color: Colors.textOnAmber },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: Colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },

    heroName: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary, textAlign: 'center' },
    heroDesc: {
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 19,
        marginTop: 4,
        marginBottom: 10,
    },

    foodTypeChip: {
        borderRadius: Radius.full,
        borderWidth: 1.5,
        paddingHorizontal: 14,
        paddingVertical: 5,
        marginBottom: 10,
    },
    foodTypeText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },

    cuisineRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
    cuisineChip: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.full,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cuisineText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },

    // Stats bar
    statsBar: {
        flexDirection: 'row',
        backgroundColor: Colors.bgCard,
        marginHorizontal: 20,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.card,
    },
    statItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
    statDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 10 },
    statValue: { fontSize: 16, fontWeight: '900', color: Colors.textPrimary },
    statLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600', marginTop: 2 },

    // Section card
    sectionCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        marginHorizontal: 20,
        overflow: 'hidden',
        ...Shadow.card,
    },
    sectionCardTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },

    // Info row
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    infoIcon: { fontSize: 16, marginTop: 1 },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', marginBottom: 2 },
    infoValue: { fontSize: 13, color: Colors.textPrimary, fontWeight: '600', lineHeight: 18 },

    // Settings
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    settingIconWrap: {
        width: 36,
        height: 36,
        borderRadius: Radius.sm,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingContent: { flex: 1 },
    settingLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
    settingSub: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
    settingChevron: { fontSize: 22, color: Colors.textMuted, fontWeight: '300' },
    settingDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },

    // Route
    routeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    routeIcon: { fontSize: 14 },
    routeText: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
    routeActivePill: {
        backgroundColor: '#DCFCE7',
        borderRadius: Radius.full,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    routeActiveText: { fontSize: 10, fontWeight: '700', color: Colors.successGreen },

    version: {
        textAlign: 'center',
        fontSize: 11,
        color: Colors.textMuted,
        fontWeight: '500',
    },
});
