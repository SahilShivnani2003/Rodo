// OTPScreen.tsx — Rodo
// 6-digit OTP verification with auto-focus and resend timer

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Platform,
    Animated,
    KeyboardAvoidingView,
} from 'react-native';
import { Colors, Radius, Shadow } from '../../theme/index';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

const OTP_LENGTH = 6;

type otpProps = NativeStackScreenProps<RootStackParamList, 'otpLogin'>

export default function OTPScreen({ navigation, route }: otpProps) {
    const phone = route?.params?.phone || '98765 43210';
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const successScale = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    // Timer countdown
    useEffect(() => {
        if (timer === 0) {
            setCanResend(true);
            return;
        }
        const t = setInterval(() => setTimer(p => p - 1), 1000);
        return () => clearInterval(t);
    }, [timer]);

    const handleChange = (val: string, idx: number) => {
        const digit = val.replace(/\D/g, '').slice(-1);
        const next = [...otp];
        next[idx] = digit;
        setOtp(next);
        setError('');

        if (digit && idx < OTP_LENGTH - 1) {
            inputRefs.current[idx + 1]?.focus();
        }
        if (!digit && idx > 0) {
            inputRefs.current[idx - 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, idx: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
            inputRefs.current[idx - 1]?.focus();
        }
    };

    const handleVerify = () => {
        const code = otp.join('');
        if (code.length < OTP_LENGTH) {
            setError('Please enter all 6 digits');
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
            ]).start();
            return;
        }

        Animated.sequence([
            Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
            Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start();

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            // Navigate to success then home
            navigation.navigate('loginSuccess');
        }, 1000);
    };

    const handleResend = () => {
        if (!canResend) return;
        setTimer(30);
        setCanResend(false);
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
    };

    const filled = otp.filter(Boolean).length;

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

            {/* Back */}
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
                <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>

            <View style={styles.content}>
                {/* Icon */}
                <View style={styles.iconWrap}>
                    <View style={styles.iconBg}>
                        <Text style={styles.iconEmoji}>📱</Text>
                    </View>
                    {/* Progress ring around icon */}
                    <View style={styles.progressRing} />
                </View>

                {/* Title */}
                <Text style={styles.title}>Verify Your{'\n'}Number</Text>
                <Text style={styles.subtitle}>
                    We sent a 6-digit OTP to{'\n'}
                    <Text style={styles.phoneHighlight}>+91 {phone}</Text>{' '}
                    <TouchableOpacity onPress={() => navigation?.goBack?.()}>
                        <Text style={styles.editLink}>Edit</Text>
                    </TouchableOpacity>
                </Text>

                {/* OTP inputs */}
                <Animated.View style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}>
                    {otp.map((digit, i) => (
                        <View
                            key={i}
                            style={[
                                styles.otpBox,
                                digit && styles.otpBoxFilled,
                                i === filled && styles.otpBoxActive,
                            ]}
                        >
                            <TextInput
                                ref={r => {
                                    inputRefs.current[i] = r;
                                }}
                                style={styles.otpInput}
                                value={digit}
                                onChangeText={v => handleChange(v, i)}
                                onKeyPress={e => handleKeyPress(e, i)}
                                keyboardType="number-pad"
                                maxLength={1}
                                textContentType="oneTimeCode"
                                autoComplete="sms-otp"
                                selectTextOnFocus
                            />
                            {/* Active cursor */}
                            {i === filled && !digit && <View style={styles.cursor} />}
                        </View>
                    ))}
                </Animated.View>

                {/* Error */}
                {error ? (
                    <View style={styles.errorWrap}>
                        <Text style={styles.errorText}>⚠️ {error}</Text>
                    </View>
                ) : null}

                {/* Progress indicator */}
                <View style={styles.progressBar}>
                    <View
                        style={[styles.progressFill, { width: `${(filled / OTP_LENGTH) * 100}%` }]}
                    />
                </View>
                <Text style={styles.progressText}>
                    {filled}/{OTP_LENGTH} digits entered
                </Text>

                {/* Resend */}
                <View style={styles.resendRow}>
                    <Text style={styles.resendLabel}>Didn't receive OTP?</Text>
                    {canResend ? (
                        <TouchableOpacity onPress={handleResend}>
                            <Text style={styles.resendBtn}>Resend OTP</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.resendTimer}>
                            Resend in{' '}
                            <Text style={styles.timerNum}>0:{String(timer).padStart(2, '0')}</Text>
                        </Text>
                    )}
                </View>

                {/* Verify button */}
                <Animated.View style={[styles.verifyWrap, { transform: [{ scale: buttonScale }] }]}>
                    <TouchableOpacity
                        style={[styles.verifyBtn, filled < OTP_LENGTH && styles.verifyBtnDisabled]}
                        onPress={handleVerify}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <Text style={styles.verifyBtnText}>Verifying…</Text>
                        ) : (
                            <>
                                <Text style={styles.verifyBtnText}>Verify & Continue</Text>
                                <Text style={styles.verifyArrow}>→</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </Animated.View>

                {/* Security note */}
                <View style={styles.securityNote}>
                    <Text style={styles.securityIcon}>🔒</Text>
                    <Text style={styles.securityText}>Your OTP is valid for 10 minutes</Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },
    backBtn: {
        marginTop: Platform.OS === 'android' ? 44 : 56,
        marginLeft: 24,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: Colors.bgCard,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadow.card,
    },
    backIcon: { fontSize: 18, color: Colors.textPrimary, fontWeight: '700' },

    content: {
        flex: 1,
        paddingHorizontal: 28,
        paddingTop: 28,
        alignItems: 'center',
    },

    // Icon
    iconWrap: {
        position: 'relative',
        marginBottom: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBg: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: Colors.amberGlow,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: Colors.borderActive,
    },
    iconEmoji: { fontSize: 36 },
    progressRing: {
        position: 'absolute',
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 2,
        borderColor: Colors.borderActive,
        borderTopColor: Colors.amber,
    },

    title: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.textPrimary,
        letterSpacing: -1,
        textAlign: 'center',
        lineHeight: 38,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 36,
    },
    phoneHighlight: {
        color: Colors.textPrimary,
        fontWeight: '700',
    },
    editLink: {
        color: Colors.amber,
        fontWeight: '700',
        fontSize: 14,
    },

    // OTP boxes
    otpRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    otpBox: {
        width: 46,
        height: 56,
        borderRadius: Radius.md,
        backgroundColor: Colors.bgCard,
        borderWidth: 1.5,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        ...Shadow.card,
    },
    otpBoxFilled: {
        borderColor: Colors.amber,
        backgroundColor: '#FFFAF6',
    },
    otpBoxActive: {
        borderColor: Colors.amber,
        borderWidth: 2,
        backgroundColor: '#FFFAF6',
    },
    otpInput: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.textPrimary,
        textAlign: 'center',
        width: '100%',
        height: '100%',
    },
    cursor: {
        position: 'absolute',
        bottom: 10,
        width: 20,
        height: 2.5,
        borderRadius: 2,
        backgroundColor: Colors.amber,
    },

    // Error
    errorWrap: {
        backgroundColor: '#FEE2E2',
        borderRadius: Radius.sm,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    errorText: { fontSize: 12, color: '#DC2626', fontWeight: '600' },

    // Progress
    progressBar: {
        width: '100%',
        height: 3,
        backgroundColor: Colors.bgElevated,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 6,
        marginTop: 4,
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.amber,
        borderRadius: 2,
    },
    progressText: {
        fontSize: 11,
        color: Colors.textMuted,
        fontWeight: '500',
        marginBottom: 24,
    },

    // Resend
    resendRow: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
        marginBottom: 28,
    },
    resendLabel: { fontSize: 13, color: Colors.textSecondary },
    resendBtn: { fontSize: 13, color: Colors.amber, fontWeight: '700' },
    resendTimer: { fontSize: 13, color: Colors.textSecondary },
    timerNum: { fontWeight: '700', color: Colors.textPrimary },

    // Verify button
    verifyWrap: { width: '100%', marginBottom: 16 },
    verifyBtn: {
        backgroundColor: Colors.amber,
        borderRadius: Radius.md,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...Shadow.amber,
    },
    verifyBtnDisabled: {
        backgroundColor: Colors.textMuted,
        shadowOpacity: 0,
        elevation: 0,
    },
    verifyBtnText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.2,
    },
    verifyArrow: { fontSize: 18, color: '#FFFFFF', fontWeight: '700' },

    // Security
    securityNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.full,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    securityIcon: { fontSize: 13 },
    securityText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
});
