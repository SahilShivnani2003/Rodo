import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    StatusBar,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Colors, Radius, Shadow } from '@theme/index';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import { useGetResMenu } from '../hooks/useGetResMenu';
import { MenuItem } from '../types/MenuItem';
import { CartItem } from '@/features/cart/services/cartService';
import { useGetResById } from '../hooks/useGetResById';

const ETA_OPTIONS = ['30 min', '45 min', '60 min', 'Custom'];

// ─── Cart ─────────────────────────────────────────────────────────────────────

const useCart = (itemMap: Record<string, MenuItem>) => {
    // qty map: itemId → quantity
    const [cart, setCart] = useState<Record<string, number>>({});

    const add = (id: string) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));

    const remove = (id: string) =>
        setCart(c => {
            const n = { ...c };
            if (n[id] > 1) n[id]--;
            else delete n[id];
            return n;
        });

    const qty = (id: string) => cart[id] || 0;

    const total = () =>
        Object.entries(cart).reduce((sum, [id, q]) => {
            const item = itemMap[id];
            if (!item) return sum;
            return sum + (item.discountedPrice ?? item.price) * q;
        }, 0);

    const count = () => Object.values(cart).reduce((a, b) => a + b, 0);

    /** Build CartItem[] from the current cart state */
    const getCartItems = (): CartItem[] =>
        Object.entries(cart)
            .filter(([id, q]) => q > 0 && !!itemMap[id])
            .map(([id, q]) => ({ ...itemMap[id], qty: q }));

    return { add, remove, qty, total, count, getCartItems };
};

// ─── Qty control ──────────────────────────────────────────────────────────────

const QtyControl = ({
    qty,
    onAdd,
    onRemove,
}: {
    qty: number;
    onAdd: () => void;
    onRemove: () => void;
}) =>
    qty === 0 ? (
        <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <Text style={styles.addBtnText}>ADD +</Text>
        </TouchableOpacity>
    ) : (
        <View style={styles.qtyControl}>
            <TouchableOpacity style={styles.qtyBtn} onPress={onRemove}>
                <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyNum}>{qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={onAdd}>
                <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
        </View>
    );

// ─── Screen ───────────────────────────────────────────────────────────────────

type menuProps = NativeStackScreenProps<RootStackParamList, 'menu'>;

export default function MenuScreen({ navigation, route }: menuProps) {
    const restaurantId = route?.params?.restaurantId;
    const { data, isLoading } = useGetResMenu(restaurantId);
    const { data: restaurantDetail } = useGetResById(restaurantId);
    const res = restaurantDetail?.data?.restaurant;
    const menuByCategory: Record<string, MenuItem[]> = data?.data?.menu ?? {};
    const categories = useMemo(() => Object.keys(menuByCategory), [menuByCategory]);

    // Build a flat id→item lookup for the cart hook
    const itemMap = useMemo<Record<string, MenuItem>>(
        () =>
            Object.values(menuByCategory)
                .flat()
                .reduce<Record<string, MenuItem>>((acc, item) => {
                    if (item._id) acc[item._id] = item;
                    return acc;
                }, {}),
        [menuByCategory],
    );

    const [activeCategory, setActiveCategory] = useState<string>('');
    const [selectedETA, setSelectedETA] = useState('30 min');
    const [dineMode, setDineMode] = useState<'dine' | 'take'>('dine');
    const { add, remove, qty, total, count, getCartItems } = useCart(itemMap);

    React.useEffect(() => {
        if (categories.length && !activeCategory) {
            setActiveCategory(categories[0]);
        }
    }, [categories]);

    const filteredItems: MenuItem[] = menuByCategory[activeCategory] ?? [];

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.bgCard} />

            <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
                <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>

            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Hero */}
                {/* Hero */}
                <View style={styles.hero}>
                    <View style={styles.heroImageBg}>
                        {res?.coverImage ? (
                            <Image
                                source={{ uri: res.coverImage }}
                                style={styles.heroCoverImg}
                                resizeMode="cover"
                            />
                        ) : (
                            <Text style={styles.heroEmoji}>🍽️</Text>
                        )}
                    </View>
                </View>

                <View style={styles.heroInfo}>
                    <View style={styles.heroTop}>
                        <View style={{ flex: 1, marginRight: 12 }}>
                            <Text style={styles.heroName}>{res?.name ?? 'Restaurant'}</Text>
                            <Text style={styles.heroCuisine}>
                                {res?.cuisines?.join(' · ') ?? ''}
                            </Text>
                        </View>
                        <View style={styles.heroRatingBadge}>
                            <Text style={styles.heroStar}>★</Text>
                            <Text style={styles.heroRating}>{res?.rating?.toFixed(1) ?? '—'}</Text>
                        </View>
                    </View>

                    {!!res?.description && <Text style={styles.heroDesc}>{res.description}</Text>}

                    <View style={[styles.heroMeta, { marginTop: 12 }]}>
                        <View style={styles.heroMetaChip}>
                            <Text style={styles.heroMetaText}>
                                ⏱ ~{res?.avgPrepTimeMinutes ?? '?'} min
                            </Text>
                        </View>
                        {res?.openingHours && (
                            <View style={styles.heroMetaChip}>
                                <Text style={styles.heroMetaText}>
                                    🕐 {res.openingHours.open} – {res.openingHours.close}
                                </Text>
                            </View>
                        )}
                        <View
                            style={[
                                styles.heroMetaChip,
                                { backgroundColor: res?.isOpen ? '#dcfce7' : '#fee2e2' },
                            ]}
                        >
                            {res?.isOpen && <View style={styles.openDot} />}
                            <Text
                                style={[
                                    styles.heroMetaText,
                                    { color: res?.isOpen ? Colors.successGreen : Colors.brandRed },
                                ]}
                            >
                                {res?.isOpen ? 'Open' : 'Closed'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ETA */}
                <View style={styles.sectionPad}>
                    <View style={styles.etaSection}>
                        <Text style={styles.etaTitle}>🕐 When will you arrive?</Text>
                        <Text style={styles.etaSub}>We'll have your food ready on time</Text>
                        <View style={styles.etaOptions}>
                            {ETA_OPTIONS.map(e => (
                                <TouchableOpacity
                                    key={e}
                                    style={[
                                        styles.etaChip,
                                        selectedETA === e && styles.etaChipActive,
                                    ]}
                                    onPress={() => setSelectedETA(e)}
                                >
                                    <Text
                                        style={[
                                            styles.etaChipText,
                                            selectedETA === e && styles.etaChipTextActive,
                                        ]}
                                    >
                                        {e}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Dine mode */}
                <View style={[styles.sectionPad, styles.dineRow]}>
                    <TouchableOpacity
                        style={[styles.dineChip, dineMode === 'dine' && styles.dineChipActive]}
                        onPress={() => setDineMode('dine')}
                    >
                        <Text
                            style={[styles.dineText, dineMode === 'dine' && styles.dineTextActive]}
                        >
                            🍽️ Dine-in
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.dineChip, dineMode === 'take' && styles.dineChipActive]}
                        onPress={() => setDineMode('take')}
                    >
                        <Text
                            style={[styles.dineText, dineMode === 'take' && styles.dineTextActive]}
                        >
                            🛍️ Takeaway
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Category tabs */}
                {isLoading ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color={Colors.brandRed} />
                ) : (
                    <>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.catTabScroll}
                            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
                        >
                            {categories.map((cat: string) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.catTab,
                                        activeCategory === cat && styles.catTabActive,
                                    ]}
                                    onPress={() => setActiveCategory(cat)}
                                >
                                    <Text
                                        style={[
                                            styles.catTabText,
                                            activeCategory === cat && styles.catTabTextActive,
                                        ]}
                                    >
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Menu items */}
                        <View style={styles.menuList}>
                            {filteredItems.map((item, index) => {
                                const id = item._id ?? `item-${index}`;
                                const isBestseller =
                                    item.isPopular || item.tags?.includes('Bestseller');
                                const isVeg = item.foodType === 'veg';
                                const hasDiscount =
                                    item.discountedPrice !== undefined &&
                                    item.discountedPrice < item.price;
                                const canAddToCart = !!item._id && item.isAvailable;

                                return (
                                    <View
                                        key={id}
                                        style={[
                                            styles.menuItem,
                                            qty(id) > 0 && styles.menuItemSelected,
                                            !item.isAvailable && styles.menuItemUnavailable,
                                        ]}
                                    >
                                        {isBestseller && (
                                            <View style={styles.bestseller}>
                                                <Text style={styles.bestsellerText}>
                                                    🏆 Bestseller
                                                </Text>
                                            </View>
                                        )}

                                        <View style={styles.menuItemInner}>
                                            <View style={styles.menuItemInfo}>
                                                <View
                                                    style={[
                                                        styles.vegBox,
                                                        {
                                                            borderColor: isVeg
                                                                ? Colors.vegGreen
                                                                : Colors.redPin,
                                                        },
                                                    ]}
                                                >
                                                    <View
                                                        style={[
                                                            styles.vegDot,
                                                            {
                                                                backgroundColor: isVeg
                                                                    ? Colors.vegGreen
                                                                    : Colors.redPin,
                                                            },
                                                        ]}
                                                    />
                                                </View>

                                                <Text style={styles.menuItemName}>{item.name}</Text>

                                                {!!item.description && (
                                                    <Text style={styles.menuItemDesc}>
                                                        {item.description}
                                                    </Text>
                                                )}

                                                <View style={styles.menuItemMeta}>
                                                    <View style={styles.priceBlock}>
                                                        {hasDiscount && (
                                                            <Text
                                                                style={styles.menuItemPriceStrike}
                                                            >
                                                                ₹{item.price}
                                                            </Text>
                                                        )}
                                                        <Text style={styles.menuItemPrice}>
                                                            ₹{item.discountedPrice ?? item.price}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.prepBadge}>
                                                        <Text style={styles.prepText}>
                                                            🧑‍🍳 {item.preparationTime} min
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            <View style={styles.menuItemRight}>
                                                <View style={styles.menuImagePlaceholder}>
                                                    <Text style={{ fontSize: 28 }}>🍛</Text>
                                                </View>

                                                {canAddToCart ? (
                                                    <QtyControl
                                                        qty={qty(id)}
                                                        onAdd={() => add(id)}
                                                        onRemove={() => remove(id)}
                                                    />
                                                ) : (
                                                    <Text style={styles.unavailableText}>
                                                        Unavailable
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </>
                )}
            </ScrollView>

            {count() > 0 && (
                <TouchableOpacity
                    style={styles.cartBar}
                    activeOpacity={0.9}
                    onPress={() =>
                        navigation.navigate('cart', {
                            cartItems: getCartItems(),
                        })
                    }
                >
                    <View style={styles.cartBarLeft}>
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{count()}</Text>
                        </View>
                        <Text style={styles.cartBarLabel}>items in cart</Text>
                    </View>
                    <View style={styles.cartBarRight}>
                        <Text style={styles.cartBarTotal}>₹{total()}</Text>
                        <Text style={styles.cartBarAction}>View Cart →</Text>
                    </View>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },
    scroll: { flex: 1 },
    backBtn: {
        position: 'absolute',
        top: Platform.OS === 'android' ? 24 : 56,
        left: 16,
        zIndex: 99,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.card,
    },
    backIcon: { fontSize: 18, color: Colors.textPrimary, fontWeight: '700' },
    hero: { height: 200, backgroundColor: Colors.bgElevated },
    heroImageBg: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    heroEmoji: { fontSize: 64, opacity: 0.5 },
    heroInfo: {
        backgroundColor: Colors.bgCard,
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    heroTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    heroName: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
    heroCuisine: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
    heroRatingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.brandYellow,
        borderRadius: Radius.sm,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: Colors.brandRed,
    },
    heroStar: { fontSize: 13, color: Colors.brandRed },
    heroRating: { fontSize: 14, fontWeight: '800', color: Colors.brandRed },
    heroMeta: { flexDirection: 'row', gap: 8 },
    heroMetaChip: {
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.full,
        paddingHorizontal: 10,
        paddingVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    heroCoverImg: { width: '100%', height: '100%' },
    heroDesc: {
        fontSize: 12,
        color: Colors.textSecondary,
        lineHeight: 18,
        marginTop: 6,
    },
    openDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.successGreen },
    heroMetaText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
    sectionPad: { paddingHorizontal: 20, marginTop: 16 },
    etaSection: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.md,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.card,
    },
    etaTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
    etaSub: { fontSize: 12, color: Colors.textSecondary, marginBottom: 12 },
    etaOptions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    etaChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: Radius.full,
        backgroundColor: Colors.bgElevated,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    etaChipActive: { backgroundColor: Colors.amberGlow2, borderColor: Colors.brandRed },
    etaChipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
    etaChipTextActive: { color: Colors.brandRed },
    dineRow: { flexDirection: 'row', gap: 10 },
    dineChip: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: Radius.md,
        alignItems: 'center',
        backgroundColor: Colors.bgCard,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    dineChipActive: { backgroundColor: Colors.amberGlow2, borderColor: Colors.brandRed },
    dineText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
    dineTextActive: { color: Colors.brandRed, fontWeight: '700' },
    catTabScroll: { paddingVertical: 12, marginTop: 4 },
    catTab: {
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: Radius.full,
        backgroundColor: Colors.bgCard,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    catTabActive: { backgroundColor: Colors.brandRed, borderColor: Colors.brandRed },
    catTabText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
    catTabTextActive: { color: '#FFFFFF', fontWeight: '700' },
    menuList: { paddingHorizontal: 20, marginTop: 4, gap: 10 },
    menuItem: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.md,
        padding: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.card,
    },
    menuItemSelected: { borderColor: Colors.brandRed, backgroundColor: Colors.amberGlow2 },
    menuItemUnavailable: { opacity: 0.5 },
    bestseller: {
        backgroundColor: Colors.amberGlow,
        borderRadius: Radius.full,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: 'flex-start',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    bestsellerText: { fontSize: 10, color: '#92400E', fontWeight: '700' },
    menuItemInner: { flexDirection: 'row', gap: 12 },
    menuItemInfo: { flex: 1, gap: 5 },
    vegBox: {
        width: 16,
        height: 16,
        borderRadius: 4,
        borderWidth: 1.5,
        backgroundColor: Colors.bgCard,
        alignItems: 'center',
        justifyContent: 'center',
    },
    vegDot: { width: 7, height: 7, borderRadius: 3.5 },
    menuItemName: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textPrimary,
        letterSpacing: -0.2,
    },
    menuItemDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
    menuItemMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    priceBlock: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    menuItemPrice: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
    menuItemPriceStrike: {
        fontSize: 12,
        color: Colors.textSecondary,
        textDecorationLine: 'line-through',
    },
    prepBadge: {
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.full,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    prepText: { fontSize: 10, color: Colors.textSecondary, fontWeight: '600' },
    menuItemRight: { alignItems: 'center', gap: 8 },
    menuImagePlaceholder: {
        width: 72,
        height: 72,
        borderRadius: Radius.sm,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addBtn: {
        backgroundColor: Colors.amberGlow2,
        borderRadius: Radius.sm,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor: Colors.brandRed,
        width: 72,
        alignItems: 'center',
    },
    addBtnText: { fontSize: 12, fontWeight: '800', color: Colors.brandRed },
    qtyControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.brandRed,
        borderRadius: Radius.sm,
        overflow: 'hidden',
        width: 72,
        justifyContent: 'center',
        ...Shadow.amber,
    },
    qtyBtn: { width: 24, height: 30, alignItems: 'center', justifyContent: 'center' },
    qtyBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
    qtyNum: {
        fontSize: 13,
        fontWeight: '800',
        color: '#FFFFFF',
        minWidth: 20,
        textAlign: 'center',
    },
    unavailableText: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontWeight: '600',
        width: 72,
        textAlign: 'center',
    },
    cartBar: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 30 : 16,
        left: 20,
        right: 20,
        backgroundColor: Colors.brandRed,
        borderRadius: Radius.md,
        paddingHorizontal: 18,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...Shadow.amber,
    },
    cartBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    cartBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartBadgeText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
    cartBarLabel: { fontSize: 13, fontWeight: '600', color: '#FFFFFF', opacity: 0.9 },
    cartBarRight: { alignItems: 'flex-end' },
    cartBarTotal: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
    cartBarAction: { fontSize: 11, color: '#FFFFFF', fontWeight: '600', opacity: 0.85 },
});
