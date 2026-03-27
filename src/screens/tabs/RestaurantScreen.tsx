import React, { useState } from 'react';
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
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/TabNavigator';
import { RootStackParamList } from '../../navigation/AppNavigator';

const ROUTE_RESTAURANTS = [
    {
        id: '1',
        name: 'Shree Dhaba',
        distanceLabel: '32 km',
        eta: '~28 min',
        rating: 4.6,
        cuisine: 'North Indian · Thali',
        isVeg: true,
        status: 'ahead',
        isOpen: true,
        priceForTwo: '₹180',
        prepTime: '15 min',
    },
    {
        id: '2',
        name: 'Maa Ka Dhaba',
        distanceLabel: '45 km',
        eta: '~38 min',
        rating: 4.4,
        cuisine: 'Indian · Homestyle',
        isVeg: true,
        status: 'nearest',
        isOpen: true,
        priceForTwo: '₹160',
        prepTime: '20 min',
    },
    {
        id: '3',
        name: 'Highway King',
        distanceLabel: '58 km',
        eta: '~48 min',
        rating: 4.3,
        cuisine: 'Multi-cuisine · Snacks',
        isVeg: false,
        status: 'ahead',
        isOpen: true,
        priceForTwo: '₹240',
        prepTime: '12 min',
    },
    {
        id: '4',
        name: 'Punjabi Tadka',
        distanceLabel: '14 km',
        eta: '~12 min',
        rating: 4.8,
        cuisine: 'Punjabi · Fast Food',
        isVeg: true,
        status: 'passed',
        isOpen: false,
        priceForTwo: '₹150',
        prepTime: '10 min',
    },
];

const FILTERS = ['All', 'Veg', 'Non-Veg', 'Open Now', 'Top Rated'];

const RouteProgressBar = () => (
    <View style={styles.routeBar}>
        <View style={styles.routeBarTrack}>
            <View style={styles.routeBarFill} />
            <View style={[styles.routeMarker, { left: '28%' as any }]}>
                <View style={styles.routeMarkerPulse} />
                <View style={styles.routeMarkerCore} />
            </View>
        </View>
        <View style={styles.routeLabels}>
            <Text style={styles.routeEndLabel}>Bhopal</Text>
            <Text style={styles.routeDistLabel}>168 km total</Text>
            <Text style={styles.routeEndLabel}>Indore</Text>
        </View>
    </View>
);

type restaurantProps = NativeStackScreenProps<MainTabParamList, 'restaurants'>;

export default function RestaurantListScreen({ navigation }: restaurantProps) {
    const [activeFilter, setActiveFilter] = useState('All');

    const RestaurantRow = ({ r }: { r: (typeof ROUTE_RESTAURANTS)[0] }) => {
        const isPassed = r.status === 'passed';
        const isNearest = r.status === 'nearest';
        return (
            <TouchableOpacity
                style={[
                    styles.rowCard,
                    isPassed && styles.rowCardPassed,
                    isNearest && styles.rowCardNearest,
                ]}
                activeOpacity={isPassed ? 1 : 0.8}
                disabled={isPassed}
                onPress={() =>
                    navigation
                        .getParent<NativeStackNavigationProp<RootStackParamList>>()
                        .navigate('menu')
                }
            >
                {isNearest && (
                    <View style={styles.nearestBadge}>
                        <Text style={styles.nearestText}>📍 Nearest</Text>
                    </View>
                )}
                <View style={styles.rowInner}>
                    <View style={styles.rowImageWrap}>
                        <View style={[styles.rowImage, isPassed && styles.rowImagePassed]}>
                            <Text style={styles.rowImageEmoji}>🍽️</Text>
                        </View>
                        <View
                            style={[
                                styles.vegBox,
                                { borderColor: r.isVeg ? Colors.vegGreen : Colors.redPin },
                            ]}
                        >
                            <View
                                style={[
                                    styles.vegCircle,
                                    { backgroundColor: r.isVeg ? Colors.vegGreen : Colors.redPin },
                                ]}
                            />
                        </View>
                    </View>
                    <View style={styles.rowInfoWrap}>
                        <View style={styles.rowNameRow}>
                            <Text style={[styles.rowName, isPassed && styles.rowNamePassed]}>
                                {r.name}
                            </Text>
                            <View style={styles.rowRating}>
                                <Text style={styles.rowStar}>★</Text>
                                <Text style={styles.rowRatingNum}>{r.rating}</Text>
                            </View>
                        </View>
                        <Text style={[styles.rowCuisine, isPassed && styles.rowCuisinePassed]}>
                            {r.cuisine}
                        </Text>
                        <View style={styles.rowMeta}>
                            {[`📍 ${r.distanceLabel}`, `⏱ ${r.eta}`, `👥 ${r.priceForTwo}`].map(
                                m => (
                                    <View key={m} style={styles.metaPill}>
                                        <Text style={styles.metaPillText}>{m}</Text>
                                    </View>
                                ),
                            )}
                        </View>
                        {!isPassed && (
                            <View style={styles.rowActionRow}>
                                <View
                                    style={[
                                        styles.openBadge,
                                        { backgroundColor: r.isOpen ? '#dcfce7' : '#fee2e2' },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.openDot,
                                            {
                                                backgroundColor: r.isOpen
                                                    ? Colors.successGreen
                                                    : Colors.redPin,
                                            },
                                        ]}
                                    />
                                    <Text
                                        style={[
                                            styles.openText,
                                            {
                                                color: r.isOpen
                                                    ? Colors.successGreen
                                                    : Colors.redPin,
                                            },
                                        ]}
                                    >
                                        {r.isOpen ? 'Open' : 'Closed'}
                                    </Text>
                                </View>
                                <TouchableOpacity style={styles.preOrderBtn}>
                                    <Text style={styles.preOrderText}>Pre-order</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {isPassed && (
                            <Text style={styles.passedLabel}>Already passed this restaurant</Text>
                        )}
                    </View>
                </View>
                <View
                    style={[styles.routeConnectorDot, isPassed && styles.routeConnectorDotPassed]}
                />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.bgCard} />

            {/* Top bar */}
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.topBarCenter}>
                    <Text style={styles.topBarTitle}>Bhopal → Indore</Text>
                    <Text style={styles.topBarSub}>4 ahead · 1 passed</Text>
                </View>
                <TouchableOpacity style={styles.mapBtn}>
                    <Text>🗺️</Text>
                </TouchableOpacity>
            </View>

            {/* Route progress */}
            <View style={styles.routeBarWrap}>
                <RouteProgressBar />
            </View>

            {/* ── Filter chips ──────────────────────────────────────────────────
                FIX: paddingVertical must be in contentContainerStyle, NOT style.
                     Padding on a horizontal ScrollView's outer style gets clipped.
                     Added explicit height so the row never collapses on Android.
            ─────────────────────────────────────────────────────────────────── */}
            <View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterScroll}
                    contentContainerStyle={styles.filterScrollContent}
                >
                    {FILTERS.map(f => (
                        <TouchableOpacity
                            key={f}
                            style={[
                                styles.filterChip,
                                activeFilter === f && styles.filterChipActive,
                            ]}
                            onPress={() => setActiveFilter(f)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    activeFilter === f && styles.filterTextActive,
                                ]}
                            >
                                {f}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Restaurant list */}
            <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.routeLineVertical} />
                {ROUTE_RESTAURANTS.map(r => (
                    <RestaurantRow key={r.id} r={r} />
                ))}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },

    topBar: {
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
    topBarCenter: { flex: 1, alignItems: 'center' },
    topBarTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.3,
    },
    topBarSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
    mapBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },

    routeBarWrap: {
        backgroundColor: Colors.bgCard,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    routeBar: { marginTop: 12 },
    routeBarTrack: {
        height: 6,
        backgroundColor: Colors.bgElevated,
        borderRadius: 3,
        position: 'relative',
        overflow: 'visible',
    },
    routeBarFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '28%',
        backgroundColor: Colors.amber,
        borderRadius: 3,
    },
    routeMarker: {
        position: 'absolute',
        top: -8,
        marginLeft: -10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    routeMarkerPulse: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.amberGlow,
    },
    routeMarkerCore: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.amber,
        borderWidth: 2,
        borderColor: Colors.bgCard,
    },
    routeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    routeEndLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
    routeDistLabel: { fontSize: 11, color: Colors.textMuted },

    // ── Filter strip ──────────────────────────────────────────────────────────
    // FIX: height set here so the row has a defined size on all platforms.
    //      paddingVertical lives in filterScrollContent, not here.
    filterScroll: {
        height: 56, // explicit height — prevents collapse
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.bgCard,
    },
    // FIX: vertical padding moved from filterScroll style → contentContainerStyle
    //      so chips are not clipped by the ScrollView's own bounds.
    filterScrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 10, // chips are centred vertically in the 56px row
        alignItems: 'center', // keeps all chips at the same vertical midpoint
    },
    filterChip: {
        height: 34, // explicit chip height
        paddingHorizontal: 16,
        borderRadius: Radius.full,
        backgroundColor: Colors.bgElevated,
        marginRight: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center', // vertically centre the label inside the chip
    },
    filterChipActive: {
        backgroundColor: Colors.amberGlow,
        borderColor: Colors.amber,
    },
    filterText: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '600',
        lineHeight: 16, // prevents text clipping on Android
    },
    filterTextActive: { color: Colors.amber },

    // ── List ──────────────────────────────────────────────────────────────────
    list: { flex: 1 },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingRight: 10,
        position: 'relative',
        margin: 10,
    },
    routeLineVertical: {
        position: 'absolute',
        left: 52,
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: Colors.border,
    },

    rowCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 14,
        ...Shadow.card,
    },
    rowCardPassed: { opacity: 0.45 },
    rowCardNearest: { borderColor: Colors.amber, borderWidth: 1.5 },
    nearestBadge: {
        backgroundColor: Colors.amber,
        alignSelf: 'flex-start',
        borderRadius: Radius.full,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginBottom: 10,
    },
    nearestText: { fontSize: 11, fontWeight: '700', color: Colors.textOnAmber },
    rowInner: { flexDirection: 'row', gap: 12 },
    rowImageWrap: { position: 'relative' },
    rowImage: {
        width: 80,
        height: 80,
        borderRadius: Radius.md,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowImagePassed: { backgroundColor: Colors.passed },
    rowImageEmoji: { fontSize: 28 },
    vegBox: {
        position: 'absolute',
        top: 6,
        left: 6,
        width: 16,
        height: 16,
        borderRadius: 4,
        borderWidth: 1.5,
        backgroundColor: Colors.bgCard,
        alignItems: 'center',
        justifyContent: 'center',
    },
    vegCircle: { width: 7, height: 7, borderRadius: 3.5 },
    rowInfoWrap: { flex: 1, gap: 6 },
    rowNameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rowName: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textPrimary,
        letterSpacing: -0.2,
        flex: 1,
        marginRight: 8,
    },
    rowNamePassed: { color: Colors.textMuted },
    rowRating: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.amberGlow,
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        gap: 2,
    },
    rowStar: { fontSize: 10, color: Colors.amber },
    rowRatingNum: { fontSize: 12, fontWeight: '700', color: Colors.amber },
    rowCuisine: { fontSize: 12, color: Colors.textSecondary },
    rowCuisinePassed: { color: Colors.textMuted },
    rowMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
    metaPill: {
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.full,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    metaPillText: { fontSize: 10, color: Colors.textSecondary, fontWeight: '600' },
    rowActionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    openBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderRadius: Radius.full,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    openDot: { width: 6, height: 6, borderRadius: 3 },
    openText: { fontSize: 11, fontWeight: '700' },
    preOrderBtn: {
        backgroundColor: Colors.amber,
        borderRadius: Radius.full,
        paddingHorizontal: 12,
        paddingVertical: 5,
        marginLeft: 'auto',
        ...Shadow.amber,
    },
    preOrderText: { fontSize: 12, fontWeight: '700', color: Colors.textOnAmber },
    passedLabel: {
        fontSize: 11,
        color: Colors.textMuted,
        fontStyle: 'italic',
        marginTop: 2,
    },
    routeConnectorDot: {
        position: 'absolute',
        left: -27,
        top: '50%',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.amber,
        borderWidth: 2,
        borderColor: Colors.bg,
    },
    routeConnectorDotPassed: { backgroundColor: Colors.passed },
});
