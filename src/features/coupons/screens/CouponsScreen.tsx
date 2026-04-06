import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Platform,
    Modal,
    TextInput,
    Switch,
    ScrollView,
} from 'react-native';
import { Colors, Radius, Shadow } from '@theme/index';
import { Coupon, ApplicableTo, DiscountType } from '../types/Coupons';

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_COUPONS: (Coupon & { _id: string })[] = [
    {
        _id: 'cp1',
        code: 'HIGHWAY50',
        description: '₹50 off on orders above ₹300',
        discountType: 'flat',
        discountValue: 50,
        minOrderAmount: 300,
        maxDiscountAmount: 50,
        applicableTo: 'restaurant',
        usageLimit: 100,
        usageCount: 68,
        perUserLimit: 1,
        validFrom: '2025-04-01T00:00:00Z',
        validUntil: '2025-04-30T23:59:59Z',
        isActive: true,
        createdAt: '2025-04-01T00:00:00Z',
        updatedAt: '2025-04-01T00:00:00Z',
    },
    {
        _id: 'cp2',
        code: 'RODO10',
        description: '10% off, max ₹80',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscountAmount: 80,
        minOrderAmount: 200,
        applicableTo: 'all',
        usageLimit: 500,
        usageCount: 312,
        perUserLimit: 2,
        validFrom: '2025-03-01T00:00:00Z',
        validUntil: '2025-06-30T23:59:59Z',
        isActive: true,
        createdAt: '2025-03-01T00:00:00Z',
        updatedAt: '2025-03-01T00:00:00Z',
    },
    {
        _id: 'cp3',
        code: 'BIRYANI20',
        description: '20% off on biryani orders',
        discountType: 'percentage',
        discountValue: 20,
        maxDiscountAmount: 100,
        minOrderAmount: 250,
        applicableTo: 'restaurant',
        usageLimit: 200,
        usageCount: 200,
        perUserLimit: 1,
        validFrom: '2025-01-01T00:00:00Z',
        validUntil: '2025-03-31T23:59:59Z',
        isActive: false,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-03-31T00:00:00Z',
    },
    {
        _id: 'cp4',
        code: 'WELCOME100',
        description: '₹100 off for new customers',
        discountType: 'flat',
        discountValue: 100,
        minOrderAmount: 400,
        applicableTo: 'all',
        usageLimit: 1000,
        usageCount: 45,
        perUserLimit: 1,
        validFrom: '2025-04-06T00:00:00Z',
        validUntil: '2025-12-31T23:59:59Z',
        isActive: true,
        createdAt: '2025-04-06T00:00:00Z',
        updatedAt: '2025-04-06T00:00:00Z',
    },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function isExpired(validUntil: string) {
    return new Date(validUntil) < new Date();
}

const APPLICABLE_ICONS: Record<ApplicableTo, string> = {
    all: '🌐',
    restaurant: '🏪',
    route: '🛣',
};

// ─── Coupon Card ─────────────────────────────────────────────────────────────
function CouponCard({
    coupon,
    onToggle,
}: {
    coupon: Coupon & { _id: string };
    onToggle: (id: string, val: boolean) => void;
}) {
    const expired = isExpired(coupon.validUntil);
    const usage = coupon.usageLimit ? (coupon.usageCount / coupon.usageLimit) * 100 : 0;
    const exhausted = coupon.usageLimit && coupon.usageCount >= coupon.usageLimit;

    return (
        <View style={[styles.couponCard, (!coupon.isActive || expired) && styles.couponCardDim]}>
            {/* Coupon strip left */}
            <View
                style={[
                    styles.couponStrip,
                    {
                        backgroundColor:
                            coupon.isActive && !expired ? Colors.amber : Colors.textMuted,
                    },
                ]}
            >
                <Text style={styles.couponStripText}>
                    {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}%`
                        : `₹${coupon.discountValue}`}
                </Text>
                <Text style={styles.couponStripOff}>OFF</Text>
            </View>

            {/* Content */}
            <View style={styles.couponContent}>
                {/* Code row */}
                <View style={styles.couponCodeRow}>
                    <View style={styles.couponCodeBox}>
                        <Text style={styles.couponCode}>{coupon.code}</Text>
                    </View>
                    <View
                        style={[
                            styles.couponStatus,
                            expired
                                ? styles.couponStatusExpired
                                : exhausted
                                ? styles.couponStatusExhausted
                                : coupon.isActive
                                ? styles.couponStatusActive
                                : styles.couponStatusOff,
                        ]}
                    >
                        <Text style={styles.couponStatusText}>
                            {expired
                                ? '⌛ Expired'
                                : exhausted
                                ? '🔴 Exhausted'
                                : coupon.isActive
                                ? '🟢 Active'
                                : '⭕ Inactive'}
                        </Text>
                    </View>
                </View>

                {/* Description */}
                {coupon.description && <Text style={styles.couponDesc}>{coupon.description}</Text>}

                {/* Info chips */}
                <View style={styles.chipRow}>
                    <Text style={styles.chip}>💰 Min ₹{coupon.minOrderAmount}</Text>
                    {coupon.maxDiscountAmount && (
                        <Text style={styles.chip}>🔝 Max ₹{coupon.maxDiscountAmount}</Text>
                    )}
                    <Text style={styles.chip}>
                        {APPLICABLE_ICONS[coupon.applicableTo]} {coupon.applicableTo}
                    </Text>
                    <Text style={styles.chip}>👤 ×{coupon.perUserLimit}/user</Text>
                </View>

                {/* Usage bar */}
                {coupon.usageLimit && (
                    <View style={styles.usageWrap}>
                        <View style={styles.usageBar}>
                            <View
                                style={[
                                    styles.usageFill,
                                    {
                                        width: `${Math.min(usage, 100)}%`,
                                        backgroundColor:
                                            usage >= 100
                                                ? '#EF4444'
                                                : usage > 70
                                                ? '#D97706'
                                                : Colors.successGreen,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.usageText}>
                            {coupon.usageCount}/{coupon.usageLimit} used
                        </Text>
                    </View>
                )}

                {/* Validity */}
                <Text style={styles.validity}>
                    📅 {formatDate(coupon.validFrom)} → {formatDate(coupon.validUntil)}
                </Text>

                {/* Toggle */}
                {!expired && !exhausted && (
                    <View style={styles.couponFooter}>
                        <Text style={styles.toggleLabel}>
                            {coupon.isActive ? 'Active' : 'Inactive'}
                        </Text>
                        <Switch
                            value={coupon.isActive}
                            onValueChange={v => onToggle(coupon._id, v)}
                            trackColor={{ false: '#FECACA', true: '#86EFAC' }}
                            thumbColor={coupon.isActive ? Colors.successGreen : '#EF4444'}
                        />
                    </View>
                )}
            </View>
        </View>
    );
}

// ─── Add Coupon Modal ─────────────────────────────────────────────────────────
function AddCouponModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    const [code, setCode] = useState('');
    const [desc, setDesc] = useState('');
    const [discountType, setDiscountType] = useState<DiscountType>('flat');
    const [discountValue, setDiscountValue] = useState('');
    const [maxDiscount, setMaxDiscount] = useState('');
    const [minOrder, setMinOrder] = useState('');
    const [usageLimit, setUsageLimit] = useState('');
    const [perUserLimit, setPerUserLimit] = useState('1');
    const [validFrom, setValidFrom] = useState('');
    const [validUntil, setValidUntil] = useState('');

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.modalRoot}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>New Coupon</Text>
                    <TouchableOpacity style={styles.modalClose} onPress={onClose}>
                        <Text style={styles.modalCloseText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.modalContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Code */}
                    <View style={styles.modalField}>
                        <Text style={styles.modalLabel}>Coupon Code *</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={code}
                            onChangeText={t => setCode(t.toUpperCase())}
                            placeholder="e.g. SAVE50"
                            placeholderTextColor={Colors.textMuted}
                            autoCapitalize="characters"
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.modalField}>
                        <Text style={styles.modalLabel}>Description</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={desc}
                            onChangeText={setDesc}
                            placeholder="Short description shown to customer"
                            placeholderTextColor={Colors.textMuted}
                        />
                    </View>

                    {/* Discount type */}
                    <View style={styles.modalField}>
                        <Text style={styles.modalLabel}>Discount Type *</Text>
                        <View style={styles.typeRow}>
                            {(['flat', 'percentage'] as DiscountType[]).map(dt => (
                                <TouchableOpacity
                                    key={dt}
                                    style={[
                                        styles.typeChip,
                                        discountType === dt && styles.typeChipActive,
                                    ]}
                                    onPress={() => setDiscountType(dt)}
                                >
                                    <Text
                                        style={[
                                            styles.typeChipText,
                                            discountType === dt && styles.typeChipTextActive,
                                        ]}
                                    >
                                        {dt === 'flat' ? '₹ Flat Amount' : '% Percentage'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Values row */}
                    <View style={styles.row2}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.modalLabel}>Discount Value *</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={discountValue}
                                onChangeText={setDiscountValue}
                                placeholder={discountType === 'flat' ? '50' : '10'}
                                keyboardType="numeric"
                                placeholderTextColor={Colors.textMuted}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.modalLabel}>Max Discount (₹)</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={maxDiscount}
                                onChangeText={setMaxDiscount}
                                placeholder="Optional"
                                keyboardType="numeric"
                                placeholderTextColor={Colors.textMuted}
                            />
                        </View>
                    </View>

                    {/* Min order */}
                    <View style={styles.row2}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.modalLabel}>Min Order (₹) *</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={minOrder}
                                onChangeText={setMinOrder}
                                placeholder="200"
                                keyboardType="numeric"
                                placeholderTextColor={Colors.textMuted}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.modalLabel}>Per User Limit</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={perUserLimit}
                                onChangeText={setPerUserLimit}
                                placeholder="1"
                                keyboardType="numeric"
                                placeholderTextColor={Colors.textMuted}
                            />
                        </View>
                    </View>

                    {/* Usage limit */}
                    <View style={styles.modalField}>
                        <Text style={styles.modalLabel}>Total Usage Limit</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={usageLimit}
                            onChangeText={setUsageLimit}
                            placeholder="Leave blank for unlimited"
                            keyboardType="numeric"
                            placeholderTextColor={Colors.textMuted}
                        />
                    </View>

                    {/* Dates */}
                    <View style={styles.row2}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.modalLabel}>Valid From *</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={validFrom}
                                onChangeText={setValidFrom}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={Colors.textMuted}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.modalLabel}>Valid Until *</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={validUntil}
                                onChangeText={setValidUntil}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={Colors.textMuted}
                            />
                        </View>
                    </View>

                    <TouchableOpacity style={styles.saveBtn} onPress={onClose}>
                        <Text style={styles.saveBtnText}>Create Coupon →</Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </Modal>
    );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function CouponsScreen() {
    const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
    const [coupons, setCoupons] = useState(MOCK_COUPONS);
    const [showModal, setShowModal] = useState(false);

    const filtered = useMemo(() => {
        if (filter === 'active') return coupons.filter(c => c.isActive && !isExpired(c.validUntil));
        if (filter === 'expired')
            return coupons.filter(c => !c.isActive || isExpired(c.validUntil));
        return coupons;
    }, [coupons, filter]);

    const toggleCoupon = (id: string, val: boolean) => {
        setCoupons(prev => prev.map(c => (c._id === id ? { ...c, isActive: val } : c)));
    };

    const activeCount = coupons.filter(c => c.isActive && !isExpired(c.validUntil)).length;
    const expiredCount = coupons.filter(c => !c.isActive || isExpired(c.validUntil)).length;

    return (
        <View style={styles.root}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Coupons</Text>
                    <Text style={styles.headerSub}>
                        {activeCount} active · {expiredCount} inactive/expired
                    </Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
                    <Text style={styles.addBtnText}>+ New</Text>
                </TouchableOpacity>
            </View>

            {/* ── Filter tabs ── */}
            <View style={styles.filterRow}>
                {(['all', 'active', 'expired'] as const).map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterTab, filter === f && styles.filterTabActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text
                            style={[
                                styles.filterTabText,
                                filter === f && styles.filterTabTextActive,
                            ]}
                        >
                            {f === 'all' ? '🏷 All' : f === 'active' ? '🟢 Active' : '⌛ Expired'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── List ── */}
            <FlatList
                data={filtered}
                keyExtractor={c => c._id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>🏷</Text>
                        <Text style={styles.emptyText}>No coupons found</Text>
                    </View>
                }
                renderItem={({ item }) => <CouponCard coupon={item} onToggle={toggleCoupon} />}
            />

            <AddCouponModal visible={showModal} onClose={() => setShowModal(false)} />
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

    filterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 14 },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: Radius.full,
        backgroundColor: Colors.bgCard,
        borderWidth: 1.5,
        borderColor: Colors.border,
    },
    filterTabActive: { backgroundColor: Colors.amberGlow, borderColor: Colors.amber },
    filterTabText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
    filterTabTextActive: { color: Colors.textPrimary, fontWeight: '800' },

    list: { paddingHorizontal: 20, gap: 14, paddingBottom: 100 },

    // Coupon card
    couponCard: {
        flexDirection: 'row',
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
        ...Shadow.card,
    },
    couponCardDim: { opacity: 0.65 },
    couponStrip: {
        width: 60,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 2,
    },
    couponStripText: { fontSize: 16, fontWeight: '900', color: '#fff' },
    couponStripOff: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.8)' },

    couponContent: { flex: 1, padding: 12, gap: 8 },

    couponCodeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    couponCodeBox: {
        backgroundColor: Colors.amberGlow,
        borderRadius: Radius.sm,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: Colors.borderActive,
        borderStyle: 'dashed',
    },
    couponCode: { fontSize: 14, fontWeight: '900', color: Colors.textPrimary, letterSpacing: 1 },

    couponStatus: { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
    couponStatusActive: { backgroundColor: '#DCFCE7' },
    couponStatusOff: { backgroundColor: Colors.bgElevated },
    couponStatusExpired: { backgroundColor: '#FEE2E2' },
    couponStatusExhausted: { backgroundColor: '#FEE2E2' },
    couponStatusText: { fontSize: 10, fontWeight: '700', color: Colors.textPrimary },

    couponDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },

    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
    chip: {
        fontSize: 10,
        fontWeight: '600',
        color: Colors.textSecondary,
        backgroundColor: Colors.bgInput,
        borderRadius: Radius.full,
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    usageWrap: { gap: 4 },
    usageBar: {
        height: 4,
        backgroundColor: Colors.bgElevated,
        borderRadius: 2,
        overflow: 'hidden',
    },
    usageFill: { height: '100%', borderRadius: 2 },
    usageText: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },

    validity: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },

    couponFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: 8,
    },
    toggleLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },

    // Modal
    modalRoot: { flex: 1, backgroundColor: Colors.bg },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalTitle: { fontSize: 20, fontWeight: '900', color: Colors.textPrimary },
    modalClose: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCloseText: { fontSize: 14, color: Colors.textPrimary, fontWeight: '700' },

    modalContent: { paddingHorizontal: 20, paddingTop: 20, gap: 14 },

    modalField: { gap: 6 },
    modalLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    modalInput: {
        backgroundColor: Colors.bgInput,
        borderRadius: Radius.md,
        borderWidth: 1.5,
        borderColor: Colors.border,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: Colors.textPrimary,
        fontWeight: '600',
    },

    row2: { flexDirection: 'row', gap: 12 },

    typeRow: { flexDirection: 'row', gap: 10 },
    typeChip: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: Radius.md,
        borderWidth: 2,
        borderColor: Colors.border,
        alignItems: 'center',
        backgroundColor: Colors.bgInput,
    },
    typeChipActive: { borderColor: Colors.amber, backgroundColor: Colors.amberGlow },
    typeChipText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
    typeChipTextActive: { color: Colors.textPrimary },

    saveBtn: {
        backgroundColor: Colors.amber,
        borderRadius: Radius.md,
        paddingVertical: 16,
        alignItems: 'center',
        ...Shadow.amber,
        marginTop: 8,
    },
    saveBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },

    emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
    emptyEmoji: { fontSize: 44 },
    emptyText: { fontSize: 15, color: Colors.textMuted, fontWeight: '600' },
});
