import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Platform,
    Animated,
    KeyboardAvoidingView,
    ScrollView,
    Switch,
    ActivityIndicator,
} from 'react-native';
import { Colors, Radius, Shadow } from '@theme/index';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import useAlert from '@/hooks/useAlert';
import { Restaurant, FoodType } from '../types/Restaurant';
import { useCreateRestaurant } from '../hooks/useRestaurant';
import { useAuthStore } from '@/store/useAuthStore';
import { ApiError } from '@/types/ApiError';
import { useRouteById, useRoutes } from '@/features/dashboard/hooks/useRoutes';
import Geolocation from '@react-native-community/geolocation';
import { Waypoint, Route } from '../types/Route';
import config from 'react-native-config';

// ─── Google Maps reverse geocode ──────────────────────────────────────────────
const GOOGLE_MAPS_API_KEY = 'AIzaSyAo40Gb5malogCubGiVUBaHR2czr48YwNM'; 

async function reverseGeocode(
    lat: number,
    lng: number,
): Promise<{
    street?: string;
    city: string;
    state?: string;
    pincode?: string;
}> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    const json = await res.json();
    console.log('geocode response : ', json)
    if (json.status !== 'OK' || !json.results?.length) {
        throw new Error('Unable to fetch address');
    }

    const components: { types: string[]; long_name: string; short_name: string }[] =
        json.results[0].address_components ?? [];

    const get = (type: string) => components.find(c => c.types.includes(type))?.long_name ?? '';

    const street = [get('street_number'), get('route'), get('sublocality_level_1')]
        .filter(Boolean)
        .join(', ');

    return {
        street: street || undefined,
        city: get('locality') || get('administrative_area_level_2') || get('sublocality_level_1'),
        state: get('administrative_area_level_1') || undefined,
        pincode: get('postal_code') || undefined,
    };
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 'basic' | 'location' | 'hours';
type Props = NativeStackScreenProps<RootStackParamList, 'createRestaurant'>;

const FOOD_TYPES: { value: FoodType; label: string; emoji: string }[] = [
    { value: 'veg', label: 'Veg', emoji: '🥦' },
    { value: 'non-veg', label: 'Non-Veg', emoji: '🍗' },
    { value: 'both', label: 'Both', emoji: '🍽️' },
];

const STEPS: { key: Step; label: string; emoji: string }[] = [
    { key: 'basic', label: 'Basic Info', emoji: '🏪' },
    { key: 'location', label: 'Location', emoji: '📍' },
    { key: 'hours', label: 'Hours & Tax', emoji: '⏰' },
];

const CUISINE_OPTIONS = [
    'Indian',
    'Chinese',
    'Italian',
    'Fast Food',
    'Biryani',
    'South Indian',
    'North Indian',
    'Continental',
    'Desserts',
    'Beverages',
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function CreateRestaurantScreen({ navigation }: Props) {
    const alert = useAlert();
    const user = useAuthStore(s => s.user);

    // ── Routes data ───────────────────────────────────────────────────────────
    const { data: routesData, isLoading: routesLoading } = useRoutes();
    const routes: Route[] = routesData?.data?.routes ?? [];

    const [selectedRouteId, setSelectedRouteId] = useState<string>('');
    const [selectedWaypointId, setSelectedWaypointId] = useState<string>('');

    const { data: routeByIdData, isLoading: routeLoading } = useRouteById(selectedRouteId);
    const waypoints: Waypoint[] = routeByIdData?.data?.route?.waypoints ?? [];

    // ── Step state ────────────────────────────────────────────────────────────
    const [step, setStep] = useState<Step>('basic');
    const stepAnim = useRef(new Animated.Value(0)).current;

    // ── Form fields – Basic ───────────────────────────────────────────────────
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [foodType, setFoodType] = useState<FoodType>('veg');
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

    // ── Form fields – Location ────────────────────────────────────────────────
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [stateName, setStateName] = useState('');
    const [pincode, setPincode] = useState('');
    const [coordinates, setCoordinates] = useState<[number, number]>([0, 0]); // [lng, lat]
    const [locationLoading, setLocationLoading] = useState(false);

    // ── Form fields – Hours & Tax ─────────────────────────────────────────────
    const [openTime, setOpenTime] = useState('09:00');
    const [closeTime, setCloseTime] = useState('22:00');
    const [gstNumber, setGstNumber] = useState('');
    const [gstRate, setGstRate] = useState('5');
    const [avgPrepTime, setAvgPrepTime] = useState('30');
    const [isOpen, setIsOpen] = useState(true);

    // ── UI state ──────────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const shakeAnim = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    // ── Query ─────────────────────────────────────────────────────────────────
    const { mutate: createRestaurant } = useCreateRestaurant();

    // ── Validation ────────────────────────────────────────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const basicValid =
        name.trim().length >= 2 &&
        phone.replace(/\D/g, '').length === 10 &&
        selectedCuisines.length > 0;

    const locationValid = city.trim().length >= 2;

    const hoursValid =
        openTime.length === 5 &&
        closeTime.length === 5 &&
        Number(gstRate) >= 0 &&
        Number(avgPrepTime) > 0;

    const currentStepValid =
        step === 'basic' ? basicValid : step === 'location' ? locationValid : hoursValid;

    // Hints
    const nameHint = name.length > 0 && name.trim().length < 2 ? 'At least 2 characters' : '';
    const phoneHint =
        phone.length > 0 && phone.replace(/\D/g, '').length !== 10
            ? `${phone.replace(/\D/g, '').length}/10 digits`
            : '';
    const emailHint = email.length > 0 && !emailRegex.test(email) ? 'Enter a valid email' : '';
    const cityHint = city.length > 0 && city.trim().length < 2 ? 'Enter a valid city' : '';

    // ── Shake ─────────────────────────────────────────────────────────────────
    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 7, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -7, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
        ]).start();
    };

    // ── Step navigation ───────────────────────────────────────────────────────
    const goToStep = (next: Step) => {
        if (!currentStepValid) {
            triggerShake();
            return;
        }
        setStep(next);
        const idx = STEPS.findIndex(s => s.key === next);
        Animated.spring(stepAnim, {
            toValue: idx,
            useNativeDriver: false,
            tension: 160,
            friction: 20,
        }).start();
    };

    const goBack = () => {
        const idx = STEPS.findIndex(s => s.key === step);
        if (idx === 0) {
            navigation.goBack();
            return;
        }
        const prev = STEPS[idx - 1].key;
        setStep(prev);
        Animated.spring(stepAnim, {
            toValue: idx - 1,
            useNativeDriver: false,
            tension: 160,
            friction: 20,
        }).start();
    };

    // ── Cuisine toggle ────────────────────────────────────────────────────────
    const toggleCuisine = (c: string) =>
        setSelectedCuisines(prev => (prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]));

    // ── Route / waypoint selection ────────────────────────────────────────────
    const handleSelectRoute = (routeId: string) => {
        setSelectedRouteId(prev => (prev === routeId ? '' : routeId));
        setSelectedWaypointId('');
    };

    const handleSelectWaypoint = (wp: Waypoint) => {
        const wpId = wp._id ?? '';
        const isDeselecting = wpId === selectedWaypointId;
        setSelectedWaypointId(isDeselecting ? '' : wpId);
        if (!isDeselecting) {
            setCoordinates([wp.coordinates.lng, wp.coordinates.lat]);
            if (!city) setCity(wp.name);
        } else {
            setCoordinates([0, 0]);
        }
    };

    // ── Current location ─────────────────────────────────────────────────────
    const handleUseCurrentLocation = () => {
        setLocationLoading(true);
        Geolocation.getCurrentPosition(
            async pos => {
                const { latitude, longitude } = pos.coords;
                setCoordinates([longitude, latitude]);
                try {
                    const addr = await reverseGeocode(latitude, longitude);
                    if (addr.street) setStreet(addr.street);
                    if (addr.city) setCity(addr.city);
                    if (addr.state) setStateName(addr.state);
                    if (addr.pincode) setPincode(addr.pincode);
                    alert.success(
                        'Location detected',
                        `${addr.city}${addr.state ? ', ' + addr.state : ''}`,
                    );
                } catch {
                    alert.error('Geocode failed', 'Could not fetch address. Please fill manually.');
                } finally {
                    setLocationLoading(false);
                }
            },
            err => {
                setLocationLoading(false);
                alert.error('Location error', err.message || 'Could not get location');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!hoursValid) {
            triggerShake();
            return;
        }
        if (!user?._id) {
            alert.error('Error', 'User session expired. Please login again.');
            return;
        }

        Animated.sequence([
            Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
            Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start();

        setLoading(true);

        const selectedWaypoint = waypoints.find(w => w._id === selectedWaypointId);

        // ✅ Full Restaurant type — no Partial, owner is guaranteed string
        const payload: Restaurant = {
            owner: user._id,
            name: name.trim(),
            description: description.trim() || undefined,
            phone: phone.replace(/\D/g, ''),
            email: email.trim() || undefined,
            foodType,
            cuisines: selectedCuisines,
            address: {
                street: street.trim() || undefined,
                city: city.trim(),
                state: stateName.trim() || undefined,
                pincode: pincode.trim() || undefined,
            },
            location: { type: 'Point', coordinates },
            routes: selectedRouteId ? [selectedRouteId] : undefined,
            routeWaypointOrder: selectedWaypoint?.order,
            openingHours: { open: openTime, close: closeTime },
            gstNumber: gstNumber.trim() || undefined,
            gstRate: Number(gstRate),
            avgPrepTimeMinutes: Number(avgPrepTime),
            isOpen,
            // Server-managed fields — sent as defaults
            rating: 0,
            totalRatings: 0,
            isActive: true,
            isVerified: false,
            totalOrders: 0,
            totalEarnings: 0,
            createdAt: '',
            updatedAt: '',
        };

        createRestaurant(payload, {
            onSuccess: () => {
                setLoading(false);
                alert.success('Success', 'Restaurant created successfully');
                navigation.replace('owner', { screen: 'dashboard' });
            },
            onError: (error: ApiError) => {
                setLoading(false);
                alert.error('Error', error?.message || 'Something went wrong');
            },
        });
    };

    // ── Progress bar ──────────────────────────────────────────────────────────
    const progressWidth = stepAnim.interpolate({
        inputRange: [0, 1, 2],
        outputRange: ['16%', '50%', '100%'],
    });

    const isFocused = (f: string) => focusedField === f;
    const onFocus = (f: string) => setFocusedField(f);
    const onBlur = () => setFocusedField(null);

    const hasCoords = coordinates[0] !== 0 || coordinates[1] !== 0;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* ── Back ──────────────────────────────────────────────────── */}
                <TouchableOpacity style={styles.backBtn} onPress={goBack} activeOpacity={0.75}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>

                {/* ── Header ────────────────────────────────────────────────── */}
                <View style={styles.headerText}>
                    <Text style={styles.title}>Setup Your Restaurant 🏪</Text>
                    <Text style={styles.subtitle}>
                        Fill in your restaurant details to start receiving orders on Rodo.
                    </Text>
                </View>

                {/* ── Step progress ─────────────────────────────────────────── */}
                <View style={styles.stepWrap}>
                    {STEPS.map((s, i) => {
                        const stepIdx = STEPS.findIndex(x => x.key === step);
                        const done = i < stepIdx;
                        const active = s.key === step;
                        return (
                            <View key={s.key} style={styles.stepItem}>
                                <View
                                    style={[
                                        styles.stepDot,
                                        active && styles.stepDotActive,
                                        done && styles.stepDotDone,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.stepDotText,
                                            (active || done) && styles.stepDotTextActive,
                                        ]}
                                    >
                                        {done ? '✓' : s.emoji}
                                    </Text>
                                </View>
                                <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>
                                    {s.label}
                                </Text>
                            </View>
                        );
                    })}
                    <View style={styles.stepLine} pointerEvents="none">
                        <Animated.View style={[styles.stepLineFill, { width: progressWidth }]} />
                    </View>
                </View>

                {/* ══════════════════════════════════════════════════════════════
                    STEP 1 — Basic Info
                ══════════════════════════════════════════════════════════════ */}
                {step === 'basic' && (
                    <Animated.View
                        style={[styles.formCard, { transform: [{ translateX: shakeAnim }] }]}
                    >
                        {/* Name */}
                        <Text style={styles.inputLabel}>
                            Restaurant Name <Text style={styles.required}>*</Text>
                        </Text>
                        <View
                            style={[styles.inputRow, isFocused('name') && styles.inputRowFocused]}
                        >
                            <View style={styles.iconWrap}>
                                <Text style={styles.inputIcon}>🏪</Text>
                            </View>
                            <View style={styles.inputDivider} />
                            <TextInput
                                style={styles.textInput}
                                value={name}
                                onChangeText={setName}
                                placeholder="e.g. Spice Garden"
                                placeholderTextColor={Colors.textMuted}
                                onFocus={() => onFocus('name')}
                                onBlur={onBlur}
                                autoCapitalize="words"
                                returnKeyType="next"
                            />
                            {name.length > 0 && (
                                <TouchableOpacity
                                    style={styles.clearBtn}
                                    onPress={() => setName('')}
                                >
                                    <Text style={styles.clearIcon}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        {nameHint ? (
                            <Text style={styles.hintError}>{nameHint}</Text>
                        ) : (
                            <View style={styles.hintSpacer} />
                        )}

                        {/* Description */}
                        <Text style={styles.inputLabel}>
                            Description <Text style={styles.inputLabelNote}>(optional)</Text>
                        </Text>
                        <View
                            style={[
                                styles.inputRow,
                                styles.textAreaRow,
                                isFocused('desc') && styles.inputRowFocused,
                            ]}
                        >
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Briefly describe your restaurant…"
                                placeholderTextColor={Colors.textMuted}
                                onFocus={() => onFocus('desc')}
                                onBlur={onBlur}
                                multiline
                                numberOfLines={3}
                                autoCapitalize="sentences"
                            />
                        </View>
                        <View style={styles.hintSpacer} />

                        {/* Phone */}
                        <Text style={styles.inputLabel}>
                            Phone Number <Text style={styles.required}>*</Text>
                        </Text>
                        <View
                            style={[styles.inputRow, isFocused('phone') && styles.inputRowFocused]}
                        >
                            <View style={styles.countryCode}>
                                <Text style={styles.flag}>🇮🇳</Text>
                                <Text style={styles.dialCode}>+91</Text>
                            </View>
                            <View style={styles.inputDivider} />
                            <TextInput
                                style={styles.textInput}
                                value={phone}
                                onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                                keyboardType="number-pad"
                                placeholder="10-digit number"
                                placeholderTextColor={Colors.textMuted}
                                onFocus={() => onFocus('phone')}
                                onBlur={onBlur}
                                maxLength={10}
                                returnKeyType="next"
                            />
                            {phone.length > 0 && (
                                <TouchableOpacity
                                    style={styles.clearBtn}
                                    onPress={() => setPhone('')}
                                >
                                    <Text style={styles.clearIcon}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        {phoneHint ? (
                            <Text style={styles.hintError}>{phoneHint}</Text>
                        ) : (
                            <View style={styles.hintSpacer} />
                        )}

                        {/* Email */}
                        <Text style={styles.inputLabel}>
                            Email <Text style={styles.inputLabelNote}>(optional)</Text>
                        </Text>
                        <View
                            style={[styles.inputRow, isFocused('email') && styles.inputRowFocused]}
                        >
                            <View style={styles.iconWrap}>
                                <Text style={styles.inputIcon}>✉️</Text>
                            </View>
                            <View style={styles.inputDivider} />
                            <TextInput
                                style={styles.textInput}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                placeholder="restaurant@email.com"
                                placeholderTextColor={Colors.textMuted}
                                onFocus={() => onFocus('email')}
                                onBlur={onBlur}
                                autoCapitalize="none"
                                returnKeyType="next"
                            />
                            {email.length > 0 && (
                                <TouchableOpacity
                                    style={styles.clearBtn}
                                    onPress={() => setEmail('')}
                                >
                                    <Text style={styles.clearIcon}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        {emailHint ? (
                            <Text style={styles.hintError}>{emailHint}</Text>
                        ) : (
                            <View style={styles.hintSpacer} />
                        )}

                        {/* Food Type */}
                        <Text style={styles.inputLabel}>
                            Food Type <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.chipRow}>
                            {FOOD_TYPES.map(ft => (
                                <TouchableOpacity
                                    key={ft.value}
                                    style={[
                                        styles.foodTypeChip,
                                        foodType === ft.value && styles.foodTypeChipActive,
                                    ]}
                                    onPress={() => setFoodType(ft.value)}
                                    activeOpacity={0.75}
                                >
                                    <Text style={styles.chipEmoji}>{ft.emoji}</Text>
                                    <Text
                                        style={[
                                            styles.chipText,
                                            foodType === ft.value && styles.chipTextActive,
                                        ]}
                                    >
                                        {ft.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.hintSpacer} />

                        {/* Cuisines */}
                        <Text style={styles.inputLabel}>
                            Cuisines <Text style={styles.required}>*</Text>
                            <Text style={styles.inputLabelNote}> (pick at least one)</Text>
                        </Text>
                        <View style={styles.cuisineGrid}>
                            {CUISINE_OPTIONS.map(c => {
                                const sel = selectedCuisines.includes(c);
                                return (
                                    <TouchableOpacity
                                        key={c}
                                        style={[
                                            styles.cuisineChip,
                                            sel && styles.cuisineChipActive,
                                        ]}
                                        onPress={() => toggleCuisine(c)}
                                        activeOpacity={0.75}
                                    >
                                        <Text
                                            style={[
                                                styles.cuisineChipText,
                                                sel && styles.cuisineChipTextActive,
                                            ]}
                                        >
                                            {c}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        {selectedCuisines.length === 0 && (
                            <Text style={styles.hintError}>Select at least one cuisine</Text>
                        )}
                        <View style={styles.hintSpacer} />
                    </Animated.View>
                )}

                {/* ══════════════════════════════════════════════════════════════
                    STEP 2 — Location
                ══════════════════════════════════════════════════════════════ */}
                {step === 'location' && (
                    <Animated.View
                        style={[styles.formCard, { transform: [{ translateX: shakeAnim }] }]}
                    >
                        {/* Use current location */}
                        <TouchableOpacity
                            style={[
                                styles.locationBtn,
                                locationLoading && styles.locationBtnLoading,
                                hasCoords && styles.locationBtnDone,
                            ]}
                            onPress={handleUseCurrentLocation}
                            activeOpacity={0.8}
                            disabled={locationLoading}
                        >
                            {locationLoading ? (
                                <ActivityIndicator size="small" color={Colors.amber} />
                            ) : (
                                <Text style={styles.locationBtnIcon}>
                                    {hasCoords ? '✅' : '📍'}
                                </Text>
                            )}
                            <View style={styles.locationBtnTextWrap}>
                                <Text style={styles.locationBtnTitle}>
                                    {locationLoading
                                        ? 'Detecting location…'
                                        : hasCoords
                                        ? 'Location detected'
                                        : 'Use Current Location'}
                                </Text>
                                <Text style={styles.locationBtnSub}>
                                    {hasCoords
                                        ? `${coordinates[1].toFixed(5)}°N  ${coordinates[0].toFixed(
                                              5,
                                          )}°E`
                                        : 'Auto-fill address via GPS + Google Maps'}
                                </Text>
                            </View>
                            {!locationLoading && !hasCoords && (
                                <Text style={styles.locationBtnArrow}>→</Text>
                            )}
                        </TouchableOpacity>

                        {/* Or divider */}
                        <View style={styles.orDivider}>
                            <View style={styles.orLine} />
                            <Text style={styles.orText}>or fill manually</Text>
                            <View style={styles.orLine} />
                        </View>

                        {/* Street */}
                        <Text style={styles.inputLabel}>
                            Street Address <Text style={styles.inputLabelNote}>(optional)</Text>
                        </Text>
                        <View
                            style={[styles.inputRow, isFocused('street') && styles.inputRowFocused]}
                        >
                            <View style={styles.iconWrap}>
                                <Text style={styles.inputIcon}>🏠</Text>
                            </View>
                            <View style={styles.inputDivider} />
                            <TextInput
                                style={styles.textInput}
                                value={street}
                                onChangeText={setStreet}
                                placeholder="Shop no., building, lane…"
                                placeholderTextColor={Colors.textMuted}
                                onFocus={() => onFocus('street')}
                                onBlur={onBlur}
                                autoCapitalize="words"
                                returnKeyType="next"
                            />
                        </View>
                        <View style={styles.hintSpacer} />

                        {/* City */}
                        <Text style={styles.inputLabel}>
                            City <Text style={styles.required}>*</Text>
                        </Text>
                        <View
                            style={[styles.inputRow, isFocused('city') && styles.inputRowFocused]}
                        >
                            <View style={styles.iconWrap}>
                                <Text style={styles.inputIcon}>🏙️</Text>
                            </View>
                            <View style={styles.inputDivider} />
                            <TextInput
                                style={styles.textInput}
                                value={city}
                                onChangeText={setCity}
                                placeholder="e.g. Indore"
                                placeholderTextColor={Colors.textMuted}
                                onFocus={() => onFocus('city')}
                                onBlur={onBlur}
                                autoCapitalize="words"
                                returnKeyType="next"
                            />
                        </View>
                        {cityHint ? (
                            <Text style={styles.hintError}>{cityHint}</Text>
                        ) : (
                            <View style={styles.hintSpacer} />
                        )}

                        {/* State + Pincode */}
                        <View style={styles.twoColRow}>
                            <View style={styles.twoColLeft}>
                                <Text style={styles.inputLabel}>
                                    State <Text style={styles.inputLabelNote}>(opt)</Text>
                                </Text>
                                <View
                                    style={[
                                        styles.inputRow,
                                        isFocused('state') && styles.inputRowFocused,
                                    ]}
                                >
                                    <TextInput
                                        style={[styles.textInput, { paddingHorizontal: 14 }]}
                                        value={stateName}
                                        onChangeText={setStateName}
                                        placeholder="e.g. MP"
                                        placeholderTextColor={Colors.textMuted}
                                        onFocus={() => onFocus('state')}
                                        onBlur={onBlur}
                                        autoCapitalize="words"
                                        returnKeyType="next"
                                    />
                                </View>
                            </View>
                            <View style={styles.twoColRight}>
                                <Text style={styles.inputLabel}>
                                    Pincode <Text style={styles.inputLabelNote}>(opt)</Text>
                                </Text>
                                <View
                                    style={[
                                        styles.inputRow,
                                        isFocused('pin') && styles.inputRowFocused,
                                    ]}
                                >
                                    <TextInput
                                        style={[styles.textInput, { paddingHorizontal: 14 }]}
                                        value={pincode}
                                        onChangeText={t =>
                                            setPincode(t.replace(/\D/g, '').slice(0, 6))
                                        }
                                        placeholder="6-digit"
                                        placeholderTextColor={Colors.textMuted}
                                        keyboardType="number-pad"
                                        onFocus={() => onFocus('pin')}
                                        onBlur={onBlur}
                                        maxLength={6}
                                        returnKeyType="done"
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={styles.hintSpacer} />

                        <View style={styles.sectionDivider} />

                        {/* Route assignment */}
                        <Text style={styles.sectionTitle}>🛣️ Assign to a Route</Text>
                        <Text style={styles.sectionSubtitle}>
                            Select which highway route this restaurant is on, then pick the nearest
                            stop.
                        </Text>

                        {routesLoading ? (
                            <View style={styles.loaderRow}>
                                <ActivityIndicator size="small" color={Colors.amber} />
                                <Text style={styles.loaderText}>Loading routes…</Text>
                            </View>
                        ) : routes.length === 0 ? (
                            <View style={styles.emptyRoutes}>
                                <Text style={styles.emptyRoutesIcon}>🛣️</Text>
                                <Text style={styles.emptyRoutesText}>
                                    No active routes available
                                </Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.inputLabel}>
                                    Route <Text style={styles.inputLabelNote}>(optional)</Text>
                                </Text>
                                <View style={styles.routeList}>
                                    {routes.map(route => {
                                        const active = route._id === selectedRouteId;
                                        return (
                                            <TouchableOpacity
                                                key={route._id}
                                                style={[
                                                    styles.routeCard,
                                                    active && styles.routeCardActive,
                                                ]}
                                                onPress={() => handleSelectRoute(route._id ?? '')}
                                                activeOpacity={0.8}
                                            >
                                                <View style={styles.routeCardLeft}>
                                                    <Text
                                                        style={[
                                                            styles.routeCardName,
                                                            active && styles.routeCardNameActive,
                                                        ]}
                                                    >
                                                        {route.name}
                                                    </Text>
                                                    <Text style={styles.routeCardMeta}>
                                                        {route.fromCity} → {route.toCity}
                                                        {route.totalDistanceKm
                                                            ? `  ·  ${route.totalDistanceKm} km`
                                                            : ''}
                                                    </Text>
                                                </View>
                                                <View
                                                    style={[
                                                        styles.routeRadio,
                                                        active && styles.routeRadioActive,
                                                    ]}
                                                >
                                                    {active && (
                                                        <View style={styles.routeRadioDot} />
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {/* Waypoint picker */}
                                {selectedRouteId !== '' && (
                                    <View style={styles.waypointSection}>
                                        <Text style={styles.inputLabel}>
                                            Nearest Stop{' '}
                                            <Text style={styles.inputLabelNote}>(optional)</Text>
                                        </Text>
                                        {routeLoading ? (
                                            <View style={styles.loaderRow}>
                                                <ActivityIndicator
                                                    size="small"
                                                    color={Colors.amber}
                                                />
                                                <Text style={styles.loaderText}>
                                                    Loading stops…
                                                </Text>
                                            </View>
                                        ) : (
                                            <ScrollView
                                                horizontal
                                                showsHorizontalScrollIndicator={false}
                                                contentContainerStyle={styles.waypointScroll}
                                            >
                                                {waypoints.map(wp => {
                                                    const sel = wp._id === selectedWaypointId;
                                                    return (
                                                        <TouchableOpacity
                                                            key={wp._id}
                                                            style={[
                                                                styles.waypointChip,
                                                                sel && styles.waypointChipActive,
                                                            ]}
                                                            onPress={() => handleSelectWaypoint(wp)}
                                                            activeOpacity={0.75}
                                                        >
                                                            <Text
                                                                style={[
                                                                    styles.waypointOrder,
                                                                    sel &&
                                                                        styles.waypointOrderActive,
                                                                ]}
                                                            >
                                                                {wp.order + 1}
                                                            </Text>
                                                            <Text
                                                                style={[
                                                                    styles.waypointName,
                                                                    sel &&
                                                                        styles.waypointNameActive,
                                                                ]}
                                                            >
                                                                {wp.name}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </ScrollView>
                                        )}
                                        {selectedWaypointId && (
                                            <View style={styles.waypointInfo}>
                                                <Text style={styles.waypointInfoText}>
                                                    📌 Coordinates set from waypoint
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </>
                        )}
                    </Animated.View>
                )}

                {/* ══════════════════════════════════════════════════════════════
                    STEP 3 — Hours & Tax
                ══════════════════════════════════════════════════════════════ */}
                {step === 'hours' && (
                    <Animated.View
                        style={[styles.formCard, { transform: [{ translateX: shakeAnim }] }]}
                    >
                        {/* Open/Closed toggle */}
                        <View style={styles.switchRow}>
                            <View>
                                <Text style={styles.switchLabel}>Currently Open</Text>
                                <Text style={styles.switchSub}>
                                    Customers will see you as {isOpen ? 'open 🟢' : 'closed 🔴'}
                                </Text>
                            </View>
                            <Switch
                                value={isOpen}
                                onValueChange={setIsOpen}
                                trackColor={{ false: Colors.border, true: Colors.amberGlow }}
                                thumbColor={isOpen ? Colors.amber : Colors.textMuted}
                            />
                        </View>
                        <View style={styles.sectionDivider} />

                        <Text style={styles.sectionTitle}>⏰ Opening Hours</Text>
                        <View style={styles.twoColRow}>
                            <View style={styles.twoColLeft}>
                                <Text style={styles.inputLabel}>
                                    Opens at <Text style={styles.required}>*</Text>
                                </Text>
                                <View
                                    style={[
                                        styles.inputRow,
                                        isFocused('open') && styles.inputRowFocused,
                                    ]}
                                >
                                    <View style={styles.iconWrap}>
                                        <Text style={styles.inputIcon}>🌅</Text>
                                    </View>
                                    <View style={styles.inputDivider} />
                                    <TextInput
                                        style={styles.textInput}
                                        value={openTime}
                                        onChangeText={setOpenTime}
                                        placeholder="09:00"
                                        placeholderTextColor={Colors.textMuted}
                                        onFocus={() => onFocus('open')}
                                        onBlur={onBlur}
                                        keyboardType="numbers-and-punctuation"
                                        maxLength={5}
                                        returnKeyType="next"
                                    />
                                </View>
                            </View>
                            <View style={styles.twoColRight}>
                                <Text style={styles.inputLabel}>
                                    Closes at <Text style={styles.required}>*</Text>
                                </Text>
                                <View
                                    style={[
                                        styles.inputRow,
                                        isFocused('close') && styles.inputRowFocused,
                                    ]}
                                >
                                    <View style={styles.iconWrap}>
                                        <Text style={styles.inputIcon}>🌙</Text>
                                    </View>
                                    <View style={styles.inputDivider} />
                                    <TextInput
                                        style={styles.textInput}
                                        value={closeTime}
                                        onChangeText={setCloseTime}
                                        placeholder="22:00"
                                        placeholderTextColor={Colors.textMuted}
                                        onFocus={() => onFocus('close')}
                                        onBlur={onBlur}
                                        keyboardType="numbers-and-punctuation"
                                        maxLength={5}
                                        returnKeyType="next"
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={styles.hintSpacer} />

                        <Text style={styles.inputLabel}>
                            Avg Prep Time (minutes) <Text style={styles.required}>*</Text>
                        </Text>
                        <View
                            style={[styles.inputRow, isFocused('prep') && styles.inputRowFocused]}
                        >
                            <View style={styles.iconWrap}>
                                <Text style={styles.inputIcon}>👨‍🍳</Text>
                            </View>
                            <View style={styles.inputDivider} />
                            <TextInput
                                style={styles.textInput}
                                value={avgPrepTime}
                                onChangeText={t => setAvgPrepTime(t.replace(/\D/g, ''))}
                                keyboardType="number-pad"
                                placeholder="e.g. 30"
                                placeholderTextColor={Colors.textMuted}
                                onFocus={() => onFocus('prep')}
                                onBlur={onBlur}
                                returnKeyType="next"
                            />
                        </View>
                        <View style={styles.hintSpacer} />
                        <View style={styles.sectionDivider} />

                        <Text style={styles.sectionTitle}>🧾 GST Details</Text>
                        <Text style={styles.inputLabel}>
                            GST Number <Text style={styles.inputLabelNote}>(optional)</Text>
                        </Text>
                        <View style={[styles.inputRow, isFocused('gst') && styles.inputRowFocused]}>
                            <View style={styles.iconWrap}>
                                <Text style={styles.inputIcon}>🪪</Text>
                            </View>
                            <View style={styles.inputDivider} />
                            <TextInput
                                style={styles.textInput}
                                value={gstNumber}
                                onChangeText={t => setGstNumber(t.toUpperCase())}
                                placeholder="15-character GSTIN"
                                placeholderTextColor={Colors.textMuted}
                                onFocus={() => onFocus('gst')}
                                onBlur={onBlur}
                                autoCapitalize="characters"
                                maxLength={15}
                                returnKeyType="next"
                            />
                        </View>
                        <View style={styles.hintSpacer} />

                        <Text style={styles.inputLabel}>
                            GST Rate (%) <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.chipRow}>
                            {['0', '5', '12', '18'].map(r => (
                                <TouchableOpacity
                                    key={r}
                                    style={[
                                        styles.foodTypeChip,
                                        gstRate === r && styles.foodTypeChipActive,
                                    ]}
                                    onPress={() => setGstRate(r)}
                                    activeOpacity={0.75}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            gstRate === r && styles.chipTextActive,
                                        ]}
                                    >
                                        {r}%
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.hintSpacer} />
                    </Animated.View>
                )}

                {/* ── CTA ───────────────────────────────────────────────────── */}
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    {step !== 'hours' ? (
                        <TouchableOpacity
                            style={[
                                styles.primaryBtn,
                                !currentStepValid && styles.primaryBtnDisabled,
                            ]}
                            onPress={() => goToStep(step === 'basic' ? 'location' : 'hours')}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.primaryBtnText}>Continue</Text>
                            <Text style={styles.primaryBtnArrow}>→</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.primaryBtn,
                                (!hoursValid || loading) && styles.primaryBtnDisabled,
                            ]}
                            onPress={handleSubmit}
                            activeOpacity={0.85}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Text style={styles.primaryBtnText}>Create Restaurant 🚀</Text>
                                    <Text style={styles.primaryBtnArrow}>→</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </Animated.View>

                <View style={{ height: 48 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? 24 : 60,
    },

    // Back
    backBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: Colors.bgCard,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        ...Shadow.card,
    },
    backIcon: { fontSize: 18, color: Colors.textPrimary, fontWeight: '700' },

    // Header
    headerText: { marginBottom: 24 },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: Colors.textPrimary,
        letterSpacing: -0.8,
        lineHeight: 36,
        marginBottom: 6,
    },
    subtitle: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },

    // Steps
    stepWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        position: 'relative',
    },
    stepLine: {
        position: 'absolute',
        top: 19,
        left: '8%',
        right: '8%',
        height: 2,
        backgroundColor: Colors.border,
        zIndex: 0,
    },
    stepLineFill: { height: '100%', backgroundColor: Colors.amber, borderRadius: 99 },
    stepItem: { alignItems: 'center', gap: 6, zIndex: 1, width: '33%' },
    stepDot: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.bgCard,
        borderWidth: 2,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepDotActive: {
        borderColor: Colors.amber,
        backgroundColor: Colors.amberGlow,
        ...Shadow.amber,
    },
    stepDotDone: { borderColor: Colors.amber, backgroundColor: Colors.amber },
    stepDotText: { fontSize: 16 },
    stepDotTextActive: { fontSize: 14, fontWeight: '800', color: Colors.textOnAmber },
    stepLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.textMuted,
        textAlign: 'center',
        letterSpacing: 0.2,
    },
    stepLabelActive: { color: Colors.amber, fontWeight: '800' },

    // Form Card
    formCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.card,
    },

    // Labels
    inputLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.7,
        marginBottom: 8,
    },
    required: { color: Colors.brandRed },
    inputLabelNote: {
        fontSize: 10,
        fontWeight: '500',
        color: Colors.textMuted,
        textTransform: 'none',
        letterSpacing: 0,
    },

    // Inputs
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.bgInput,
        borderRadius: Radius.md,
        borderWidth: 1.5,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    inputRowFocused: { borderColor: Colors.amber, backgroundColor: '#FFFAF6' },
    textAreaRow: { alignItems: 'flex-start' },
    countryCode: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
    iconWrap: {
        paddingHorizontal: 14,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputIcon: { fontSize: 15 },
    flag: { fontSize: 16 },
    dialCode: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
    inputDivider: { width: 1, height: 28, backgroundColor: Colors.border },
    textInput: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textPrimary,
        paddingHorizontal: 14,
        paddingVertical: 14,
        letterSpacing: 0.2,
    },
    textArea: { paddingHorizontal: 14, paddingTop: 14, minHeight: 80, textAlignVertical: 'top' },
    clearBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    clearIcon: { fontSize: 11, color: Colors.textSecondary, fontWeight: '700' },

    // Hints
    hintError: {
        fontSize: 11,
        color: Colors.brandRed,
        fontWeight: '600',
        marginTop: 5,
        marginBottom: 12,
        marginLeft: 4,
    },
    hintSpacer: { height: 14 },

    // Chips
    chipRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
    foodTypeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: Radius.full,
        backgroundColor: Colors.bgElevated,
        borderWidth: 1.5,
        borderColor: Colors.border,
    },
    foodTypeChipActive: {
        backgroundColor: Colors.amber,
        borderColor: Colors.amber,
        ...Shadow.amber,
    },
    chipEmoji: { fontSize: 14 },
    chipText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
    chipTextActive: { color: Colors.textOnAmber },
    cuisineGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    cuisineChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: Radius.full,
        backgroundColor: Colors.bgElevated,
        borderWidth: 1.5,
        borderColor: Colors.border,
    },
    cuisineChipActive: { backgroundColor: Colors.amberGlow, borderColor: Colors.amber },
    cuisineChipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
    cuisineChipTextActive: { color: Colors.amber },

    // Two-col
    twoColRow: { flexDirection: 'row', gap: 12 },
    twoColLeft: { flex: 1 },
    twoColRight: { flex: 1 },

    // Location button
    locationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: Colors.amberGlow,
        borderRadius: Radius.md,
        borderWidth: 1.5,
        borderColor: Colors.borderActive,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 4,
    },
    locationBtnLoading: { opacity: 0.65 },
    locationBtnDone: {
        backgroundColor: 'rgba(21,128,61,0.08)',
        borderColor: 'rgba(21,128,61,0.35)',
    },
    locationBtnIcon: { fontSize: 22 },
    locationBtnTextWrap: { flex: 1 },
    locationBtnTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.2,
    },
    locationBtnSub: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
    locationBtnArrow: { fontSize: 16, color: Colors.amber, fontWeight: '700' },

    // Or divider
    orDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 14 },
    orLine: { flex: 1, height: 1, backgroundColor: Colors.border },
    orText: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, letterSpacing: 0.4 },

    // Section
    sectionDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 16 },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 4,
        letterSpacing: -0.2,
    },
    sectionSubtitle: { fontSize: 12, color: Colors.textMuted, lineHeight: 18, marginBottom: 14 },

    // Loader
    loaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
    loaderText: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },

    // Empty
    emptyRoutes: { paddingVertical: 20, alignItems: 'center', gap: 6 },
    emptyRoutesIcon: { fontSize: 28 },
    emptyRoutesText: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },

    // Route cards
    routeList: { gap: 10, marginBottom: 4 },
    routeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.bgInput,
        borderRadius: Radius.md,
        borderWidth: 1.5,
        borderColor: Colors.border,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    routeCardActive: { borderColor: Colors.amber, backgroundColor: Colors.amberGlow },
    routeCardLeft: { flex: 1, gap: 3 },
    routeCardName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
    routeCardNameActive: { color: Colors.amber },
    routeCardMeta: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
    routeRadio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    routeRadioActive: { borderColor: Colors.amber },
    routeRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.amber },

    // Waypoints
    waypointSection: { marginTop: 14 },
    waypointScroll: { gap: 8, paddingVertical: 2 },
    waypointChip: {
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: Radius.md,
        backgroundColor: Colors.bgElevated,
        borderWidth: 1.5,
        borderColor: Colors.border,
        minWidth: 72,
    },
    waypointChipActive: {
        backgroundColor: Colors.amber,
        borderColor: Colors.amber,
        ...Shadow.amber,
    },
    waypointOrder: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.textMuted,
        backgroundColor: Colors.border,
        borderRadius: 99,
        paddingHorizontal: 6,
        paddingVertical: 1,
        overflow: 'hidden',
    },
    waypointOrderActive: { backgroundColor: 'rgba(255,255,255,0.3)', color: Colors.textOnAmber },
    waypointName: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    waypointNameActive: { color: Colors.textOnAmber },
    waypointInfo: {
        marginTop: 10,
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.sm,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    waypointInfoText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },

    // Switch
    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    switchLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
    switchSub: { fontSize: 12, color: Colors.textMuted },

    // CTA
    primaryBtn: {
        backgroundColor: Colors.amber,
        borderRadius: Radius.md,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...Shadow.amber,
    },
    primaryBtnDisabled: { backgroundColor: Colors.textMuted, shadowOpacity: 0, elevation: 0 },
    primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.2 },
    primaryBtnArrow: { fontSize: 18, color: '#FFFFFF', fontWeight: '700' },
});
