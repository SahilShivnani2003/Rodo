import { useRef, useEffect, useState } from 'react';
import {
    Animated,
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
    Platform,
    LayoutChangeEvent,
    Easing,
} from 'react-native';
import { Colors, Radius } from '../theme';

// ─── Tab config ───────────────────────────────────────────────────────────────

export type TabName = 'home' | 'restaurants' | 'orders' | 'profile';

export const TABS: {
    name: TabName;
    label: string;
    icon: string;
    activeIcon: string;
    badge?: number;
}[] = [
    { name: 'home', label: 'Home', icon: '🏠', activeIcon: '🏡' },
    { name: 'restaurants', label: 'Explore', icon: '🍽️', activeIcon: '🍽️' },
    { name: 'orders', label: 'Orders', icon: '📦', activeIcon: '📬', badge: 2 },
    { name: 'profile', label: 'Profile', icon: '👤', activeIcon: '😊' },
];

const TAB_COUNT = TABS.length;
const EASE_OUT = Easing.out(Easing.cubic);

// ─── Tab Item ─────────────────────────────────────────────────────────────────

interface TabItemProps {
    tab: (typeof TABS)[0];
    isFocused: boolean;
    onPress: () => void;
    index: number;
}

function TabItem({ tab, isFocused, onPress, index }: TabItemProps) {
    const scale = useRef(new Animated.Value(1)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const labelOpacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
    const labelY = useRef(new Animated.Value(isFocused ? 0 : 4)).current;
    const glowOpacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
    const glowScale = useRef(new Animated.Value(isFocused ? 1 : 0.6)).current;
    const iconScale = useRef(new Animated.Value(isFocused ? 1.15 : 1)).current;
    // Ripple on press
    const ripple = useRef(new Animated.Value(0)).current;
    const rippleOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isFocused) {
            // Entrance: glow expands, icon bounces up, label slides in
            Animated.parallel([
                Animated.spring(scale, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 160,
                    friction: 9,
                }),
                Animated.spring(translateY, {
                    toValue: -6,
                    useNativeDriver: true,
                    tension: 160,
                    friction: 9,
                }),
                Animated.spring(iconScale, {
                    toValue: 1.18,
                    useNativeDriver: true,
                    tension: 180,
                    friction: 8,
                }),
                Animated.spring(glowScale, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 120,
                    friction: 10,
                }),
                Animated.timing(glowOpacity, {
                    toValue: 1,
                    duration: 180,
                    easing: EASE_OUT,
                    useNativeDriver: true,
                }),
                Animated.timing(labelOpacity, {
                    toValue: 1,
                    duration: 220,
                    easing: EASE_OUT,
                    useNativeDriver: true,
                }),
                Animated.spring(labelY, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 160,
                    friction: 10,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.spring(scale, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 160,
                    friction: 9,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 160,
                    friction: 9,
                }),
                Animated.spring(iconScale, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 180,
                    friction: 8,
                }),
                Animated.spring(glowScale, {
                    toValue: 0.6,
                    useNativeDriver: true,
                    tension: 120,
                    friction: 10,
                }),
                Animated.timing(glowOpacity, {
                    toValue: 0,
                    duration: 150,
                    easing: EASE_OUT,
                    useNativeDriver: true,
                }),
                Animated.timing(labelOpacity, {
                    toValue: 0,
                    duration: 130,
                    easing: EASE_OUT,
                    useNativeDriver: true,
                }),
                Animated.spring(labelY, {
                    toValue: 4,
                    useNativeDriver: true,
                    tension: 160,
                    friction: 10,
                }),
            ]).start();
        }
    }, [isFocused]);

    const handlePress = () => {
        // Ripple burst on tap
        ripple.setValue(0);
        rippleOpacity.setValue(0.35);
        Animated.parallel([
            Animated.timing(ripple, {
                toValue: 1,
                duration: 380,
                easing: EASE_OUT,
                useNativeDriver: true,
            }),
            Animated.timing(rippleOpacity, {
                toValue: 0,
                duration: 380,
                easing: EASE_OUT,
                useNativeDriver: true,
            }),
        ]).start();
        onPress();
    };

    const rippleSize = ripple.interpolate({ inputRange: [0, 1], outputRange: [0, 60] });

    return (
        <TouchableOpacity
            style={styles.item}
            onPress={handlePress}
            activeOpacity={1}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={tab.label}
        >
            <Animated.View style={[styles.inner, { transform: [{ scale }, { translateY }] }]}>
                {/* Ripple burst */}
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.ripple,
                        {
                            opacity: rippleOpacity,
                            transform: [{ scale: ripple }],
                        },
                    ]}
                />

                {/* Soft ambient glow behind icon */}
                <Animated.View
                    style={[
                        styles.glow,
                        {
                            opacity: glowOpacity,
                            transform: [{ scale: glowScale }],
                        },
                    ]}
                />

                {/* Icon */}
                <Animated.View style={[styles.iconWrap, { transform: [{ scale: iconScale }] }]}>
                    <Text style={[styles.icon, !isFocused && styles.iconInactive]}>
                        {isFocused ? tab.activeIcon : tab.icon}
                    </Text>

                    {/* Badge */}
                    {!!tab.badge && tab.badge > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {tab.badge > 9 ? '9+' : String(tab.badge)}
                            </Text>
                        </View>
                    )}
                </Animated.View>

                {/* Label */}
                <Animated.Text
                    style={[
                        styles.label,
                        isFocused ? styles.labelActive : styles.labelInactive,
                        { opacity: labelOpacity, transform: [{ translateY: labelY }] },
                    ]}
                    numberOfLines={1}
                >
                    {tab.label}
                </Animated.Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────

export function CustomTabBar({ state, navigation }: any) {
    const [barWidth, setBarWidth] = useState(0);
    const accentX = useRef(new Animated.Value(0)).current;
    const accentW = useRef(new Animated.Value(0)).current;

    const tabWidth = barWidth > 0 ? barWidth / TAB_COUNT : 0;
    const pillW = tabWidth * 0.44;
    const centreOffset = (tabWidth - pillW) / 2;

    useEffect(() => {
        if (barWidth === 0) return;
        const toX = state.index * tabWidth + centreOffset;
        Animated.spring(accentX, {
            toValue: toX,
            useNativeDriver: true,
            tension: 200,
            friction: 18,
        }).start();
        // Width stays constant — only X slides
        accentW.setValue(pillW);
    }, [state.index, barWidth]);

    const onLayout = (e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width);

    return (
        <View style={styles.bar} onLayout={onLayout}>
            {/* Sliding indicator pill */}
            {barWidth > 0 && (
                <Animated.View
                    style={[
                        styles.indicator,
                        {
                            width: pillW,
                            transform: [{ translateX: accentX }],
                        },
                    ]}
                />
            )}

            {/* Tab row */}
            <View style={styles.row}>
                {TABS.map((tab, index) => (
                    <TabItem
                        key={tab.name}
                        tab={tab}
                        index={index}
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

const GLOW_SIZE = 52;
const RIPPLE_SIZE = 28;

const styles = StyleSheet.create({
    bar: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.055)',
        paddingTop: 10,
        paddingBottom: Platform.OS === 'ios' ? 28 : 12,
        shadowColor: '#6B4A2A',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.09,
        shadowRadius: 16,
        elevation: 20,
    },

    // Slim pill that slides under the active tab
    indicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: 3,
        borderRadius: 3,
        backgroundColor: Colors.amber,
        // subtle glow on the indicator itself
        shadowColor: Colors.amber,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
        elevation: 4,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },

    item: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        minHeight: 52,
    },

    inner: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        position: 'relative',
        paddingHorizontal: 6,
        paddingTop: 4,
    },

    // Soft circular amber glow behind active icon
    glow: {
        position: 'absolute',
        top: -2,
        alignSelf: 'center',
        width: GLOW_SIZE,
        height: GLOW_SIZE,
        borderRadius: GLOW_SIZE / 2,
        backgroundColor: Colors.amberGlow,
    },

    // Press ripple
    ripple: {
        position: 'absolute',
        alignSelf: 'center',
        width: RIPPLE_SIZE,
        height: RIPPLE_SIZE,
        borderRadius: RIPPLE_SIZE / 2,
        backgroundColor: Colors.amber,
        top: 6,
    },

    iconWrap: {
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
        opacity: 0.32,
    },

    label: {
        fontSize: 10,
        fontFamily: 'DM Sans',
        letterSpacing: 0.15,
        zIndex: 1,
        textAlign: 'center',
    },
    labelActive: {
        fontWeight: '800',
        color: Colors.amber,
    },
    labelInactive: {
        fontWeight: '600',
        color: Colors.textMuted,
    },

    badge: {
        position: 'absolute',
        top: -5,
        right: -8,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: Colors.amber,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: Colors.amber,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4,
    },
    badgeText: {
        fontSize: 8,
        fontWeight: '900',
        color: '#FFFFFF',
        lineHeight: 10,
        fontFamily: 'DM Sans',
    },
});
