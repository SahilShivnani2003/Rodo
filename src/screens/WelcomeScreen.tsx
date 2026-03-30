import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
    StatusBar,
    Platform,
    NativeScrollEvent,
    NativeSyntheticEvent,
} from 'react-native';
import { Colors, Radius, Shadow } from '../theme/index';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width, height } = Dimensions.get('window');

type welcomeProps = NativeStackScreenProps<RootStackParamList, 'welcome'>;
// ─── Slides Data ──────────────────────────────────────────────────────────────

const SLIDES = [
    {
        emoji: '🛣️',
        bg: Colors.bg,
        accentBg: Colors.amberGlow2,
        title: 'Plan Your\nHighway Trip',
        desc: 'Select your route from Bhopal to Indore. We find all restaurants along the way — no surprises.',
        highlight: 'Bhopal → Indore',
    },
    {
        emoji: '🍽️',
        bg: Colors.bg,
        accentBg: Colors.amberGlow,
        title: 'Pre-order Food\nBefore You Arrive',
        desc: 'Pick your meal, set your arrival time, and your food will be hot and ready when you get there.',
        highlight: 'Zero waiting time',
    },
    {
        emoji: '📍',
        bg: Colors.bg,
        accentBg: Colors.amberGlow2,
        title: 'Track &\nEnjoy',
        desc: 'Watch your order status in real-time. Get directions to the restaurant with one tap.',
        highlight: 'Live order tracking',
    },
];

// ─── Dot Indicator ────────────────────────────────────────────────────────────

const Dots = ({ active, count }: { active: number; count: number }) => (
    <View style={styles.dots}>
        {[...Array(count)].map((_, i) => (
            <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
        ))}
    </View>
);

// ─── Slide Illustration ───────────────────────────────────────────────────────

const SlideIllustration = ({ slide }: { slide: (typeof SLIDES)[0] }) => (
    <View style={[styles.illustrationWrap, { backgroundColor: slide.accentBg }]}>
        {/* Decorative circles */}
        <View style={styles.illCircle1} />
        <View style={styles.illCircle2} />

        {/* Floating card mock */}
        <View style={styles.floatingCard}>
            <Text style={styles.floatingEmoji}>{slide.emoji}</Text>
            <View style={styles.floatingLines}>
                <View style={[styles.floatingLine, { width: 80 }]} />
                <View style={[styles.floatingLine, { width: 56, marginTop: 5 }]} />
            </View>
        </View>

        {/* Highlight badge */}
        <View style={styles.highlightBadge}>
            <View style={styles.highlightDot} />
            <Text style={styles.highlightText}>{slide.highlight}</Text>
        </View>
    </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function WelcomeScreen({ navigation }: welcomeProps) {
    const [activeSlide, setActiveSlide] = useState(0);
    const scrollRef = useRef<ScrollView>(null);

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const idx = Math.round(e.nativeEvent.contentOffset.x / width);
        setActiveSlide(idx);
    };

    const handleNext = () => {
        if (activeSlide < SLIDES.length - 1) {
            scrollRef.current?.scrollTo({ x: (activeSlide + 1) * width, animated: true });
        } else {
            navigation.replace('login');
        }
    };

    const isLast = activeSlide === SLIDES.length - 1;
    const slide = SLIDES[activeSlide];

    return (
        <View style={[styles.root, { backgroundColor: slide.bg }]}>
            <StatusBar barStyle="dark-content" backgroundColor={slide.bg} />

            {/* Skip */}
            <TouchableOpacity
                style={styles.skipBtn}
                onPress={() => navigation.replace('login')}
            >
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Slides */}
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                scrollEventThrottle={16}
                style={styles.slideScroll}
            >
                {SLIDES.map((s, i) => (
                    <View key={i} style={[styles.slide, { width }]}>
                        <SlideIllustration slide={s} />
                        <Text style={styles.slideTitle}>{s.title}</Text>
                        <Text style={styles.slideDesc}>{s.desc}</Text>
                    </View>
                ))}
            </ScrollView>

            {/* Bottom actions */}
            <View style={styles.bottom}>
                <Dots active={activeSlide} count={SLIDES.length} />

                <TouchableOpacity
                    style={[styles.nextBtn, isLast && styles.nextBtnFull]}
                    onPress={handleNext}
                    activeOpacity={0.85}
                >
                    <Text style={styles.nextBtnText}>{isLast ? 'Get Started 🚀' : 'Next →'}</Text>
                </TouchableOpacity>

                {isLast && (
                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => navigation.replace('login')}
                    >
                        <Text style={styles.loginLinkText}>
                            Already have an account?{' '}
                            <Text style={styles.loginLinkBold}>Log In</Text>
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    skipBtn: {
        position: 'absolute',
        top: Platform.OS === 'android' ? 24 : 56,
        right: 24,
        zIndex: 10,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: Radius.full,
        backgroundColor: Colors.bgCard,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.card,
    },
    skipText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textSecondary,
    },

    slideScroll: { flex: 1 },

    slide: {
        flex: 1,
        paddingHorizontal: 28,
        paddingTop: Platform.OS === 'android' ? 80 : 100,
        alignItems: 'flex-start',
    },

    // Illustration
    illustrationWrap: {
        width: '100%',
        height: 220,
        borderRadius: Radius.lg,
        marginBottom: 36,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    illCircle1: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255,255,255,0.5)',
        top: -40,
        right: -40,
    },
    illCircle2: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.35)',
        bottom: -30,
        left: -20,
    },
    floatingCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingHorizontal: 22,
        paddingVertical: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        ...Shadow.card,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
    },
    floatingEmoji: { fontSize: 40 },
    floatingLines: {},
    floatingLine: {
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.bgElevated,
    },
    highlightBadge: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: Colors.brandRed,
        borderRadius: Radius.full,
        paddingHorizontal: 12,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        ...Shadow.amber,
    },
    highlightDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.7)',
    },
    highlightText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    slideTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.textPrimary,
        letterSpacing: -1,
        lineHeight: 38,
        marginBottom: 16,
    },
    slideDesc: {
        fontSize: 15,
        color: Colors.textSecondary,
        lineHeight: 23,
        fontWeight: '400',
    },

    // Bottom
    bottom: {
        paddingHorizontal: 28,
        paddingBottom: Platform.OS === 'ios' ? 44 : 28,
        paddingTop: 16,
        gap: 16,
        alignItems: 'stretch',
    },
    dots: {
        flexDirection: 'row',
        gap: 7,
        alignSelf: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.textMuted,
    },
    dotActive: {
        width: 24,
        backgroundColor: Colors.amber,
    },
    nextBtn: {
        backgroundColor: Colors.amber,
        borderRadius: Radius.md,
        paddingVertical: 16,
        alignItems: 'center',
        ...Shadow.amber,
    },
    nextBtnFull: {},
    nextBtnText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.2,
    },
    loginLink: {
        alignItems: 'center',
        paddingBottom: 4,
    },
    loginLinkText: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    loginLinkBold: {
        color: Colors.amber,
        fontWeight: '700',
    },
});
