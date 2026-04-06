import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Switch,
    Platform,
} from 'react-native';
import { Colors, Radius, Shadow } from '@theme/index';
import { useNavigation } from '@react-navigation/native';
import { MenuItem } from '../types/MenuItem';

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_MENU: (MenuItem & { _id: string })[] = [
    {
        _id: 'm1',
        restaurant: 'r1',
        name: 'Chicken Tikka',
        category: 'Starters',
        description: 'Marinated chicken chunks grilled in tandoor',
        price: 220,
        discountedPrice: 199,
        foodType: 'non-veg',
        isAvailable: true,
        isPopular: true,
        preparationTime: 15,
        tags: ['Bestseller', 'Spicy'],
        sortOrder: 1,
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2025-04-01T00:00:00Z',
    },
    {
        _id: 'm2',
        restaurant: 'r1',
        name: 'Veg Manchurian',
        category: 'Starters',
        description: 'Crispy veg balls in spicy manchurian sauce',
        price: 160,
        foodType: 'veg',
        isAvailable: true,
        isPopular: false,
        preparationTime: 12,
        tags: ['Veg'],
        sortOrder: 2,
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2025-04-01T00:00:00Z',
    },
    {
        _id: 'm3',
        restaurant: 'r1',
        name: 'Mutton Biryani',
        category: 'Biryani',
        description: 'Slow-cooked dum biryani with tender mutton',
        price: 320,
        foodType: 'non-veg',
        isAvailable: true,
        isPopular: true,
        preparationTime: 30,
        tags: ['Bestseller', 'Chef Special'],
        sortOrder: 3,
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2025-04-01T00:00:00Z',
    },
    {
        _id: 'm4',
        restaurant: 'r1',
        name: 'Veg Biryani',
        category: 'Biryani',
        description: 'Fragrant basmati with seasonal vegetables',
        price: 200,
        foodType: 'veg',
        isAvailable: false,
        isPopular: false,
        preparationTime: 25,
        sortOrder: 4,
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2025-04-01T00:00:00Z',
    },
    {
        _id: 'm5',
        restaurant: 'r1',
        name: 'BBQ Platter',
        category: 'Mains',
        description: 'Mixed grill platter with chicken, seekh, paneer',
        price: 550,
        foodType: 'non-veg',
        isAvailable: true,
        isPopular: true,
        preparationTime: 20,
        tags: ['Bestseller'],
        sortOrder: 5,
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2025-04-01T00:00:00Z',
    },
    {
        _id: 'm6',
        restaurant: 'r1',
        name: 'Dal Tadka',
        category: 'Mains',
        description: 'Yellow lentils tempered with ghee and spices',
        price: 150,
        foodType: 'veg',
        isAvailable: true,
        isPopular: false,
        preparationTime: 15,
        sortOrder: 6,
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2025-04-01T00:00:00Z',
    },
    {
        _id: 'm7',
        restaurant: 'r1',
        name: 'Butter Naan',
        category: 'Breads',
        price: 40,
        foodType: 'veg',
        isAvailable: true,
        isPopular: false,
        preparationTime: 8,
        sortOrder: 7,
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2025-04-01T00:00:00Z',
    },
    {
        _id: 'm8',
        restaurant: 'r1',
        name: 'Cold Coffee',
        category: 'Beverages',
        price: 80,
        foodType: 'veg',
        isAvailable: true,
        isPopular: false,
        preparationTime: 5,
        sortOrder: 8,
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2025-04-01T00:00:00Z',
    },
];

const FOOD_DOT: Record<string, string> = {
    veg: '#16A34A',
    'non-veg': '#D61A1A',
    egg: '#D97706',
};

// ─── Sub-components ──────────────────────────────────────────────────────────
function FoodTypeDot({ type }: { type: string }) {
    return (
        <View style={[styles.foodDotOuter, { borderColor: FOOD_DOT[type] }]}>
            <View style={[styles.foodDotInner, { backgroundColor: FOOD_DOT[type] }]} />
        </View>
    );
}

function MenuCard({
    item,
    onToggleAvailability,
    onPress,
}: {
    item: (typeof MOCK_MENU)[0];
    onToggleAvailability: (id: string, val: boolean) => void;
    onPress: () => void;
}) {
    const discount = item.discountedPrice
        ? Math.round(((item.price - item.discountedPrice) / item.price) * 100)
        : 0;

    return (
        <TouchableOpacity style={styles.menuCard} onPress={onPress} activeOpacity={0.85}>
            <View style={styles.menuCardTop}>
                {/* Image placeholder */}
                <View style={styles.menuImgPlaceholder}>
                    <Text style={{ fontSize: 28 }}>
                        {item.foodType === 'veg' ? '🥗' : item.foodType === 'egg' ? '🥚' : '🍗'}
                    </Text>
                </View>

                <View style={styles.menuInfo}>
                    {/* Name + food dot */}
                    <View style={styles.menuNameRow}>
                        <FoodTypeDot type={item.foodType} />
                        <Text style={styles.menuName} numberOfLines={1}>
                            {item.name}
                        </Text>
                        {item.isPopular && (
                            <View style={styles.popularBadge}>
                                <Text style={styles.popularText}>⭐ Popular</Text>
                            </View>
                        )}
                    </View>

                    {/* Category */}
                    <Text style={styles.menuCategory}>{item.category}</Text>

                    {/* Description */}
                    {item.description && (
                        <Text style={styles.menuDesc} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}

                    {/* Price row */}
                    <View style={styles.menuPriceRow}>
                        {item.discountedPrice ? (
                            <>
                                <Text style={styles.menuPriceActual}>₹{item.discountedPrice}</Text>
                                <Text style={styles.menuPriceMRP}>₹{item.price}</Text>
                                <View style={styles.discountBadge}>
                                    <Text style={styles.discountText}>{discount}% off</Text>
                                </View>
                            </>
                        ) : (
                            <Text style={styles.menuPriceActual}>₹{item.price}</Text>
                        )}
                    </View>

                    {/* Prep time + tags */}
                    <View style={styles.menuMetaRow}>
                        <Text style={styles.menuMeta}>⏱ {item.preparationTime}m</Text>
                        {item.tags?.slice(0, 2).map(t => (
                            <View key={t} style={styles.tagPill}>
                                <Text style={styles.tagText}>{t}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            {/* Footer: availability toggle */}
            <View style={styles.menuCardFooter}>
                <Text style={[styles.availLabel, !item.isAvailable && styles.availLabelOff]}>
                    {item.isAvailable ? '✅ Available' : '❌ Unavailable'}
                </Text>
                <Switch
                    value={item.isAvailable}
                    onValueChange={v => onToggleAvailability(item._id, v)}
                    trackColor={{ false: '#FECACA', true: '#86EFAC' }}
                    thumbColor={item.isAvailable ? Colors.successGreen : '#EF4444'}
                />
            </View>
        </TouchableOpacity>
    );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function OwnerMenuScreen() {
    const navigation = useNavigation<any>();
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [menuItems, setMenuItems] = useState(MOCK_MENU);

    const categories = useMemo(() => {
        const cats = Array.from(new Set(MOCK_MENU.map(m => m.category)));
        return ['All', ...cats];
    }, []);

    const filtered = useMemo(() => {
        let list = menuItems;
        if (activeCategory !== 'All') list = list.filter(m => m.category === activeCategory);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                m => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q),
            );
        }
        return list;
    }, [menuItems, activeCategory, search]);

    const toggleAvailability = (id: string, val: boolean) => {
        setMenuItems(prev => prev.map(m => (m._id === id ? { ...m, isAvailable: val } : m)));
    };

    const available = menuItems.filter(m => m.isAvailable).length;
    const unavailable = menuItems.length - available;

    return (
        <View style={styles.root}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Menu</Text>
                    <Text style={styles.headerSub}>
                        {available} available · {unavailable} unavailable
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => navigation.navigate('AddMenuItem')}
                >
                    <Text style={styles.addBtnText}>+ Add Item</Text>
                </TouchableOpacity>
            </View>

            {/* ── Search ── */}
            <View style={styles.searchWrap}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search menu items…"
                    placeholderTextColor={Colors.textMuted}
                    value={search}
                    onChangeText={setSearch}
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')}>
                        <Text style={styles.searchClear}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* ── Category tabs ── */}
            <FlatList
                horizontal
                data={categories}
                keyExtractor={c => c}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.catTabs}
                renderItem={({ item: cat }) => (
                    <TouchableOpacity
                        style={[styles.catTab, activeCategory === cat && styles.catTabActive]}
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
                )}
            />

            {/* ── List ── */}
            <FlatList
                data={filtered}
                keyExtractor={m => m._id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>🍽</Text>
                        <Text style={styles.emptyText}>No items found</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <MenuCard
                        item={item}
                        onToggleAvailability={toggleAvailability}
                        onPress={() => navigation.navigate('AddMenuItem', { item })}
                    />
                )}
            />
        </View>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },

    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 28 : 60,
        paddingBottom: 14,
        backgroundColor: Colors.bg,
    },
    headerTitle: { fontSize: 26, fontWeight: '900', color: Colors.textPrimary },
    headerSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
    addBtn: {
        backgroundColor: Colors.amber,
        borderRadius: Radius.md,
        paddingHorizontal: 16,
        paddingVertical: 10,
        ...Shadow.amber,
    },
    addBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },

    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        marginHorizontal: 20,
        marginBottom: 12,
        paddingHorizontal: 14,
        ...Shadow.card,
    },
    searchIcon: { fontSize: 14, marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: Colors.textPrimary },
    searchClear: { fontSize: 12, color: Colors.textMuted, padding: 4 },

    catTabs: { paddingHorizontal: 20, gap: 8, marginBottom: 12 },
    catTab: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: Radius.full,
        backgroundColor: Colors.bgCard,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    catTabActive: { backgroundColor: Colors.amber, borderColor: Colors.amber },
    catTabText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
    catTabTextActive: { color: '#fff' },

    list: { paddingHorizontal: 20, gap: 12, paddingBottom: 100 },

    // Menu card
    menuCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
        ...Shadow.card,
    },
    menuCardTop: { flexDirection: 'row', padding: 14, gap: 12 },
    menuImgPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: Radius.md,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    menuInfo: { flex: 1, gap: 4 },
    menuNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    menuName: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary, flex: 1 },
    menuCategory: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
    menuDesc: { fontSize: 11, color: Colors.textSecondary, lineHeight: 16 },

    menuPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    menuPriceActual: { fontSize: 16, fontWeight: '900', color: Colors.textPrimary },
    menuPriceMRP: { fontSize: 12, color: Colors.textMuted, textDecorationLine: 'line-through' },
    discountBadge: {
        backgroundColor: '#DCFCE7',
        borderRadius: Radius.full,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    discountText: { fontSize: 10, fontWeight: '700', color: Colors.successGreen },

    menuMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    menuMeta: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
    tagPill: {
        backgroundColor: Colors.amberGlow,
        borderRadius: Radius.full,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    tagText: { fontSize: 9, fontWeight: '700', color: Colors.textSecondary },

    menuCardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: Colors.bgInput,
    },
    availLabel: { fontSize: 12, fontWeight: '700', color: Colors.successGreen },
    availLabelOff: { color: '#EF4444' },

    // Food type dot
    foodDotOuter: {
        width: 14,
        height: 14,
        borderRadius: 3,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    foodDotInner: { width: 6, height: 6, borderRadius: 1.5 },

    // Popular badge
    popularBadge: {
        backgroundColor: Colors.amberGlow,
        borderRadius: Radius.full,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    popularText: { fontSize: 9, fontWeight: '700', color: Colors.textSecondary },

    // Empty state
    emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
    emptyEmoji: { fontSize: 44 },
    emptyText: { fontSize: 15, color: Colors.textMuted, fontWeight: '600' },
});
