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

// ─── Role Types ───────────────────────────────────────────────────────────────
type Role = 'customer' | 'restaurant';

// ─── Static Register Handler (replace with API) ───────────────────────────────
const staticRegister = (role: Role, payload: RegisterPayload): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // TODO: replace with real API call
            if (payload.phone.length === 10 && payload.password.length >= 6) {
                resolve();
            } else {
                reject(new Error('Invalid details'));
            }
        }, 1000);
    });
};

interface RegisterPayload {
    fullName: string;
    phone: string;
    email: string;
    password: string;
}

// ─────────────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<RootStackParamList, 'register'>;

export default function RegisterScreen({ navigation }: Props) {
    const alert = useAlert();

    // Role
    const [role, setRole] = useState<Role>('customer');
    const roleSlide = useRef(new Animated.Value(0)).current;

    // Form fields
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);

    // UI state
    const [loading, setLoading] = useState(false);
    const [nameFocused, setNameFocused] = useState(false);
    const [phoneFocused, setPhoneFocused] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passFocused, setPassFocused] = useState(false);

    // Animations
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    // ── Validation ────────────────────────────────────────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid =
        fullName.trim().length >= 2 &&
        phone.length === 10 &&
        emailRegex.test(email) &&
        password.length >= 6;

    // Field-level hints
    const nameHint =
        fullName.length > 0 && fullName.trim().length < 2 ? 'At least 2 characters' : '';
    const phoneHint = phone.length > 0 ? `${phone.length}/10 digits` : '';
    const emailHint = email.length > 0 && !emailRegex.test(email) ? 'Enter a valid email' : '';
    const passwordHint =
        password.length > 0 && password.length < 6 ? `${password.length}/6 min chars` : '';

    // ── Role switch ───────────────────────────────────────────────────────────
    const switchRole = (r: Role) => {
        setRole(r);
        Animated.spring(roleSlide, {
            toValue: r === 'customer' ? 0 : 1,
            useNativeDriver: false,
            tension: 180,
            friction: 22,
        }).start();
    };

    const pillLeft = roleSlide.interpolate({
        inputRange: [0, 1],
        outputRange: ['2%', '51%'],
    });

    // ── Shake ─────────────────────────────────────────────────────────────────
    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 7, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -7, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
        ]).start();
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleRegister = () => {
        if (!isValid) {
            triggerShake();
            return;
        }

        Animated.sequence([
            Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
            Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start();

        setLoading(true);

        // ── TODO: Replace with your API mutation ─────────────────────────────
        staticRegister(role, { fullName, phone, email, password })
            .then(() => {
                setLoading(false);
                alert.success('Account Created!', 'OTP has been sent to your email.');
                // navigation.navigate('otpLogin', { phone, otp: undefined });
            })
            .catch(err => {
                setLoading(false);
                alert.error('Registration Failed', err?.message || 'Something went wrong');
                triggerShake();
            });
        // ─────────────────────────────────────────────────────────────────────
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
                {/* ── Back button ───────────────────────────────────────────── */}
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.75}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>

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
                    <Text style={styles.title}>Create Account ✨</Text>
                    <Text style={styles.subtitle}>
                        {role === 'customer'
                            ? 'Join Rodo to discover great food around you.'
                            : 'List your restaurant and start receiving orders.'}
                    </Text>
                </View>

                {/* ── Role Toggle ───────────────────────────────────────────── */}
                <View style={styles.roleTrack}>
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
                    {/* ── Full Name ── */}
                    <Text style={styles.inputLabel}>
                        Full Name <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={[styles.inputRow, nameFocused && styles.inputRowFocused]}>
                        <View style={styles.iconWrap}>
                            <Text style={styles.inputIcon}>👤</Text>
                        </View>
                        <View style={styles.inputDivider} />
                        <TextInput
                            style={styles.textInput}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Your full name"
                            placeholderTextColor={Colors.textMuted}
                            onFocus={() => setNameFocused(true)}
                            onBlur={() => setNameFocused(false)}
                            autoCapitalize="words"
                            returnKeyType="next"
                        />
                        {fullName.length > 0 && (
                            <TouchableOpacity
                                style={styles.clearBtn}
                                onPress={() => setFullName('')}
                            >
                                <Text style={styles.clearIcon}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    {nameHint ? (
                        <Text style={styles.hintError}>{nameHint}</Text>
                    ) : (
                        <View style={styles.hintSpacer} />
                    )}

                    {/* ── Mobile Number ── */}
                    <Text style={styles.inputLabel}>
                        Mobile Number <Text style={styles.required}>*</Text>
                    </Text>
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
                            placeholder="10-digit number"
                            placeholderTextColor={Colors.textMuted}
                            onFocus={() => setPhoneFocused(true)}
                            onBlur={() => setPhoneFocused(false)}
                            maxLength={10}
                            returnKeyType="next"
                        />
                        {phone.length > 0 && (
                            <TouchableOpacity style={styles.clearBtn} onPress={() => setPhone('')}>
                                <Text style={styles.clearIcon}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    {phoneHint ? (
                        <Text style={phone.length === 10 ? styles.hintOk : styles.hintError}>
                            {phoneHint}
                        </Text>
                    ) : (
                        <View style={styles.hintSpacer} />
                    )}

                    {/* ── Email ── */}
                    <Text style={styles.inputLabel}>
                        Email <Text style={styles.required}>*</Text>
                        <Text style={styles.inputLabelNote}> (OTP will be sent here)</Text>
                    </Text>
                    <View style={[styles.inputRow, emailFocused && styles.inputRowFocused]}>
                        <View style={styles.iconWrap}>
                            <Text style={styles.inputIcon}>✉️</Text>
                        </View>
                        <View style={styles.inputDivider} />
                        <TextInput
                            style={styles.textInput}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            placeholder="your@email.com"
                            placeholderTextColor={Colors.textMuted}
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                            autoCapitalize="none"
                            returnKeyType="next"
                        />
                        {email.length > 0 && (
                            <TouchableOpacity style={styles.clearBtn} onPress={() => setEmail('')}>
                                <Text style={styles.clearIcon}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    {emailHint ? (
                        <Text style={styles.hintError}>{emailHint}</Text>
                    ) : (
                        <View style={styles.hintSpacer} />
                    )}

                    {/* ── Password ── */}
                    <Text style={styles.inputLabel}>
                        Password <Text style={styles.required}>*</Text>
                        <Text style={styles.inputLabelNote}> (min 6 chars)</Text>
                    </Text>
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
                            placeholder="Create a password"
                            placeholderTextColor={Colors.textMuted}
                            onFocus={() => setPassFocused(true)}
                            onBlur={() => setPassFocused(false)}
                            autoCapitalize="none"
                            returnKeyType="done"
                            onSubmitEditing={handleRegister}
                        />
                        <TouchableOpacity
                            style={styles.clearBtn}
                            onPress={() => setShowPass(v => !v)}
                        >
                            <Text style={styles.clearIcon}>{showPass ? '🙈' : '👁'}</Text>
                        </TouchableOpacity>
                    </View>
                    {passwordHint ? (
                        <Text style={password.length >= 6 ? styles.hintOk : styles.hintError}>
                            {passwordHint}
                        </Text>
                    ) : (
                        <View style={styles.hintSpacer} />
                    )}

                    {/* ── Strength bar ── */}
                    {password.length > 0 && (
                        <View style={styles.strengthWrap}>
                            {[1, 2, 3, 4].map(i => {
                                const strength =
                                    password.length >= 10 &&
                                    /[A-Z]/.test(password) &&
                                    /\d/.test(password) &&
                                    /[^A-Za-z0-9]/.test(password)
                                        ? 4
                                        : password.length >= 8 &&
                                          /[A-Z]/.test(password) &&
                                          /\d/.test(password)
                                        ? 3
                                        : password.length >= 6
                                        ? 2
                                        : 1;
                                const colors = ['#EF4444', '#F97316', '#22C55E', '#16A34A'];
                                return (
                                    <View
                                        key={i}
                                        style={[
                                            styles.strengthBar,
                                            {
                                                backgroundColor:
                                                    i <= strength
                                                        ? colors[strength - 1]
                                                        : Colors.border,
                                            },
                                        ]}
                                    />
                                );
                            })}
                            <Text style={styles.strengthLabel}>
                                {password.length < 6
                                    ? 'Too short'
                                    : password.length >= 10 &&
                                      /[A-Z]/.test(password) &&
                                      /\d/.test(password) &&
                                      /[^A-Za-z0-9]/.test(password)
                                    ? 'Strong 💪'
                                    : password.length >= 8 && /[A-Z]/.test(password)
                                    ? 'Good'
                                    : 'Weak'}
                            </Text>
                        </View>
                    )}
                </Animated.View>

                {/* ── Terms ─────────────────────────────────────────────────── */}
                <Text style={styles.terms}>
                    By registering, you agree to our{' '}
                    <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>

                {/* ── CTA ───────────────────────────────────────────────────── */}
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <TouchableOpacity
                        style={[styles.registerBtn, !isValid && styles.registerBtnDisabled]}
                        onPress={handleRegister}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <Text style={styles.registerBtnText}>Creating Account…</Text>
                        ) : (
                            <>
                                <Text style={styles.registerBtnText}>
                                    {role === 'customer' ? 'Create Account' : 'Register Restaurant'}
                                </Text>
                                <Text style={styles.registerBtnArrow}>→</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </Animated.View>

                {/* ── Already have account ───────────────────────────────────── */}
                <View style={styles.loginRow}>
                    <Text style={styles.loginText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
                        <Text style={styles.loginLink}>Sign In →</Text>
                    </TouchableOpacity>
                </View>

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

    // ── Back ──────────────────────────────────────────────────────────────────
    backBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: Colors.bgCard,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        ...Shadow.card,
    },
    backIcon: { fontSize: 18, color: Colors.textPrimary, fontWeight: '700' },

    // ── Hero ──────────────────────────────────────────────────────────────────
    heroWrap: { alignItems: 'center', marginBottom: 24 },
    heroBg: {
        width: '100%',
        height: 130,
        borderRadius: Radius.lg,
        backgroundColor: Colors.amberGlow,
        borderWidth: 1,
        borderColor: Colors.borderActive,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
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
        width: 76,
        height: 76,
        borderRadius: 22,
        backgroundColor: Colors.amber,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadow.amber,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    heroImage: { width: 68, height: 68, borderRadius: 18 },

    // ── Header ────────────────────────────────────────────────────────────────
    headerText: { marginBottom: 20 },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: Colors.textPrimary,
        letterSpacing: -0.8,
        lineHeight: 36,
        marginBottom: 6,
    },
    subtitle: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },

    // ── Role Toggle ───────────────────────────────────────────────────────────
    roleTrack: {
        flexDirection: 'row',
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 4,
        marginBottom: 20,
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
    roleOption: { flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
    roleText: { fontSize: 13, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.1 },
    roleTextActive: { color: Colors.textOnAmber },

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
    required: { color: Colors.brandRed },
    inputLabelNote: {
        fontSize: 10,
        fontWeight: '500',
        color: Colors.textMuted,
        textTransform: 'none',
        letterSpacing: 0,
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
    inputIcon: { fontSize: 15 },
    flag: { fontSize: 16 },
    dialCode: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
    inputDivider: { width: 1, height: 28, backgroundColor: Colors.border },
    textInput: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textPrimary,
        paddingHorizontal: 14,
        paddingVertical: 14,
        letterSpacing: 0.2,
    },
    clearBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    clearIcon: { fontSize: 11, color: Colors.textSecondary, fontWeight: '700' },

    // Hints
    hintError: {
        fontSize: 11,
        color: Colors.brandRed,
        fontWeight: '600',
        marginTop: 5,
        marginBottom: 12,
        marginLeft: 4,
    },
    hintOk: {
        fontSize: 11,
        color: Colors.successGreen,
        fontWeight: '600',
        marginTop: 5,
        marginBottom: 12,
        marginLeft: 4,
    },
    hintSpacer: { height: 14 },

    // Password strength bar
    strengthWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 4,
    },
    strengthBar: {
        flex: 1,
        height: 4,
        borderRadius: 99,
    },
    strengthLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textSecondary,
        marginLeft: 6,
        minWidth: 54,
        textAlign: 'right',
    },

    // ── Terms ─────────────────────────────────────────────────────────────────
    terms: {
        fontSize: 12,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 18,
    },
    termsLink: { color: Colors.amber, fontWeight: '600' },

    // ── CTA ───────────────────────────────────────────────────────────────────
    registerBtn: {
        backgroundColor: Colors.amber,
        borderRadius: Radius.md,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...Shadow.amber,
    },
    registerBtnDisabled: {
        backgroundColor: Colors.textMuted,
        shadowOpacity: 0,
        elevation: 0,
    },
    registerBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.2 },
    registerBtnArrow: { fontSize: 18, color: '#FFFFFF', fontWeight: '700' },

    // ── Login Row ─────────────────────────────────────────────────────────────
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    loginText: { fontSize: 14, color: Colors.textSecondary },
    loginLink: {
        fontSize: 14,
        fontWeight: '800',
        color: Colors.amber,
    },
});
