import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Platform,
    Animated,
    KeyboardAvoidingView,
    ScrollView,
    Image,
} from 'react-native';
import { Colors, Radius, Shadow } from '@theme/index';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import useAlert from '@/hooks/useAlert';
import { useCustomerLogin } from '../hooks/useCustomerAuth';
import { useRestaurantLogin } from '../hooks/useRestaurantAuth';
import { ApiError } from '@/types/ApiError';
import { useAuthStore } from '@/store/useAuthStore';
import { useOwnerRestaurant } from '@/features/dashboard/hooks/useOwnerRestaurant';

// ─── Role Types ───────────────────────────────────────────────────────────────
type Role = 'customer' | 'restaurant';

type Props = NativeStackScreenProps<RootStackParamList, 'login'>;

export default function LoginWithPasswordScreen({ navigation }: Props) {
    const alert = useAlert();
    const { setAuth } = useAuthStore();
    // Form state
    const [role, setRole] = useState<Role>('customer');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const { mutate: customerLogin } = useCustomerLogin();
    const { mutate: restaurantLogin } = useRestaurantLogin();

    // UI state
    const [phoneFocused, setPhoneFocused] = useState(false);
    const [passFocused, setPassFocused] = useState(false);

    // Animations
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;
    const roleSlide = useRef(new Animated.Value(0)).current; // 0 = customer, 1 = restaurant

    const isValid = phone.length === 10 && password.length >= 4;

    // ── Role switch ────────────────────────────────────────────────────────────
    const switchRole = (r: Role) => {
        setRole(r);
        setPhone('');
        setPassword('');
        Animated.spring(roleSlide, {
            toValue: r === 'customer' ? 0 : 1,
            useNativeDriver: false,
            tension: 180,
            friction: 22,
        }).start();
    };

    // ── Shake animation ────────────────────────────────────────────────────────
    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 7, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -7, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
        ]).start();
    };

    // ── Static login logic (replace with API) ─────────────────────────────────
    const handleLogin = () => {
        if (!isValid) {
            triggerShake();
            return;
        }

        Animated.sequence([
            Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
            Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start();

        setLoading(true);

        const data = {
            phone: phone,
            password: password,
        };

        if (role === 'customer') {
            customerLogin(data, {
                onSuccess: data => {
                    setLoading(false);
                    setAuth(data?.data?.user, data?.data?.token);
                    alert.success('Success', 'Login successfull');
                    navigation.replace('loginSuccess');
                },
                onError: (error: ApiError) => {
                    setLoading(false);
                    alert.error('Login failed', error.message || 'Something went wrong');
                },
            });
        } else if (role === 'restaurant') {
            restaurantLogin(data, {
                onSuccess: data => {
                    setLoading(false);
                    setAuth(data?.data?.user, data?.data?.token);
                    navigation.replace('loginSuccess');
                },
                onError: (error: ApiError) => {
                    setLoading(false);
                    alert.error('Login failed', error.message || 'Something went wrong');
                },
            });
        }
    };

    const handleGooglePress = () => {
        alert.info('Comming soon', 'Google login feature comming soon.');
    };

    // ── Role pill background (animated) ───────────────────────────────────────
    const pillLeft = roleSlide.interpolate({
        inputRange: [0, 1],
        outputRange: ['2%', '51%'],
    });

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
                {/* ── Hero ──────────────────────────────────────────────────── */}
                <View style={styles.heroWrap}>
                    <View style={styles.heroBg}>
                        <View style={styles.heroBgCircle1} />
                        <View style={styles.heroBgCircle2} />
                        <View style={styles.heroCard}>
                            <Image
                                source={require('@assets/logo.jpeg')}
                                style={styles.heroImage}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                </View>

                {/* ── Header ────────────────────────────────────────────────── */}
                <View style={styles.headerText}>
                    <Text style={styles.title}>
                        {role === 'customer' ? 'Welcome back 👋' : 'Restaurant Portal 🏪'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {role === 'customer'
                            ? 'Sign in to order your favourite food.'
                            : 'Manage your menu, orders & earnings.'}
                    </Text>
                </View>

                {/* ── Role Toggle ───────────────────────────────────────────── */}
                <View style={styles.roleTrack}>
                    {/* Animated sliding pill */}
                    <Animated.View style={[styles.rolePill, { left: pillLeft }]} />

                    <TouchableOpacity
                        style={styles.roleOption}
                        onPress={() => switchRole('customer')}
                        activeOpacity={0.75}
                    >
                        <Text
                            style={[styles.roleText, role === 'customer' && styles.roleTextActive]}
                        >
                            👤 Customer
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.roleOption}
                        onPress={() => switchRole('restaurant')}
                        activeOpacity={0.75}
                    >
                        <Text
                            style={[
                                styles.roleText,
                                role === 'restaurant' && styles.roleTextActive,
                            ]}
                        >
                            🏪 Restaurant
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ── Form Card ─────────────────────────────────────────────── */}
                <Animated.View
                    style={[styles.formCard, { transform: [{ translateX: shakeAnim }] }]}
                >
                    {/* Phone */}
                    <Text style={styles.inputLabel}>Mobile Number</Text>
                    <View style={[styles.inputRow, phoneFocused && styles.inputRowFocused]}>
                        <View style={styles.countryCode}>
                            <Text style={styles.flag}>🇮🇳</Text>
                            <Text style={styles.dialCode}>+91</Text>
                        </View>
                        <View style={styles.inputDivider} />
                        <TextInput
                            style={styles.textInput}
                            value={phone}
                            onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                            keyboardType="number-pad"
                            placeholder="98765 43210"
                            placeholderTextColor={Colors.textMuted}
                            onFocus={() => setPhoneFocused(true)}
                            onBlur={() => setPhoneFocused(false)}
                            maxLength={10}
                        />
                        {phone.length > 0 && (
                            <TouchableOpacity style={styles.clearBtn} onPress={() => setPhone('')}>
                                <Text style={styles.clearIcon}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.fieldGap} />

                    {/* Password */}
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={[styles.inputRow, passFocused && styles.inputRowFocused]}>
                        <View style={styles.iconWrap}>
                            <Text style={styles.inputIcon}>🔒</Text>
                        </View>
                        <View style={styles.inputDivider} />
                        <TextInput
                            style={styles.textInput}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPass}
                            placeholder="Enter password"
                            placeholderTextColor={Colors.textMuted}
                            onFocus={() => setPassFocused(true)}
                            onBlur={() => setPassFocused(false)}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={styles.clearBtn}
                            onPress={() => setShowPass(v => !v)}
                        >
                            <Text style={styles.clearIcon}>{showPass ? '🙈' : '👁'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Forgot password */}
                    <TouchableOpacity style={styles.forgotWrap} activeOpacity={0.7}>
                        <Text style={styles.forgotText}>Forgot password?</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* ── Terms ─────────────────────────────────────────────────── */}
                <Text style={styles.terms}>
                    By continuing, you agree to our{' '}
                    <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>

                {/* ── CTA ───────────────────────────────────────────────────── */}
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <TouchableOpacity
                        style={[styles.loginBtn, !isValid && styles.loginBtnDisabled]}
                        onPress={handleLogin}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <Text style={styles.loginBtnText}>Signing in…</Text>
                        ) : (
                            <>
                                <Text style={styles.loginBtnText}>
                                    {role === 'customer' ? 'Sign In' : 'Restaurant Sign In'}
                                </Text>
                                <Text style={styles.loginBtnArrow}>→</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </Animated.View>

                {/* ── OTP alternative ───────────────────────────────────────── */}
                {/* <View style={styles.altRow}>
                    <Text style={styles.altText}>Prefer OTP login? </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('login' as any)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.altLink}>Use OTP instead →</Text>
                    </TouchableOpacity>
                </View> */}

                {/* ── Register ──────────────────────────────────────────────── */}
                <View style={styles.registerRow}>
                    <Text style={styles.registerText}>New to Rodo? </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('register' as any)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.registerLink}>Create an account</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Divider ───────────────────────────────────────────────── */}
                {role === 'customer' && (
                    <>
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or continue with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <View style={styles.socialRow}>
                            <TouchableOpacity style={styles.socialBtn} onPress={handleGooglePress}>
                                <Text style={styles.socialEmoji}>🔵</Text>
                                <Text style={styles.socialText}>Google</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                <View style={{ height: 48 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? 24 : 60,
    },

    // ── Dev Panel ─────────────────────────────────────────────────────────────
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
    devHeaderText: { fontSize: 13, fontWeight: '700', color: '#2563EB', letterSpacing: 0.1 },
    devChevron: { fontSize: 10, color: '#2563EB', fontWeight: '700' },
    devBody: {
        paddingHorizontal: 14,
        paddingBottom: 12,
        borderTopWidth: 1,
        borderTopColor: '#C7D9FF',
        gap: 4,
    },
    devSectionLabelText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#64748B',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginTop: 4,
        marginBottom: 2,
    },
    devRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#DBEAFE',
    },
    devLabel: { fontSize: 12, fontWeight: '600', color: '#1E40AF', flex: 1, marginRight: 8 },
    devMeta: { fontSize: 11, fontWeight: '500', color: '#475569' },

    // ── Hero ──────────────────────────────────────────────────────────────────
    heroWrap: { alignItems: 'center', marginBottom: 28 },
    heroBg: {
        width: '100%',
        height: 150,
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
        width: 80,
        height: 80,
        borderRadius: 22,
        backgroundColor: Colors.amber,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadow.amber,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    heroImage: { width: 72, height: 72, borderRadius: 18 },

    // ── Header ────────────────────────────────────────────────────────────────
    headerText: { marginBottom: 22 },
    title: {
        fontSize: 30,
        fontWeight: '900',
        color: Colors.textPrimary,
        letterSpacing: -0.8,
        lineHeight: 38,
        marginBottom: 8,
    },
    subtitle: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },

    // ── Role Toggle ───────────────────────────────────────────────────────────
    roleTrack: {
        flexDirection: 'row',
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 4,
        marginBottom: 22,
        position: 'relative',
        height: 46,
    },
    rolePill: {
        position: 'absolute',
        top: 4,
        width: '48%',
        height: 38,
        borderRadius: Radius.full,
        backgroundColor: Colors.amber,
        ...Shadow.amber,
    },
    roleOption: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    roleText: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.textMuted,
        letterSpacing: 0.1,
    },
    roleTextActive: {
        color: Colors.textOnAmber,
    },

    // ── Form Card ─────────────────────────────────────────────────────────────
    formCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.card,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.7,
        marginBottom: 8,
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
    iconWrap: {
        paddingHorizontal: 14,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputIcon: { fontSize: 16 },
    flag: { fontSize: 18 },
    dialCode: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
    inputDivider: { width: 1, height: 28, backgroundColor: Colors.border },
    textInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        paddingHorizontal: 14,
        paddingVertical: 14,
        letterSpacing: 0.4,
    },
    clearBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    clearIcon: { fontSize: 11, color: Colors.textSecondary, fontWeight: '700' },
    fieldGap: { height: 14 },
    forgotWrap: { alignSelf: 'flex-end', marginTop: 10 },
    forgotText: { fontSize: 12, fontWeight: '700', color: Colors.amber },

    // ── Terms ─────────────────────────────────────────────────────────────────
    terms: {
        fontSize: 12,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 18,
    },
    termsLink: { color: Colors.amber, fontWeight: '600' },

    // ── CTA Button ────────────────────────────────────────────────────────────
    loginBtn: {
        backgroundColor: Colors.amber,
        borderRadius: Radius.md,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...Shadow.amber,
    },
    loginBtnDisabled: {
        backgroundColor: Colors.textMuted,
        shadowOpacity: 0,
        elevation: 0,
    },
    loginBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.2 },
    loginBtnArrow: { fontSize: 18, color: '#FFFFFF', fontWeight: '700' },

    // ── Alt OTP row ───────────────────────────────────────────────────────────
    altRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 4,
    },
    altText: { fontSize: 13, color: Colors.textMuted },
    altLink: { fontSize: 13, fontWeight: '700', color: Colors.amber },

    // ── Social ────────────────────────────────────────────────────────────────
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

    // ── Register ──────────────────────────────────────────────────────────────
    registerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6,
        paddingVertical: 14,
    },
    registerText: { fontSize: 14, color: Colors.textSecondary },
    registerLink: {
        fontSize: 14,
        fontWeight: '800',
        color: Colors.amber,
    },
});
