// components/BottomTabBar.tsx — Rodo
// Custom animated bottom tab bar

import { useRef, useEffect, useState } from 'react';
import {
    Animated,
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
    Platform,
    LayoutChangeEvent,
} from 'react-native';
import { Colors, Radius } from '../theme';

// ─── Tab config — must match route names in TabNavigator ─────────────────────

export type TabName = 'home' | 'restaurants' | 'orders' | 'profile';

export const TABS: {
    name: TabName;
    label: string;
    icon: string;
    badge?: number;
}[] = [
    { name: 'home', label: 'Home', icon: '🏠' },
    { name: 'restaurants', label: 'Restaurants', icon: '🍽️' },
    { name: 'orders', label: 'Orders', icon: '📦', badge: 2 },
    { name: 'profile', label: 'Profile', icon: '👤' },
];

const TAB_COUNT = TABS.length;

// ─── Single Tab Item ──────────────────────────────────────────────────────────

interface TabItemProps {
    tab: (typeof TABS)[0];
    isFocused: boolean;
    onPress: () => void;
}

function TabItem({ tab, isFocused, onPress }: TabItemProps) {
    const scale = useRef(new Animated.Value(1)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const pillScaleX = useRef(new Animated.Value(0)).current;
    const pillOpacity = useRef(new Animated.Value(0)).current;
    const labelOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isFocused) {
            Animated.parallel([
                Animated.spring(scale, {
                    toValue: 1.1,
                    useNativeDriver: true,
                    tension: 140,
                    friction: 8,
                }),
                Animated.spring(translateY, {
                    toValue: -4,
                    useNativeDriver: true,
                    tension: 140,
                    friction: 8,
                }),
                Animated.spring(pillScaleX, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 110,
                    friction: 10,
                }),
                Animated.timing(pillOpacity, { toValue: 1, duration: 160, useNativeDriver: true }),
                Animated.timing(labelOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.spring(scale, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 140,
                    friction: 8,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 140,
                    friction: 8,
                }),
                Animated.spring(pillScaleX, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 110,
                    friction: 10,
                }),
                Animated.timing(pillOpacity, { toValue: 0, duration: 120, useNativeDriver: true }),
                Animated.timing(labelOpacity, { toValue: 0, duration: 120, useNativeDriver: true }),
            ]).start();
        }
    }, [isFocused]);

    return (
        <TouchableOpacity
            style={styles.item}
            onPress={onPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={tab.label}
        >
            <Animated.View style={[styles.inner, { transform: [{ scale }, { translateY }] }]}>
                {/* Amber pill background */}
                <Animated.View
                    style={[
                        styles.pill,
                        {
                            opacity: pillOpacity,
                            transform: [{ scaleX: pillScaleX }],
                        },
                    ]}
                />

                {/* Icon + notification badge */}
                <View style={styles.iconWrap}>
                    <Text style={[styles.icon, !isFocused && styles.iconInactive]}>{tab.icon}</Text>
                    {!!tab.badge && tab.badge > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {tab.badge > 9 ? '9+' : String(tab.badge)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Label — only visible when focused */}
                <Animated.Text style={[styles.label, { opacity: labelOpacity }]} numberOfLines={1}>
                    {tab.label}
                </Animated.Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────

export function CustomTabBar({ state, navigation }: any) {
    // Use onLayout to get real rendered width — avoids Dimensions mismatch
    // (safe area insets, foldables, tablets, etc.)
    const [barWidth, setBarWidth] = useState(0);
    const accentX = useRef(new Animated.Value(0)).current;

    const tabWidth = barWidth > 0 ? barWidth / TAB_COUNT : 0;
    // Accent bar is 40% of tab width, centred inside the tab column
    const accentW = tabWidth * 0.4;
    const centreOffset = (tabWidth - accentW) / 2;

    useEffect(() => {
        if (barWidth === 0) return;
        Animated.spring(accentX, {
            toValue: state.index * tabWidth + centreOffset,
            useNativeDriver: true,
            tension: 180,
            friction: 16,
        }).start();
    }, [state.index, barWidth]);

    const onLayout = (e: LayoutChangeEvent) => {
        setBarWidth(e.nativeEvent.layout.width);
    };

    return (
        <View style={styles.bar} onLayout={onLayout}>
            {/* Sliding accent bar — only render once width is known */}
            {barWidth > 0 && (
                <Animated.View
                    style={[
                        styles.accentBar,
                        {
                            width: accentW,
                            transform: [{ translateX: accentX }],
                        },
                    ]}
                />
            )}

            {/* Tab items */}
            <View style={styles.row}>
                {TABS.map((tab, index) => (
                    <TabItem
                        key={tab.name}
                        tab={tab}
                        isFocused={state.index === index}
                        onPress={() => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: state.routes[index].key,
                                canPreventDefault: true,
                            });
                            if (!event.defaultPrevented) {
                                navigation.navigate(tab.name);
                            }
                        }}
                    />
                ))}
            </View>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    bar: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.07)',
        paddingTop: 8, // room for the 3px accent bar + breathing space
        paddingBottom: Platform.OS === 'ios' ? 28 : 12,
        paddingHorizontal: 0,
        shadowColor: '#8A7060',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 16,
    },

    // Slides via translateX — no % strings, works with useNativeDriver: true
    accentBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: 3,
        borderBottomLeftRadius: 3,
        borderBottomRightRadius: 3,
        backgroundColor: Colors.amber,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center', // vertically centre all icons at same baseline
    },

    item: {
        flex: 1, // equal width columns
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        minHeight: 54,
    },

    inner: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        position: 'relative',
        paddingHorizontal: 8,
    },

    pill: {
        position: 'absolute',
        top: -6,
        width: 56,
        height: 36,
        borderRadius: Radius.full,
        backgroundColor: Colors.amberGlow,
        borderWidth: 1,
        borderColor: Colors.borderActive,
        alignSelf: 'center',
    },

    iconWrap: {
        position: 'relative',
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },

    icon: {
        fontSize: 22,
    },
    iconInactive: {
        opacity: 0.3,
    },

    label: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.amber,
        letterSpacing: 0.2,
        zIndex: 1,
        textAlign: 'center',
    },

    badge: {
        position: 'absolute',
        top: -4,
        right: -7,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: Colors.amber,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    badgeText: {
        fontSize: 8,
        fontWeight: '800',
        color: '#FFFFFF',
        lineHeight: 10,
    },
});
