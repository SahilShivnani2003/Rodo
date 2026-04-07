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
    ActivityIndicator,
} from 'react-native';
import { Colors, Radius, Shadow } from '@theme/index';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList } from '@/types/RootStackParamList';
import { MainTabParamList } from '@/types/MainTabParamList';
import { useRestaurants } from '../hooks/useRestaurant';
import { useRoutes } from '../hooks/useRoutes';
import { Restaurant } from '@/features/restaurant/types/Restaurant';

const { width } = Dimensions.get('window');

// ─── Static Data ──────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Derive a human-readable cuisine string from the Restaurant object */
const getCuisine = (r: Restaurant): string => {
    const parts: string[] = [];
    if (r.cuisines?.length) parts.push(r.cuisines.slice(0, 2).join(' · '));
    if (r.foodType === 'veg')     parts.push('Veg');
    if (r.foodType === 'non-veg') parts.push('Non-Veg');
    return parts.join(' · ') || 'Multi-cuisine';
};

/** Rough ETA string from avg prep time */
const getEta = (r: Restaurant): string =>
    r.avgPrepTimeMinutes ? `~${r.avgPrepTimeMinutes} min` : 'N/A';

// ─── Types ────────────────────────────────────────────────────────────────────
type homeProps = NativeStackScreenProps<MainTabParamList, 'home'>;

// ─── PressCard ────────────────────────────────────────────────────────────────
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
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={{ flex: 1 }}
            >
                {children}
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardScreen({ navigation }: homeProps) {
    // ── Data fetching ──────────────────────────────────────────────────────────
    const { data: routesData, isLoading: routesLoading } = useRoutes();
    const routes = routesData?.data?.routes ?? [];
    const firstRouteId = routes[0]?._id ?? '';

    const { data: restaurantsData, isLoading: restaurantsLoading } =
        useRestaurants(firstRouteId);
    const restaurants: Restaurant[] = restaurantsData?.data?.restaurants ?? [];

    // ── Local state ────────────────────────────────────────────────────────────
    const [from, setFrom]               = useState('Bhopal');
    const [to, setTo]                   = useState('Indore');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTime, setSelectedTime] = useState('immediately');
    const [activeFilter, setActiveFilter] = useState('All');
    const [activeCat, setActiveCat]     = useState('1');
    const searchFocused = useRef(new Animated.Value(0)).current;

    const handleSwap = () => { const t = from; setFrom(to); setTo(t); };

    const focusSearch = () =>
        Animated.spring(searchFocused, { toValue: 1, useNativeDriver: false, tension: 120, friction: 8 }).start();
    const blurSearch = () =>
        Animated.spring(searchFocused, { toValue: 0, useNativeDriver: false, tension: 120, friction: 8 }).start();

    const searchBorder = searchFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [Colors.border, Colors.borderActive],
    });

    // ── Filter logic ───────────────────────────────────────────────────────────
    const filteredRestaurants = restaurants.filter(r => {
        if (activeFilter === 'Veg')       return r.foodType === 'veg';
        if (activeFilter === 'Non-Veg')   return r.foodType === 'non-veg';
        if (activeFilter === 'Open Now')  return r.isOpen;
        if (activeFilter === 'Top Rated') return r.rating >= 4.5;
        return true; // 'All'
    });

    // ── Search filter on top ───────────────────────────────────────────────────
    const displayedRestaurants = searchQuery.trim()
        ? filteredRestaurants.filter(r =>
              r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              r.cuisines?.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())),
          )
        : filteredRestaurants;

    // ── Restaurant Card ────────────────────────────────────────────────────────
    const RestaurantCard = ({ r }: { r: Restaurant }) => {
        const id      = r._id ?? '';
        const isVeg   = r.foodType === 'veg';
        // A restaurant is "ahead" (orderable) if it's open and active
        const isAhead = r.isOpen && r.isActive;

        return (
            <PressCard
                onPress={() =>
                    isAhead && id &&
                    navigation
                        .getParent<NativeStackNavigationProp<RootStackParamList>>()
                        .navigate('menu', { restaurantId: id })
                }
                disabled={!isAhead || !id}
                style={[styles.restCard, !isAhead && styles.restCardDimmed]}
            >
                {/* Image section */}
                <View style={styles.restImageArea}>
                    <View style={[styles.restImageBg, !isAhead && { backgroundColor: Colors.passed }]}>
                        <View style={styles.restImageStripe} />
                        {r.coverImage ? (
                            <Image
                                source={{ uri: r.coverImage }}
                                style={StyleSheet.absoluteFillObject}
                                resizeMode="cover"
                            />
                        ) : (
                            <Text style={{ fontSize: 52 }}>🍽️</Text>
                        )}
                    </View>

                    {/* Veg indicator */}
                    <View style={[styles.vegIndicator, { borderColor: isVeg ? Colors.vegGreen : Colors.redPin }]}>
                        <View style={[styles.vegDot, { backgroundColor: isVeg ? Colors.vegGreen : Colors.redPin }]} />
                    </View>

                    {/* Rating pill */}
                    <View style={styles.ratingBadge}>
                        <Text style={styles.ratingBadgeStar}>★</Text>
                        <Text style={styles.ratingBadgeText}>{r.rating.toFixed(1)}</Text>
                    </View>

                    {/* ETA badge */}
                    {isAhead && (
                        <View style={styles.etaBadge}>
                            <Text style={styles.etaBadgeText}>⏱ {getEta(r)}</Text>
                        </View>
                    )}

                    {/* Verified badge */}
                    {r.isVerified && (
                        <View style={styles.verifiedBadge}>
                            <Text style={styles.verifiedBadgeText}>✓ Verified</Text>
                        </View>
                    )}

                    {!isAhead && (
                        <View style={styles.passedBanner}>
                            <View style={styles.passedBannerInner}>
                                <Text style={styles.passedBannerText}>
                                    {!r.isOpen ? 'Currently Closed' : 'Unavailable'}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={styles.restContent}>
                    <View style={styles.restTopRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.restName} numberOfLines={1}>{r.name}</Text>
                            <Text style={styles.restCuisine}>{getCuisine(r)}</Text>
                        </View>
                        <View style={styles.priceBadge}>
                            <Text style={styles.priceText}>{r.totalRatings}</Text>
                            <Text style={styles.priceFor}> ratings</Text>
                        </View>
                    </View>

                    <View style={styles.restDivider} />

                    <View style={styles.restBottomRow}>
                        <View style={styles.metaGroup}>
                            <View style={styles.metaPill}>
                                <Text style={styles.metaIcon}>📍</Text>
                                <Text style={styles.metaPillText}>{r.address.city}</Text>
                            </View>
                            <View style={styles.metaDot} />
                            {r.cuisines?.slice(0, 2).map(tag => (
                                <View key={tag} style={styles.tagChip}>
                                    <Text style={styles.tagChipText}>{tag}</Text>
                                </View>
                            ))}
                        </View>

                        {isAhead && id && (
                            <TouchableOpacity
                                style={styles.menuCta}
                                activeOpacity={0.85}
                                onPress={() =>
                                    navigation
                                        .getParent<NativeStackNavigationProp<RootStackParamList>>()
                                        .navigate('menu', { restaurantId: id })
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
    };

    const isLoading = routesLoading || restaurantsLoading;

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.brandRed} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* ══ HERO ══════════════════════════════════════════════════════ */}
                <View style={styles.hero}>
                    <View style={styles.heroShape1} />
                    <View style={styles.heroShape2} />
                    <View style={styles.heroShape3} />
                    <View style={styles.heroDiag} />

                    {/* Top nav */}
                    <View style={styles.heroNav}>
                        <View style={styles.heroNavLeft}>
                            <View style={styles.heroLogoWrap}>
                                <Image
                                    source={require('../../../assets/logo.jpeg')}
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

                    {/* Greeting */}
                    <View style={styles.heroGreetingBlock}>
                        <Text style={styles.heroGreeting}>Hey Rahul! 👋</Text>
                        <Text style={styles.heroSub}>
                            Pre-order highway food so it's ready{'\n'}When you arrive. No waiting, just eating!
                        </Text>
                    </View>

                    {/* How it works */}
                    <View style={styles.howItWorks}>
                        {[
                            { icon: 'circle-small', label: 'Select Route'          },
                            { icon: 'circle-small', label: 'Order Food Ahead'      },
                            { icon: 'circle-small', label: 'Enjoy Hot & Fresh Food'},
                        ].map(step => (
                            <View key={step.label} style={styles.howItWorksRow}>
                                <Icon name={step.icon} size={18} color="rgba(255,255,255,0.8)" />
                                <Text style={styles.howItWorksText}>{step.label}</Text>
                            </View>
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
                    </View>
                </View>

                {/* ══ SEARCH ════════════════════════════════════════════════════ */}
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

                    {/* ── RESTAURANTS ON ROUTE ──────────────────────────────── */}
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>On Your Route</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('restaurants')} activeOpacity={0.7}>
                            <Text style={styles.seeAllText}>See all →</Text>
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator
                            color={Colors.brandRed}
                            size="large"
                            style={{ marginTop: 24 }}
                        />
                    ) : displayedRestaurants.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateEmoji}>🍽️</Text>
                            <Text style={styles.emptyStateTitle}>No restaurants found</Text>
                            <Text style={styles.emptyStateDesc}>
                                {searchQuery
                                    ? 'Try a different search term'
                                    : 'No restaurants available on this route'}
                            </Text>
                        </View>
                    ) : (
                        displayedRestaurants.map(r => (
                            <RestaurantCard key={r._id ?? r.name} r={r} />
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },

    // ── HERO ──────────────────────────────────────────────────────────────────
    hero: {
        backgroundColor: Colors.brandRed,
        paddingTop: Platform.OS === 'android' ? 40 : 64,
        paddingHorizontal: 22,
        paddingBottom: 52,
        overflow: 'hidden',
        position: 'relative',
    },
    heroShape1: {
        position: 'absolute', width: 280, height: 280, borderRadius: 140,
        backgroundColor: 'rgba(255,211,0,0.18)', top: -90, right: -60,
    },
    heroShape2: {
        position: 'absolute', width: 180, height: 180, borderRadius: 90,
        backgroundColor: 'rgba(255,211,0,0.12)', bottom: -40, left: -50,
    },
    heroShape3: {
        position: 'absolute', width: 100, height: 100, borderRadius: 50,
        backgroundColor: 'rgba(0,0,0,0.06)', top: 60, right: 160,
    },
    heroDiag: {
        position: 'absolute', width: 200, height: 3,
        backgroundColor: 'rgba(255,255,255,0.10)', bottom: 70, right: -30,
        transform: [{ rotate: '-18deg' }],
    },
    heroNav: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 28,
    },
    heroNavLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    heroLogoWrap: {
        width: 48, height: 48, borderRadius: 14, overflow: 'hidden',
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.38)', ...Shadow.amber,
    },
    heroLogo: { width: '100%', height: '100%' },
    heroLogoShine: {
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '45%', backgroundColor: 'rgba(255,255,255,0.12)',
    },
    heroAppName: {
        fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.8,
    },
    heroLocRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
    heroLocDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.65)' },
    heroLocText: { fontSize: 11, color: 'rgba(255,255,255,0.72)', fontWeight: '600', letterSpacing: 0.3 },
    heroNotif: {
        width: 48, height: 48, borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.30)', alignItems: 'center', justifyContent: 'center',
    },
    notifDot: {
        position: 'absolute', top: 10, right: 10, width: 9, height: 9,
        borderRadius: 5, backgroundColor: Colors.redPin, borderWidth: 2, borderColor: Colors.amber,
    },
    heroGreetingBlock: { marginBottom: 20 },
    heroGreeting: { fontSize: 38, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1.5, lineHeight: 44 },
    heroSub: { fontSize: 14.5, color: 'rgba(255,255,255,0.75)', fontWeight: '500', marginTop: 8, lineHeight: 21 },

    // How it works
    howItWorks: { marginBottom: 20, gap: 6 },
    howItWorksRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    howItWorksText: { fontSize: 13, color: 'rgba(255,255,255,0.80)', fontWeight: '600' },

    heroCtaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    heroCta: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#FFFFFF', borderRadius: 14,
        paddingVertical: 12, paddingHorizontal: 18, ...Shadow.card,
    },
    heroCtaText: { fontSize: 14, fontWeight: '900', color: Colors.amber, letterSpacing: -0.3 },
    heroCtaArrow: { fontSize: 15, color: Colors.amber, fontWeight: '900' },

    // ── SEARCH ────────────────────────────────────────────────────────────────
    searchOuter: { paddingHorizontal: 18, marginTop: -26, marginBottom: 22, zIndex: 10 },
    searchInner: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg, paddingHorizontal: 16, height: 54, borderWidth: 1.5, gap: 10, ...Shadow.card,
    },
    searchIcon: { fontSize: 16 },
    searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '600', padding: 0 },
    searchClearBtn: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center',
    },
    searchClearText: { fontSize: 12, color: Colors.textMuted, fontWeight: '700' },
    searchKbd: {
        backgroundColor: Colors.bgElevated, borderRadius: 7,
        paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: Colors.border,
    },
    searchKbdText: { fontSize: 10, color: Colors.textMuted, fontWeight: '700' },

    // ── BODY ──────────────────────────────────────────────────────────────────
    body: { paddingHorizontal: 20 },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 18, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.6 },
    sectionHeaderRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 16,
    },
    seeAllText: { fontSize: 13, color: Colors.amber, fontWeight: '800' },

    // ── TRIP PLANNER ──────────────────────────────────────────────────────────
    plannerCard: {
        backgroundColor: Colors.bgCard, borderRadius: 24, padding: 20, marginBottom: 30,
        borderWidth: 1.5, borderColor: Colors.borderActive, ...Shadow.card,
    },
    plannerHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 18,
    },
    plannerLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    plannerLabelAccent: { width: 4, height: 18, borderRadius: 2, backgroundColor: Colors.amber },
    plannerLabel: { fontSize: 14, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.3 },
    plannerSwapBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.amberGlow,
        paddingHorizontal: 13, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderActive,
    },
    plannerSwapIcon: { fontSize: 14, color: Colors.amber, fontWeight: '900' },
    plannerSwapText: { fontSize: 12, color: Colors.amber, fontWeight: '800' },
    routeBox: {
        backgroundColor: Colors.bgInput, borderRadius: 16, paddingHorizontal: 14,
        paddingTop: 4, paddingBottom: 4, marginBottom: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
    },
    routeRow: { flexDirection: 'row', alignItems: 'stretch', gap: 14 },
    routeIndicator: { alignItems: 'center', paddingTop: 22, width: 14 },
    routeDot: { width: 13, height: 13, borderRadius: 7, borderWidth: 2.5, borderColor: Colors.bgCard, flexShrink: 0 },
    routeLine: {
        flex: 1, width: 2, backgroundColor: Colors.border,
        marginTop: 5, alignSelf: 'center', minHeight: 20, borderRadius: 1,
    },
    routeFieldWrap: { flex: 1, paddingVertical: 13 },
    routeFieldLabel: {
        fontSize: 10, fontWeight: '900', color: Colors.textMuted,
        letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4,
    },
    routeField: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, padding: 0, letterSpacing: -0.3 },
    findBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: Colors.amber, borderRadius: 14, paddingVertical: 14,
        paddingLeft: 20, paddingRight: 14, ...Shadow.amber,
    },
    findBtnText: { fontSize: 15, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.3 },
    findBtnArrowBox: {
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center',
    },
    findBtnArrow: { fontSize: 16, color: '#FFFFFF', fontWeight: '900' },

    // ── DELIVERY TIME ─────────────────────────────────────────────────────────
    timeGrid: { flexDirection: 'row', gap: 10, marginTop: 14 },
    timeCard: {
        flex: 1, alignItems: 'center', backgroundColor: Colors.bgCard,
        borderRadius: 16, paddingVertical: 14, borderWidth: 1.5, borderColor: Colors.border,
        gap: 5, position: 'relative', overflow: 'hidden', ...Shadow.card,
    },
    timeCardActive: { backgroundColor: Colors.amber, borderColor: Colors.amber, ...Shadow.amber },
    timeCardEmoji: { fontSize: 20 },
    timeCardText: { fontSize: 11, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 0.1 },
    timeCardTextActive: { color: '#FFFFFF', fontWeight: '900' },
    timeCardActiveDot: {
        position: 'absolute', bottom: 5, width: 4, height: 4,
        borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.6)',
    },

    // ── FILTERS ───────────────────────────────────────────────────────────────
    filterRow: { gap: 10, paddingRight: 4 },
    filterChip: {
        paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.full,
        backgroundColor: Colors.bgCard, borderWidth: 1.5, borderColor: Colors.border, ...Shadow.card,
    },
    filterChipActive: { backgroundColor: Colors.amber, borderColor: Colors.amber, ...Shadow.amber },
    filterChipText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
    filterChipTextActive: { color: '#FFFFFF', fontWeight: '900' },

    // ── OFFERS ────────────────────────────────────────────────────────────────
    offerCard: {
        backgroundColor: Colors.bgCard, borderRadius: 20, padding: 16, paddingTop: 20,
        width: 154, borderWidth: 1.5, borderColor: Colors.border, overflow: 'hidden', ...Shadow.card,
    },
    offerStrip: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
    offerIconBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    offerTitle: { fontSize: 17, fontWeight: '900', letterSpacing: -0.4, marginBottom: 4 },
    offerDesc: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', lineHeight: 16, marginBottom: 14 },
    offerCta: { borderWidth: 1.5, borderRadius: 10, paddingVertical: 7, alignItems: 'center' },
    offerCtaText: { fontSize: 12, fontWeight: '800' },

    // ── CATEGORIES ────────────────────────────────────────────────────────────
    catCard: {
        alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: 18,
        paddingHorizontal: 18, paddingVertical: 14, borderWidth: 1.5,
        borderColor: Colors.border, minWidth: 84, gap: 8, ...Shadow.card,
    },
    catCardActive: { borderColor: Colors.amber, backgroundColor: Colors.amberGlow },
    catEmojiBox: { width: 46, height: 46, borderRadius: 13, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
    catEmojiBoxActive: { backgroundColor: Colors.amber },
    catCardEmoji: { fontSize: 22 },
    catCardLabel: { fontSize: 11, fontWeight: '800', color: Colors.textSecondary },
    catCardLabelActive: { color: Colors.amber, fontWeight: '900' },

    // ── QUICK BITES ───────────────────────────────────────────────────────────
    biteCard: {
        backgroundColor: Colors.bgCard, borderRadius: 18, padding: 14,
        width: 126, borderWidth: 1.5, borderColor: Colors.border, gap: 8, ...Shadow.card,
    },
    biteIconBox: { width: 52, height: 52, borderRadius: 14, backgroundColor: Colors.amberGlow, alignItems: 'center', justifyContent: 'center' },
    biteEmoji: { fontSize: 26 },
    biteName: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },
    biteFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    bitePrice: { fontSize: 13, fontWeight: '800', color: Colors.amber },
    biteRating: {
        flexDirection: 'row', alignItems: 'center', gap: 2,
        backgroundColor: Colors.bgElevated, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 7,
    },
    biteRatingStar: { fontSize: 9, color: Colors.amber },
    biteRatingText: { fontSize: 10, fontWeight: '800', color: Colors.textSecondary },

    // ── RESTAURANT CARD ───────────────────────────────────────────────────────
    restCard: {
        backgroundColor: Colors.bgCard, borderRadius: 22, marginBottom: 16,
        borderWidth: 1.5, borderColor: Colors.border, overflow: 'hidden', ...Shadow.card,
    },
    restCardDimmed: { opacity: 0.5 },
    restImageArea: { height: 148, position: 'relative' },
    restImageBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center',
    },
    restImageStripe: {
        position: 'absolute', width: 300, height: 60,
        backgroundColor: 'rgba(255,255,255,0.06)', top: 30, left: -40,
        transform: [{ rotate: '-8deg' }],
    },
    vegIndicator: {
        position: 'absolute', top: 12, left: 12, width: 26, height: 26,
        borderRadius: 7, borderWidth: 2, backgroundColor: Colors.bgCard,
        alignItems: 'center', justifyContent: 'center',
    },
    vegDot: { width: 10, height: 10, borderRadius: 5 },
    ratingBadge: {
        position: 'absolute', top: 12, right: 12, flexDirection: 'row',
        alignItems: 'center', gap: 3, backgroundColor: Colors.textPrimary,
        borderRadius: 9, paddingHorizontal: 9, paddingVertical: 5,
    },
    ratingBadgeStar: { fontSize: 10, color: Colors.amber },
    ratingBadgeText: { fontSize: 13, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.3 },
    etaBadge: {
        position: 'absolute', bottom: 10, right: 12,
        backgroundColor: 'rgba(26,22,16,0.65)', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 5,
    },
    etaBadgeText: { fontSize: 11, color: '#FFFFFF', fontWeight: '700' },
    verifiedBadge: {
        position: 'absolute', bottom: 10, left: 12,
        backgroundColor: 'rgba(22,163,74,0.85)', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 5,
    },
    verifiedBadgeText: { fontSize: 10, color: '#FFFFFF', fontWeight: '800' },
    passedBanner: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(26,22,16,0.52)', paddingVertical: 8, alignItems: 'center',
    },
    passedBannerInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    passedBannerText: {
        fontSize: 11, color: '#FFFFFF', fontWeight: '900',
        letterSpacing: 1, textTransform: 'uppercase',
    },
    restContent: { padding: 16, gap: 10 },
    restTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
    restName: { fontSize: 17, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5, flex: 1 },
    restCuisine: { fontSize: 12, color: Colors.textMuted, fontWeight: '500', marginTop: 2 },
    priceBadge: {
        flexDirection: 'row', alignItems: 'baseline', backgroundColor: Colors.bgElevated,
        borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4, flexShrink: 0,
    },
    priceText: { fontSize: 13, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.3 },
    priceFor: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
    restDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 2 },
    restBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    metaGroup: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, flexWrap: 'wrap' },
    metaPill: {
        flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.bgElevated,
        borderRadius: Radius.full, paddingHorizontal: 9, paddingVertical: 5,
    },
    metaIcon: { fontSize: 10 },
    metaPillText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '700' },
    metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.border },
    tagChip: {
        backgroundColor: Colors.amberGlow2, borderRadius: Radius.full,
        paddingHorizontal: 9, paddingVertical: 5, borderWidth: 1, borderColor: Colors.borderActive,
    },
    tagChipText: { fontSize: 10, color: Colors.amber, fontWeight: '800' },
    menuCta: {
        flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.amber,
        borderRadius: 11, paddingVertical: 9, paddingHorizontal: 14, flexShrink: 0, ...Shadow.amber,
    },
    menuCtaText: { fontSize: 13, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.2 },
    menuCtaArrow: { fontSize: 13, color: '#FFFFFF', fontWeight: '900' },

    // ── EMPTY STATE ───────────────────────────────────────────────────────────
    emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
    emptyStateEmoji: { fontSize: 48, marginBottom: 8 },
    emptyStateTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
    emptyStateDesc: { fontSize: 13, color: Colors.textMuted, fontWeight: '500', textAlign: 'center' },
});