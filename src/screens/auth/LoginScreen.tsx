import React, { useState, useRef } from 'react';
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
    ScrollView,
    Dimensions,
} from 'react-native';
import { Colors, Radius, Shadow } from '../../theme/index';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';


type loginProps = NativeStackScreenProps<RootStackParamList, 'login'>;

export default function LoginScreen({ navigation }: loginProps) {
    const [phone, setPhone] = useState('');
    const [focused, setFocused] = useState(false);
    const [loading, setLoading] = useState(false);

    const shakeAnim = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    const isValid = phone.length === 10;

    const handleSendOTP = () => {
        if (!isValid) {
            // Shake animation
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
            ]).start();
            return;
        }

        // Button press animation
        Animated.sequence([
            Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
            Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start();

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigation.navigate('otpLogin', {phone});
        }, 800);
    };

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Top illustration */}
                <View style={styles.heroWrap}>
                    <View style={styles.heroBg}>
                        <View style={styles.heroBgCircle1} />
                        <View style={styles.heroBgCircle2} />
                        <View style={styles.heroCard}>
                            <Text style={styles.heroCardEmoji}>🛣️</Text>
                        </View>
                    </View>
                </View>

                {/* Header text */}
                <View style={styles.headerText}>
                    <Text style={styles.title}>Welcome to{'\n'}Rodo 👋</Text>
                    <Text style={styles.subtitle}>
                        Enter your mobile number to get started. We'll send you an OTP to verify.
                    </Text>
                </View>

                {/* Phone input card */}
                <Animated.View
                    style={[styles.inputCard, { transform: [{ translateX: shakeAnim }] }]}
                >
                    <Text style={styles.inputLabel}>Mobile Number</Text>
                    <View style={[styles.inputRow, focused && styles.inputRowFocused]}>
                        {/* Country code */}
                        <TouchableOpacity style={styles.countryCode}>
                            <Text style={styles.flag}>🇮🇳</Text>
                            <Text style={styles.dialCode}>+91</Text>
                            <Text style={styles.chevron}>›</Text>
                        </TouchableOpacity>
                        <View style={styles.inputDivider} />
                        {/* Number input */}
                        <TextInput
                            style={styles.phoneInput}
                            value={phone}
                            onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                            keyboardType="number-pad"
                            placeholder="98765 43210"
                            placeholderTextColor={Colors.textMuted}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            maxLength={10}
                        />
                        {/* Clear */}
                        {phone.length > 0 && (
                            <TouchableOpacity style={styles.clearBtn} onPress={() => setPhone('')}>
                                <Text style={styles.clearIcon}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text style={styles.inputHint}>
                        {phone.length > 0
                            ? `${phone.length}/10 digits`
                            : 'We never share your number'}
                    </Text>
                </Animated.View>

                {/* Terms */}
                <Text style={styles.terms}>
                    By continuing, you agree to our{' '}
                    <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>

                {/* CTA */}
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <TouchableOpacity
                        style={[styles.sendBtn, !isValid && styles.sendBtnDisabled]}
                        onPress={handleSendOTP}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <Text style={styles.sendBtnText}>Sending OTP…</Text>
                        ) : (
                            <>
                                <Text style={styles.sendBtnText}>Send OTP</Text>
                                <Text style={styles.sendBtnArrow}>→</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </Animated.View>

                {/* Divider */}
                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or continue with</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Social login */}
                <View style={styles.socialRow}>
                    <TouchableOpacity style={styles.socialBtn}>
                        <Text style={styles.socialEmoji}>🔵</Text>
                        <Text style={styles.socialText}>Google</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? 24 : 60,
    },

    backBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: Colors.bgCard,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        ...Shadow.card,
    },
    backIcon: { fontSize: 18, color: Colors.textPrimary, fontWeight: '700' },

    // Hero
    heroWrap: { alignItems: 'center', marginBottom: 32 },
    heroBg: {
        width: '100%',
        height: 160,
        borderRadius: Radius.lg,
        backgroundColor: Colors.amberGlow,
        borderWidth: 1,
        borderColor: Colors.borderActive,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        marginTop: 52
    },
    heroBgCircle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(232,106,26,0.07)',
        top: -60,
        right: -40,
    },
    heroBgCircle2: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(232,106,26,0.07)',
        bottom: -50,
        left: -30,
    },
    heroCard: {
        width: 88,
        height: 88,
        borderRadius: 26,
        backgroundColor: Colors.amber,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadow.amber,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    heroCardEmoji: { fontSize: 42 },

    // Header text
    headerText: { marginBottom: 28 },
    title: {
        fontSize: 34,
        fontWeight: '900',
        color: Colors.textPrimary,
        letterSpacing: -1,
        lineHeight: 40,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 15,
        color: Colors.textSecondary,
        lineHeight: 22,
    },

    // Input card
    inputCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.card,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 10,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.bgInput,
        borderRadius: Radius.md,
        borderWidth: 1.5,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    inputRowFocused: {
        borderColor: Colors.amber,
        backgroundColor: '#FFFAF6',
    },
    countryCode: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
    flag: { fontSize: 18 },
    dialCode: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    chevron: {
        fontSize: 16,
        color: Colors.textMuted,
        fontWeight: '600',
    },
    inputDivider: {
        width: 1,
        height: 28,
        backgroundColor: Colors.border,
    },
    phoneInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: Colors.textPrimary,
        paddingHorizontal: 14,
        paddingVertical: 14,
        letterSpacing: 1,
    },
    clearBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    clearIcon: { fontSize: 10, color: Colors.textSecondary, fontWeight: '700' },
    inputHint: {
        fontSize: 11,
        color: Colors.textMuted,
        marginTop: 8,
        fontWeight: '500',
    },

    // Terms
    terms: {
        fontSize: 12,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 20,
    },
    termsLink: {
        color: Colors.amber,
        fontWeight: '600',
    },

    // Send button
    sendBtn: {
        backgroundColor: Colors.amber,
        borderRadius: Radius.md,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...Shadow.amber,
    },
    sendBtnDisabled: {
        backgroundColor: Colors.textMuted,
        shadowOpacity: 0,
        elevation: 0,
    },
    sendBtnText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.2,
    },
    sendBtnArrow: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: '700',
    },

    // Divider
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginVertical: 20,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
    dividerText: {
        fontSize: 12,
        color: Colors.textMuted,
        fontWeight: '500',
    },

    // Social
    socialRow: { flexDirection: 'row', justifyContent: 'center' },
    socialBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.md,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.card,
    },
    socialEmoji: { fontSize: 20 },
    socialText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
});
