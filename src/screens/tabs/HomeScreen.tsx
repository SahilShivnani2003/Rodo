import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Dimensions,
    Platform,
} from 'react-native';
import { Colors, Radius, Shadow } from '../../theme/index';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/TabNavigator';
import { RootStackParamList } from '../../navigation/AppNavigator';

const { width } = Dimensions.get('window');

const OFFERS = [
    { id: '1', label: '10% Off', sub: 'on all pre-orders', emoji: '🎉', color: Colors.amber },
    { id: '2', label: 'Free Chai', sub: 'orders above ₹199', emoji: '☕', color: '#2563EB' },
    { id: '3', label: '₹50 Off', sub: 'first order', emoji: '🔥', color: '#7C3AED' },
];

const CATEGORIES = [
    { id: '1', emoji: '🍱', label: 'Thali' },
    { id: '2', emoji: '🍔', label: 'Snacks' },
    { id: '3', emoji: '☕', label: 'Chai' },
    { id: '4', emoji: '🍟', label: 'Fast Food' },
    { id: '5', emoji: '🥗', label: 'Healthy' },
];

const POPULAR_RESTAURANTS = [
    {
        id: '1',
        name: 'Shree Dhaba',
        distance: '32 km',
        eta: '~28 min',
        rating: 4.6,
        tags: ['Veg', 'Thali', 'Chai'],
        isVeg: true,
        isAhead: true,
        priceForTwo: '₹180',
    },
    {
        id: '2',
        name: 'Highway King',
        distance: '58 km',
        eta: '~48 min',
        rating: 4.3,
        tags: ['Non-Veg', 'Snacks'],
        isVeg: false,
        isAhead: true,
        priceForTwo: '₹240',
    },
    {
        id: '3',
        name: 'Punjabi Tadka',
        distance: '14 km',
        eta: '~12 min',
        rating: 4.8,
        tags: ['Veg', 'Punjabi'],
        isVeg: true,
        isAhead: false,
        priceForTwo: '₹150',
    },
];

type homeProps = NativeStackScreenProps<MainTabParamList, 'home'>;

export default function HomeScreen({ navigation }: homeProps) {
    const [from, setFrom] = useState('Bhopal');
    const [to, setTo] = useState('Indore');
    const handleSwap = () => {
        const t = from;
        setFrom(to);
        setTo(t);
    };

    const RestaurantCard = ({ r }: { r: (typeof POPULAR_RESTAURANTS)[0] }) => (
        <TouchableOpacity
            style={[styles.restCard, !r.isAhead && styles.restCardPassed]}
            activeOpacity={0.8}
        >
            <View style={styles.restImageWrap}>
                <View style={[styles.restImageBg, !r.isAhead && styles.restImageBgPassed]}>
                    <Text style={styles.restImageEmoji}>🍽️</Text>
                </View>
                <View
                    style={[
                        styles.vegBadge,
                        { borderColor: r.isVeg ? Colors.vegGreen : Colors.redPin },
                    ]}
                >
                    <View
                        style={[
                            styles.vegDot,
                            { backgroundColor: r.isVeg ? Colors.vegGreen : Colors.redPin },
                        ]}
                    />
                </View>
                {!r.isAhead && (
                    <View style={styles.passedOverlay}>
                        <Text style={styles.passedText}>Passed</Text>
                    </View>
                )}
            </View>
            <View style={styles.restInfo}>
                <View style={styles.restNameRow}>
                    <Text style={[styles.restName, !r.isAhead && styles.restNamePassed]}>
                        {r.name}
                    </Text>
                    <View style={styles.ratingRow}>
                        <Text style={styles.starIcon}>★</Text>
                        <Text style={styles.ratingText}>{r.rating}</Text>
                    </View>
                </View>
                <View style={styles.restMetaRow}>
                    {[`📍 ${r.distance}`, `⏱ ${r.eta}`, `👥 ${r.priceForTwo}`].map(m => (
                        <View key={m} style={styles.restMetaChip}>
                            <Text style={styles.restMetaText}>{m}</Text>
                        </View>
                    ))}
                </View>
                <View style={styles.tagRow}>
                    {r.tags.map(t => (
                        <View key={t} style={styles.tag}>
                            <Text style={styles.tagText}>{t}</Text>
                        </View>
                    ))}
                </View>
                {r.isAhead && (
                    <TouchableOpacity style={styles.menuBtn} onPress={()=> navigation.getParent<NativeStackNavigationProp<RootStackParamList>>().navigate('menu')}>
                        <Text style={styles.menuBtnText}>View Menu</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/**Header Section */}
                <View style={styles.header}>
                    <View>
                        <View style={styles.locationRow}>
                            <View style={styles.locationDot} />
                            <Text style={styles.locationLabel}>Sehore Highway</Text>
                        </View>
                        <Text style={styles.greeting}>Hello, Rahul! 👋</Text>
                        <Text style={styles.subGreeting}>Where are you headed today?</Text>
                    </View>
                    <TouchableOpacity style={styles.notifBtn}>
                        <Text style={styles.notifIcon}>🔔</Text>
                        <View style={styles.notifBadge} />
                    </TouchableOpacity>
                </View>
                {/**Trip Planner Section */}
                <View style={styles.plannerCard}>
                    <View style={styles.plannerGlow} />
                    <View style={styles.plannerHeader}>
                        <View style={styles.plannerIconWrap}>
                            <Text style={styles.plannerIcon}>🛣️</Text>
                        </View>
                        <Text style={styles.plannerTitle}>Plan Your Trip</Text>
                    </View>
                    <View style={styles.routeInputs}>
                        <View style={styles.inputRow}>
                            <View style={[styles.routeDot, { backgroundColor: Colors.vegGreen }]} />
                            <TextInput
                                style={styles.routeInput}
                                value={from}
                                onChangeText={setFrom}
                                placeholder="Starting point"
                                placeholderTextColor={Colors.textMuted}
                            />
                        </View>
                        <View style={styles.dividerRow}>
                            <View style={styles.routeLine} />
                            <TouchableOpacity style={styles.swapBtn} onPress={handleSwap}>
                                <Text style={styles.swapIcon}>⇅</Text>
                            </TouchableOpacity>
                            <View style={styles.routeLine} />
                        </View>
                        <View style={styles.inputRow}>
                            <View style={[styles.routeDot, { backgroundColor: Colors.redPin }]} />
                            <TextInput
                                style={styles.routeInput}
                                value={to}
                                onChangeText={setTo}
                                placeholder="Destination"
                                placeholderTextColor={Colors.textMuted}
                            />
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.findBtn}
                        onPress={() => navigation.navigate('restaurants')}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.findBtnText}>Find Restaurants on Route</Text>
                        <Text style={styles.findBtnArrow}>→</Text>
                    </TouchableOpacity>
                </View>

                {/**Offer Strip Section*/}
                <View>
                    <Text style={styles.sectionTitle}>Special Offers</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.offersScroll}
                    >
                        {OFFERS.map(o => (
                            <TouchableOpacity
                                key={o.id}
                                style={[styles.offerCard, { borderColor: o.color + '30' }]}
                            >
                                <View
                                    style={[
                                        styles.offerIconBg,
                                        { backgroundColor: o.color + '12' },
                                    ]}
                                >
                                    <Text style={styles.offerEmoji}>{o.emoji}</Text>
                                </View>
                                <Text style={[styles.offerLabel, { color: o.color }]}>
                                    {o.label}
                                </Text>
                                <Text style={styles.offerSub}>{o.sub}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/**Category Row Section */}
                <View>
                    <Text style={styles.sectionTitle}>Quick Categories</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.catScroll}
                    >
                        {CATEGORIES.map((c, i) => (
                            <TouchableOpacity
                                key={c.id}
                                style={[styles.catItem, i === 0 && styles.catItemActive]}
                            >
                                <Text style={styles.catEmoji}>{c.emoji}</Text>
                                <Text style={[styles.catLabel, i === 0 && styles.catLabelActive]}>
                                    {c.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/**Restaurants Section */}
                <View style={styles.sectionRow}>
                    <Text style={styles.sectionTitle}>Restaurants on Route</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>See all →</Text>
                    </TouchableOpacity>
                </View>
                {POPULAR_RESTAURANTS.map(r => (
                    <RestaurantCard key={r.id} r={r} />
                ))}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },
    scroll: { flex: 1 },
    scrollContent: { paddingTop: Platform.OS === 'android' ? 48 : 60, paddingHorizontal: 20 },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
    locationDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.amber },
    locationLabel: {
        fontSize: 11,
        color: Colors.amber,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    greeting: {
        fontSize: 26,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.5,
        lineHeight: 32,
    },
    subGreeting: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
    notifBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.bgCard,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
        ...Shadow.card,
    },
    notifIcon: { fontSize: 18 },
    notifBadge: {
        position: 'absolute',
        top: 9,
        right: 9,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.amber,
        borderWidth: 1.5,
        borderColor: Colors.bgCard,
    },

    plannerCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        padding: 20,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: Colors.borderActive,
        overflow: 'hidden',
        ...Shadow.card,
    },
    plannerGlow: {
        position: 'absolute',
        top: -50,
        right: -40,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: Colors.amberGlow,
    },
    plannerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
    plannerIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.amberGlow,
        alignItems: 'center',
        justifyContent: 'center',
    },
    plannerIcon: { fontSize: 18 },
    plannerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.textPrimary,
        letterSpacing: -0.3,
    },
    routeInputs: {
        backgroundColor: Colors.bgInput,
        borderRadius: Radius.md,
        paddingHorizontal: 14,
        paddingVertical: 4,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
    routeDot: { width: 10, height: 10, borderRadius: 5 },
    routeInput: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary, padding: 0 },
    dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 2 },
    routeLine: { flex: 1, height: 1, backgroundColor: Colors.border },
    swapBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.bgElevated,
        borderWidth: 1,
        borderColor: Colors.borderActive,
        alignItems: 'center',
        justifyContent: 'center',
    },
    swapIcon: { fontSize: 14, color: Colors.amber, fontWeight: '700' },
    findBtn: {
        backgroundColor: Colors.amber,
        borderRadius: Radius.md,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...Shadow.amber,
    },
    findBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textOnAmber,
        letterSpacing: -0.2,
    },
    findBtnArrow: { fontSize: 16, color: Colors.textOnAmber, fontWeight: '700' },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 14,
        letterSpacing: -0.4,
    },
    sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    seeAll: { fontSize: 13, color: Colors.amber, fontWeight: '600' },

    offersScroll: { marginBottom: 28, marginHorizontal: -20, paddingHorizontal: 20 },
    offerCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.md,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginRight: 12,
        borderWidth: 1.5,
        minWidth: 130,
        alignItems: 'flex-start',
        ...Shadow.card,
    },
    offerIconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    offerEmoji: { fontSize: 18 },
    offerLabel: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },
    offerSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, fontWeight: '500' },

    catScroll: { marginBottom: 28, marginHorizontal: -20, paddingHorizontal: 20 },
    catItem: {
        alignItems: 'center',
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.md,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginRight: 10,
        borderWidth: 1,
        borderColor: Colors.border,
        minWidth: 74,
        ...Shadow.card,
    },
    catItemActive: { backgroundColor: Colors.amber, borderColor: Colors.amber },
    catEmoji: { fontSize: 24, marginBottom: 6 },
    catLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
    catLabelActive: { color: '#FFFFFF', fontWeight: '700' },

    restCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
        flexDirection: 'row',
        ...Shadow.card,
    },
    restCardPassed: { opacity: 0.5 },
    restImageWrap: { width: 100, position: 'relative' },
    restImageBg: {
        flex: 1,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    restImageBgPassed: { backgroundColor: Colors.passed },
    restImageEmoji: { fontSize: 32 },
    vegBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1.5,
        backgroundColor: Colors.bgCard,
        alignItems: 'center',
        justifyContent: 'center',
    },
    vegDot: { width: 8, height: 8, borderRadius: 4 },
    passedOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.7)',
        paddingVertical: 4,
        alignItems: 'center',
    },
    passedText: {
        fontSize: 10,
        color: Colors.passedText,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    restInfo: { flex: 1, padding: 14, gap: 8 },
    restNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    restName: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textPrimary,
        letterSpacing: -0.2,
        flex: 1,
        marginRight: 6,
    },
    restNamePassed: { color: Colors.textMuted },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.amberGlow,
        borderRadius: Radius.xs,
        paddingHorizontal: 6,
        paddingVertical: 2,
        gap: 2,
    },
    starIcon: { fontSize: 11, color: Colors.amber },
    ratingText: { fontSize: 12, fontWeight: '700', color: Colors.amber },
    restMetaRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
    restMetaChip: {
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.full,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    restMetaText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
    tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
    tag: {
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.full,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    tagText: { fontSize: 10, color: Colors.textSecondary, fontWeight: '600' },
    menuBtn: {
        backgroundColor: Colors.amberGlow,
        borderRadius: Radius.sm,
        paddingVertical: 7,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.borderActive,
        marginTop: 2,
    },
    menuBtnText: { fontSize: 12, fontWeight: '700', color: Colors.amber },

    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: Colors.bgCard,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        paddingTop: 10,
        ...Shadow.card,
    },
    navItem: { flex: 1, alignItems: 'center', gap: 3 },
    navIcon: { fontSize: 20, opacity: 0.3 },
    navIconActive: { opacity: 1 },
    navLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600', letterSpacing: 0.3 },
    navLabelActive: { color: Colors.amber },
    navActiveDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.amber,
        marginTop: 2,
    },
});
