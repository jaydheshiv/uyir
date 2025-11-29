import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Edit } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../store/useAppStore';

// Types for API response
interface Subscription {
  subscription_id: string;
  user_id: string;
  professional_id: string;
  status: string;
  amount: number;
  created_at?: string;
}

interface SubscriberPageResponse {
  subscriber_count: number;
  items: Subscription[];
  next_cursor: string | null;
}

const API_BASE_URL = 'http://dev.api.uyir.ai/';

const toNonEmptyString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return null;
};

const normalizeSubscription = (raw: any, index: number): Subscription | null => {
  const userId = toNonEmptyString(raw?.user_id ?? raw?.subscriber_id ?? raw?.subscriberId);
  if (!userId) {
    return null;
  }

  const subscriptionId =
    toNonEmptyString(raw?.subscription_id ?? raw?.id ?? raw?.subscriptionId) ?? `${userId}-${index}`;
  const professionalId =
    toNonEmptyString(raw?.professional_id ?? raw?.professionalId ?? raw?.pro_id ?? raw?.profile_id) ?? '';
  const status = toNonEmptyString(raw?.status ?? raw?.subscription_status ?? raw?.state) ?? 'unknown';
  const createdAt = toNonEmptyString(raw?.created_at ?? raw?.createdAt ?? raw?.timestamp ?? raw?.created);

  const amountRaw = raw?.amount ?? raw?.price ?? raw?.billing_amount ?? raw?.subscription_amount ?? 0;
  const parsedAmount =
    typeof amountRaw === 'number'
      ? amountRaw
      : (() => {
        const numeric = Number(String(amountRaw));
        return Number.isFinite(numeric) ? numeric : 0;
      })();

  return {
    subscription_id: subscriptionId,
    user_id: userId,
    professional_id: professionalId,
    status,
    amount: parsedAmount,
    created_at: createdAt ?? undefined,
  };
};

const parseSubscriberPageResponse = (payload: any): SubscriberPageResponse => {
  const resolveArray = (value: any): any[] => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.items)) return value.items;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.results)) return value.results;
    if (Array.isArray(value?.subscriptions)) return value.subscriptions;
    if (Array.isArray(value?.subscribers)) return value.subscribers;
    return [];
  };

  const rawItems = resolveArray(payload);
  const normalizedItems = rawItems
    .map((item, index) => normalizeSubscription(item, index))
    .filter((item): item is Subscription => Boolean(item));

  const resolvedCount =
    typeof payload?.subscriber_count === 'number'
      ? payload.subscriber_count
      : typeof payload?.count === 'number'
        ? payload.count
        : typeof payload?.total === 'number'
          ? payload.total
          : normalizedItems.length;

  const resolvedCursor =
    toNonEmptyString(payload?.next_cursor ?? payload?.nextCursor ?? payload?.cursor) ?? null;

  return {
    subscriber_count: resolvedCount,
    items: normalizedItems,
    next_cursor: resolvedCursor,
  };
};

const TotalSubscribers: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { token } = useAuth();

  // State management
  const [subscribers, setSubscribers] = useState<Subscription[]>([]);
  const [subscriberCount, setSubscriberCount] = useState<number>(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Fetch subscribers from backend
  const fetchSubscribers = useCallback(async (cursor?: string, isRefresh: boolean = false) => {
    if (!token) {
      Alert.alert('Error', 'Authentication token not found');
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
      return;
    }

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else if (cursor) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const params = new URLSearchParams({ limit: '20' });
      if (cursor) {
        params.append('cursor', cursor);
      }

      const endpoint = `${API_BASE_URL}professional/subscribers?${params.toString()}`;
      console.log('📡 Fetching subscribers from:', endpoint);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📡 Response status:', response.status);
      const rawBody = await response.text();

      if (!response.ok) {
        console.error('❌ Failed to fetch subscribers:', response.status, rawBody);
        Alert.alert('Error', 'Failed to load subscribers');
        return;
      }

      let payload: any = {};
      if (rawBody) {
        try {
          payload = JSON.parse(rawBody);
        } catch (parseError) {
          console.warn('⚠️ Unable to parse subscribers response JSON. Falling back to empty payload.', parseError);
          payload = {};
        }
      }

      const parsed = parseSubscriberPageResponse(payload);
      console.log('✅ Subscribers fetched:', parsed.subscriber_count, 'total subscribers');

      setSubscriberCount(parsed.subscriber_count);

      if (isRefresh || !cursor) {
        setSubscribers(parsed.items);
      } else {
        setSubscribers(prev => [...prev, ...parsed.items]);
      }

      setNextCursor(parsed.next_cursor);
    } catch (error) {
      console.error('❌ Error fetching subscribers:', error);
      Alert.alert('Error', 'Network error while loading subscribers');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [token]);

  // Load subscribers on mount
  useEffect(() => {
    void fetchSubscribers();
  }, [fetchSubscribers]);

  // Handle refresh
  const handleRefresh = () => {
    void fetchSubscribers(undefined, true);
  };

  // Handle load more (pagination)
  const handleLoadMore = () => {
    if (nextCursor && !isLoadingMore) {
      void fetchSubscribers(nextCursor);
    }
  };

  // Get status display text
  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <View style={styles.root}>
      {/* Header with Back Arrow aligned */}
      <View style={styles.headerWrapper}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, styles.headerTitleNoMargin]}>
          All Subscribers {subscriberCount > 0 ? `(${subscriberCount})` : ''}
        </Text>
        <TouchableOpacity style={styles.editBtn}>
          <Edit color="black" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Table */}
      <View style={styles.tableWrapper}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, styles.tableCellFlex1_5]}>User ID</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellFlex1_5]}>Status</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellFlex1]}>Amount</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>Loading subscribers...</Text>
          </View>
        ) : subscribers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No subscribers yet</Text>
          </View>
        ) : (
          <FlatList
            data={subscribers}
            keyExtractor={(item) => item.subscription_id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={['#7C3AED']}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoadingMore ? (
                <View style={styles.loadMoreContainer}>
                  <ActivityIndicator size="small" color="#7C3AED" />
                  <Text style={styles.loadMoreText}>Loading more...</Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => {
              const truncatedUserId = item.user_id.length > 8 ? `${item.user_id.slice(0, 8)}...` : item.user_id;
              const formattedAmount = Number.isFinite(item.amount) ? item.amount.toFixed(2) : '0.00';

              return (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.tableCellFlex1_7]} numberOfLines={1}>
                    {truncatedUserId}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellFlex1_6]}>
                    {getStatusText(item.status)}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellFlex1_3]}>
                    ${formattedAmount}
                  </Text>
                </View>
              );
            }}
          />
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <CustomBottomNav />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 45,
    paddingHorizontal: 12.6,
    paddingBottom: 12.6,
    backgroundColor: '#F7F7F7',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 2.7,
    borderRadius: 16.2,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  editBtn: {
    padding: 2.7,
    borderRadius: 16.2,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  headerTitle: {
    fontSize: 21.6,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Outfit-Bold',
    // Remove negative margin to avoid overlap
  },
  tableWrapper: {
    marginHorizontal: 12.6,
    marginTop: 5.4,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    paddingBottom: 5.4,
    flex: 1,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingVertical: 10.8,
    paddingHorizontal: 12.6,
    backgroundColor: '#fff',
  },
  tableHeaderCell: {
    fontSize: 12.6,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'Outfit-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingVertical: 9.9,
    paddingHorizontal: 12.6,
    backgroundColor: '#fff',
  },
  tableCell: {
    fontSize: 12.6,
    color: '#222',
    fontFamily: 'Outfit-Regular',
  },
  headerTitleNoMargin: {
    marginLeft: 0,
  },
  tableCellFlex1_5: {
    flex: 1.5,
  },
  tableCellFlex2_3: {
    flex: 2.3,
  },
  tableCellFlex1: {
    flex: 1,
  },
  tableCellFlex1_7: {
    flex: 1.7,
  },
  tableCellFlex1_6: {
    flex: 1.6,
  },
  tableCellFlex1_3: {
    flex: 1.3,
  },
  bottomNavContainer: {
    marginBottom: 31.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 28.8,
  },
  loadingText: {
    marginTop: 9,
    fontSize: 12.6,
    color: '#666',
    fontFamily: 'Outfit-Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 28.8,
  },
  emptyText: {
    fontSize: 12.6,
    color: '#666',
    fontFamily: 'Outfit-Regular',
  },
  loadMoreContainer: {
    paddingVertical: 10.8,
    alignItems: 'center',
  },
  loadMoreText: {
    marginTop: 5.4,
    fontSize: 11.7,
    color: '#666',
    fontFamily: 'Outfit-Regular',
  },
});

export default TotalSubscribers;
