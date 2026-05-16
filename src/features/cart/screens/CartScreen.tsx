import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Platform,
    StatusBar,
    Alert,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { Colors, Radius, Shadow } from '@theme/index';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import { MenuItem } from '@/features/menu/types/MenuItem';
import {
    CartItem,
    loadCartItems,
    loadCartMetadata,
    saveCartItems,
    saveCartMetadata,
    clearCart as clearCartStorage,
} from '../services/cartService';
import { Order, OrderItem, OrderType, PaymentMethod } from '@/features/orders/types/Order';
import { useCreateOrder } from '@/features/orders/hooks/hooks';
import { useGetResById } from '@/features/menu/hooks/useGetResById';
import { Restaurant } from '@/features/restaurant/types/Restaurant';
import { useValidateCoupon } from '../hooks/useCoupon';
import { useInitiatePayment, useVerifyPayment } from '../hooks/usePayment';
import { ApiError } from '@/types/ApiError';
import useAlert from '@/hooks/useAlert';
import Razorpay from 'react-native-razorpay';

// ─── Constants ────────────────────────────────────────────────────────────────

const ETA_OPTIONS = ['30 min', '45 min', '60 min', 'Custom'];

const DINE_OPTIONS: { label: string; value: OrderType }[] = [
    { label: 'Dine-in', value: 'dine-in' },
    { label: 'Takeaway', value: 'takeaway' },
];

const PAYMENT_OPTIONS: {
    value: PaymentMethod;
    label: string;
    desc: string;
    icon: string;
}[] = [
    {
        value: 'cash',
        label: 'Cash at Restaurant',
        desc: 'Pay with cash when you arrive',
        icon: '💵',
    },
    {
        value: 'upi_at_restaurant',
        label: 'UPI at Restaurant',
        desc: 'Scan & pay on arrival',
        icon: '📱',
    },
    {
        value: 'online',
        label: 'Pay Online',
        desc: 'Card, UPI, Wallet & more',
        icon: '💳',
    },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const VegBadge = ({ foodType }: { foodType: MenuItem['foodType'] }) => {
    const isVeg = foodType === 'veg';
    const isEgg = foodType === 'egg';
    const color = isVeg ? Colors.vegGreen : isEgg ? '#FFA500' : Colors.redPin;
    return (
        <View style={[badge.wrap, { borderColor: color }]}>
            <View style={[badge.dot, { backgroundColor: color }]} />
        </View>
    );
};

const badge = StyleSheet.create({
    wrap: {
        width: 16,
        height: 16,
        borderRadius: 4,
        borderWidth: 1.5,
        backgroundColor: Colors.bgCard,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: { width: 7, height: 7, borderRadius: 3.5 },
});

const QtyStepper = ({
    qty,
    onInc,
    onDec,
}: {
    qty: number;
    onInc: () => void;
    onDec: () => void;
}) => (
    <View style={stepper.wrap}>
        <TouchableOpacity style={stepper.btn} onPress={onDec} activeOpacity={0.7}>
            <Text style={stepper.btnText}>{qty === 1 ? '🗑' : '−'}</Text>
        </TouchableOpacity>
        <Text style={stepper.qty}>{qty}</Text>
        <TouchableOpacity style={stepper.btn} onPress={onInc} activeOpacity={0.7}>
            <Text style={stepper.btnText}>+</Text>
        </TouchableOpacity>
    </View>
);

const stepper = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.brandYellow,
        borderRadius: Radius.full,
        overflow: 'hidden',
        ...Shadow.amber,
    },
    btn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
    btnText: { fontSize: 14, color: '#fff', fontWeight: '800' },
    qty: { minWidth: 24, textAlign: 'center', fontSize: 13, fontWeight: '800', color: '#fff' },
});

const SectionHeader = ({ title, sub }: { title: string; sub?: string }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {sub && <Text style={styles.sectionSub}>{sub}</Text>}
    </View>
);

const BillRow = ({
    label,
    value,
    isBold,
    highlight,
}: {
    label: string;
    value: string;
    isBold?: boolean;
    highlight?: boolean;
}) => (
    <View style={billRow.row}>
        <Text style={[billRow.label, isBold && billRow.bold, highlight && billRow.green]}>
            {label}
        </Text>
        <Text style={[billRow.value, isBold && billRow.bold, highlight && billRow.green]}>
            {value}
        </Text>
    </View>
);

const billRow = StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
    label: { fontSize: 13, color: Colors.textSecondary },
    value: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
    bold: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
    green: { color: Colors.vegGreen, fontWeight: '700' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

type CartProps = NativeStackScreenProps<RootStackParamList, 'cart'>;

export default function CartScreen({ navigation, route }: CartProps) {
    const alert = useAlert();

    const [items, setItems] = useState<CartItem[]>([]);
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [isCouponLoading, setIsCouponLoading] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(
        null,
    );
    const [selectedETA, setSelectedETA] = useState('30 min');
    const [dineMode, setDineMode] = useState<OrderType>('dine-in');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [specialNote, setSpecialNote] = useState('');
    const [noteExpanded, setNoteExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // ETA modal
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [customETA, setCustomETA] = useState('');
    const [customEtaInput, setCustomEtaInput] = useState('');

    const { mutateAsync: placeOrder, isPending: isPlacingOrder } = useCreateOrder();
    const { mutateAsync: validateCoupon } = useValidateCoupon();
    const { mutateAsync: initiatePayment } = useInitiatePayment();
    const { mutateAsync: verifyPayment } = useVerifyPayment();

    const isBusy = isPlacingOrder || isProcessingPayment;

    // ── Load cart on mount ────────────────────────────────────────────────────
    useEffect(() => {
        loadCart();
    }, []);

    // ── Merge incoming items from route params ────────────────────────────────
    useEffect(() => {
        if (!route?.params?.cartItems?.length) return;
        (async () => {
            const existing = await loadCartItems();
            const incoming: CartItem[] | undefined = route?.params?.cartItems;
            const merged = [...existing];
            if (incoming) {
                for (const item of incoming) {
                    const idx = merged.findIndex(e => e._id === item._id);
                    if (idx !== -1)
                        merged[idx] = { ...merged[idx], qty: merged[idx].qty + item.qty };
                    else merged.push(item);
                }
            }
            setItems(merged);
            await saveCartItems(merged);
        })();
    }, [route?.params?.cartItems]);

    // ── Persist on change ─────────────────────────────────────────────────────
    useEffect(() => {
        if (isLoading) return;
        if (items.length > 0) saveCartItems(items);
        saveCartMetadata({ selectedETA, dineMode, specialNote, appliedCoupon, paymentMethod });
    }, [items, selectedETA, dineMode, specialNote, appliedCoupon, paymentMethod, isLoading]);

    const loadCart = async () => {
        try {
            const [cartItems, metadata] = await Promise.all([loadCartItems(), loadCartMetadata()]);
            setItems(cartItems);
            setSelectedETA(metadata.selectedETA);
            setDineMode((metadata.dineMode as OrderType) ?? 'dine-in');
            setPaymentMethod((metadata.paymentMethod as PaymentMethod) ?? 'cash');
            setSpecialNote(metadata.specialNote);
            setAppliedCoupon(metadata.appliedCoupon);
        } catch {
            Alert.alert('Error', 'Failed to load cart.');
        } finally {
            setIsLoading(false);
        }
    };

    const clearCart = async () => {
        await clearCartStorage();
        setItems([]);
        setAppliedCoupon(null);
        setCouponCode('');
        setSpecialNote('');
        setSelectedETA('30 min');
        setDineMode('dine-in');
        setPaymentMethod('cash');
    };

    // ── Cart math ─────────────────────────────────────────────────────────────
    const subtotal = items.reduce((s, i) => s + (i.discountedPrice || i.price) * i.qty, 0);
    const GST_RATE = 5;
    const gst = Math.round(subtotal * (GST_RATE / 100));
    const discount = appliedCoupon?.discount ?? 0;
    const total = subtotal + gst - discount;
    const totalQty = items.reduce((s, i) => s + i.qty, 0);

    const restaurantId = items[0]?.restaurant ?? '';
    const { data: restaurantData } = useGetResById(restaurantId);
    const restaurant: Restaurant = restaurantData?.data?.restaurant;

    // ── Shared helpers ────────────────────────────────────────────────────────
    const resolveEtaMinutes = () =>
        selectedETA === 'Custom' ? parseInt(customETA, 10) || 60 : parseInt(selectedETA, 10) || 30;

    const buildOrderItems = (): OrderItem[] =>
        items.map(item => ({
            menuItemId: item._id!,
            name: item.name,
            price: item.discountedPrice ?? item.price,
            quantity: item.qty,
            foodType: item.foodType,
        }));

    // ── Item mutations ────────────────────────────────────────────────────────
    const inc = (id: string) =>
        setItems(prev => prev.map(i => (i._id === id ? { ...i, qty: i.qty + 1 } : i)));

    const dec = (id: string) =>
        setItems(prev => {
            const item = prev.find(i => i._id === id);
            if (!item) return prev;
            if (item.qty === 1) {
                Alert.alert('Remove item?', `Remove "${item.name}" from cart?`, [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: () => {
                            const next = prev.filter(i => i._id !== id);
                            setItems(next);
                            if (next.length === 0) clearCart();
                            else saveCartItems(next);
                        },
                    },
                ]);
                return prev;
            }
            return prev.map(i => (i._id === id ? { ...i, qty: i.qty - 1 } : i));
        });

    // ── Coupon ────────────────────────────────────────────────────────────────
    // Response: { success, message, data: { coupon: { code, discountType, discountValue }, discount } }
    const handleApplyCoupon = async () => {
        const code = couponCode.trim().toUpperCase();
        if (!code) {
            setCouponError('Please enter a coupon code');
            return;
        }
        setIsCouponLoading(true);
        setCouponError('');
        try {
            const response = await validateCoupon({ code, orderAmount: subtotal, restaurantId });
            const { coupon, discount: discountAmount } = response.data;
            // Store the code from the server response and round the discount
            setAppliedCoupon({ code: coupon.code, discount: Math.round(discountAmount) });
            setCouponCode('');
        } catch (error: any) {
            const msg =
                error?.response?.data?.message ??
                (error as ApiError)?.message ??
                'Invalid coupon code';
            setCouponError(msg);
            setAppliedCoupon(null);
        } finally {
            setIsCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    // ── Online payment via Razorpay ───────────────────────────────────────────
    const handleOnlinePayment = async () => {
        const etaMinutes = resolveEtaMinutes();
        const etaDate = new Date(Date.now() + etaMinutes * 60 * 1000).toISOString();

        // 1. Create Razorpay order on backend and get key + amount
        const paymentData = await initiatePayment({
            restaurantId,
            items: buildOrderItems(),
            orderType: dineMode,
            customerETA: etaDate,
            etaMinutes,
        });

        const { amount, keyId, snapshot } = paymentData.data;

        // 2. Open Razorpay SDK — resolves with IDs or rejects on failure/dismiss
        const paymentResponse = await Razorpay.open({
            key: keyId,
            amount,
            currency: 'INR',
            name: 'Rodofood',
            description: 'Highway Food Pre-Order',
            image: '/logo.jpeg',
            prefill: {},
            theme: { color: '#FF6B35' },
        } as any);

        // 3. Verify payment signature with backend
        await verifyPayment({
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            snapshot,
        });

        await clearCart();
        alert.success('Payment Successful', 'Your order has been placed!');
    };

    // ── COD / UPI-at-restaurant order ─────────────────────────────────────────
    const handlePlaceOrder = async () => {
        const etaMinutes = resolveEtaMinutes();
        const etaDate = new Date(Date.now() + etaMinutes * 60 * 1000).toISOString();

        const payload: Order = {
            restaurantId,
            items: buildOrderItems(),
            subtotal,
            gstAmount: gst,
            gstRate: GST_RATE,
            discount,
            totalAmount: total,
            ...(appliedCoupon && { couponCode: appliedCoupon.code }),
            orderType: dineMode,
            customerETA: etaDate,
            etaMinutes,
            status: 'pending',
            paymentMethod,
            paymentStatus: 'pending',
            isManualOrder: false,
            ...(specialNote.trim() && { specialNote: specialNote.trim() }),
        };

        const response = await placeOrder(payload);
        await clearCart();
        navigation.navigate('main', {
            screen: 'orders',
            params: { orderId: response?.data?._id ?? response?._id },
        });
    };

    // ── Unified checkout entry point ──────────────────────────────────────────
    const handleCheckout = async () => {
        if (isBusy) return;
        setIsProcessingPayment(true);
        try {
            if (paymentMethod === 'online') {
                await handleOnlinePayment();
            } else {
                await handlePlaceOrder();
            }
        } catch (error: any) {
            // Razorpay dismissal rejects with code 0 — silently ignore
            if (error?.code === 0) return;
            alert.error(
                error?.response?.data?.message ??
                    (error as ApiError)?.message ??
                    'Something went wrong. Please try again.',
            );
        } finally {
            setIsProcessingPayment(false);
        }
    };

    // ── Guards ────────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
                <ActivityIndicator color={Colors.brandRed} />
            </View>
        );
    }

    if (items.length === 0) return <EmptyCart navigation={navigation} />;

    const selectedPayment = PAYMENT_OPTIONS.find(p => p.value === paymentMethod)!;

    return (
        <View style={styles.root}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Your Cart</Text>
                    <Text style={styles.headerSub}>{totalQty} items</Text>
                </View>
                <TouchableOpacity
                    style={styles.clearBtn}
                    onPress={() =>
                        Alert.alert('Clear cart?', 'Remove all items?', [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Clear', style: 'destructive', onPress: clearCart },
                        ])
                    }
                >
                    <Text style={styles.clearBtnText}>Clear</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Restaurant strip */}
                <View style={styles.restaurantStrip}>
                    <View style={styles.restaurantIcon}>
                        <Text style={{ fontSize: 20 }}>🍽️</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.restaurantName}>{restaurant?.name ?? '—'}</Text>
                        <Text style={styles.restaurantMeta}>Tap "Add more" to browse menu</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addMoreBtn}
                        onPress={() => navigation?.goBack?.()}
                    >
                        <Text style={styles.addMoreText}>+ Add more</Text>
                    </TouchableOpacity>
                </View>

                {/* Items */}
                <SectionHeader title="Items" sub={`${totalQty} items`} />
                <View style={styles.itemsCard}>
                    {items.map((item, index) => (
                        <View key={item._id || index}>
                            <View style={styles.itemRow}>
                                <View style={styles.itemLeft}>
                                    <VegBadge foodType={item.foodType} />
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        {item.description && (
                                            <Text style={styles.itemDesc} numberOfLines={1}>
                                                {item.description}
                                            </Text>
                                        )}
                                        <Text style={styles.itemPrice}>
                                            ₹{item.discountedPrice || item.price}
                                            {item.discountedPrice && (
                                                <Text style={styles.itemPriceStrike}>
                                                    {' '}
                                                    ₹{item.price}
                                                </Text>
                                            )}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.itemRight}>
                                    <View style={styles.itemEmoji}>
                                        <Text style={{ fontSize: 24 }}>🍽️</Text>
                                    </View>
                                    <QtyStepper
                                        qty={item.qty}
                                        onInc={() => inc(item._id || '')}
                                        onDec={() => dec(item._id || '')}
                                    />
                                    <Text style={styles.itemTotal}>
                                        ₹{(item.discountedPrice || item.price) * item.qty}
                                    </Text>
                                </View>
                            </View>
                            {index < items.length - 1 && <View style={styles.itemDivider} />}
                        </View>
                    ))}
                </View>

                {/* ETA */}
                <SectionHeader title="🕐 Arrival Time" sub="We'll prepare your food accordingly" />
                <View style={styles.etaRow}>
                    {ETA_OPTIONS.map(e => {
                        const isCustom = e === 'Custom';
                        const isActive = isCustom ? selectedETA === 'Custom' : selectedETA === e;
                        const label = isCustom && customETA ? `${customETA} min` : e;
                        return (
                            <TouchableOpacity
                                key={e}
                                style={[styles.etaChip, isActive && styles.etaChipActive]}
                                onPress={() => {
                                    if (isCustom) {
                                        setCustomEtaInput(customETA);
                                        setShowCustomModal(true);
                                    } else {
                                        setSelectedETA(e);
                                    }
                                }}
                            >
                                <Text style={[styles.etaText, isActive && styles.etaTextActive]}>
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Order type */}
                <SectionHeader title="🍽️ Order Type" />
                <View style={styles.dineRow}>
                    {DINE_OPTIONS.map(d => (
                        <TouchableOpacity
                            key={d.value}
                            style={[styles.dineChip, dineMode === d.value && styles.dineChipActive]}
                            onPress={() => setDineMode(d.value)}
                        >
                            <Text style={styles.dineEmoji}>
                                {d.value === 'dine-in' ? '🍽️' : '🛍️'}
                            </Text>
                            <Text
                                style={[
                                    styles.dineText,
                                    dineMode === d.value && styles.dineTextActive,
                                ]}
                            >
                                {d.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Payment Method */}
                <SectionHeader title="💳 Payment Method" />
                <View style={styles.paymentCard}>
                    {PAYMENT_OPTIONS.map((option, index) => {
                        const isActive = paymentMethod === option.value;
                        return (
                            <React.Fragment key={option.value}>
                                <TouchableOpacity
                                    style={[
                                        styles.paymentOption,
                                        isActive && styles.paymentOptionActive,
                                    ]}
                                    onPress={() => setPaymentMethod(option.value)}
                                    activeOpacity={0.75}
                                >
                                    <View
                                        style={[
                                            styles.paymentRadio,
                                            isActive && styles.paymentRadioActive,
                                        ]}
                                    >
                                        {isActive && <View style={styles.paymentRadioDot} />}
                                    </View>
                                    <View
                                        style={[
                                            styles.paymentIconWrap,
                                            isActive && styles.paymentIconWrapActive,
                                        ]}
                                    >
                                        <Text style={styles.paymentIconEmoji}>{option.icon}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={[
                                                styles.paymentLabel,
                                                isActive && styles.paymentLabelActive,
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                        <Text style={styles.paymentDesc}>{option.desc}</Text>
                                    </View>
                                    {option.value === 'cash' && (
                                        <View style={styles.recommendedBadge}>
                                            <Text style={styles.recommendedText}>Popular</Text>
                                        </View>
                                    )}
                                    {option.value === 'online' && (
                                        <View style={styles.onlineBadge}>
                                            <Text style={styles.onlineText}>Instant</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                                {index < PAYMENT_OPTIONS.length - 1 && (
                                    <View style={styles.paymentDivider} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </View>

                {/* Special note */}
                <TouchableOpacity
                    style={styles.noteToggle}
                    onPress={() => setNoteExpanded(p => !p)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.noteToggleIcon}>📝</Text>
                    <Text style={styles.noteToggleText}>Special instructions</Text>
                    <Text style={styles.noteToggleChev}>{noteExpanded ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {noteExpanded && (
                    <TextInput
                        style={styles.noteInput}
                        value={specialNote}
                        onChangeText={setSpecialNote}
                        placeholder="e.g. Less spicy, extra roti, no onion…"
                        placeholderTextColor={Colors.textMuted}
                        multiline
                        maxLength={200}
                    />
                )}

                {/* Coupon */}
                <SectionHeader title="🎟️ Coupon" />
                {appliedCoupon ? (
                    <View style={styles.couponApplied}>
                        <View style={styles.couponAppliedLeft}>
                            <Text style={styles.couponAppliedIcon}>✅</Text>
                            <View>
                                <Text style={styles.couponAppliedCode}>{appliedCoupon.code}</Text>
                                <Text style={styles.couponAppliedSaving}>
                                    You save ₹{appliedCoupon.discount}!
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={removeCoupon} style={styles.couponRemoveBtn}>
                            <Text style={styles.couponRemoveText}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.couponRow}>
                        <TextInput
                            style={styles.couponInput}
                            value={couponCode}
                            onChangeText={v => {
                                setCouponCode(v.toUpperCase());
                                setCouponError('');
                            }}
                            placeholder="Enter coupon code"
                            placeholderTextColor={Colors.textMuted}
                            autoCapitalize="characters"
                            returnKeyType="done"
                            onSubmitEditing={handleApplyCoupon}
                            editable={!isCouponLoading}
                        />
                        <TouchableOpacity
                            style={[styles.couponApplyBtn, isCouponLoading && { opacity: 0.6 }]}
                            onPress={handleApplyCoupon}
                            disabled={isCouponLoading}
                        >
                            {isCouponLoading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.couponApplyText}>Apply</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
                {!!couponError && <Text style={styles.couponError}>⚠ {couponError}</Text>}

                {/* Bill */}
                <SectionHeader title="🧾 Bill Summary" />
                <View style={styles.billCard}>
                    <BillRow label="Subtotal" value={`₹${subtotal}`} />
                    <BillRow label={`GST (${GST_RATE}%)`} value={`₹${gst}`} />
                    {appliedCoupon && (
                        <BillRow
                            label={`Coupon (${appliedCoupon.code})`}
                            value={`−₹${discount}`}
                            highlight
                        />
                    )}
                    <View style={styles.billDivider} />
                    <BillRow label="Total" value={`₹${total}`} isBold />
                    <View style={styles.paymentBadge}>
                        <Text style={styles.paymentBadgeIcon}>{selectedPayment.icon}</Text>
                        <Text style={styles.paymentBadgeText}>{selectedPayment.label}</Text>
                    </View>
                </View>

                {discount > 0 && (
                    <View style={styles.savingsCallout}>
                        <Text style={styles.savingsText}>
                            🎉 You're saving ₹{discount} on this order!
                        </Text>
                    </View>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Checkout bar */}
            <View style={styles.checkoutBar}>
                <View style={styles.checkoutLeft}>
                    <Text style={styles.checkoutTotal}>₹{total}</Text>
                    <Text style={styles.checkoutItems}>{totalQty} items</Text>
                </View>
                <TouchableOpacity
                    style={[styles.checkoutBtn, isBusy && { opacity: 0.7 }]}
                    onPress={handleCheckout}
                    activeOpacity={0.85}
                    disabled={isBusy}
                >
                    {isBusy ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Text style={styles.checkoutBtnText}>
                                {paymentMethod === 'online' ? 'Pay Now' : 'Place Order'}
                            </Text>
                            <Text style={styles.checkoutBtnArrow}>→</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Custom ETA Modal */}
            <Modal
                visible={showCustomModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCustomModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCustomModal(false)}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
                        <Text style={styles.modalTitle}>⏱ Set Custom Time</Text>
                        <Text style={styles.modalSub}>How many minutes until you arrive?</Text>

                        <View style={styles.modalInputRow}>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="e.g. 20"
                                placeholderTextColor={Colors.textMuted}
                                keyboardType="numeric"
                                value={customEtaInput}
                                onChangeText={v => setCustomEtaInput(v.replace(/[^0-9]/g, ''))}
                                maxLength={3}
                                autoFocus
                            />
                            <Text style={styles.modalUnit}>min</Text>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={() => setShowCustomModal(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalConfirmBtn,
                                    !customEtaInput && styles.modalConfirmBtnDisabled,
                                ]}
                                disabled={!customEtaInput}
                                onPress={() => {
                                    setCustomETA(customEtaInput);
                                    setSelectedETA('Custom');
                                    setShowCustomModal(false);
                                }}
                            >
                                <Text style={styles.modalConfirmText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

// ─── Empty Cart ───────────────────────────────────────────────────────────────

function EmptyCart({ navigation }: any) {
    return (
        <View style={emptyStyles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.bgCard} />
            <View style={emptyStyles.header}>
                <TouchableOpacity
                    style={emptyStyles.backBtn}
                    onPress={() => navigation?.goBack?.()}
                >
                    <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary }}>
                        ←
                    </Text>
                </TouchableOpacity>
                <Text style={emptyStyles.title}>Your Cart</Text>
            </View>
            <View style={emptyStyles.body}>
                <Text style={emptyStyles.emoji}>🛒</Text>
                <Text style={emptyStyles.emptyTitle}>Cart is empty</Text>
                <Text style={emptyStyles.emptyDesc}>
                    You haven't added anything yet. Explore restaurants on your route and pre-order
                    your favourite food.
                </Text>
                <TouchableOpacity
                    style={emptyStyles.btn}
                    onPress={() => navigation.navigate('main', { screen: 'restaurants' })}
                >
                    <Text style={emptyStyles.btnText}>Browse Restaurants →</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const emptyStyles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 24 : 56,
        paddingBottom: 14,
        backgroundColor: Colors.bgCard,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
    body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
    emoji: { fontSize: 64, marginBottom: 20 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 10 },
    emptyDesc: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
    },
    btn: {
        backgroundColor: Colors.amber,
        borderRadius: Radius.md,
        paddingVertical: 14,
        paddingHorizontal: 28,
        ...Shadow.amber,
    },
    btnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 24 : 56,
        paddingBottom: 14,
        backgroundColor: Colors.bgCard,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: { fontSize: 18, color: Colors.textPrimary, fontWeight: '700' },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.3,
    },
    headerSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
    clearBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: Radius.full,
        backgroundColor: '#FEE2E2',
    },
    clearBtnText: { fontSize: 12, fontWeight: '700', color: Colors.redPin },

    restaurantStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.md,
        padding: 14,
        marginBottom: 22,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.card,
    },
    restaurantIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    restaurantName: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textPrimary,
        letterSpacing: -0.2,
    },
    restaurantMeta: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
    addMoreBtn: {
        backgroundColor: Colors.brandYellow,
        borderRadius: Radius.full,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: Colors.brandRed,
    },
    addMoreText: { fontSize: 12, fontWeight: '700', color: Colors.brandRed },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.3,
    },
    sectionSub: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },

    itemsCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        padding: 4,
        marginBottom: 22,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.card,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        gap: 10,
    },
    itemLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    itemInfo: { flex: 1, gap: 3 },
    itemName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.2 },
    itemDesc: { fontSize: 11, color: Colors.textSecondary },
    itemPrice: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
    itemPriceStrike: {
        fontSize: 11,
        fontWeight: '500',
        color: Colors.textMuted,
        textDecorationLine: 'line-through',
    },
    itemRight: { alignItems: 'center', gap: 8 },
    itemEmoji: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemTotal: { fontSize: 12, fontWeight: '700', color: Colors.brandRed },
    itemDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 12 },

    etaRow: { flexDirection: 'row', gap: 8, marginBottom: 22, flexWrap: 'wrap' },
    etaChip: {
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: Radius.full,
        backgroundColor: Colors.bgCard,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.card,
    },
    etaChipActive: { backgroundColor: Colors.amberGlow2, borderColor: Colors.brandRed },
    etaText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
    etaTextActive: { color: Colors.brandRed, fontWeight: '700' },

    dineRow: { flexDirection: 'row', gap: 12, marginBottom: 22 },
    dineChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        paddingVertical: 13,
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.card,
    },
    dineChipActive: { backgroundColor: Colors.amberGlow2, borderColor: Colors.brandRed },
    dineEmoji: { fontSize: 18 },
    dineText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
    dineTextActive: { color: Colors.brandRed, fontWeight: '700' },

    // ── Payment ───────────────────────────────────────────────────────────────
    paymentCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        marginBottom: 22,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
        ...Shadow.card,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        backgroundColor: Colors.bgCard,
    },
    paymentOptionActive: { backgroundColor: Colors.amberGlow2 },
    paymentRadio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    paymentRadioActive: { borderColor: Colors.brandRed },
    paymentRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.brandRed },
    paymentIconWrap: {
        width: 40,
        height: 40,
        borderRadius: Radius.sm,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    paymentIconWrapActive: { backgroundColor: '#FFF7ED' },
    paymentIconEmoji: { fontSize: 20 },
    paymentLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.textPrimary,
        letterSpacing: -0.1,
    },
    paymentLabelActive: { color: Colors.brandRed },
    paymentDesc: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
    paymentDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 14 },
    recommendedBadge: {
        backgroundColor: '#FEF9C3',
        borderRadius: Radius.full,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    recommendedText: { fontSize: 10, fontWeight: '700', color: Colors.amber },
    onlineBadge: {
        backgroundColor: '#EFF6FF',
        borderRadius: Radius.full,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    onlineText: { fontSize: 10, fontWeight: '700', color: '#3B82F6' },

    noteToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.md,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.card,
    },
    noteToggleIcon: { fontSize: 16 },
    noteToggleText: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
    noteToggleChev: { fontSize: 10, color: Colors.textMuted, fontWeight: '700' },
    noteInput: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.md,
        borderWidth: 1.5,
        borderColor: Colors.borderActive,
        padding: 14,
        fontSize: 13,
        color: Colors.textPrimary,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 22,
        ...Shadow.card,
    },

    couponRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
    couponInput: {
        flex: 1,
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.md,
        borderWidth: 1.5,
        borderColor: Colors.border,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textPrimary,
        letterSpacing: 1,
        ...Shadow.card,
    },
    couponApplyBtn: {
        backgroundColor: Colors.brandRed,
        borderRadius: Radius.md,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 72,
        ...Shadow.amber,
    },
    couponApplyText: { fontSize: 13, fontWeight: '800', color: '#fff' },
    couponApplied: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F0FDF4',
        borderRadius: Radius.md,
        padding: 14,
        borderWidth: 1,
        borderColor: '#86EFAC',
        marginBottom: 6,
    },
    couponAppliedLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    couponAppliedIcon: { fontSize: 20 },
    couponAppliedCode: { fontSize: 13, fontWeight: '800', color: Colors.vegGreen },
    couponAppliedSaving: { fontSize: 11, color: Colors.vegGreen, marginTop: 1 },
    couponRemoveBtn: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: Radius.full,
        backgroundColor: '#FEE2E2',
    },
    couponRemoveText: { fontSize: 11, fontWeight: '700', color: Colors.redPin },
    couponError: {
        fontSize: 11,
        color: Colors.redPin,
        fontWeight: '600',
        marginBottom: 16,
        marginTop: 2,
    },

    billCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.card,
    },
    billDivider: { height: 1.5, backgroundColor: Colors.border, marginVertical: 8 },
    paymentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.full,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignSelf: 'flex-start',
        marginTop: 10,
    },
    paymentBadgeIcon: { fontSize: 13 },
    paymentBadgeText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },

    savingsCallout: {
        backgroundColor: '#F0FDF4',
        borderRadius: Radius.md,
        padding: 12,
        borderWidth: 1,
        borderColor: '#86EFAC',
        alignItems: 'center',
        marginBottom: 8,
    },
    savingsText: { fontSize: 13, fontWeight: '700', color: Colors.vegGreen },

    checkoutBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.bgCard,
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        gap: 16,
        shadowColor: '#8A7060',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 16,
    },
    checkoutLeft: { gap: 2 },
    checkoutTotal: {
        fontSize: 20,
        fontWeight: '900',
        color: Colors.textPrimary,
        letterSpacing: -0.5,
    },
    checkoutItems: { fontSize: 11, color: Colors.textSecondary },
    checkoutBtn: {
        flex: 1,
        backgroundColor: Colors.brandRed,
        borderRadius: Radius.md,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...Shadow.amber,
    },
    checkoutBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },
    checkoutBtnArrow: { fontSize: 18, color: '#fff', fontWeight: '700' },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        padding: 24,
        width: '80%',
        ...Shadow.card,
    },
    modalTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
    modalSub: { fontSize: 13, color: Colors.textSecondary, marginBottom: 20 },
    modalInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.md,
        borderWidth: 1.5,
        borderColor: Colors.brandRed,
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
        marginBottom: 20,
    },
    modalInput: {
        flex: 1,
        fontSize: 28,
        fontWeight: '900',
        color: Colors.textPrimary,
        paddingVertical: 4,
    },
    modalUnit: { fontSize: 16, fontWeight: '600', color: Colors.textSecondary },
    modalActions: { flexDirection: 'row', gap: 10 },
    modalCancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: Radius.md,
        alignItems: 'center',
        backgroundColor: Colors.bgElevated,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    modalCancelText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
    modalConfirmBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: Radius.md,
        alignItems: 'center',
        backgroundColor: Colors.brandRed,
    },
    modalConfirmBtnDisabled: { opacity: 0.4 },
    modalConfirmText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
