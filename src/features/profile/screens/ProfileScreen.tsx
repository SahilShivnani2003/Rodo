import {
    View,
    StatusBar,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ScrollView,
    ActivityIndicator,
    Linking,
    Modal,
    Pressable,
} from 'react-native';
import { useState } from 'react';
import { Colors, Shadow, Radius } from '../../../theme';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import { MainTabParamList } from '@/types/MainTabParamList';
import { useAuthStore } from '@/store/useAuthStore';
import { useGetMyOrders } from '@/features/orders/hooks/hooks';
import { Order, OrderStatus } from '@/features/orders/types/Order';

type ProfileProps = NativeStackScreenProps<MainTabParamList, 'profile'>;

interface MenuItem {
    icon: string;
    label: string;
    onPress: () => void;
    danger?: boolean;
    badge?: string | number;
}

const ACTIVE_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready'];

const CONTACT_ITEMS = [
    {
        id: 'whatsapp',
        icon: '💬',
        iconBg: '#DCFCE7',
        label: 'WHATSAPP',
        value: '+91 99999 99999',
        onPress: () => Linking.openURL('whatsapp://send?phone=919999999999'),
    },
    {
        id: 'email',
        icon: '✉️',
        iconBg: '#EFF6FF',
        label: 'EMAIL',
        value: 'support@rodofood.in',
        onPress: () => Linking.openURL('mailto:support@rodofood.in'),
    },
    {
        id: 'phone',
        icon: '📞',
        iconBg: '#FFF7ED',
        label: 'PHONE',
        value: '+91 99999 99999',
        onPress: () => Linking.openURL('tel:+919999999999'),
    },
    {
        id: 'address',
        icon: '📍',
        iconBg: '#F5F3FF',
        label: 'ADDRESS',
        value: 'Bhopal, Madhya Pradesh, India',
        onPress: () => Linking.openURL('https://maps.google.com/?q=Bhopal,Madhya+Pradesh,India'),
    },
] as const;

const deriveStats = (orders: Order[]) => {
    const total = orders.length;
    const active = orders.filter(o => ACTIVE_STATUSES.includes(o.status)).length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const spent = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.totalAmount, 0);
    return { total, active, completed, spent };
};

interface StatCardProps {
    value: string | number;
    label: string;
    icon: string;
    highlight?: boolean;
}

const StatCard = ({ value, label, icon, highlight }: StatCardProps) => (
    <View style={[styles.statCard, highlight && styles.statCardHighlight]}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

interface ContactModalProps {
    visible: boolean;
    onClose: () => void;
}

const ContactModal = ({ visible, onClose }: ContactModalProps) => (
    <Modal
        visible={visible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={onClose}
    >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.sheetTitle}>Get in touch</Text>
                    <Text style={styles.sheetSubtitle}>
                        {"We're here to help. Reach out via any of\nthe channels below."}
                    </Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
                    <Text style={styles.closeBtnText}>X</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.contactList}>
                {CONTACT_ITEMS.map((item, i) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            styles.contactRow,
                            i < CONTACT_ITEMS.length - 1 && styles.contactRowBorder,
                        ]}
                        onPress={item.onPress}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.contactIconWrap, { backgroundColor: item.iconBg }]}>
                            <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                        </View>
                        <View style={styles.contactText}>
                            <Text style={styles.contactLabel}>{item.label}</Text>
                            <Text style={styles.contactValue}>{item.value}</Text>
                        </View>
                        <Text style={styles.contactArrow}>›</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.hoursCard}>
                <Text style={styles.hoursTitle}>Support Hours</Text>
                <View style={styles.hoursRow}>
                    <Text style={styles.hoursDay}>Monday – Saturday</Text>
                    <Text style={styles.hoursTime}>9 AM – 8 PM</Text>
                </View>
                <View style={styles.hoursRow}>
                    <Text style={styles.hoursDay}>Sunday</Text>
                    <Text style={styles.hoursTime}>10 AM – 6 PM</Text>
                </View>
            </View>
        </View>
    </Modal>
);

export function ProfileScreen({ navigation }: ProfileProps) {
    const [contactVisible, setContactVisible] = useState(false);

    const { data: orderData, isLoading: ordersLoading } = useGetMyOrders();
    const { user, removeAuth } = useAuthStore();

    const allOrders: Order[] = orderData?.data ?? orderData ?? [];
    const stats = deriveStats(allOrders);

    const menuItems: MenuItem[] = [
        {
            icon: '📦',
            label: 'Order History',
            badge: stats.total > 0 ? stats.total : undefined,
            onPress: () =>
                navigation
                    .getParent<NativeStackNavigationProp<RootStackParamList>>()
                    .navigate('orderHistory'),
        },
        {
            icon: '🎟️',
            label: 'Help & FAQ',
            onPress: () => Linking.openURL('whatsapp://send?phone=919999999999'),
        },
        {
            icon: 'ℹ️',
            label: 'About Us',
            onPress: () => Linking.openURL('https://rodofood.vercel.app/pages/about'),
        },
        {
            icon: '💬',
            label: 'WhatsApp Support',
            onPress: () => Linking.openURL('whatsapp://send?phone=919999999999'),
        },
        {
            icon: '📄',
            label: 'Terms & Conditions',
            onPress: () => Linking.openURL('https://rodofood.vercel.app/pages/terms'),
        },
        {
            icon: '🔒',
            label: 'Privacy Policy',
            onPress: () => Linking.openURL('https://rodofood.vercel.app/pages/privacy'),
        },
        {
            icon: '💸',
            label: 'Refund Policy',
            onPress: () => Linking.openURL('https://rodofood.vercel.app/pages/refund'),
        },
        {
            icon: '📞',
            label: 'Contact Us',
            onPress: () => setContactVisible(true),
        },
        {
            icon: '🚪',
            label: 'Log Out',
            onPress: async () => {
                await removeAuth();
                navigation
                    .getParent<NativeStackNavigationProp<RootStackParamList>>()
                    .reset({ index: 0, routes: [{ name: 'login' }] });
            },
            danger: true,
        },
    ];

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.bgCard} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={{ fontSize: 38 }}>👤</Text>
                    </View>
                    <Text style={styles.name}>{user?.name ?? '—'}</Text>
                    <Text style={styles.phone}>{user?.phone ?? '—'}</Text>
                    <TouchableOpacity style={styles.editBtn} activeOpacity={0.75}>
                        <Text style={styles.editText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {ordersLoading ? (
                    <View style={styles.statsLoadingWrap}>
                        <ActivityIndicator size="small" color={Colors.amber} />
                    </View>
                ) : (
                    <View style={styles.statsRow}>
                        <StatCard icon="📦" value={stats.total} label="Total Orders" />
                        <StatCard
                            icon="⏳"
                            value={stats.active}
                            label="Active"
                            highlight={stats.active > 0}
                        />
                        <StatCard icon="🎉" value={stats.completed} label="Completed" />
                        <StatCard icon="₹" value={stats.spent || '0'} label="Spent" />
                    </View>
                )}

                <View style={styles.menuSection}>
                    {menuItems.map((item, i) => {
                        const isFirst = i === 0;
                        const isDanger = !!item.danger;
                        const prevIsDanger = i > 0 && !!menuItems[i - 1].danger;

                        return (
                            <TouchableOpacity
                                key={item.label}
                                style={[
                                    styles.menuItem,
                                    isFirst && styles.menuItemFirst,
                                    isDanger && styles.menuItemDanger,
                                    prevIsDanger && styles.menuItemFirst,
                                ]}
                                onPress={item.onPress}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.menuIcon}>{item.icon}</Text>
                                <Text
                                    style={[styles.menuLabel, isDanger && styles.menuLabelDanger]}
                                >
                                    {item.label}
                                </Text>

                                {item.badge !== undefined && (
                                    <View style={styles.menuBadge}>
                                        <Text style={styles.menuBadgeText}>{item.badge}</Text>
                                    </View>
                                )}

                                {!isDanger && <Text style={styles.menuArrow}>›</Text>}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Text style={styles.version}>Rodo v1.0.0</Text>
            </ScrollView>

            <ContactModal visible={contactVisible} onClose={() => setContactVisible(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },
    scrollContent: { paddingBottom: 40 },

    header: {
        backgroundColor: Colors.bgCard,
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? 24 : 70,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        ...Shadow.card,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: Colors.amberGlow,
        borderWidth: 2.5,
        borderColor: Colors.borderActive,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        ...Shadow.card,
    },
    name: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
    phone: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, marginBottom: 14 },
    editBtn: {
        backgroundColor: Colors.amberGlow,
        borderRadius: Radius.full,
        paddingHorizontal: 20,
        paddingVertical: 9,
        borderWidth: 1,
        borderColor: Colors.borderActive,
    },
    editText: { fontSize: 13, fontWeight: '700', color: Colors.amber },

    statsLoadingWrap: {
        height: 88,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginVertical: 12,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.md,
        paddingVertical: 14,
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.card,
    },
    statCardHighlight: { backgroundColor: Colors.amberGlow, borderColor: Colors.borderActive },
    statIcon: { fontSize: 18 },
    statValue: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
    statValueHighlight: { color: Colors.amber },
    statLabel: { fontSize: 10, fontWeight: '600', color: Colors.textMuted, textAlign: 'center' },

    menuSection: { marginTop: 4 },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 17,
        paddingHorizontal: 24,
        backgroundColor: Colors.bgCard,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    menuItemFirst: { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 8 },
    menuItemDanger: { marginTop: 8, borderTopWidth: 1, borderTopColor: Colors.border },
    menuIcon: { fontSize: 20, width: 28 },
    menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
    menuLabelDanger: { color: '#DC2626' },
    menuArrow: { fontSize: 20, color: Colors.textMuted },
    menuBadge: {
        backgroundColor: Colors.amberGlow,
        borderRadius: Radius.full,
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: Colors.borderActive,
        marginRight: 4,
    },
    menuBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.amber },
    version: {
        textAlign: 'center',
        fontSize: 12,
        color: Colors.textMuted,
        marginTop: 28,
        fontWeight: '500',
    },

    // Contact Modal
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
        marginBottom: 20,
    },
    sheetTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },
    sheetSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, lineHeight: 19 },
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

    contactList: {
        backgroundColor: Colors.bg,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 14,
        overflow: 'hidden',
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    contactRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
    contactIconWrap: {
        width: 44,
        height: 44,
        borderRadius: Radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    contactText: { flex: 1 },
    contactLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.textMuted,
        letterSpacing: 0.8,
        marginBottom: 3,
    },
    contactValue: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
        letterSpacing: -0.1,
    },
    contactArrow: { fontSize: 20, color: Colors.textMuted },

    hoursCard: {
        backgroundColor: Colors.amberGlow,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.borderActive,
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 8,
    },
    hoursTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 4,
        letterSpacing: -0.2,
    },
    hoursRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    hoursDay: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
    hoursTime: { fontSize: 13, color: Colors.amber, fontWeight: '700' },
});
