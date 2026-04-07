import React, { useState, useRef, Suspense } from 'react';
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
import { Colors, Radius, Shadow } from '@theme/index';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import { useSendOtp } from '../hooks/useSendOtp';
import useAlert from '@/hooks/useAlert';
import { ApiError } from '@/types/ApiError';

// ─── Dev Mode Config ──────────────────────────────────────────────────────────
const DEV_MODE = __DEV__; // flip to false to hide in production

const DEV_ACCOUNTS = {
    customer: { label: 'Customer', phone: '9876543210' },
    restaurants: [
        { label: 'Sehore Highway Treat', phone: '8800000001' },
        { label: 'Midway Delite Ashta', phone: '8800000002' },
        { label: 'Dewas Restaurant & Sweets', phone: '8800000003' },
        { label: 'Obaidullaganj Quick Bites', phone: '8800000004' },
        { label: 'Highway Grill & Bar-B-Q', phone: '8800000005' },
        { label: 'Indore Sarafa Sweets', phone: '8800000006' },
    ],
};
// ─────────────────────────────────────────────────────────────────────────────

type loginProps = NativeStackScreenProps<RootStackParamList, 'login'>;

export default function LoginScreen({ navigation }: loginProps) {    
    const alert = useAlert();
    const [phone, setPhone] = useState('');
    const [focused, setFocused] = useState(false);
    const [loading, setLoading] = useState(false);
    const [devOpen, setDevOpen] = useState(false);
    const {mutate:sendOtp} = useSendOtp();

    const shakeAnim = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    const isValid = phone.length === 10;

    const handleSendOTP = () => {
        if (!isValid) {
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
            ]).start();
            return;
        }

        Animated.sequence([
            Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
            Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start();

        setLoading(true);
        sendOtp(
            {phone},
            {
                onSuccess:(data)=>{
                    setLoading(false);
                    alert.success('Otp Sent', data?.message || 'Otp sent successfully');
                    console.log('Founded data : ', data);
                    navigation.navigate('otpLogin',{
                        phone: data?.data?.phone,
                        otp: data?.data?.devOtp
                    })
                },
                onError: (error:ApiError) =>{
                    setLoading(false)
                    alert.error('Failed', error?.message || 'Somthing went wrong')
                }
            }
        )
    };

    const fillPhone = (p: string) => {
        setPhone(p);
        setDevOpen(false);
    };

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* ── Dev Panel ── */}
                {DEV_MODE && (
                    <View style={styles.devPanel}>
                        <TouchableOpacity
                            style={styles.devHeader}
                            onPress={() => setDevOpen(o => !o)}
                            activeOpacity={0.75}
                        >
                            <Text style={styles.devHeaderText}>🛠 Dev Mode — Click to fill</Text>
                            <Text style={styles.devChevron}>{devOpen ? '▲' : '▼'}</Text>
                        </TouchableOpacity>

                        {devOpen && (
                            <View style={styles.devBody}>
                                {/* Customer pill */}
                                <View style={styles.devRow}>
                                    <TouchableOpacity
                                        style={[styles.devPill, styles.devPillCustomer]}
                                        onPress={() => fillPhone(DEV_ACCOUNTS.customer.phone)}
                                    >
                                        <Text style={styles.devPillCustomerText}>
                                            {DEV_ACCOUNTS.customer.label}
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={styles.devPhone}>
                                        {DEV_ACCOUNTS.customer.phone}
                                    </Text>
                                </View>

                                {/* Divider */}
                                <View style={styles.devSectionLabel}>
                                    <Text style={styles.devSectionLabelText}>
                                        🏪 RESTAURANT OWNERS
                                    </Text>
                                </View>

                                {/* Restaurant pills */}
                                {DEV_ACCOUNTS.restaurants.map(r => (
                                    <TouchableOpacity
                                        key={r.phone}
                                        style={styles.devRestaurantRow}
                                        onPress={() => fillPhone(r.phone)}
                                        activeOpacity={0.65}
                                    >
                                        <Text style={styles.devRestaurantLabel} numberOfLines={1}>
                                            {r.label}
                                        </Text>
                                        <Text style={styles.devPhone}>{r.phone}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                )}

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
                        <TouchableOpacity style={styles.countryCode}>
                            <Text style={styles.flag}>🇮🇳</Text>
                            <Text style={styles.dialCode}>+91</Text>
                            <Text style={styles.chevron}>›</Text>
                        </TouchableOpacity>
                        <View style={styles.inputDivider} />
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

    // ── Dev Panel ──────────────────────────────────────────────────────────────
    devPanel: {
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: '#C7D9FF',
        backgroundColor: '#EEF4FF',
        marginBottom: 16,
        overflow: 'hidden',
    },
    devHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    devHeaderText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#2563EB',
        letterSpacing: 0.1,
    },
    devChevron: {
        fontSize: 10,
        color: '#2563EB',
        fontWeight: '700',
    },
    devBody: {
        paddingHorizontal: 14,
        paddingBottom: 12,
        borderTopWidth: 1,
        borderTopColor: '#C7D9FF',
        gap: 6,
    },
    devRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    devPill: {
        borderRadius: 99,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    devPillCustomer: {
        backgroundColor: '#22C55E',
    },
    devPillCustomerText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
    devPhone: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
        fontVariant: ['tabular-nums'],
        letterSpacing: 0.3,
    },
    devSectionLabel: {
        marginTop: 6,
        marginBottom: 2,
    },
    devSectionLabelText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#64748B',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    devRestaurantRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#DBEAFE',
    },
    devRestaurantLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1E40AF',
        flex: 1,
        marginRight: 12,
    },
    // ──────────────────────────────────────────────────────────────────────────

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
        marginTop: 12,
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
    dialCode: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
    chevron: { fontSize: 16, color: Colors.textMuted, fontWeight: '600' },
    inputDivider: { width: 1, height: 28, backgroundColor: Colors.border },
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

    terms: {
        fontSize: 12,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 20,
    },
    termsLink: { color: Colors.amber, fontWeight: '600' },

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
    sendBtnArrow: { fontSize: 18, color: '#FFFFFF', fontWeight: '700' },

    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginVertical: 20,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
    dividerText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },

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
    socialText: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
});
