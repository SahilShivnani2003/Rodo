import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar, Easing, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

// ─── Theme ────────────────────────────────────────────────────────────────────
const Colors = {
    bg: '#F5F2ED',
    amber: '#E86A1A',
    amberLight: '#F08040',
    amberGlow: 'rgba(232,106,26,0.18)',
    amberGlow2: 'rgba(232,106,26,0.07)',
    textPrimary: '#1A1610',
    textSecondary: '#6B6560',
    textMuted: '#B0A89E',
    textOnAmber: '#FFFFFF',
    border: 'rgba(0,0,0,0.06)',
    bgElevated: '#EEE9E2',
};

// ─── Types ────────────────────────────────────────────────────────────────────
type splashProps = NativeStackScreenProps<RootStackParamList, 'splash'>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const easeOut = Easing.out(Easing.cubic);
const easeInOut = Easing.inOut(Easing.cubic);

// ─── Component ────────────────────────────────────────────────────────────────
export default function SplashScreen({ navigation }: splashProps) {
    // — values
    const masterOpacity = useRef(new Animated.Value(1)).current;

    // pill / wordmark reveal
    const pillScale = useRef(new Animated.Value(0.72)).current;
    const pillOpacity = useRef(new Animated.Value(0)).current;
    const pillY = useRef(new Animated.Value(28)).current;

    // logo card
    const logoScale = useRef(new Animated.Value(0.6)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoY = useRef(new Animated.Value(14)).current;

    // brand text
    const nameOpacity = useRef(new Animated.Value(0)).current;
    const nameY = useRef(new Animated.Value(10)).current;
    const nameLetterX = useRef(new Animated.Value(-6)).current;

    // tagline
    const tagOpacity = useRef(new Animated.Value(0)).current;
    const tagY = useRef(new Animated.Value(6)).current;

    // accent line
    const lineWidth = useRef(new Animated.Value(0)).current;

    // decorative dots
    const dotsOpacity = useRef(new Animated.Value(0)).current;

    // loader progress
    const loaderProgress = useRef(new Animated.Value(0)).current;
    const loaderOpacity = useRef(new Animated.Value(0)).current;

    // ambient halo pulse
    const haloScale1 = useRef(new Animated.Value(1)).current;
    const haloOpacity1 = useRef(new Animated.Value(0.35)).current;
    const haloScale2 = useRef(new Animated.Value(1)).current;
    const haloOpacity2 = useRef(new Animated.Value(0.18)).current;

    useEffect(() => {
        // ── ambient halo loops ────────────────────────────────────────────────
        Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(haloScale1, {
                        toValue: 1.18,
                        duration: 2000,
                        easing: easeInOut,
                        useNativeDriver: true,
                    }),
                    Animated.timing(haloOpacity1, {
                        toValue: 0.08,
                        duration: 2000,
                        easing: easeInOut,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(haloScale1, {
                        toValue: 1,
                        duration: 2000,
                        easing: easeInOut,
                        useNativeDriver: true,
                    }),
                    Animated.timing(haloOpacity1, {
                        toValue: 0.35,
                        duration: 2000,
                        easing: easeInOut,
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.delay(600),
                Animated.parallel([
                    Animated.timing(haloScale2, {
                        toValue: 1.28,
                        duration: 2400,
                        easing: easeInOut,
                        useNativeDriver: true,
                    }),
                    Animated.timing(haloOpacity2, {
                        toValue: 0.04,
                        duration: 2400,
                        easing: easeInOut,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(haloScale2, {
                        toValue: 1,
                        duration: 2400,
                        easing: easeInOut,
                        useNativeDriver: true,
                    }),
                    Animated.timing(haloOpacity2, {
                        toValue: 0.18,
                        duration: 2400,
                        easing: easeInOut,
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        ).start();

        // ── entrance sequence ─────────────────────────────────────────────────
        Animated.sequence([
            // 1 – pill badge slides in
            Animated.parallel([
                Animated.timing(pillOpacity, {
                    toValue: 1,
                    duration: 340,
                    easing: easeOut,
                    useNativeDriver: true,
                }),
                Animated.timing(pillY, {
                    toValue: 0,
                    duration: 400,
                    easing: easeOut,
                    useNativeDriver: true,
                }),
                Animated.spring(pillScale, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 110,
                    friction: 8,
                }),
            ]),

            Animated.delay(60),

            // 2 – logo card
            Animated.parallel([
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 360,
                    easing: easeOut,
                    useNativeDriver: true,
                }),
                Animated.timing(logoY, {
                    toValue: 0,
                    duration: 440,
                    easing: easeOut,
                    useNativeDriver: true,
                }),
                Animated.spring(logoScale, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                }),
            ]),

            Animated.delay(40),

            // 3 – brand name + accent line together
            Animated.parallel([
                Animated.timing(nameOpacity, {
                    toValue: 1,
                    duration: 380,
                    easing: easeOut,
                    useNativeDriver: true,
                }),
                Animated.timing(nameY, {
                    toValue: 0,
                    duration: 420,
                    easing: easeOut,
                    useNativeDriver: true,
                }),
                Animated.timing(nameLetterX, {
                    toValue: 0,
                    duration: 420,
                    easing: easeOut,
                    useNativeDriver: true,
                }),
                Animated.timing(lineWidth, {
                    toValue: 1,
                    duration: 520,
                    easing: easeOut,
                    useNativeDriver: false,
                }),
            ]),

            Animated.delay(40),

            // 4 – tagline + dots
            Animated.parallel([
                Animated.timing(tagOpacity, {
                    toValue: 1,
                    duration: 340,
                    easing: easeOut,
                    useNativeDriver: true,
                }),
                Animated.timing(tagY, {
                    toValue: 0,
                    duration: 380,
                    easing: easeOut,
                    useNativeDriver: true,
                }),
                Animated.timing(dotsOpacity, {
                    toValue: 1,
                    duration: 500,
                    easing: easeOut,
                    useNativeDriver: true,
                }),
            ]),

            Animated.delay(80),

            // 5 – loader appears and fills
            Animated.parallel([
                Animated.timing(loaderOpacity, {
                    toValue: 1,
                    duration: 280,
                    easing: easeOut,
                    useNativeDriver: true,
                }),
                Animated.timing(loaderProgress, {
                    toValue: 1,
                    duration: 1100,
                    easing: easeInOut,
                    useNativeDriver: false,
                }),
            ]),

            Animated.delay(260),

            // 6 – exit fade
            Animated.timing(masterOpacity, {
                toValue: 0,
                duration: 460,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start(() => navigation.replace('welcome'));
    }, []);

    const loaderFillWidth = loaderProgress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    const accentLineWidth = lineWidth.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '48%'],
    });

    return (
        <Animated.View style={[styles.root, { opacity: masterOpacity }]}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

            {/* ── Ambient halos ──────────────────────────────────────────────── */}
            <Animated.View
                style={[
                    styles.halo,
                    styles.halo2,
                    {
                        transform: [{ scale: haloScale2 }],
                        opacity: haloOpacity2,
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.halo,
                    styles.halo1,
                    {
                        transform: [{ scale: haloScale1 }],
                        opacity: haloOpacity1,
                    },
                ]}
            />

            {/* ── Background grid texture ─────────────────────────────────────── */}
            <View style={styles.gridOverlay} pointerEvents="none">
                {[...Array(7)].map((_, row) => (
                    <View key={row} style={styles.gridRow}>
                        {[...Array(5)].map((_, col) => (
                            <View key={col} style={styles.gridDot} />
                        ))}
                    </View>
                ))}
            </View>

            {/* ── Top pill badge ─────────────────────────────────────────────── */}
            <Animated.View
                style={[
                    styles.pillBadge,
                    {
                        opacity: pillOpacity,
                        transform: [{ translateY: pillY }, { scale: pillScale }],
                    },
                ]}
            >
                <View style={styles.pillDot} />
                <Text style={styles.pillText}>Est. 2024 · Delivery</Text>
            </Animated.View>

            {/* ── Logo card ──────────────────────────────────────────────────── */}
            <Animated.View
                style={[
                    styles.logoCard,
                    {
                        opacity: logoOpacity,
                        transform: [{ translateY: logoY }, { scale: logoScale }],
                    },
                ]}
            >
                <Image
                    source={require('../assets/logo.jpeg')}
                    style={styles.logoImage}
                    resizeMode="cover"
                />
                {/* inner amber shine overlay */}
                <View style={styles.logoShine} />
            </Animated.View>

            {/* ── Brand name ─────────────────────────────────────────────────── */}
            <Animated.View
                style={[
                    styles.nameRow,
                    {
                        opacity: nameOpacity,
                        transform: [{ translateY: nameY }, { translateX: nameLetterX }],
                    },
                ]}
            >
                <Text style={styles.brandName}>Rodo</Text>
                <View style={styles.nameSupBadge}>
                    <Text style={styles.nameSupText}>®</Text>
                </View>
            </Animated.View>

            {/* ── Accent line ────────────────────────────────────────────────── */}
            <View style={styles.accentLineTrack}>
                <Animated.View style={[styles.accentLineFill, { width: accentLineWidth }]} />
            </View>

            {/* ── Tagline ────────────────────────────────────────────────────── */}
            <Animated.View
                style={[styles.tagRow, { opacity: tagOpacity, transform: [{ translateY: tagY }] }]}
            >
                <Text style={styles.tagline}>Rodo karo, wait mat karo</Text>
            </Animated.View>

            {/* ── Decorative dots bottom-left ────────────────────────────────── */}
            <Animated.View style={[styles.decorDots, { opacity: dotsOpacity }]}>
                {[0, 1, 2].map(i => (
                    <View key={i} style={[styles.decorDot, { opacity: 1 - i * 0.28 }]} />
                ))}
            </Animated.View>

            {/* ── Corner accent ──────────────────────────────────────────────── */}
            <Animated.View style={[styles.cornerAccent, { opacity: dotsOpacity }]}>
                <View style={styles.cornerLine} />
                <View style={[styles.cornerLine, styles.cornerLineH]} />
            </Animated.View>

            {/* ── Loader ─────────────────────────────────────────────────────── */}
            <Animated.View style={[styles.loaderWrap, { opacity: loaderOpacity }]}>
                <View style={styles.loaderTrack}>
                    <Animated.View style={[styles.loaderFill, { width: loaderFillWidth }]} />
                    {/* moving glow head */}
                    <Animated.View style={[styles.loaderGlow, { left: loaderFillWidth }]} />
                </View>
                <Text style={styles.loaderLabel}>Loading your ride…</Text>
            </Animated.View>
        </Animated.View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.amber,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── halos ──
    halo: {
        position: 'absolute',
        borderRadius: 9999,
        backgroundColor: '#D61A1A',
    },
    halo1: {
        width: 300,
        height: 300,
    },
    halo2: {
        width: 480,
        height: 480,
    },

    // ── dot grid background ──
    gridOverlay: {
        position: 'absolute',
        top: '15%',
        left: '5%',
        right: '5%',
        bottom: '15%',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    gridRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
    },
    gridDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#D61A1A',
        opacity: 0.13,
    },

    // ── pill badge ──
    pillBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        backgroundColor: Colors.bgElevated,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 7,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    pillDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: Colors.amber,
    },
    pillText: {
        fontFamily: 'DM Sans',
        fontSize: 12,
        fontWeight: '500',
        color: Colors.textSecondary,
        letterSpacing: 0.5,
    },

    // ── logo card ──
    logoCard: {
        width: 108,
        height: 108,
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(214,26,26,0.3)',
        marginBottom: 28,
        shadowColor: '#D61A1A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.32,
        shadowRadius: 20,
        elevation: 11,
        backgroundColor: Colors.bgElevated,
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    logoShine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderTopLeftRadius: 29,
        borderTopRightRadius: 29,
    },

    // ── brand name ──
    nameRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 4,
    },
    brandName: {
        fontFamily: 'SpaceGrotesk-Bold',
        fontSize: 60,
        fontWeight: '900',
        color: Colors.textPrimary,
        letterSpacing: -3,
        lineHeight: 60,
    },
    nameSupBadge: {
        marginTop: 10,
        backgroundColor: Colors.amberGlow,
        borderRadius: 6,
        paddingHorizontal: 5,
        paddingVertical: 2,
    },
    nameSupText: {
        fontFamily: 'SpaceGrotesk-Bold',
        fontSize: 14,
        color: Colors.amber,
        fontWeight: '700',
    },

    // ── accent line ──
    accentLineTrack: {
        width: '56%',
        height: 2.5,
        backgroundColor: 'transparent',
        marginTop: 6,
        marginBottom: 12,
        overflow: 'hidden',
        alignSelf: 'center',
    },
    accentLineFill: {
        height: '100%',
        backgroundColor: '#D61A1A',
        borderRadius: 2,
    },

    // ── tagline ──
    tagRow: {
        alignItems: 'center',
    },
    tagline: {
        fontFamily: 'DM Sans',
        fontSize: 14.5,
        fontWeight: '500',
        color: '#D61A1A',
        letterSpacing: 0.15,
        fontStyle: 'italic',
    },

    // ── decorative dots ──
    decorDots: {
        position: 'absolute',
        bottom: 90,
        left: 32,
        flexDirection: 'row',
        gap: 7,
    },
    decorDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.amber,
    },

    // ── corner accent ──
    cornerAccent: {
        position: 'absolute',
        top: 58,
        right: 28,
        width: 20,
        height: 20,
    },
    cornerLine: {
        position: 'absolute',
        right: 0,
        top: 0,
        width: 2,
        height: 20,
        backgroundColor: Colors.amber,
        borderRadius: 1,
        opacity: 0.45,
    },
    cornerLineH: {
        width: 20,
        height: 2,
        right: 0,
        top: 0,
    },

    // ── loader ──
    loaderWrap: {
        position: 'absolute',
        bottom: 52,
        alignItems: 'center',
        gap: 10,
        width: 160,
    },
    loaderTrack: {
        width: '100%',
        height: 3,
        backgroundColor: 'rgba(232,106,26,0.14)',
        borderRadius: 2,
        overflow: 'visible',
    },
    loaderFill: {
        height: '100%',
        backgroundColor: Colors.amber,
        borderRadius: 2,
    },
    loaderGlow: {
        position: 'absolute',
        top: -3,
        width: 12,
        height: 9,
        borderRadius: 5,
        backgroundColor: Colors.amberLight,
        opacity: 0.7,
        marginLeft: -6,
        shadowColor: Colors.amber,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 4,
    },
    loaderLabel: {
        fontFamily: 'DM Sans',
        fontSize: 11,
        fontWeight: '500',
        color: Colors.textMuted,
        letterSpacing: 0.4,
    },
});
