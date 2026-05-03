/**
 * Manual Search Screen — search for food items by name.
 *
 * Shows recent searches, a search input, and searchable food results.
 * Presented as a modal from the Scan tab.
 */

import { AppScreen, TopBar } from '@/components/ui';
import { MOCK_RECENT_SEARCHES, MOCK_SEARCH_RESULTS, type SearchFoodItem } from '@/data/mockData';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ManualSearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const results = query.trim().length > 0
    ? MOCK_SEARCH_RESULTS.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleSelect = (item: SearchFoodItem) => {
    router.replace({
      pathname: '/scan-preview',
      params: { source: 'manual', foodName: item.name },
    });
  };

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
            accessibilityLabel="Search food"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} accessibilityRole="button">
              <Ionicons name="close-circle" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Recent Searches */}
        {query.trim().length === 0 && (
          <View style={styles.recents}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, marginBottom: 10 }}>
              Recent Searches
            </Text>
            {MOCK_RECENT_SEARCHES.map((s) => (
              <TouchableOpacity key={s} onPress={() => setQuery(s)} style={styles.recentRow} accessibilityRole="button">
                <Ionicons name="time-outline" size={18} color={theme.colors.textTertiary} />
                <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, marginLeft: 10, flex: 1 }}>
                  {s}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Results */}
        {query.trim().length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptySearch}>
                <Ionicons name="search-outline" size={40} color={theme.colors.textTertiary} />
                <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.body, marginTop: 12, textAlign: 'center' }}>
                  No results for "{query}"
                </Text>
                <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, marginTop: 4, textAlign: 'center' }}>
                  Try a different search term
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelect(item)} style={[styles.resultRow, { borderBottomColor: theme.colors.borderLight }]} accessibilityRole="button">
                <View style={[styles.foodIcon, { backgroundColor: theme.colors.surfaceSecondary }]}>
                  <Ionicons name="nutrition-outline" size={20} color={theme.colors.textSecondary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.body, fontWeight: theme.fontWeights.medium }}>
                    {item.name}
                  </Text>
                  <Text style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm, marginTop: 2 }}>
                    {item.brand} · {item.calories} kcal
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, marginBottom: 16 },
  recents: { marginTop: 8 },
  recentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.06)' },
  resultRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  foodIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  emptySearch: { alignItems: 'center', paddingTop: 60 },
});
