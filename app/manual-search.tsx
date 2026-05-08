/**
 * Manual Search Screen — search for food products by name.
 *
 * Powered by Open Food Facts search API.
 * Shows debounced results with product image, name, brand, quantity, nutriscore.
 * Tapping a product navigates to scan-result with normalized data.
 */

import { AppScreen, SkeletonLoader, TopBar } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { buildScanResultFromSearchProduct, searchProducts } from '@/services/scanService';
import type { SearchProduct } from '@/types/products';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const NUTRISCORE_COLORS: Record<string, string> = {
  a: '#2E7D32', b: '#4CAF50', c: '#FFA000', d: '#E65100', e: '#C62828',
};

export default function ManualSearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce input: wait 350ms after last keystroke
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Fetch results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    let isActive = true;

    const fetchResults = async () => {
      setIsSearching(true);
      setError(null);
      setHasSearched(true);

      try {
        const products = await searchProducts(debouncedQuery);
        if (isActive) setResults(products);
      } catch (err) {
        if (isActive) setError('Search failed. Please try again.');
        console.error('Search error:', err);
      } finally {
        if (isActive) setIsSearching(false);
      }
    };

    fetchResults();
    return () => { isActive = false; };
  }, [debouncedQuery]);

  const handleSelect = (product: SearchProduct) => {
    const result = buildScanResultFromSearchProduct(product, 'lunch');
    router.push({
      pathname: '/scan-result',
      params: {
        foodName: result.foodName,
        mealType: result.mealType,
        source: 'manual',
        resultData: encodeURIComponent(JSON.stringify(result)),
      },
    });
  };

  const renderItem = ({ item }: { item: SearchProduct }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item)}
      style={[styles.resultRow, { borderBottomColor: theme.colors.borderLight }]}
      accessibilityRole="button"
    >
      {/* Thumbnail */}
      <View style={[styles.thumb, { backgroundColor: theme.colors.surfaceSecondary, borderRadius: theme.radius.md }]}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.thumbImg} contentFit="cover" transition={200} />
        ) : (
          <Ionicons name="fast-food-outline" size={22} color={theme.colors.textTertiary} />
        )}
      </View>

      {/* Info */}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium }} numberOfLines={1}>
          {item.productName}
        </Text>
        {item.brand ? (
          <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, marginTop: 2 }} numberOfLines={1}>
            {item.brand}{item.quantity ? ` · ${item.quantity}` : ''}
          </Text>
        ) : null}
      </View>

      {/* Nutri-Score */}
      {item.nutriscoreGrade ? (
        <View style={[styles.nutriscoreBadge, { backgroundColor: NUTRISCORE_COLORS[item.nutriscoreGrade] ?? theme.colors.surfaceSecondary, borderRadius: theme.radius.sm }]}>
          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: theme.fontWeights.bold }}>
            {item.nutriscoreGrade.toUpperCase()}
          </Text>
        </View>
      ) : null}

      <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  );

  return (
    <AppScreen noPadding>
      <TopBar title="Search Food" showBack />
      <View style={{ paddingHorizontal: 20, flex: 1 }}>
        {/* Search Input */}
        <View style={[styles.searchBar, { backgroundColor: theme.colors.surfaceSecondary, borderRadius: theme.radius.md, borderColor: query ? theme.colors.primary : theme.colors.border }]}>
          <Ionicons name="search" size={20} color={theme.colors.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search for a food item..."
            placeholderTextColor={theme.colors.textTertiary}
            style={{ flex: 1, color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, marginLeft: 10 }}
            autoFocus
            returnKeyType="search"
            accessibilityLabel="Search food"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} accessibilityRole="button">
              <Ionicons name="close-circle" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Loading skeleton */}
        {isSearching && (
          <View style={{ paddingTop: 8 }}>
            <SkeletonLoader rows={4} />
          </View>
        )}

        {/* Error state */}
        {!isSearching && error && (
          <View style={styles.stateContainer}>
            <Ionicons name="cloud-offline-outline" size={40} color={theme.colors.caution.icon} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, marginTop: 12, textAlign: 'center' }}>
              {error}
            </Text>
            <TouchableOpacity
              onPress={() => setDebouncedQuery(query.trim())}
              style={[styles.retryBtn, { borderColor: theme.colors.border, borderRadius: theme.radius.md }]}
            >
              <Ionicons name="refresh" size={18} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.primary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium, marginLeft: 6 }}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty state (searched but no results) */}
        {!isSearching && !error && hasSearched && results.length === 0 && (
          <View style={styles.stateContainer}>
            <Ionicons name="search-outline" size={40} color={theme.colors.textTertiary} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, marginTop: 12, textAlign: 'center' }}>
              No products found for "{debouncedQuery}"
            </Text>
            <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, marginTop: 4, textAlign: 'center' }}>
              Try a different search term
            </Text>
          </View>
        )}

        {/* Results */}
        {!isSearching && results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}

        {/* Initial prompt */}
        {!hasSearched && !query.trim() && (
          <View style={styles.stateContainer}>
            <Ionicons name="search-outline" size={48} color={theme.colors.textTertiary} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, marginTop: 12, textAlign: 'center' }}>
              Search for a food product from{'\n'}Open Food Facts database
            </Text>
          </View>
        )}

        {/* Attribution */}
        <View style={styles.attribution}>
          <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs, textAlign: 'center', lineHeight: 14 }}>
            Product data from Open Food Facts ({results.length > 0 ? `${results.length} results` : ''})
          </Text>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, marginTop: 8, marginBottom: 12 },
  resultRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  thumb: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%' },
  nutriscoreBadge: { width: 26, height: 26, justifyContent: 'center', alignItems: 'center' },
  stateContainer: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 20 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, marginTop: 16 },
  attribution: { paddingVertical: 12 },
});
