import { AlertType, CustomAlertProps, IconStyle } from '@/types/Alert';
import React, { useRef, useEffect } from 'react';
import { Animated, Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Colors, Radius, Shadow } from '@/theme';

//Alert Type Config
const TYPE_CONFIG: Record<AlertType, IconStyle> = {
    success: {
        icon: 'checkmark-circle',
        iconColor: Colors.vegGreen,
        iconBg: '#DCFCE7',               // no theme token — success light bg
        accentColor: Colors.vegGreen,
    },
    error: {
        icon: 'close-circle',
        iconColor: Colors.brandRed,
        iconBg: '#FEE2E2',               // no theme token — error light bg
        accentColor: Colors.brandRed,
    },
    warning: {
        icon: 'warning',
        iconColor: Colors.amber,
        iconBg: Colors.bgElevated,
        accentColor: Colors.amber,
    },
    info: {
        icon: 'information-circle',
        iconColor: Colors.amberLight,
        iconBg: Colors.bgInput,
        accentColor: Colors.amberLight,
    },
    confirm: {
        icon: 'help-circle',
        iconColor: Colors.textPrimary,
        iconBg: Colors.bg,
        accentColor: Colors.textPrimary,
    },
};

const BUTTON_STYLES: Record<string, object> = {
    primary: {
        bg: Colors.amber,
        text: Colors.textOnAmber,
        border: 'transparent',
        shadow: Colors.amber,
    },
    secondary: {
        bg: Colors.textPrimary,
        text: Colors.bgCard,
        border: 'transparent',
        shadow: Colors.textPrimary,
    },
    danger: {
        bg: '#FEE2E2',                   // no theme token — danger light bg
        text: Colors.brandRed,
        border: '#FECACA',               // no theme token — danger border
        shadow: 'transparent',
    },
    ghost: {
        bg: Colors.bg,
        text: Colors.textMuted,
        border: Colors.border,
        shadow: 'transparent',
    },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function CustomAlert({
    visible,
    type = 'info',
    title,
    message,
    buttons = [{ label: 'OK', onPress: () => {}, style: 'primary' }],
    onDismiss,
    dismissable = true,
}: CustomAlertProps) {
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const cardScale = useRef(new Animated.Value(0.82)).current;
    const cardOpacity = useRef(new Animated.Value(0)).current;
    const cardY = useRef(new Animated.Value(24)).current;
    const iconScale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Backdrop in
            Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: 220,
                useNativeDriver: true,
            }).start();
            // Card spring in
            Animated.parallel([
                Animated.spring(cardScale, {
                    toValue: 1,
                    useNativeDriver: true,
                    speed: 20,
                    bounciness: 10,
                }),
                Animated.timing(cardOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.spring(cardY, {
                    toValue: 0,
                    useNativeDriver: true,
                    speed: 20,
                    bounciness: 8,
                }),
            ]).start();
            // Icon pop in with delay
            Animated.sequence([
                Animated.delay(120),
                Animated.spring(iconScale, {
                    toValue: 1,
                    useNativeDriver: true,
                    speed: 18,
                    bounciness: 16,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.timing(cardOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
                Animated.timing(cardScale, { toValue: 0.9, duration: 150, useNativeDriver: true }),
            ]).start(() => {
                cardScale.setValue(0.82);
                cardY.setValue(24);
                iconScale.setValue(0);
            });
        }
    }, [visible]);

    const cfg = TYPE_CONFIG[type];

    return (
        <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
            {/* ── Backdrop ── */}
            <Animated.View
                style={[styles.backdrop, { opacity: backdropOpacity }]}
                onTouchEnd={dismissable ? onDismiss : undefined}
            />

            {/* ── Card ── */}
            <View style={styles.centerer} pointerEvents="box-none">
                <Animated.View
                    style={[
                        styles.card,
                        {
                            opacity: cardOpacity,
                            transform: [{ scale: cardScale }, { translateY: cardY }],
                        },
                    ]}
                >
                    {/* Top accent bar */}
                    <View style={[styles.topAccent, { backgroundColor: cfg.accentColor }]} />

                    {/* Icon */}
                    <Animated.View
                        style={[
                            styles.iconWrap,
                            { backgroundColor: cfg.iconBg, transform: [{ scale: iconScale }] },
                        ]}
                    >
                        <Ionicons name={cfg.icon as any} size={34} color={cfg.iconColor} />
                    </Animated.View>

                    {/* Text */}
                    <Text style={styles.title}>{title}</Text>
                    {message ? <Text style={styles.message}>{message}</Text> : null}

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Buttons */}
                    <View style={[styles.buttonsRow, buttons.length === 1 && styles.buttonsSingle]}>
                        {buttons.map((btn, i) => {
                            const bStyle = BUTTON_STYLES[btn.style ?? 'primary'] as any;
                            return (
                                <TouchableOpacity
                                    key={i}
                                    style={[
                                        styles.btn,
                                        buttons.length === 1 && styles.btnFull,
                                        {
                                            backgroundColor: bStyle.bg,
                                            borderColor: bStyle.border,
                                            borderWidth: bStyle.border !== 'transparent' ? 1.5 : 0,
                                            shadowColor: bStyle.shadow,
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity:
                                                bStyle.shadow !== 'transparent' ? 0.3 : 0,
                                            shadowRadius: 8,
                                            elevation: bStyle.shadow !== 'transparent' ? 4 : 0,
                                        },
                                    ]}
                                    onPress={btn.onPress}
                                    activeOpacity={0.82}
                                >
                                    <Text style={[styles.btnText, { color: bStyle.text }]}>
                                        {btn.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(38, 27, 15, 0.55)',  // Colors.textPrimary at 55% opacity
    },
    centerer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    card: {
        width: '100%',
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.xl,
        alignItems: 'center',
        paddingBottom: 24,
        overflow: 'hidden',
        ...Shadow.card,
    },
    topAccent: {
        width: '100%',
        height: 5,
        marginBottom: 28,
    },
    iconWrap: {
        width: 72,
        height: 72,
        borderRadius: Radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
    },
    title: {
        fontSize: 19,
        fontWeight: '800',
        color: Colors.textPrimary,
        textAlign: 'center',
        letterSpacing: -0.3,
        paddingHorizontal: 24,
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 21,
        paddingHorizontal: 24,
        fontWeight: '400',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: Colors.bg,
        marginTop: 24,
        marginBottom: 20,
    },
    buttonsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 10,
        width: '100%',
    },
    buttonsSingle: {
        justifyContent: 'center',
    },
    btn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: Radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnFull: {
        flex: 1,
    },
    btnText: {
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.2,
    },
});