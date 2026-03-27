// MenuScreen.tsx — Rodo (Light Theme)

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    StatusBar,
} from 'react-native';
import { Colors, Radius, Shadow } from '../theme/index';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const MENU_CATEGORIES = [
    { id: 'thali', label: '🍱 Thali' },
    { id: 'snacks', label: '🥪 Snacks' },
    { id: 'drinks', label: '☕ Drinks' },
    { id: 'desserts', label: '🍮 Desserts' },
];

const MENU_ITEMS = [
    {
        id: '1',
        category: 'thali',
        name: 'Full Rajasthani Thali',
        desc: 'Dal, Baati, Churma, 3 Sabzi, Rice, Roti',
        price: 180,
        isVeg: true,
        isBestseller: true,
        prepTime: '15 min',
    },
    {
        id: '2',
        category: 'thali',
        name: 'Mini Thali',
        desc: '2 Sabzi, Dal, Rice, 2 Roti',
        price: 120,
        isVeg: true,
        isBestseller: false,
        prepTime: '12 min',
    },
    {
        id: '3',
        category: 'snacks',
        name: 'Samosa (2 pcs)',
        desc: 'Crispy samosa with tamarind chutney',
        price: 30,
        isVeg: true,
        isBestseller: true,
        prepTime: '5 min',
    },
    {
        id: '4',
        category: 'drinks',
        name: 'Masala Chai',
        desc: 'Freshly brewed spiced tea',
        price: 20,
        isVeg: true,
        isBestseller: true,
        prepTime: '3 min',
    },
];

const ETA_OPTIONS = ['30 min', '45 min', '60 min', 'Custom'];

const useCart = () => {
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
        Object.entries(cart).reduce(
            (s, [id, q]) => s + (MENU_ITEMS.find(m => m.id === id)?.price || 0) * q,
            0,
        );
    const count = () => Object.values(cart).reduce((a, b) => a + b, 0);
    return { add, remove, qty, total, count };
};

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

type menuProps = NativeStackScreenProps<RootStackParamList, 'menu'>

export default function MenuScreen({ navigation }: menuProps) {
    const [activeCategory, setActiveCategory] = useState('thali');
    const [selectedETA, setSelectedETA] = useState('30 min');
    const [dineMode, setDineMode] = useState('dine');
    const { add, remove, qty, total, count } = useCart();
    const filteredItems = MENU_ITEMS.filter(m => m.category === activeCategory);

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
                <View style={styles.hero}>
                    <View style={styles.heroImageBg}>
                        <Text style={styles.heroEmoji}>🍽️</Text>
                    </View>
                </View>
                <View style={styles.heroInfo}>
                    <View style={styles.heroTop}>
                        <View>
                            <Text style={styles.heroName}>Shree Dhaba</Text>
                            <Text style={styles.heroCuisine}>North Indian · Thali</Text>
                        </View>
                        <View style={styles.heroRatingBadge}>
                            <Text style={styles.heroStar}>★</Text>
                            <Text style={styles.heroRating}>4.6</Text>
                        </View>
                    </View>
                    <View style={styles.heroMeta}>
                        {['📍 32 km', '⏱ ~28 min'].map(m => (
                            <View key={m} style={styles.heroMetaChip}>
                                <Text style={styles.heroMetaText}>{m}</Text>
                            </View>
                        ))}
                        <View style={[styles.heroMetaChip, { backgroundColor: '#dcfce7' }]}>
                            <View style={styles.openDot} />
                            <Text style={[styles.heroMetaText, { color: Colors.successGreen }]}>
                                Open
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
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.catTabScroll}
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
                >
                    {MENU_CATEGORIES.map(c => (
                        <TouchableOpacity
                            key={c.id}
                            style={[styles.catTab, activeCategory === c.id && styles.catTabActive]}
                            onPress={() => setActiveCategory(c.id)}
                        >
                            <Text
                                style={[
                                    styles.catTabText,
                                    activeCategory === c.id && styles.catTabTextActive,
                                ]}
                            >
                                {c.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Menu items */}
                <View style={styles.menuList}>
                    {filteredItems.map(item => (
                        <View
                            key={item.id}
                            style={[styles.menuItem, qty(item.id) > 0 && styles.menuItemSelected]}
                        >
                            {item.isBestseller && (
                                <View style={styles.bestseller}>
                                    <Text style={styles.bestsellerText}>🏆 Bestseller</Text>
                                </View>
                            )}
                            <View style={styles.menuItemInner}>
                                <View style={styles.menuItemInfo}>
                                    <View
                                        style={[
                                            styles.vegBox,
                                            {
                                                borderColor: item.isVeg
                                                    ? Colors.vegGreen
                                                    : Colors.redPin,
                                            },
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.vegDot,
                                                {
                                                    backgroundColor: item.isVeg
                                                        ? Colors.vegGreen
                                                        : Colors.redPin,
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.menuItemName}>{item.name}</Text>
                                    <Text style={styles.menuItemDesc}>{item.desc}</Text>
                                    <View style={styles.menuItemMeta}>
                                        <Text style={styles.menuItemPrice}>₹{item.price}</Text>
                                        <View style={styles.prepBadge}>
                                            <Text style={styles.prepText}>🧑‍🍳 {item.prepTime}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.menuItemRight}>
                                    <View style={styles.menuImagePlaceholder}>
                                        <Text style={{ fontSize: 28 }}>🍛</Text>
                                    </View>
                                    <QtyControl
                                        qty={qty(item.id)}
                                        onAdd={() => add(item.id)}
                                        onRemove={() => remove(item.id)}
                                    />
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {count() > 0 && (
                <TouchableOpacity style={styles.cartBar} activeOpacity={0.9}>
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
        top: Platform.OS === 'android' ? 44 : 56,
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
        backgroundColor: Colors.amberGlow,
        borderRadius: Radius.sm,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: Colors.borderActive,
    },
    heroStar: { fontSize: 13, color: Colors.amber },
    heroRating: { fontSize: 14, fontWeight: '800', color: Colors.amber },
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
    etaChipActive: { backgroundColor: Colors.amberGlow, borderColor: Colors.amber },
    etaChipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
    etaChipTextActive: { color: Colors.amber },
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
    dineChipActive: { backgroundColor: Colors.amberGlow, borderColor: Colors.amber },
    dineText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
    dineTextActive: { color: Colors.amber, fontWeight: '700' },
    catTabScroll: { paddingVertical: 12, marginTop: 4 },
    catTab: {
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: Radius.full,
        backgroundColor: Colors.bgCard,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    catTabActive: { backgroundColor: Colors.amber, borderColor: Colors.amber },
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
    menuItemSelected: { borderColor: Colors.borderActive, backgroundColor: '#FFFAF6' },
    bestseller: {
        backgroundColor: '#FEF3C7',
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
    menuItemPrice: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
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
        backgroundColor: Colors.amberGlow,
        borderRadius: Radius.sm,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor: Colors.borderActive,
        width: 72,
        alignItems: 'center',
    },
    addBtnText: { fontSize: 12, fontWeight: '800', color: Colors.amber },
    qtyControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.amber,
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
    cartBar: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 30 : 16,
        left: 20,
        right: 20,
        backgroundColor: Colors.amber,
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
