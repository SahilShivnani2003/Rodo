import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Dimensions,
    Platform,
    Animated,
} from 'react-native';
import { Colors, Radius, Shadow } from '../../theme/index';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/TabNavigator';
import { RootStackParamList } from '../../navigation/AppNavigator';

const { width } = Dimensions.get('window');

// ─── Data ─────────────────────────────────────────────────────────────────────

const OFFERS = [
    { id: '1', label: '10% Off',   sub: 'on all pre-orders',  emoji: '🎉', color: Colors.brandRed,    bg: 'rgba(214,26,26,0.12)' },
    { id: '2', label: 'Free Chai', sub: 'orders above ₹199',  emoji: '☕', color: Colors.brandYellow, bg: 'rgba(255,211,0,0.12)' },
    { id: '3', label: '₹50 Off',   sub: 'first order',        emoji: '🔥', color: '#9333EA',          bg: 'rgba(147,51,234,0.10)' },
];

const CATEGORIES = [
    { id: '1', emoji: '🍱', label: 'Thali'     },
    { id: '2', emoji: '🍔', label: 'Snacks'    },
    { id: '3', emoji: '☕', label: 'Chai'      },
    { id: '4', emoji: '🍟', label: 'Fast Food' },
    { id: '5', emoji: '🥗', label: 'Healthy'   },
];

const DELIVERY_TIMES = [
    { id: 'immediately', label: 'Now',    emoji: '⚡' },
    { id: '30',          label: '30 min', emoji: '🕐' },
    { id: '45',          label: '45 min', emoji: '🕒' },
    { id: 'custom',      label: 'Custom', emoji: '📅' },
];

const HOME_FILTERS: string[] = ['All', 'Veg', 'Non-Veg', 'Open Now', 'Top Rated'];

const QUICK_BITES = [
    { id: '1', name: 'Paneer Tikka',  price: '₹120', emoji: '🍢', rating: 4.7 },
    { id: '2', name: 'Chicken Roll',  price: '₹150', emoji: '🌯', rating: 4.5 },
    { id: '3', name: 'Veg Burger',    price: '₹80',  emoji: '🍔', rating: 4.8 },
    { id: '4', name: 'Masala Chai',   price: '₹30',  emoji: '☕', rating: 4.9 },
];

const POPULAR_RESTAURANTS = [
    {
        id: '1',
        name: 'Shree Dhaba',
        distance: '32 km',
        eta: '~28 min',
        rating: 4.6,
        tags: ['Thali', 'Chai'],
        isVeg: true,
        isAhead: true,
        priceForTwo: '₹180',
        cuisine: 'North Indian · Thali',
    },
    {
        id: '2',
        name: 'Highway King',
        distance: '58 km',
        eta: '~48 min',
        rating: 4.3,
        tags: ['Snacks', 'Rolls'],
        isVeg: false,
        isAhead: true,
        priceForTwo: '₹240',
        cuisine: 'Non-Veg · Snacks',
    },
    {
        id: '3',
        name: 'Punjabi Tadka',
        distance: '14 km',
        eta: '~12 min',
        rating: 4.8,
        tags: ['Dal', 'Roti'],
        isVeg: true,
        isAhead: false,
        priceForTwo: '₹150',
        cuisine: 'Punjabi · Veg',
    },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type homeProps = NativeStackScreenProps<MainTabParamList, 'home'>;

// ─── Pressable card with scale feedback ───────────────────────────────────────
// onPress is passed directly to TouchableOpacity so React Native's scroll
// gesture recogniser can cancel it properly — never put navigation inside
// onPressOut, which fires unconditionally even when the user is scrolling.
function PressCard({
    onPress,
    style,
    children,
    disabled,
}: {
    onPress?: () => void;
    style?: any;
    children: React.ReactNode;
    disabled?: boolean;
}) {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn  = () =>
        Animated.spring(scale, { toValue: 0.965, useNativeDriver: true, tension: 200, friction: 10 }).start();
    const handlePressOut = () =>
        Animated.spring(scale, { toValue: 1,     useNativeDriver: true, tension: 200, friction: 10 }).start();

    if (disabled) return <View style={style}>{children}</View>;
    return (
        <Animated.View style={[{ transform: [{ scale }] }, style]}>
            <TouchableOpacity
                activeOpacity={0.95}
                onPress={onPress}          // ← RN suppresses this during scroll
                onPressIn={handlePressIn}  // ← only scale, never navigate
                onPressOut={handlePressOut}
                style={{ flex: 1 }}
            >
                {children}
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }: homeProps) {
    const [from, setFrom] = useState('Bhopal');
    const [to, setTo] = useState('Indore');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTime, setSelectedTime] = useState('immediately');
    const [activeFilter, setActiveFilter] = useState('All');
    const [activeCat, setActiveCat] = useState('1');
    const searchFocused = useRef(new Animated.Value(0)).current;

    const handleSwap = () => { const t = from; setFrom(to); setTo(t); };

    const focusSearch = () =>
        Animated.spring(searchFocused, { toValue: 1, useNativeDriver: false, tension: 120, friction: 8 }).start();
    const blurSearch = () =>
        Animated.spring(searchFocused, { toValue: 0, useNativeDriver: false, tension: 120, friction: 8 }).start();

    const searchBorder = searchFocused.interpolate({ inputRange: [0, 1], outputRange: [Colors.border, Colors.borderActive] });

    // ── Restaurant Card ────────────────────────────────────────────
    const RestaurantCard = ({ r }: { r: (typeof POPULAR_RESTAURANTS)[0] }) => (
        <PressCard
            onPress={() =>
                r.isAhead &&
                navigation.getParent<NativeStackNavigationProp<RootStackParamList>>().navigate('menu')
            }
            disabled={!r.isAhead}
            style={[styles.restCard, !r.isAhead && styles.restCardDimmed]}
        >
            {/* Image section */}
            <View style={styles.restImageArea}>
                <View style={[styles.restImageBg, !r.isAhead && { backgroundColor: Colors.passed }]}>
                    {/* Decorative diagonal stripe */}
                    <View style={styles.restImageStripe} />
                    <Text style={{ fontSize: 52 }}>🍽️</Text>
                </View>

                {/* Veg indicator */}
                <View style={[styles.vegIndicator, { borderColor: r.isVeg ? Colors.vegGreen : Colors.redPin }]}>
                    <View style={[styles.vegDot, { backgroundColor: r.isVeg ? Colors.vegGreen : Colors.redPin }]} />
                </View>

                {/* Rating pill */}
                <View style={styles.ratingBadge}>
                    <Text style={styles.ratingBadgeStar}>★</Text>
                    <Text style={styles.ratingBadgeText}>{r.rating}</Text>
                </View>

                {/* ETA badge */}
                {r.isAhead && (
                    <View style={styles.etaBadge}>
                        <Text style={styles.etaBadgeText}>⏱ {r.eta}</Text>
                    </View>
                )}

                {!r.isAhead && (
                    <View style={styles.passedBanner}>
                        <View style={styles.passedBannerInner}>
                            <Text style={styles.passedBannerText}>Already Passed</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={styles.restContent}>
                {/* Name row */}
                <View style={styles.restTopRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.restName} numberOfLines={1}>{r.name}</Text>
                        <Text style={styles.restCuisine}>{r.cuisine}</Text>
                    </View>
                    <View style={styles.priceBadge}>
                        <Text style={styles.priceText}>{r.priceForTwo}</Text>
                        <Text style={styles.priceFor}> for 2</Text>
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.restDivider} />

                {/* Meta + CTA row */}
                <View style={styles.restBottomRow}>
                    <View style={styles.metaGroup}>
                        <View style={styles.metaPill}>
                            <Text style={styles.metaIcon}>📍</Text>
                            <Text style={styles.metaPillText}>{r.distance}</Text>
                        </View>
                        <View style={styles.metaDot} />
                        {r.tags.map(t => (
                            <View key={t} style={styles.tagChip}>
                                <Text style={styles.tagChipText}>{t}</Text>
                            </View>
                        ))}
                    </View>

                    {r.isAhead && (
                        <TouchableOpacity
                            style={styles.menuCta}
                            activeOpacity={0.85}
                            onPress={() =>
                                navigation.getParent<NativeStackNavigationProp<RootStackParamList>>().navigate('menu')
                            }
                        >
                            <Text style={styles.menuCtaText}>Menu</Text>
                            <Text style={styles.menuCtaArrow}>→</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </PressCard>
    );

    // ── Render ─────────────────────────────────────────────────────
    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.brandRed} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >

                {/* ══ HERO ══════════════════════════════════════════════════════ */}
                <View style={styles.hero}>
                    {/* Layered decorative shapes */}
                    <View style={styles.heroShape1} />
                    <View style={styles.heroShape2} />
                    <View style={styles.heroShape3} />
                    {/* Diagonal slash accent */}
                    <View style={styles.heroDiag} />

                    {/* Top nav */}
                    <View style={styles.heroNav}>
                        <View style={styles.heroNavLeft}>
                            <View style={styles.heroLogoWrap}>
                                <Image
                                    source={require('../../assets/logo.jpeg')}
                                    style={styles.heroLogo}
                                    resizeMode="cover"
                                />
                                <View style={styles.heroLogoShine} />
                            </View>
                            <View>
                                <Text style={styles.heroAppName}>Rodo</Text>
                                <View style={styles.heroLocRow}>
                                    <View style={styles.heroLocDot} />
                                    <Text style={styles.heroLocText}>Sehore Highway</Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.heroNotif} activeOpacity={0.8}>
                            <Text style={{ fontSize: 18 }}>🔔</Text>
                            <View style={styles.notifDot} />
                        </TouchableOpacity>
                    </View>

                    {/* Greeting block */}
                    <View style={styles.heroGreetingBlock}>
                        <Text style={styles.heroGreeting}>Hey Rahul! 👋</Text>
                        <Text style={styles.heroSub}>
                            Hungry on the highway?{'\n'}We've got you covered.
                        </Text>
                    </View>

                    {/* Stats strip — frosted glass style */}
                    <View style={styles.heroStats}>
                        {[
                            { label: 'Restaurants', value: '24+', icon: '🍽' },
                            { label: 'On Route',    value: '8',    icon: '📍' },
                            { label: 'Avg ETA',     value: '28m',  icon: '⚡' },
                        ].map((s, i) => (
                            <React.Fragment key={s.label}>
                                <View style={styles.heroStat}>
                                    <Text style={styles.heroStatIcon}>{s.icon}</Text>
                                    <Text style={styles.heroStatValue}>{s.value}</Text>
                                    <Text style={styles.heroStatLabel}>{s.label}</Text>
                                </View>
                                {i < 2 && <View style={styles.heroStatDivider} />}
                            </React.Fragment>
                        ))}
                    </View>

                    {/* CTA row */}
                    <View style={styles.heroCtaRow}>
                        <TouchableOpacity
                            style={styles.heroCta}
                            activeOpacity={0.85}
                            onPress={() => navigation.navigate('restaurants')}
                        >
                            <Text style={styles.heroCtaText}>Start Journey</Text>
                            <Text style={styles.heroCtaArrow}>→</Text>
                        </TouchableOpacity>
                        <View style={styles.heroLiveChip}>
                            <View style={styles.heroLiveDot} />
                            <Text style={styles.heroLiveText}>Live Tracking</Text>
                        </View>
                    </View>
                </View>

                {/* ══ SEARCH (floating, overlapping hero) ══════════════════════ */}
                <View style={styles.searchOuter}>
                    <Animated.View style={[styles.searchInner, { borderColor: searchBorder }]}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onFocus={focusSearch}
                            onBlur={blurSearch}
                            placeholder="Search restaurants, dishes…"
                            placeholderTextColor={Colors.textMuted}
                            style={styles.searchInput}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 ? (
                            <TouchableOpacity
                                style={styles.searchClearBtn}
                                onPress={() => setSearchQuery('')}
                            >
                                <Text style={styles.searchClearText}>✕</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.searchKbd}>
                                <Text style={styles.searchKbdText}>⌘K</Text>
                            </View>
                        )}
                    </Animated.View>
                </View>

                {/* ══ BODY ══════════════════════════════════════════════════════ */}
                <View style={styles.body}>

                    {/* ── TRIP PLANNER ──────────────────────────────────────── */}
                    <View style={styles.plannerCard}>
                        {/* Header */}
                        <View style={styles.plannerHeader}>
                            <View style={styles.plannerLabelRow}>
                                <View style={styles.plannerLabelAccent} />
                                <Text style={styles.plannerLabel}>Trip Planner</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.plannerSwapBtn}
                                onPress={handleSwap}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.plannerSwapIcon}>⇅</Text>
                                <Text style={styles.plannerSwapText}>Swap</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Route inputs */}
                        <View style={styles.routeBox}>
                            {/* FROM */}
                            <View style={styles.routeRow}>
                                <View style={styles.routeIndicator}>
                                    <View style={[styles.routeDot, { backgroundColor: Colors.vegGreen }]} />
                                    <View style={styles.routeLine} />
                                </View>
                                <View style={[styles.routeFieldWrap, { borderBottomWidth: 1, borderBottomColor: Colors.border }]}>
                                    <Text style={styles.routeFieldLabel}>FROM</Text>
                                    <TextInput
                                        value={from}
                                        onChangeText={setFrom}
                                        style={styles.routeField}
                                        placeholderTextColor={Colors.textMuted}
                                        placeholder="Starting point"
                                    />
                                </View>
                            </View>
                            {/* TO */}
                            <View style={styles.routeRow}>
                                <View style={styles.routeIndicator}>
                                    <View style={[styles.routeDot, { backgroundColor: Colors.redPin }]} />
                                </View>
                                <View style={styles.routeFieldWrap}>
                                    <Text style={styles.routeFieldLabel}>TO</Text>
                                    <TextInput
                                        value={to}
                                        onChangeText={setTo}
                                        style={styles.routeField}
                                        placeholderTextColor={Colors.textMuted}
                                        placeholder="Destination"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Find button */}
                        <TouchableOpacity
                            style={styles.findBtn}
                            onPress={() => navigation.navigate('restaurants')}
                            activeOpacity={0.88}
                        >
                            <Text style={styles.findBtnText}>Find Restaurants on Route</Text>
                            <View style={styles.findBtnArrowBox}>
                                <Text style={styles.findBtnArrow}>→</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* ── DELIVERY TIME ─────────────────────────────────────── */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>When do you want it?</Text>
                        </View>
                        <View style={styles.timeGrid}>
                            {DELIVERY_TIMES.map(t => (
                                <TouchableOpacity
                                    key={t.id}
                                    style={[styles.timeCard, selectedTime === t.id && styles.timeCardActive]}
                                    onPress={() => setSelectedTime(t.id)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.timeCardEmoji}>{t.emoji}</Text>
                                    <Text style={[styles.timeCardText, selectedTime === t.id && styles.timeCardTextActive]}>
                                        {t.label}
                                    </Text>
                                    {selectedTime === t.id && <View style={styles.timeCardActiveDot} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* ── FILTERS ───────────────────────────────────────────── */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterRow}
                        style={{ marginHorizontal: -20, paddingHorizontal: 20, marginBottom: 30 }}
                    >
                        {HOME_FILTERS.map(f => (
                            <TouchableOpacity
                                key={f}
                                style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                                onPress={() => setActiveFilter(f)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
                                    {f}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* ── OFFERS ────────────────────────────────────────────── */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>Special Offers</Text>
                            <TouchableOpacity activeOpacity={0.7}>
                                <Text style={styles.seeAllText}>See all →</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 14, paddingRight: 4 }}
                            style={{ marginHorizontal: -20, paddingHorizontal: 20 }}
                        >
                            {OFFERS.map(o => (
                                <TouchableOpacity key={o.id} style={styles.offerCard} activeOpacity={0.85}>
                                    {/* Top accent strip */}
                                    <View style={[styles.offerStrip, { backgroundColor: o.color }]} />
                                    <View style={[styles.offerIconBox, { backgroundColor: o.bg }]}>
                                        <Text style={{ fontSize: 28 }}>{o.emoji}</Text>
                                    </View>
                                    <Text style={[styles.offerTitle, { color: o.color }]}>{o.label}</Text>
                                    <Text style={styles.offerDesc}>{o.sub}</Text>
                                    <View style={[styles.offerCta, { borderColor: o.color + '50' }]}>
                                        <Text style={[styles.offerCtaText, { color: o.color }]}>Grab →</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* ── CATEGORIES ────────────────────────────────────────── */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Browse by Category</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 12, paddingRight: 4 }}
                            style={{ marginHorizontal: -20, paddingHorizontal: 20 }}
                        >
                            {CATEGORIES.map(c => (
                                <TouchableOpacity
                                    key={c.id}
                                    style={[styles.catCard, activeCat === c.id && styles.catCardActive]}
                                    onPress={() => setActiveCat(c.id)}
                                    activeOpacity={0.85}
                                >
                                    <View style={[styles.catEmojiBox, activeCat === c.id && styles.catEmojiBoxActive]}>
                                        <Text style={styles.catCardEmoji}>{c.emoji}</Text>
                                    </View>
                                    <Text style={[styles.catCardLabel, activeCat === c.id && styles.catCardLabelActive]}>
                                        {c.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* ── QUICK BITES ───────────────────────────────────────── */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>Quick Bites</Text>
                            <TouchableOpacity activeOpacity={0.7}>
                                <Text style={styles.seeAllText}>See all →</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 14, paddingRight: 4 }}
                            style={{ marginHorizontal: -20, paddingHorizontal: 20 }}
                        >
                            {QUICK_BITES.map(b => (
                                <TouchableOpacity key={b.id} style={styles.biteCard} activeOpacity={0.85}>
                                    <View style={styles.biteIconBox}>
                                        <Text style={styles.biteEmoji}>{b.emoji}</Text>
                                    </View>
                                    <Text style={styles.biteName}>{b.name}</Text>
                                    <View style={styles.biteFooter}>
                                        <Text style={styles.bitePrice}>{b.price}</Text>
                                        <View style={styles.biteRating}>
                                            <Text style={styles.biteRatingStar}>★</Text>
                                            <Text style={styles.biteRatingText}>{b.rating}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* ── RESTAURANTS ON ROUTE ─────────────────────────────── */}
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>On Your Route</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('restaurants')} activeOpacity={0.7}>
                            <Text style={styles.seeAllText}>See all →</Text>
                        </TouchableOpacity>
                    </View>

                    {POPULAR_RESTAURANTS.map(r => (
                        <RestaurantCard key={r.id} r={r} />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.bg,
    },

    // ── HERO ──────────────────────────────────────────────────────
    hero: {
        backgroundColor: Colors.brandRed,
        paddingTop: Platform.OS === 'android' ? 40 : 64,
        paddingHorizontal: 22,
        paddingBottom: 52, // extra so search card overlaps cleanly
        overflow: 'hidden',
        position: 'relative',
    },
    heroShape1: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: 'rgba(255,211,0,0.18)',
        top: -90,
        right: -60,
    },
    heroShape2: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255,211,0,0.12)',
        bottom: -40,
        left: -50,
    },
    heroShape3: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(0,0,0,0.06)',
        top: 60,
        right: 160,
    },
    heroDiag: {
        position: 'absolute',
        width: 200,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.10)',
        bottom: 70,
        right: -30,
        transform: [{ rotate: '-18deg' }],
    },

    // Nav
    heroNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 28,
    },
    heroNavLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    heroLogoWrap: {
        width: 48,
        height: 48,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.38)',
        ...Shadow.amber,
    },
    heroLogo: {
        width: '100%',
        height: '100%',
    },
    heroLogoShine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '45%',
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    heroAppName: {
        fontFamily: 'SpaceGrotesk-Bold',
        fontSize: 22,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.8,
    },
    heroLocRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 2,
    },
    heroLocDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.65)',
    },
    heroLocText: {
        fontFamily: 'DM Sans',
        fontSize: 11,
        color: 'rgba(255,255,255,0.72)',
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    heroNotif: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.30)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    notifDot: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: Colors.redPin,
        borderWidth: 2,
        borderColor: Colors.amber,
    },

    // Greeting
    heroGreetingBlock: {
        marginBottom: 24,
    },
    heroGreeting: {
        fontFamily: 'SpaceGrotesk-Bold',
        fontSize: 38,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -1.5,
        lineHeight: 44,
    },
    heroSub: {
        fontFamily: 'DM Sans',
        fontSize: 14.5,
        color: 'rgba(255,255,255,0.75)',
        fontWeight: '500',
        marginTop: 8,
        lineHeight: 21,
    },

    // Stats strip
    heroStats: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.12)',
        borderRadius: 20,
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        marginBottom: 18,
    },
    heroStat: {
        flex: 1,
        alignItems: 'center',
        gap: 3,
    },
    heroStatIcon: {
        fontSize: 16,
        marginBottom: 2,
    },
    heroStatValue: {
        fontFamily: 'SpaceGrotesk-Bold',
        fontSize: 19,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    heroStatLabel: {
        fontFamily: 'DM Sans',
        fontSize: 10,
        color: 'rgba(255,255,255,0.62)',
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    heroStatDivider: {
        width: 1,
        height: 32,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignSelf: 'center',
    },

    // CTA row
    heroCtaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    heroCta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 18,
        ...Shadow.card,
    },
    heroCtaText: {
        fontFamily: 'SpaceGrotesk-Bold',
        fontSize: 14,
        fontWeight: '900',
        color: Colors.amber,
        letterSpacing: -0.3,
    },
    heroCtaArrow: {
        fontSize: 15,
        color: Colors.amber,
        fontWeight: '900',
    },
    heroLiveChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.18)',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.28)',
    },
    heroLiveDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#4ADE80',
    },
    heroLiveText: {
        fontFamily: 'DM Sans',
        fontSize: 12,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '700',
    },

    // ── SEARCH ────────────────────────────────────────────────────
    searchOuter: {
        paddingHorizontal: 18,
        marginTop: -26,
        marginBottom: 22,
        zIndex: 10,
    },
    searchInner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        paddingHorizontal: 16,
        height: 54,
        borderWidth: 1.5,
        gap: 10,
        ...Shadow.card,
    },
    searchIcon: {
        fontSize: 16,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'DM Sans',
        fontSize: 14,
        color: Colors.textPrimary,
        fontWeight: '600',
        padding: 0,
    },
    searchClearBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchClearText: {
        fontSize: 12,
        color: Colors.textMuted,
        fontWeight: '700',
    },
    searchKbd: {
        backgroundColor: Colors.bgElevated,
        borderRadius: 7,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    searchKbdText: {
        fontFamily: 'DM Sans',
        fontSize: 10,
        color: Colors.textMuted,
        fontWeight: '700',
    },

    // ── BODY ──────────────────────────────────────────────────────
    body: {
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontFamily: 'SpaceGrotesk-Bold',
        fontSize: 18,
        fontWeight: '900',
        color: Colors.textPrimary,
        letterSpacing: -0.6,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAllText: {
        fontFamily: 'DM Sans',
        fontSize: 13,
        color: Colors.amber,
        fontWeight: '800',
    },

    // ── TRIP PLANNER ──────────────────────────────────────────────
    plannerCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: 24,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1.5,
        borderColor: Colors.borderActive,
        ...Shadow.card,
    },
    plannerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },
    plannerLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    plannerLabelAccent: {
        width: 4,
        height: 18,
        borderRadius: 2,
        backgroundColor: Colors.amber,
    },
    plannerLabel: {
        fontFamily: 'SpaceGrotesk-Bold',
        fontSize: 14,
        fontWeight: '900',
        color: Colors.textPrimary,
        letterSpacing: -0.3,
    },
    plannerSwapBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: Colors.amberGlow,
        paddingHorizontal: 13,
        paddingVertical: 8,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: Colors.borderActive,
    },
    plannerSwapIcon: {
        fontSize: 14,
        color: Colors.amber,
        fontWeight: '900',
    },
    plannerSwapText: {
        fontFamily: 'DM Sans',
        fontSize: 12,
        color: Colors.amber,
        fontWeight: '800',
    },
    routeBox: {
        backgroundColor: Colors.bgInput,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingTop: 4,
        paddingBottom: 4,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    routeRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 14,
    },
    routeIndicator: {
        alignItems: 'center',
        paddingTop: 22,
        width: 14,
    },
    routeDot: {
        width: 13,
        height: 13,
        borderRadius: 7,
        borderWidth: 2.5,
        borderColor: Colors.bgCard,
        flexShrink: 0,
    },
    routeLine: {
        flex: 1,
        width: 2,
        backgroundColor: Colors.border,
        marginTop: 5,
        alignSelf: 'center',
        minHeight: 20,
        borderRadius: 1,
    },
    routeFieldWrap: {
        flex: 1,
        paddingVertical: 13,
    },
    routeFieldLabel: {
        fontFamily: 'DM Sans',
        fontSize: 10,
        fontWeight: '900',
        color: Colors.textMuted,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    routeField: {
        fontFamily: 'SpaceGrotesk-Bold',
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textPrimary,
        padding: 0,
        letterSpacing: -0.3,
    },
    findBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.amber,
        borderRadius: 14,
        paddingVertical: 14,
        paddingLeft: 20,
        paddingRight: 14,
        ...Shadow.amber,
    },
    findBtnText: {
        fontFamily: 'SpaceGrotesk-Bold',
        fontSize: 15,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.3,
    },
    findBtnArrowBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.22)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    findBtnArrow: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '900',
    },

    // ── DELIVERY TIME ─────────────────────────────────────────────
    timeGrid: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 14,
    },
    timeCard: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: Colors.bgCard,
        borderRadius: 16,
        paddingVertical: 14,
        borderWidth: 1.5,
        borderColor: Colors.border,
        gap: 5,
        position: 'relative',
        overflow: 'hidden',
        ...Shadow.card,
    },
    timeCardActive: {
        backgroundColor: Colors.amber,
        borderColor: Colors.amber,
        ...Shadow.amber,
    },
    timeCardEmoji: { fontSize: 20 },
    timeCardText: {
        fontFamily: 'DM Sans',
        fontSize: 11,
        fontWeight: '800',
        color: Colors.textSecondary,
        letterSpacing: 0.1,
    },
    timeCardTextActive: {
        color: '#FFFFFF',
        fontWeight: '900',
    },
    timeCardActiveDot: {
        position: 'absolute',
        bottom: 5,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.6)',
    },

    // ── FILTERS ───────────────────────────────────────────────────
    filterRow: {
        gap: 10,
        paddingRight: 4,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: Radius.full,
        backgroundColor: Colors.bgCard,
        borderWidth: 1.5,
        borderColor: Colors.border,
        ...Shadow.card,
    },
    filterChipActive: {
        backgroundColor: Colors.amber,
        borderColor: Colors.amber,
        ...Shadow.amber,
    },
    filterChipText: {
        fontFamily: 'DM Sans',
        fontSize: 13,
        fontWeight: '700',
        color: Colors.textSecondary,
    },
    filterChipTextActive: {
        color: '#FFFFFF',
        fontWeight: '900',
    },

    // ── OFFERS ────────────────────────────────────────────────────
    offerCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: 20,
        padding: 16,
        paddingTop: 20,
        width: 154,
        borderWidth: 1.5,
        borderColor: Colors.border,
        overflow: 'hidden',
        ...Shadow.card,
    },
    offerStrip: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
    },
    offerIconBox: {
        width: 52,
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    offerTitle: {
        fontFamily: 'SpaceGrotesk-Bold',
        fontSize: 17,
        fontWeight: '900',
        letterSpacing: -0.4,
        marginBottom: 4,
    },
    offerDesc: {
        fontFamily: 'DM Sans',
        fontSize: 11,
        color: Colors.textMuted,
        fontWeight: '600',
        lineHeight: 16,
        marginBottom: 14,
    },
    offerCta: {
        borderWidth: 1.5,
        borderRadius: 10,
        paddingVertical: 7,
        alignItems: 'center',
    },
    offerCtaText: {
        fontFamily: 'DM Sans',
        fontSize: 12,
        fontWeight: '800',
    },

    // ── CATEGORIES ────────────────────────────────────────────────
    catCard: {
        alignItems: 'center',
        backgroundColor: Colors.bgCard,
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderWidth: 1.5,
        borderColor: Colors.border,
        minWidth: 84,
        gap: 8,
        ...Shadow.card,
    },
    catCardActive: {
        borderColor: Colors.amber,
        backgroundColor: Colors.amberGlow,
    },
    catEmojiBox: {
        width: 46,
        height: 46,
        borderRadius: 13,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    catEmojiBoxActive: {
        backgroundColor: Colors.amber,
    },
    catCardEmoji: { fontSize: 22 },
    catCardLabel: {
        fontFamily: 'DM Sans',
        fontSize: 11,
        fontWeight: '800',
        color: Colors.textSecondary,
    },
    catCardLabelActive: {
        color: Colors.amber,
        fontWeight: '900',
    },

    // ── QUICK BITES ───────────────────────────────────────────────
    biteCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: 18,
        padding: 14,
        width: 126,
        borderWidth: 1.5,
        borderColor: Colors.border,
        gap: 8,
        ...Shadow.card,
    },
    biteIconBox: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: Colors.amberGlow,
        alignItems: 'center',
        justifyContent: 'center',
    },
    biteEmoji: { fontSize: 26 },
    biteName: {
        fontFamily: 'SpaceGrotesk-Bold',
        fontSize: 13,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.2,
    },
    biteFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bitePrice: {
        fontFamily: 'DM Sans',
        fontSize: 13,
        fontWeight: '800',
        color: Colors.amber,
    },
    biteRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: Colors.bgElevated,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 7,
    },
    biteRatingStar: {
        fontSize: 9,
        color: Colors.amber,
    },
    biteRatingText: {
        fontFamily: 'DM Sans',
        fontSize: 10,
        fontWeight: '800',
        color: Colors.textSecondary,
    },

    // ── RESTAURANT CARD ───────────────────────────────────────────
    restCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: 22,
        marginBottom: 16,
        borderWidth: 1.5,
        borderColor: Colors.border,
        overflow: 'hidden',
        ...Shadow.card,
    },
    restCardDimmed: {
        opacity: 0.5,
    },
    restImageArea: {
        height: 148,
        position: 'relative',
    },
    restImageBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    restImageStripe: {
        position: 'absolute',
        width: 300,
        height: 60,
        backgroundColor: 'rgba(255,255,255,0.06)',
        top: 30,
        left: -40,
        transform: [{ rotate: '-8deg' }],
    },
    vegIndicator: {
        position: 'absolute',
        top: 12,
        left: 12,
        width: 26,
        height: 26,
        borderRadius: 7,
        borderWidth: 2,
        backgroundColor: Colors.bgCard,
        alignItems: 'center',
        justifyContent: 'center',
    },
    vegDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    ratingBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: Colors.textPrimary,
        borderRadius: 9,
        paddingHorizontal: 9,
        paddingVertical: 5,
    },
    ratingBadgeStar: {
        fontSize: 10,
        color: Colors.amber,
    },
    ratingBadgeText: {
        fontFamily: 'SpaceGrotesk-Bold',
        fontSize: 13,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.3,
    },
    etaBadge: {
        position: 'absolute',
        bottom: 10,
        right: 12,
        backgroundColor: 'rgba(26,22,16,0.65)',
        borderRadius: 9,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    etaBadgeText: {
        fontFamily: 'DM Sans',
        fontSize: 11,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    passedBanner: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(26,22,16,0.52)',
        paddingVertical: 8,
        alignItems: 'center',
    },
    passedBannerInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    passedBannerText: {
        fontFamily: 'DM Sans',
        fontSize: 11,
        color: '#FFFFFF',
        fontWeight: '900',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    restContent: {
        padding: 16,
        gap: 10,
    },
    restTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
    },
    restName: {
        fontFamily: 'SpaceGrotesk-Bold',
        fontSize: 17,
        fontWeight: '900',
        color: Colors.textPrimary,
        letterSpacing: -0.5,
        flex: 1,
    },
    restCuisine: {
        fontFamily: 'DM Sans',
        fontSize: 12,
        color: Colors.textMuted,
        fontWeight: '500',
        marginTop: 2,
    },
    priceBadge: {
        flexDirection: 'row',
        alignItems: 'baseline',
        backgroundColor: Colors.bgElevated,
        borderRadius: 8,
        paddingHorizontal: 9,
        paddingVertical: 4,
        flexShrink: 0,
    },
    priceText: {
        fontFamily: 'SpaceGrotesk-Bold',
        fontSize: 13,
        fontWeight: '900',
        color: Colors.textPrimary,
        letterSpacing: -0.3,
    },
    priceFor: {
        fontFamily: 'DM Sans',
        fontSize: 10,
        color: Colors.textMuted,
        fontWeight: '600',
    },
    restDivider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 2,
    },
    restBottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    metaGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
        flexWrap: 'wrap',
    },
    metaPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.full,
        paddingHorizontal: 9,
        paddingVertical: 5,
    },
    metaIcon: {
        fontSize: 10,
    },
    metaPillText: {
        fontFamily: 'DM Sans',
        fontSize: 11,
        color: Colors.textSecondary,
        fontWeight: '700',
    },
    metaDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: Colors.border,
    },
    tagChip: {
        backgroundColor: Colors.amberGlow2,
        borderRadius: Radius.full,
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: Colors.borderActive,
    },
    tagChipText: {
        fontFamily: 'DM Sans',
        fontSize: 10,
        color: Colors.amber,
        fontWeight: '800',
    },
    menuCta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.amber,
        borderRadius: 11,
        paddingVertical: 9,
        paddingHorizontal: 14,
        flexShrink: 0,
        ...Shadow.amber,
    },
    menuCtaText: {
        fontFamily: 'SpaceGrotesk-Bold',
        fontSize: 13,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.2,
    },
    menuCtaArrow: {
        fontSize: 13,
        color: '#FFFFFF',
        fontWeight: '900',
    },
});