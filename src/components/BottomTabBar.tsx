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
import { Colors } from '../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ITabItem } from '@/types/TabItems';

// ─── Constants ────────────────────────────────────────────────────────────────

const EASE_OUT = Easing.out(Easing.cubic);
const ICON_SIZE = 24;
const GLOW_SIZE = 52;
const RIPPLE_SIZE = 28;

// ─── Vector Icon Helper ───────────────────────────────────────────────────────

interface VectorIconProps {
    family: 'MaterialCommunityIcons' | 'Ionicons';
    name: string;
    size?: number;
    color?: string;
}

function VectorIcon({ family, name, size = ICON_SIZE, color }: VectorIconProps) {
    if (family === 'Ionicons') {
        return <Ionicons name={name as any} size={size} color={color} />;
    }
    return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
}

// ─── Tab Item ─────────────────────────────────────────────────────────────────

interface TabItemProps {
    tab: ITabItem;
    isFocused: boolean;
    onPress: () => void;
    index: number;
}

function TabItem({ tab, isFocused, onPress }: TabItemProps) {
    const translateY     = useRef(new Animated.Value(isFocused ? -6 : 0)).current;
    const labelOpacity   = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
    const labelY         = useRef(new Animated.Value(isFocused ? 0 : 4)).current;
    const glowOpacity    = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
    const glowScale      = useRef(new Animated.Value(isFocused ? 1 : 0.6)).current;
    const iconScale      = useRef(new Animated.Value(isFocused ? 1.18 : 1)).current;
    const iconOpacity    = useRef(new Animated.Value(isFocused ? 1 : 0.35)).current;

    // Ripple on press
    const ripple        = useRef(new Animated.Value(0)).current;
    const rippleOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const focused = isFocused;
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: focused ? -6 : 0,
                useNativeDriver: true,
                tension: 160,
                friction: 9,
            }),
            Animated.spring(iconScale, {
                toValue: focused ? 1.18 : 1,
                useNativeDriver: true,
                tension: 180,
                friction: 8,
            }),
            Animated.timing(iconOpacity, {
                toValue: focused ? 1 : 0.35,
                duration: 180,
                easing: EASE_OUT,
                useNativeDriver: true,
            }),
            Animated.spring(glowScale, {
                toValue: focused ? 1 : 0.6,
                useNativeDriver: true,
                tension: 120,
                friction: 10,
            }),
            Animated.timing(glowOpacity, {
                toValue: focused ? 1 : 0,
                duration: focused ? 180 : 150,
                easing: EASE_OUT,
                useNativeDriver: true,
            }),
            Animated.timing(labelOpacity, {
                toValue: focused ? 1 : 0,
                duration: focused ? 220 : 130,
                easing: EASE_OUT,
                useNativeDriver: true,
            }),
            Animated.spring(labelY, {
                toValue: focused ? 0 : 4,
                useNativeDriver: true,
                tension: 160,
                friction: 10,
            }),
        ]).start();
    }, [isFocused]);

    const handlePress = () => {
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
            <Animated.View style={[styles.inner, { transform: [{ translateY }] }]}>
                {/* Ripple burst */}
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.ripple,
                        { opacity: rippleOpacity, transform: [{ scale: rippleSize }] },
                    ]}
                />

                {/* Soft ambient glow behind icon */}
                <Animated.View
                    style={[
                        styles.glow,
                        { opacity: glowOpacity, transform: [{ scale: glowScale }] },
                    ]}
                />

                {/* Icon */}
                <Animated.View
                    style={[
                        styles.iconWrap,
                        { transform: [{ scale: iconScale }], opacity: iconOpacity },
                    ]}
                >
                    <VectorIcon
                        family={tab.iconFamily}
                        name={isFocused ? tab.activeIcon : tab.icon}
                        size={ICON_SIZE}
                        color={isFocused ? Colors.amber : Colors.textMuted}
                    />

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

interface CustomTabBarProps {
    state: any;
    navigation: any;
    /** Pass USER_TABS or OWNER_TABS from TabNavigator */
    tabs: ITabItem[];
}

export function CustomTabBar({ state, navigation, tabs }: CustomTabBarProps) {
    const [barWidth, setBarWidth] = useState(0);
    const accentX = useRef(new Animated.Value(0)).current;
    const accentW = useRef(new Animated.Value(0)).current;

    const TAB_COUNT  = tabs.length;
    const tabWidth   = barWidth > 0 ? barWidth / TAB_COUNT : 0;
    const pillW      = tabWidth * 0.44;
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
                        { width: pillW, transform: [{ translateX: accentX }] },
                    ]}
                />
            )}

            {/* Tab row */}
            <View style={styles.row}>
                {tabs.map((tab, index) => (
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

    indicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: 3,
        borderRadius: 3,
        backgroundColor: Colors.amber,
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

    glow: {
        position: 'absolute',
        top: -2,
        alignSelf: 'center',
        width: GLOW_SIZE,
        height: GLOW_SIZE,
        borderRadius: GLOW_SIZE / 2,
        backgroundColor: Colors.amberGlow,
    },

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