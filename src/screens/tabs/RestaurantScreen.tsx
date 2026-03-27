import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    StatusBar,
    TextInput,
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

// ─── Route Progress Bar ───────────────────────────────────────────────────────

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

// ─── Search Bar Component ─────────────────────────────────────────────────────

interface SearchBarProps {
    value: string;
    onChangeText: (t: string) => void;
    onFocus: () => void;
    onBlur: () => void;
    focused: boolean;
    onClear: () => void;
}

function SearchBar({ value, onChangeText, onFocus, onBlur, focused, onClear }: SearchBarProps) {
    return (
        <View style={[styles.searchWrap, focused && styles.searchWrapFocused]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
                style={styles.searchInput}
                value={value}
                onChangeText={onChangeText}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder="Search restaurant by name…"
                placeholderTextColor={Colors.textMuted}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="words"
            />
            {value.length > 0 && (
                <TouchableOpacity style={styles.clearBtn} onPress={onClear} activeOpacity={0.7}>
                    <View style={styles.clearCircle}>
                        <Text style={styles.clearX}>✕</Text>
                    </View>
                </TouchableOpacity>
            )}
        </View>
    );
}

// ─── No Results ───────────────────────────────────────────────────────────────

function NoResults({ query }: { query: string }) {
    return (
        <View style={styles.noResults}>
            <Text style={styles.noResultsEmoji}>🍽️</Text>
            <Text style={styles.noResultsTitle}>No restaurants found</Text>
            <Text style={styles.noResultsSub}>
                No match for <Text style={styles.noResultsQuery}>"{query}"</Text>
                {'\n'}Try a different name or clear the search
            </Text>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

type restaurantProps = NativeStackScreenProps<MainTabParamList, 'restaurants'>;

export default function RestaurantListScreen({ navigation }: restaurantProps) {
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setFocused] = useState(false);

    const isSearching = searchQuery.trim().length > 0;

    // ── Filter + search logic ─────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let list = [...ROUTE_RESTAURANTS];

        const q = searchQuery.trim().toLowerCase();
        if (q) {
            list = list.filter(
                r => r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q),
            );
        }

        if (activeFilter === 'Veg') list = list.filter(r => r.isVeg);
        if (activeFilter === 'Non-Veg') list = list.filter(r => !r.isVeg);
        if (activeFilter === 'Open Now') list = list.filter(r => r.isOpen);
        if (activeFilter === 'Top Rated') list = [...list].sort((a, b) => b.rating - a.rating);

        return list;
    }, [searchQuery, activeFilter]);

    // ── Restaurant Row ────────────────────────────────────────────────────────
    const RestaurantRow = ({ r }: { r: (typeof ROUTE_RESTAURANTS)[0] }) => {
        const isPassed = r.status === 'passed';
        const isNearest = r.status === 'nearest';
        const q = searchQuery.trim();

        // Highlight matching portion of the name
        const renderName = () => {
            if (!q) {
                return (
                    <Text style={[styles.rowName, isPassed && styles.rowNamePassed]}>{r.name}</Text>
                );
            }
            const lower = r.name.toLowerCase();
            const idx = lower.indexOf(q.toLowerCase());
            if (idx === -1) {
                return (
                    <Text style={[styles.rowName, isPassed && styles.rowNamePassed]}>{r.name}</Text>
                );
            }
            return (
                <Text style={[styles.rowName, isPassed && styles.rowNamePassed]} numberOfLines={1}>
                    {r.name.slice(0, idx)}
                    <Text style={styles.highlight}>{r.name.slice(idx, idx + q.length)}</Text>
                    {r.name.slice(idx + q.length)}
                </Text>
            );
        };

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
                            {renderName()}
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
                <TouchableOpacity
                    style={styles.cartBtn}
                    onPress={() =>
                        navigation
                            .getParent<NativeStackNavigationProp<RootStackParamList>>()
                            .navigate('cart')
                    }
                >
                    <Text>🛒</Text>
                </TouchableOpacity>
            </View>

            {/* Route progress — hidden while user is searching */}
            {!isSearching && (
                <View style={styles.routeBarWrap}>
                    <RouteProgressBar />
                </View>
            )}

            {/* ── Search bar ───────────────────────────────────────────────── */}
            <View style={styles.searchContainer}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    focused={searchFocused}
                    onClear={() => setSearchQuery('')}
                />
                {/* Result count shown only during active search */}
                {isSearching && (
                    <View style={styles.resultBadge}>
                        <Text style={styles.resultBadgeText}>
                            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                )}
            </View>

            {/* Filter chips — hidden while searching */}
            {!isSearching && (
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
            )}

            {/* Restaurant list */}
            <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {!isSearching && <View style={styles.routeLineVertical} />}

                {filtered.length === 0 ? (
                    <NoResults query={searchQuery} />
                ) : (
                    filtered.map(r => <RestaurantRow key={r.id} r={r} />)
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },

    topBar: {
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
    topBarCenter: { flex: 1, alignItems: 'center' },
    topBarTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.3,
    },
    topBarSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
    cartBtn: {
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
    routeLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    routeEndLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
    routeDistLabel: { fontSize: 11, color: Colors.textMuted },

    // ── Search ────────────────────────────────────────────────────────────────
    searchContainer: {
        backgroundColor: Colors.bgCard,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        gap: 8,
    },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 46,
        borderRadius: Radius.md,
        backgroundColor: Colors.bgInput,
        borderWidth: 1.5,
        borderColor: Colors.border,
        paddingHorizontal: 12,
        gap: 8,
    },
    searchWrapFocused: {
        borderColor: Colors.amber,
        backgroundColor: '#FFFAF6',
    },
    searchIcon: { fontSize: 16 },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textPrimary,
        padding: 0,
    },
    clearBtn: { padding: 2 },
    clearCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearX: { fontSize: 9, color: Colors.textSecondary, fontWeight: '800' },
    resultBadge: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.amberGlow,
        borderRadius: Radius.full,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: Colors.borderActive,
    },
    resultBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.amber },

    // ── Filter strip ──────────────────────────────────────────────────────────
    filterScroll: {
        height: 56,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.bgCard,
    },
    filterScrollContent: { paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center' },
    filterChip: {
        height: 34,
        paddingHorizontal: 16,
        borderRadius: Radius.full,
        backgroundColor: Colors.bgElevated,
        marginRight: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterChipActive: { backgroundColor: Colors.amberGlow, borderColor: Colors.amber },
    filterText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600', lineHeight: 16 },
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
    rowNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    rowName: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textPrimary,
        letterSpacing: -0.2,
        flex: 1,
        marginRight: 8,
    },
    rowNamePassed: { color: Colors.textMuted },

    // Highlighted match portion
    highlight: {
        color: Colors.amber,
        fontWeight: '800',
        backgroundColor: Colors.amberGlow,
    },

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
    passedLabel: { fontSize: 11, color: Colors.textMuted, fontStyle: 'italic', marginTop: 2 },
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

    // ── No results ────────────────────────────────────────────────────────────
    noResults: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 10 },
    noResultsEmoji: { fontSize: 48, marginBottom: 4 },
    noResultsTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.4,
    },
    noResultsSub: {
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    noResultsQuery: { color: Colors.amber, fontWeight: '700' },
});
