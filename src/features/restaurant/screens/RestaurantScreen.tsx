import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    StatusBar,
    TextInput,
    ActivityIndicator,
    Image,
    PermissionsAndroid,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { Colors, Radius, Shadow } from '../../../theme/index';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import { MainTabParamList } from '@/types/MainTabParamList';
import { Restaurant } from '../types/Restaurant';
import { Route, Waypoint } from '../types/Route';
import { useRestaurants } from '@/features/dashboard/hooks/useRestaurant';
import { useRouteById } from '@/features/dashboard/hooks/useRoutes';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const FILTERS = ['All', 'Veg', 'Non-Veg', 'Open Now', 'Top Rated'];

// ─── Geo Helpers ──────────────────────────────────────────────────────────────

/** Haversine distance in km between two lat/lng points */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Index of the waypoint nearest to the given GPS position */
function nearestWaypointIdx(waypoints: Waypoint[], lat: number, lng: number): number {
    let minDist = Infinity;
    let bestIdx = 0;
    waypoints.forEach((wp, i) => {
        const d = haversineKm(lat, lng, wp.coordinates.lat, wp.coordinates.lng);
        if (d < minDist) {
            minDist = d;
            bestIdx = i;
        }
    });
    return bestIdx;
}

// ─── Restaurant Helpers ───────────────────────────────────────────────────────

const getCuisine = (r: Restaurant): string => {
    const parts: string[] = [];
    if (r.cuisines?.length) parts.push(r.cuisines.slice(0, 2).join(' · '));
    if (r.foodType === 'veg') parts.push('Veg');
    if (r.foodType === 'non-veg') parts.push('Non-Veg');
    return parts.join(' · ') || 'Multi-cuisine';
};

const getEta = (r: Restaurant): string =>
    r.avgPrepTimeMinutes ? `~${r.avgPrepTimeMinutes} min` : 'N/A';

// ─── Route Progress Bar ───────────────────────────────────────────────────────

interface RouteProgressBarProps {
    fromCity: string;
    toCity: string;
    totalKm?: number;
    waypoints: Waypoint[];
    userProgress: number; // 0–1
    nearestWaypointName?: string;
    locationLoading: boolean;
}

const RouteProgressBar = ({
    fromCity,
    toCity,
    totalKm,
    waypoints,
    userProgress,
    nearestWaypointName,
    locationLoading,
}: RouteProgressBarProps) => {
    const pct = `${Math.min(100, Math.round(userProgress * 100))}%` as `${number}%`;

    return (
        <View style={styles.routeBar}>
            {/* ── Track ──────────────────────────────────────────────────────── */}
            <View style={styles.routeBarTrack}>
                {/* Filled portion */}
                <View style={[styles.routeBarFill, { width: pct }]} />

                {/* Waypoint dots at proportional positions */}
                {waypoints.map((wp, i) => {
                    const pos = waypoints.length > 1 ? i / (waypoints.length - 1) : 0;
                    const passed = pos <= userProgress;
                    return (
                        <View
                            key={wp._id ?? wp.name}
                            style={[
                                styles.waypointDot,
                                { left: `${pos * 100}%` as any },
                                passed && styles.waypointDotPassed,
                            ]}
                        />
                    );
                })}

                {/* User marker (or loading spinner) */}
                {locationLoading ? (
                    <View style={[styles.routeMarker, { left: '0%' as any }]}>
                        <ActivityIndicator size="small" color={Colors.brandRed} />
                    </View>
                ) : (
                    <View style={[styles.routeMarker, { left: pct as any }]}>
                        <View style={styles.routeMarkerPulse} />
                        <View style={styles.routeMarkerCore} />
                    </View>
                )}
            </View>

            {/* ── City labels ───────────────────────────────────────────────── */}
            <View style={styles.routeLabels}>
                <Text style={styles.routeEndLabel}>{fromCity}</Text>
                {totalKm ? <Text style={styles.routeDistLabel}>{totalKm} km total</Text> : null}
                <Text style={styles.routeEndLabel}>{toCity}</Text>
            </View>

            {/* ── Waypoint chips ────────────────────────────────────────────── */}
            {waypoints.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginTop: 10 }}
                    contentContainerStyle={{ gap: 6 }}
                >
                    {waypoints.map((wp, i) => {
                        const pos = waypoints.length > 1 ? i / (waypoints.length - 1) : 0;
                        const isPassed = pos < userProgress;
                        const isCurrent = wp.name === nearestWaypointName;
                        const isFirst = i === 0;
                        const isLast = i === waypoints.length - 1;
                        return (
                            <View
                                key={wp._id ?? wp.name}
                                style={[
                                    styles.waypointChip,
                                    isPassed && styles.waypointChipPassed,
                                    isCurrent && styles.waypointChipCurrent,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.waypointChipText,
                                        isCurrent && styles.waypointChipTextCurrent,
                                    ]}
                                >
                                    {isFirst ? (
                                        <Icon name="ellipse" size={8} color={Colors.successGreen} />
                                    ) : isLast ? (
                                        <Icon name="ellipse" size={8} color={Colors.redPin} />
                                    ) : (
                                        <Icon
                                            name="radio-button-on"
                                            size={8}
                                            color={Colors.textSecondary}
                                        />
                                    )}{' '}
                                    {wp.name}
                                </Text>
                            </View>
                        );
                    })}
                </ScrollView>
            )}

            {/* ── Nearest waypoint callout ──────────────────────────────────── */}
            {nearestWaypointName && !locationLoading && (
                <Text style={styles.nearestText}>
                    <Icon name="location-sharp" size={11} color={Colors.amber} /> You're near{' '}
                    <Text style={styles.nearestHighlight}>{nearestWaypointName}</Text>
                </Text>
            )}
        </View>
    );
};

// ─── Search Bar ───────────────────────────────────────────────────────────────

interface SearchBarProps {
    value: string;
    onChangeText: (t: string) => void;
    onFocus: () => void;
    onBlur: () => void;
    focused: boolean;
    onClear: () => void;
    placeholder?: string; // ← add
}

function SearchBar({
    value,
    onChangeText,
    onFocus,
    onBlur,
    focused,
    onClear,
    placeholder,
}: SearchBarProps) {
    return (
        <View style={[styles.searchWrap, focused && styles.searchWrapFocused]}>
            <Icon name="search-outline" size={16} color={Colors.textMuted} />
            <TextInput
                style={styles.searchInput}
                value={value}
                onChangeText={onChangeText}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder={placeholder ?? 'Search restaurant by name…'} // ← use it
                placeholderTextColor={Colors.textMuted}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="words"
            />
            {value.length > 0 && (
                <TouchableOpacity style={styles.clearBtn} onPress={onClear} activeOpacity={0.7}>
                    <View style={styles.clearCircle}>
                        <Icon name="close" size={11} color={Colors.textSecondary} />
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
            <MaterialCommunityIcon
                name="silverware-fork-knife"
                size={48}
                color={Colors.textMuted}
                style={{ marginBottom: 4 }}
            />
            <Text style={styles.noResultsTitle}>No restaurants found</Text>
            <Text style={styles.noResultsSub}>
                {query ? (
                    <>
                        No match for <Text style={styles.noResultsQuery}>"{query}"</Text>
                        {'\n'}Try a different name or clear the search
                    </>
                ) : (
                    'No restaurants available on this route'
                )}
            </Text>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

type restaurantProps = NativeStackScreenProps<MainTabParamList, 'restaurants'>;

export default function RestaurantListScreen({ navigation, route }: restaurantProps) {
    // routeId arrives from DashboardScreen via navigation params
    const routeId = route.params?.routeId ?? '';
    const initialQuery = route.params?.searchQuery ?? '';

    useEffect(() => {
        if (initialQuery) setSearchQuery(initialQuery);
    }, []);

    // ── Route details ──────────────────────────────────────────────────────────
    // API: GET /routes/:id  →  { data: { route: Route } }
    const { data: routeData, isLoading: routeLoading } = useRouteById(routeId);
    const currentRoute: Route | undefined = routeData?.data?.route;

    // ── Restaurants on this route ──────────────────────────────────────────────
    const { data: restaurantsData, isLoading: restaurantsLoading } = useRestaurants(routeId);
    const restaurants: Restaurant[] = restaurantsData?.data?.restaurants ?? [];

    // ── Geolocation state ──────────────────────────────────────────────────────
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationLoading, setLocLoading] = useState(true);
    const watchIdRef = useRef<number | null>(null);

    // ── UI state ───────────────────────────────────────────────────────────────
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setFocused] = useState(false);
    const [selectedRestaurantId, setSelectedId] = useState<string | null>(null);

    const isLoading = routeLoading || restaurantsLoading;
    const isSearching = searchQuery.trim().length > 0;

    // ── Location permission ────────────────────────────────────────────────────
    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            try {
                const result = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Access',
                        message:
                            'Rodofood uses your location to track your position along the route.',
                        buttonPositive: 'Allow',
                        buttonNegative: 'Deny',
                    },
                );
                return result === PermissionsAndroid.RESULTS.GRANTED;
            } catch {
                return false;
            }
        }
        // iOS — NSLocationWhenInUseUsageDescription must be in Info.plist
        Geolocation.requestAuthorization();
        return true;
    }, []);

    // ── Start GPS tracking ─────────────────────────────────────────────────────
    useEffect(() => {
        let watchId: number;

        const startTracking = async () => {
            const allowed = await requestPermission();
            if (!allowed) {
                setLocLoading(false);
                return;
            }

            // Immediate fix
            Geolocation.getCurrentPosition(
                pos => {
                    setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    setLocLoading(false);
                },
                () => setLocLoading(false),
                { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
            );

            // Continuous tracking — update every 200 m of movement
            watchId = Geolocation.watchPosition(
                pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => {},
                { enableHighAccuracy: true, distanceFilter: 200 },
            );
            watchIdRef.current = watchId;
        };

        startTracking();

        return () => {
            if (watchIdRef.current !== null) Geolocation.clearWatch(watchIdRef.current);
        };
    }, [requestPermission]);

    // ── Derive progress from GPS + Waypoint points ───────────────────────────────────
    const { userProgress, nearestWaypoint } = useMemo(() => {
        const waypoints = currentRoute?.waypoints ?? [];
        if (!userLocation || waypoints.length === 0) {
            return { userProgress: 0, nearestWaypoint: undefined };
        }
        const idx = nearestWaypointIdx(waypoints, userLocation.lat, userLocation.lng);
        const progress = waypoints.length > 1 ? idx / (waypoints.length - 1) : 0;
        return { userProgress: progress, nearestWaypoint: waypoints[idx] };
    }, [userLocation, currentRoute?.waypoints]);

    // ── Filter + search ────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let list = [...restaurants];

        const q = searchQuery.trim().toLowerCase();
        if (q) {
            list = list.filter(r => {
                const cuisine = getCuisine(r).toLowerCase();
                return (
                    r.name.toLowerCase().includes(q) ||
                    r.description?.toLowerCase().includes(q) ||
                    cuisine.includes(q) ||
                    r.cuisines?.some(c => c.toLowerCase().includes(q)) ||
                    r.foodType.toLowerCase().includes(q) || // "veg" / "non-veg"
                    r.address.city?.toLowerCase().includes(q) ||
                    r.address.street?.toLowerCase().includes(q) ||
                    r.address.state?.toLowerCase().includes(q) ||
                    r.address.pincode?.includes(q) ||
                    String(r.rating).includes(q) || // e.g. "4.5"
                    (q === 'open' && r.isOpen) || // "open"
                    (q === 'closed' && !r.isOpen) || // "closed"
                    (q === 'verified' && r.isVerified) // "verified"
                );
            });
        }

        if (activeFilter === 'Veg') list = list.filter(r => r.foodType === 'veg');
        if (activeFilter === 'Non-Veg') list = list.filter(r => r.foodType === 'non-veg');
        if (activeFilter === 'Open Now') list = list.filter(r => r.isOpen);
        if (activeFilter === 'Top Rated') list = [...list].sort((a, b) => b.rating - a.rating);

        return list;
    }, [searchQuery, activeFilter, restaurants]);

    // ── Header stats ───────────────────────────────────────────────────────────
    const openCount = restaurants.filter(r => r.isOpen && r.isActive).length;
    const closedCount = restaurants.length - openCount;

    // ── Restaurant Row ────────────────────────────────────────────────────────
    const RestaurantRow = ({ r }: { r: Restaurant }) => {
        const id = r._id ?? '';
        const isVeg = r.foodType === 'veg';
        const isOpen = r.isOpen && r.isActive;
        const isPassed = !r.isActive;
        const cuisine = getCuisine(r);
        const eta = getEta(r);
        const q = searchQuery.trim();

        const renderName = () => {
            if (!q)
                return (
                    <Text style={[styles.rowName, isPassed && styles.rowNamePassed]}>{r.name}</Text>
                );
            const lower = r.name.toLowerCase();
            const idx = lower.indexOf(q.toLowerCase());
            if (idx === -1)
                return (
                    <Text style={[styles.rowName, isPassed && styles.rowNamePassed]}>{r.name}</Text>
                );
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
                    selectedRestaurantId === id && styles.rowCardSelected,
                ]}
                activeOpacity={isPassed ? 1 : 0.8}
                disabled={isPassed || !id}
                onPress={() => {
                    setSelectedId(id);
                    navigation
                        .getParent<NativeStackNavigationProp<RootStackParamList>>()
                        .navigate('menu', { restaurantId: id });
                }}
            >
                <View style={styles.rowInner}>
                    {/* ── Image ──────────────────────────────────────────────── */}
                    <View style={styles.rowImageWrap}>
                        <View style={[styles.rowImage, isPassed && styles.rowImagePassed]}>
                            {r.coverImage ? (
                                <Image
                                    source={{ uri: r.coverImage }}
                                    style={StyleSheet.absoluteFillObject}
                                    resizeMode="cover"
                                />
                            ) : (
                                <MaterialCommunityIcon
                                    name="silverware-fork-knife"
                                    size={28}
                                    color={Colors.textMuted}
                                />
                            )}
                        </View>
                        <View
                            style={[
                                styles.vegBox,
                                { borderColor: isVeg ? Colors.vegGreen : Colors.redPin },
                            ]}
                        >
                            <View
                                style={[
                                    styles.vegCircle,
                                    { backgroundColor: isVeg ? Colors.vegGreen : Colors.redPin },
                                ]}
                            />
                        </View>
                        {r.isVerified && (
                            <View style={styles.verifiedDot}>
                                <Icon name="checkmark" size={9} color="#FFFFFF" />
                            </View>
                        )}
                    </View>

                    {/* ── Info ───────────────────────────────────────────────── */}
                    <View style={styles.rowInfoWrap}>
                        <View style={styles.rowNameRow}>
                            {renderName()}
                            <View style={styles.rowRating}>
                                <Text style={styles.rowStar}>★</Text>
                                <Text style={styles.rowRatingNum}>{r.rating.toFixed(1)}</Text>
                            </View>
                        </View>

                        <Text style={[styles.rowCuisine, isPassed && styles.rowCuisinePassed]}>
                            {cuisine}
                        </Text>

                        {/* ── Meta pills ── */}
                        <View style={styles.rowMeta}>
                            {/* City */}
                            <View style={styles.metaPill}>
                                <Icon
                                    name="location-sharp"
                                    size={10}
                                    color={Colors.textSecondary}
                                />
                                <Text style={styles.metaPillText}>{r.address.city}</Text>
                            </View>

                            {/* Prep time */}
                            <View style={styles.metaPill}>
                                <MaterialCommunityIcon
                                    name="clock-outline"
                                    size={10}
                                    color={Colors.textSecondary}
                                />
                                <Text style={styles.metaPillText}>{eta}</Text>
                            </View>

                            {/* Reviews */}
                            <View style={styles.metaPill}>
                                <Icon name="star-outline" size={10} color={Colors.textSecondary} />
                                <Text style={styles.metaPillText}>{r.totalRatings} reviews</Text>
                            </View>

                            {/* Distance */}
                            {userLocation && r.location?.coordinates?.length >= 2 ? (
                                <View style={styles.metaPill}>
                                    <MaterialCommunityIcon
                                        name="map-marker-distance"
                                        size={10}
                                        color={Colors.textSecondary}
                                    />
                                    <Text style={styles.metaPillText}>
                                        {haversineKm(
                                            userLocation.lat,
                                            userLocation.lng,
                                            r.location.coordinates[1],
                                            r.location.coordinates[0],
                                        ).toFixed(1)}{' '}
                                        km away
                                    </Text>
                                </View>
                            ) : locationLoading ? (
                                <View style={styles.metaPill}>
                                    <MaterialCommunityIcon
                                        name="map-marker-distance"
                                        size={10}
                                        color={Colors.textSecondary}
                                    />
                                    <Text style={styles.metaPillText}>Locating…</Text>
                                </View>
                            ) : null}
                        </View>

                        {!isPassed && (
                            <View style={styles.rowActionRow}>
                                <View
                                    style={[
                                        styles.openBadge,
                                        { backgroundColor: isOpen ? '#dcfce7' : '#fee2e2' },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.openDot,
                                            {
                                                backgroundColor: isOpen
                                                    ? Colors.successGreen
                                                    : Colors.redPin,
                                            },
                                        ]}
                                    />
                                    <Text
                                        style={[
                                            styles.openText,
                                            { color: isOpen ? Colors.successGreen : Colors.redPin },
                                        ]}
                                    >
                                        {isOpen ? 'Open' : 'Closed'}
                                    </Text>
                                </View>

                                {isOpen && id && (
                                    <TouchableOpacity
                                        style={styles.preOrderBtn}
                                        onPress={() => {
                                            setSelectedId(id);
                                            navigation
                                                .getParent<
                                                    NativeStackNavigationProp<RootStackParamList>
                                                >()
                                                .navigate('menu', { restaurantId: id });
                                        }}
                                    >
                                        <Text style={styles.preOrderText}>Pre-order</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {isPassed && (
                            <Text style={styles.passedLabel}>
                                {r.isOpen ? 'Currently unavailable' : 'Restaurant is closed'}
                            </Text>
                        )}
                    </View>
                </View>

                <View
                    style={[styles.routeConnectorDot, isPassed && styles.routeConnectorDotPassed]}
                />
            </TouchableOpacity>
        );
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <View style={styles.root}>
            {/* ── Top bar ─────────────────────────────────────────────────────── */}
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={18} color={Colors.textPrimary} />
                </TouchableOpacity>

                <View style={styles.topBarCenter}>
                    <Text style={styles.topBarTitle} numberOfLines={1}>
                        {currentRoute
                            ? `${currentRoute.fromCity} → ${currentRoute.toCity}`
                            : routeLoading
                            ? 'Loading route…'
                            : 'On Your Route'}
                    </Text>
                    <Text style={styles.topBarSub}>
                        {isLoading
                            ? 'Fetching restaurants…'
                            : `${openCount} open · ${closedCount} closed`}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.cartBtn}
                    onPress={() =>
                        navigation
                            .getParent<NativeStackNavigationProp<RootStackParamList>>()
                            .navigate('cart')
                    }
                >
                    <Icon name="cart-outline" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* ── Route progress bar (hidden while searching) ──────────────── */}
            {!isSearching && currentRoute && (
                <View style={styles.routeBarWrap}>
                    <RouteProgressBar
                        fromCity={currentRoute.fromCity}
                        toCity={currentRoute.toCity}
                        totalKm={currentRoute.totalDistanceKm}
                        waypoints={currentRoute.waypoints ?? []}
                        userProgress={userProgress}
                        nearestWaypointName={nearestWaypoint?.name}
                        locationLoading={locationLoading}
                    />
                </View>
            )}

            {/* ── Search ──────────────────────────────────────────────────────── */}
            <View style={styles.searchContainer}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    focused={searchFocused}
                    onClear={() => setSearchQuery('')}
                    placeholder="Search by name, cuisine, city, veg…" // ← add this prop
                />
                {isSearching && (
                    <View style={styles.resultBadge}>
                        <Text style={styles.resultBadgeText}>
                            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                )}
            </View>

            {/* ── Filters (hidden while searching) ────────────────────────────── */}
            <View>
                {!isSearching && (
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
                )}
            </View>

            {/* ── Restaurant list ──────────────────────────────────────────────── */}
            <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {!isSearching && <View style={styles.routeLineVertical} />}

                {isLoading ? (
                    <ActivityIndicator
                        color={Colors.brandRed}
                        size="large"
                        style={{ marginTop: 40 }}
                    />
                ) : filtered.length === 0 ? (
                    <NoResults query={searchQuery} />
                ) : (
                    filtered.map(r => <RestaurantRow key={r._id ?? r.name} r={r} />)
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },

    // ── Top bar ───────────────────────────────────────────────────────────────
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
    topBarCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
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

    // ── Route progress bar ────────────────────────────────────────────────────
    routeBarWrap: {
        backgroundColor: Colors.bgCard,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    routeBar: {},

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
        backgroundColor: Colors.brandRed,
        borderRadius: 3,
    },

    // Waypoint dots on the track
    waypointDot: {
        position: 'absolute',
        top: -4,
        marginLeft: -5,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.bgElevated,
        borderWidth: 2,
        borderColor: Colors.border,
        zIndex: 1,
    },
    waypointDotPassed: { backgroundColor: Colors.brandRed, borderColor: Colors.brandRed },

    // User position marker
    routeMarker: {
        position: 'absolute',
        top: -9,
        marginLeft: -10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    routeMarkerPulse: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.amberGlow2,
    },
    routeMarkerCore: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.brandRed,
        borderWidth: 2,
        borderColor: Colors.bgCard,
    },

    routeLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    routeEndLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
    routeDistLabel: { fontSize: 11, color: Colors.textMuted },

    // Waypoint chips below track
    waypointChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: Radius.full,
        backgroundColor: Colors.bgElevated,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    waypointChipPassed: {
        backgroundColor: 'rgba(214,26,26,0.08)',
        borderColor: Colors.brandRed,
    },
    waypointChipCurrent: {
        backgroundColor: Colors.amberGlow,
        borderColor: Colors.amber,
    },
    waypointChipText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
    waypointChipTextCurrent: { color: Colors.amber, fontWeight: '800' },

    nearestText: { fontSize: 11, color: Colors.textMuted, marginTop: 8, fontWeight: '500' },
    nearestHighlight: { color: Colors.amber, fontWeight: '700' },

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
    searchWrapFocused: { borderColor: Colors.brandRed, backgroundColor: '#FFF3E0' },
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

    // ── Filters ───────────────────────────────────────────────────────────────
    filterScroll: {
        height: 56,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.bgCard,
    },
    filterScrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: 'center',
    },
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

    // ── Restaurant row card ───────────────────────────────────────────────────
    rowCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 14,
        ...Shadow.card,
    },
    rowCardSelected: {
        borderColor: Colors.amber,
        borderWidth: 2,
        shadowColor: Colors.amber,
        shadowOpacity: 0.22,
        elevation: 8,
    },
    rowCardPassed: { opacity: 0.45 },
    rowInner: { flexDirection: 'row', gap: 12 },
    rowImageWrap: { position: 'relative' },
    rowImage: {
        width: 80,
        height: 80,
        borderRadius: Radius.md,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
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
    verifiedDot: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#16a34a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifiedDotText: { fontSize: 8, color: '#FFFFFF', fontWeight: '900' },
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
    highlight: { color: Colors.amber, fontWeight: '800', backgroundColor: Colors.amberGlow },
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
        flexDirection: 'row', // ← add
        alignItems: 'center', // ← add
        gap: 3, // ← add
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
