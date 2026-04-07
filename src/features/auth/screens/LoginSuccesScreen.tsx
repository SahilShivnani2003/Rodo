import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    StatusBar,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Colors, Radius, Shadow } from '@theme/index';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import { useAuthStore } from '@/store/useAuthStore';

type loginSuccessProps = NativeStackScreenProps<RootStackParamList, 'loginSuccess'>;

export default function LoginSuccessScreen({ navigation }: loginSuccessProps) {
    const { user } = useAuthStore();
    const checkScale = useRef(new Animated.Value(0)).current;
    const checkOpacity = useRef(new Animated.Value(0)).current;
    const ring1Scale = useRef(new Animated.Value(0.5)).current;
    const ring1Opacity = useRef(new Animated.Value(0)).current;
    const ring2Scale = useRef(new Animated.Value(0.5)).current;
    const ring2Opacity = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const textY = useRef(new Animated.Value(24)).current;
    const btnOpacity = useRef(new Animated.Value(0)).current;
    const btnY = useRef(new Animated.Value(20)).current;
    const confetti1 = useRef(new Animated.Value(0)).current;
    const confetti2 = useRef(new Animated.Value(0)).current;
    const confetti3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            // Check mark pop
            Animated.parallel([
                Animated.spring(checkScale, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 6,
                }),
                Animated.timing(checkOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]),
            // Rings expand
            Animated.parallel([
                Animated.spring(ring1Scale, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 60,
                    friction: 8,
                }),
                Animated.timing(ring1Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.delay(150),
            ]),
            Animated.parallel([
                Animated.spring(ring2Scale, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 8,
                }),
                Animated.timing(ring2Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]),
            // Confetti
            Animated.parallel([
                Animated.spring(confetti1, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 80,
                    friction: 7,
                }),
                Animated.spring(confetti2, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 70,
                    friction: 7,
                }),
                Animated.spring(confetti3, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 90,
                    friction: 7,
                }),
            ]),
            // Text slide in
            Animated.parallel([
                Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.spring(textY, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 10,
                }),
            ]),
            // Button fade in
            Animated.parallel([
                Animated.timing(btnOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
                Animated.spring(btnY, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 10,
                }),
            ]),
        ]).start();
    }, []);

    const confetti1Y = confetti1.interpolate({ inputRange: [0, 1], outputRange: [0, -80] });
    const confetti1X = confetti1.interpolate({ inputRange: [0, 1], outputRange: [0, -60] });
    const confetti2Y = confetti2.interpolate({ inputRange: [0, 1], outputRange: [0, -100] });
    const confetti2X = confetti2.interpolate({ inputRange: [0, 1], outputRange: [0, 50] });
    const confetti3Y = confetti3.interpolate({ inputRange: [0, 1], outputRange: [0, -70] });
    const confetti3X = confetti3.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

            <View style={styles.center}>
                {/* Ring 2 (outermost) */}
                <Animated.View
                    style={[
                        styles.ring2,
                        { transform: [{ scale: ring2Scale }], opacity: ring2Opacity },
                    ]}
                />

                {/* Ring 1 */}
                <Animated.View
                    style={[
                        styles.ring1,
                        { transform: [{ scale: ring1Scale }], opacity: ring1Opacity },
                    ]}
                />

                {/* Check circle */}
                <Animated.View
                    style={[
                        styles.checkCircle,
                        { transform: [{ scale: checkScale }], opacity: checkOpacity },
                    ]}
                >
                    <Text style={styles.checkIcon}>✓</Text>
                </Animated.View>

                {/* Confetti emojis */}
                <Animated.Text
                    style={[
                        styles.confetti,
                        {
                            transform: [{ translateY: confetti1Y }, { translateX: confetti1X }],
                            opacity: confetti1,
                        },
                    ]}
                >
                    🎉
                </Animated.Text>
                <Animated.Text
                    style={[
                        styles.confetti,
                        styles.confetti2,
                        {
                            transform: [{ translateY: confetti2Y }, { translateX: confetti2X }],
                            opacity: confetti2,
                        },
                    ]}
                >
                    ✨
                </Animated.Text>
                <Animated.Text
                    style={[
                        styles.confetti,
                        styles.confetti3,
                        {
                            transform: [{ translateY: confetti3Y }, { translateX: confetti3X }],
                            opacity: confetti3,
                        },
                    ]}
                >
                    🛣️
                </Animated.Text>
            </View>

            {/* Text */}
            <Animated.View
                style={[
                    styles.textWrap,
                    { opacity: textOpacity, transform: [{ translateY: textY }] },
                ]}
            >
                <Text style={styles.title}>You're all set! 🚀</Text>
                <Text style={styles.subtitle}>
                    Welcome to Rodo! Plan your first highway trip and pre-order delicious food along
                    the way.
                </Text>

                {/* Perks chips */}
                <View style={styles.perksRow}>
                    {['🎉 10% off first order', '📍 Live tracking', '⏱ Zero wait time'].map(p => (
                        <View key={p} style={styles.perkChip}>
                            <Text style={styles.perkText}>{p}</Text>
                        </View>
                    ))}
                </View>
            </Animated.View>

            {/* Button */}
            <Animated.View
                style={[styles.btnWrap, { opacity: btnOpacity, transform: [{ translateY: btnY }] }]}
            >
                <TouchableOpacity
                    style={styles.startBtn}
                    onPress={() => {
                        if (user?.role === 'customer') {
                            navigation.replace('main', {
                                screen: 'home',
                            });
                        } else {
                            navigation.replace('owner', {
                                screen: 'dashboard',
                            });
                        }
                    }}
                    activeOpacity={0.85}
                >
                    <Text style={styles.startBtnText}>Start Exploring 🛣️</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
    },

    center: {
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        position: 'relative',
    },

    ring2: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 1.5,
        borderColor: Colors.borderActive,
        backgroundColor: Colors.amberGlow2,
    },
    ring1: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 2,
        borderColor: Colors.borderActive,
        backgroundColor: Colors.amberGlow,
    },

    checkCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: Colors.amber,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadow.amber,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    checkIcon: {
        fontSize: 44,
        color: '#FFFFFF',
        fontWeight: '900',
    },

    confetti: {
        position: 'absolute',
        fontSize: 28,
        top: '50%',
        left: '50%',
    },
    confetti2: { top: '40%', left: '55%' },
    confetti3: { top: '55%', left: '45%' },

    textWrap: {
        alignItems: 'center',
        marginBottom: 36,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.textPrimary,
        letterSpacing: -1,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 23,
        marginBottom: 20,
    },
    perksRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
    },
    perkChip: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.full,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.card,
    },
    perkText: {
        fontSize: 12,
        color: Colors.textPrimary,
        fontWeight: '600',
    },

    btnWrap: { width: '100%' },
    startBtn: {
        backgroundColor: Colors.amber,
        borderRadius: Radius.md,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadow.amber,
    },
    startBtnText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.2,
    },
});
