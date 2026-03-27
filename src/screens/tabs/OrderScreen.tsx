import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    StatusBar,
} from 'react-native';
import { Colors, Radius, Shadow } from '../../theme/index';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/TabNavigator';

const ORDER = {
    id: 'RD-2891',
    restaurant: 'Shree Dhaba',
    location: 'Sehore Highway, NH-86',
    eta: '28 min',
    arrivalETA: '45 min',
    restaurantDist: '32 km',
    items: [
        { name: 'Full Rajasthani Thali', qty: 1, price: 180 },
        { name: 'Masala Chai', qty: 2, price: 20 },
    ],
    subtotal: 220,
    gst: 11,
    total: 231,
    paymentMode: 'Pay at Restaurant',
    dineMode: 'Dine-in',
    status: 'preparing',
};

const STATUS_STEPS = [
    { id: 'sent', label: 'Order Sent', icon: '📨', desc: 'Restaurant received your order' },
    { id: 'preparing', label: 'Preparing', icon: '🧑‍🍳', desc: 'Chef is preparing your food' },
    { id: 'ready', label: 'Ready to Serve', icon: '🍽️', desc: 'Food is ready, come on in!' },
];

type orderProps = NativeStackScreenProps<MainTabParamList, 'orders'>;

export default function OrderTrackingScreen({ navigation }: orderProps) {
    const getState = (stepId: string, current: string) => {
        const order = ['sent', 'preparing', 'ready'];
        const d = order.indexOf(stepId) - order.indexOf(current);
        return d < 0 ? 'done' : d === 0 ? 'active' : 'pending';
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.bgCard} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Tracking Order</Text>
                    <Text style={styles.headerSub}>#{ORDER.id}</Text>
                </View>
                <TouchableOpacity style={styles.backBtn}>
                    <Text>⎋</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Restaurant row */}
                <View style={styles.restRow}>
                    <View style={styles.restIcon}>
                        <Text style={{ fontSize: 22 }}>🍽️</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.restName}>{ORDER.restaurant}</Text>
                        <Text style={styles.restSub}>{ORDER.location}</Text>
                    </View>
                    <TouchableOpacity style={styles.navBtn}>
                        <Text style={{ fontSize: 16 }}>🗺️</Text>
                        <Text style={styles.navBtnText}>Navigate</Text>
                    </TouchableOpacity>
                </View>

                {/* ETA display */}
                <View style={styles.etaCard}>
                    <View style={styles.etaGlow} />
                    {[
                        { val: ORDER.eta, label: 'Food Ready In' },
                        { val: ORDER.arrivalETA, label: 'Your Arrival' },
                        { val: ORDER.restaurantDist, label: 'Distance' },
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

                {/* Status timeline */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Order Status</Text>
                    {STATUS_STEPS.map((step, i) => {
                        const state = getState(step.id, ORDER.status);
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
                                        <Text
                                            style={[
                                                styles.tlLabel,
                                                state === 'active' && styles.tlLabelActive,
                                                state === 'pending' && styles.tlLabelPending,
                                            ]}
                                        >
                                            {step.label}
                                        </Text>
                                        {state !== 'pending' && (
                                            <Text style={styles.tlDesc}>{step.desc}</Text>
                                        )}
                                        {state === 'active' && (
                                            <View style={styles.activePill}>
                                                <View style={styles.activeDot} />
                                                <Text style={styles.activeText}>In progress</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Summary */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Order Summary</Text>
                    {ORDER.items.map((item, i) => (
                        <View key={i} style={styles.sumRow}>
                            <Text style={styles.sumItem}>
                                {item.name} × {item.qty}
                            </Text>
                            <Text style={styles.sumValue}>₹{item.price * item.qty}</Text>
                        </View>
                    ))}
                    <View style={styles.sumDivider} />
                    <View style={styles.sumRow}>
                        <Text style={styles.sumLabel}>GST (5%)</Text>
                        <Text style={styles.sumValue}>₹{ORDER.gst}</Text>
                    </View>
                    <View style={[styles.sumDivider, { height: 2 }]} />
                    <View style={styles.sumRow}>
                        <Text style={styles.sumTotalLabel}>Total</Text>
                        <Text style={styles.sumTotalValue}>₹{ORDER.total}</Text>
                    </View>
                    <View style={styles.paymentRow}>
                        <View style={styles.payBadge}>
                            <Text style={{ fontSize: 12 }}>💵</Text>
                            <Text style={styles.payText}>{ORDER.paymentMode}</Text>
                        </View>
                        <View style={styles.payBadge}>
                            <Text style={styles.payText}>{ORDER.dineMode}</Text>
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

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },
    scroll: { flex: 1 },
    scrollContent: { padding: 20 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 44 : 56,
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
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 18,
        letterSpacing: -0.3,
    },
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
    tlLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.2 },
    tlLabelActive: { color: Colors.amber },
    tlLabelPending: { color: Colors.textMuted },
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
