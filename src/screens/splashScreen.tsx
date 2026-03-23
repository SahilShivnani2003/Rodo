import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar, Dimensions } from 'react-native';
import { Colors } from '../theme/index';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type splashProps = NativeStackScreenProps<RootStackParamList, 'splash'>

export default function SplashScreen({navigation}:splashProps) {
    // Animations
    const logoScale = useRef(new Animated.Value(0.4)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const textY = useRef(new Animated.Value(20)).current;
    const tagOpacity = useRef(new Animated.Value(0)).current;
    const ringScale1 = useRef(new Animated.Value(0.6)).current;
    const ringOpacity1 = useRef(new Animated.Value(0.4)).current;
    const ringScale2 = useRef(new Animated.Value(0.6)).current;
    const ringOpacity2 = useRef(new Animated.Value(0.25)).current;
    const exitOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Pulse rings
        const pulseRings = () => {
            Animated.loop(
                Animated.parallel([
                    Animated.sequence([
                        Animated.timing(ringScale1, {
                            toValue: 1.3,
                            duration: 1400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(ringScale1, {
                            toValue: 0.9,
                            duration: 1400,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.sequence([
                        Animated.timing(ringOpacity1, {
                            toValue: 0.1,
                            duration: 1400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(ringOpacity1, {
                            toValue: 0.4,
                            duration: 1400,
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
            ).start();

            Animated.loop(
                Animated.parallel([
                    Animated.sequence([
                        Animated.delay(400),
                        Animated.timing(ringScale2, {
                            toValue: 1.5,
                            duration: 1600,
                            useNativeDriver: true,
                        }),
                        Animated.timing(ringScale2, {
                            toValue: 0.8,
                            duration: 1600,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.sequence([
                        Animated.delay(400),
                        Animated.timing(ringOpacity2, {
                            toValue: 0.06,
                            duration: 1600,
                            useNativeDriver: true,
                        }),
                        Animated.timing(ringOpacity2, {
                            toValue: 0.25,
                            duration: 1600,
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
            ).start();
        };

        pulseRings();

        // Main entrance sequence
        Animated.sequence([
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 90,
                    friction: 7,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.spring(textY, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 10,
                }),
            ]),
            Animated.timing(tagOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.delay(1000),
            // Exit
            Animated.timing(exitOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start(() => navigation.replace('welcome'));
    }, []);

    return (
        <Animated.View style={[styles.root, { opacity: exitOpacity }]}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.amber} />

            {/* Background rings */}
            <Animated.View
                style={[
                    styles.ring2,
                    { transform: [{ scale: ringScale2 }], opacity: ringOpacity2 },
                ]}
            />
            <Animated.View
                style={[
                    styles.ring1,
                    { transform: [{ scale: ringScale1 }], opacity: ringOpacity1 },
                ]}
            />

            {/* Road dashes decoration */}
            <View style={styles.roadDashes}>
                {[...Array(6)].map((_, i) => (
                    <View key={i} style={styles.dash} />
                ))}
            </View>

            {/* Logo */}
            <Animated.View
                style={[
                    styles.logoWrap,
                    { transform: [{ scale: logoScale }], opacity: logoOpacity },
                ]}
            >
                <View style={styles.logoCircle}>
                    <Text style={styles.logoEmoji}>🛣️</Text>
                </View>
            </Animated.View>

            {/* Brand name */}
            <Animated.View style={{ opacity: textOpacity, transform: [{ translateY: textY }] }}>
                <Text style={styles.brandName}>Rodo</Text>
            </Animated.View>

            {/* Tagline */}
            <Animated.View style={{ opacity: tagOpacity }}>
                <Text style={styles.tagline}>Pre-order food on your highway</Text>
            </Animated.View>

            {/* Bottom loader */}
            <View style={styles.loaderWrap}>
                <View style={styles.loaderTrack}>
                    <Animated.View style={styles.loaderFill} />
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.amber,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ring1: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    ring2: {
        position: 'absolute',
        width: 420,
        height: 420,
        borderRadius: 210,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    roadDashes: {
        position: 'absolute',
        bottom: 120,
        flexDirection: 'row',
        gap: 10,
        opacity: 0.15,
    },
    dash: {
        width: 28,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#FFFFFF',
    },
    logoWrap: {
        marginBottom: 24,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.22)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    logoEmoji: {
        fontSize: 48,
    },
    brandName: {
        fontSize: 52,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -2,
        textAlign: 'center',
    },
    tagline: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
        marginTop: 8,
        letterSpacing: 0.2,
    },
    loaderWrap: {
        position: 'absolute',
        bottom: 60,
        width: 120,
    },
    loaderTrack: {
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    loaderFill: {
        height: '100%',
        width: '65%',
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
    },
});
