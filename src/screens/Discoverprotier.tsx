import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ListRenderItemInfo,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import CustomBottomNav from "../components/CustomBottomNav";
import { useAuth } from "../store/useAppStore";
import { useTheme } from "../theme/ThemeContext";

interface Professional {
  id: number;
  user_id: number;
  professional_id?: string;
  display_name: string;
  bio?: string;
  specialization?: string;
  tags?: string[];
  tagSlugs?: string[];
  primaryTagName?: string | null;
  primaryTagSlug?: string | null;
  profile_image_url?: string;
  cover_image_url?: string;
  subscriber_count?: number;
  is_verified?: boolean;
}

// Tags from backend (same shape as used in LetUsKnowYou.tsx)
interface Tag {
  tag_id: string;
  name: string;
  slug: string;
  tag_type: "domain" | "sub_specialization";
  parent_id: string | null;
  is_active: boolean;
}

const DOMAIN_FILTERS = [
  { name: "Career guidance", slug: "career-guidance" },
  { name: "Creative coaching", slug: "creative-coaching" },
  { name: "Financial planning", slug: "financial-planning" },
  { name: "Fitness and physical health", slug: "fitness-and-physical-health" },
  { name: "Motivational speaking", slug: "motivational-speaking" },
] as const;

const DOMAIN_FILTER_SLUG_SET = new Set<string>(DOMAIN_FILTERS.map((domain) => domain.slug));

const buildFallbackDomainTags = (): Tag[] =>
  DOMAIN_FILTERS.map((domain) => ({
    tag_id: domain.slug,
    name: domain.name,
    slug: domain.slug,
    tag_type: "domain" as "domain", // ensure correct type
    parent_id: null,
    is_active: true,
  }));

type ProfessionalTagInfo = {
  slug: string;
  name: string;
};

type CategoryOption = {
  name: string;
  tag: string | null;
};

const normalizeTagSlug = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  const sanitized = trimmed.replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
  const collapsed = sanitized.replace(/--+/g, "-").replace(/^-+|-+$/g, "");
  return collapsed || null;
};

const formatTagDisplayName = (value: string | null | undefined): string => {
  if (!value) return "";
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
};

export default function Discoverprotier() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<any>>();
  const { theme } = useTheme();
  const { token } = useAuth();

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [rawProfessionals, setRawProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [domainTags, setDomainTags] = useState<Tag[]>(() => buildFallbackDomainTags());
  const [specializationTags, setSpecializationTags] = useState<Tag[]>([]);
  const [professionalTagMap, setProfessionalTagMap] = useState<Record<string, ProfessionalTagInfo[]>>({});
  const inFlightRef = useRef<{ aborter?: AbortController } | null>({});
  const categoryScrollRef = useRef<FlatList<CategoryOption> | null>(null);
  const pillLayoutsRef = useRef<Array<{ x: number; width: number }>>([]);
  const searchInputRef = useRef<TextInput | null>(null);

  const backendUrl = 'http://dev.api.uyir.ai:8081';

  const normalizedActiveCategory = useMemo(
    () => normalizeTagSlug(activeCategory ?? undefined),
    [activeCategory],
  );

  const knownTagLookup = useMemo(() => {
    const bySlug = new Map<string, Tag>();
    const byId = new Map<string, Tag>();

    const registerTag = (tag: Tag | null | undefined) => {
      if (!tag) return;
      const explicitSlug = normalizeTagSlug(tag.slug);
      if (explicitSlug) {
        bySlug.set(explicitSlug, tag);
      }

      if (tag.name) {
        const nameSlug = normalizeTagSlug(tag.name);
        if (nameSlug) {
          bySlug.set(nameSlug, tag);
        }
      }

      if (tag.tag_id !== undefined && tag.tag_id !== null) {
        byId.set(String(tag.tag_id), tag);
      }
    };

    domainTags.forEach(registerTag);
    specializationTags.forEach(registerTag);

    return { bySlug, byId };
  }, [domainTags, specializationTags]);

  const doesProfessionalMatchCategory = useCallback(
    (prof: Professional, targetSlugOrName: string | null): boolean => {
      if (!targetSlugOrName) return true;
      const normalizedTarget = normalizeTagSlug(targetSlugOrName);
      if (!normalizedTarget) return false;

      const slugMatches = (prof.tagSlugs ?? []).some(
        (slug) => normalizeTagSlug(slug) === normalizedTarget,
      );
      if (slugMatches) return true;

      const tagNameMatches = (prof.tags ?? []).some(
        (tagName) => normalizeTagSlug(tagName) === normalizedTarget,
      );
      if (tagNameMatches) return true;

      if (normalizeTagSlug(prof.primaryTagSlug) === normalizedTarget) return true;
      if (normalizeTagSlug(prof.primaryTagName) === normalizedTarget) return true;
      if (normalizeTagSlug(prof.specialization) === normalizedTarget) return true;

      return false;
    },
    [],
  );

  const buildProfessionalsWithTags = useCallback(
    (list: Professional[]): Professional[] => {
      if (!Array.isArray(list) || list.length === 0) {
        return [];
      }

      return list.map((prof) => {
        const keyCandidates: string[] = [];
        if (prof.professional_id) keyCandidates.push(String(prof.professional_id));
        if (prof.user_id !== undefined && prof.user_id !== null) keyCandidates.push(String(prof.user_id));
        if (prof.id !== undefined && prof.id !== null) keyCandidates.push(String(prof.id));

        const matchedAssignments: ProfessionalTagInfo[] = [];
        keyCandidates.forEach((key) => {
          const assignments = professionalTagMap[key];
          if (assignments && assignments.length > 0) {
            assignments.forEach((info) => {
              if (info?.slug) {
                matchedAssignments.push({ slug: info.slug, name: info.name });
              }
            });
          }
        });

        const slugSet = new Set<string>();
        const displayNames: string[] = [];
        const slugList: string[] = [];

        const pushTag = (slugCandidate: string | null | undefined, displayCandidate?: string | null) => {
          const normalizedSlug = normalizeTagSlug(slugCandidate ?? undefined);
          if (!normalizedSlug) return;
          if (slugSet.has(normalizedSlug)) return;
          slugSet.add(normalizedSlug);

          const knownTag = knownTagLookup.bySlug.get(normalizedSlug);
          const displayName = (displayCandidate ?? "").trim() || knownTag?.name || formatTagDisplayName(normalizedSlug);

          slugList.push(normalizedSlug);
          displayNames.push(displayName);
        };

        matchedAssignments.forEach((info) => {
          pushTag(info.slug, info.name);
        });

        (prof.tagSlugs ?? []).forEach((slug, index) => {
          const displayFromProfile = prof.tags?.[index];
          pushTag(slug, displayFromProfile);
        });

        (prof.tags ?? []).forEach((name) => {
          pushTag(name, name);
        });

        const firstAssignment = matchedAssignments.find((info) => normalizeTagSlug(info.slug));
        const primarySlug = firstAssignment ? normalizeTagSlug(firstAssignment.slug) : slugList[0] ?? null;
        const primaryName = firstAssignment?.name ?? displayNames[0] ?? null;

        return {
          ...prof,
          tags: displayNames,
          tagSlugs: slugList,
          primaryTagName: primaryName,
          primaryTagSlug: primarySlug,
        };
      });
    },
    [professionalTagMap, knownTagLookup],
  );

  useEffect(() => {
    // Filter professionals based on active category and optional search query
    let base = professionals;

    if (activeCategory !== null) {
      base = base.filter((prof) => doesProfessionalMatchCategory(prof, activeCategory));
    }

    const q = searchQuery.trim().toLowerCase();
    if (q.length > 0) {
      base = base.filter((p) =>
        (p.display_name || '').toLowerCase().includes(q) ||
        (p.bio || '').toLowerCase().includes(q) ||
        (p.specialization || '').toLowerCase().includes(q) ||
        (p.tags || []).some((t) => (t || '').toLowerCase().includes(q)) ||
        (p.tagSlugs || []).some((slug) => slug.includes(q)),
      );
    }

    setFilteredProfessionals(base);
  }, [activeCategory, professionals, searchQuery, doesProfessionalMatchCategory]);

  useEffect(() => {
    if (rawProfessionals.length === 0) {
      setProfessionals([]);
      setFilteredProfessionals([]);
      return;
    }

    const augmented = buildProfessionalsWithTags(rawProfessionals);
    setProfessionals(augmented);
    setFilteredProfessionals(augmented);
  }, [rawProfessionals, buildProfessionalsWithTags]);

  // Default: show all professionals (activeCategory null corresponds to "All")
  // No auto-selection of first domain, so users always see results initially.

  const fetchProfessionals = useCallback(async () => {
    setLoading(true);
    setError(null);

    let normalizedCount = 0;

    try {
      // Many backends redirect /professionals -> /professionals/; hit the canonical URL directly
      const url = `${backendUrl}/professionals/`;
      console.log('📡 Fetching professionals from:', url);

      // Build headers, omit Authorization entirely if no token
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Using authenticated request with token:', token.substring(0, 20) + '...');
      } else {
        console.log('🔓 Making unauthenticated request (no token)');
      }

      // Abort support + timeout to avoid lingering sockets between navigations
      const aborter = new AbortController();
      inFlightRef.current = { aborter };
      const timeout = setTimeout(() => aborter.abort(), 12000);

      const doFetch = async () =>
        fetch(url, {
          method: 'GET',
          headers,
          signal: aborter.signal,
        });

      let response: Response | null = null;
      try {
        response = await doFetch();
      } catch (firstErr) {
        // Quick one-time retry on transient network error
        console.warn('⚠️ First attempt failed, retrying once...', firstErr);
        await new Promise<void>((res) => setTimeout(res, 300));
        response = await doFetch();
      } finally {
        clearTimeout(timeout);
      }

      if (!response) {
        throw new Error('No response received from professionals endpoint.');
      }

      console.log('📥 Response status:', response.status);

      if (response.ok) {
        let data: any = null;
        try {
          data = await response.json();
          console.log('📦 Raw API response:', JSON.stringify(data, null, 2));
        } catch (parseError) {
          console.warn('⚠️ No JSON body returned for professionals list', parseError);
          data = [];
        }

        // Normalize the payload into an array
        let list: any[] = [];
        if (Array.isArray(data)) list = data;
        else if (data && Array.isArray(data.professionals)) list = data.professionals;
        else if (data && Array.isArray(data.results)) list = data.results;
        else if (data && Array.isArray(data.items)) list = data.items;
        else if (data && data.data && Array.isArray(data.data)) list = data.data;
        else {
          console.warn('⚠️ Unexpected data format:', typeof data, Object.keys(data || {}));
          list = [];
        }

        console.log('📋 Extracted list length:', list.length);

        // Normalize each professional object to match our UI expectations
        const normalized: Professional[] = list.map((p: any, idx: number) => {
          const rawTags = Array.isArray(p?.tags) ? p.tags : [];

          const displayTags: string[] = [];
          const slugList: string[] = [];

          const pushTag = (slugCandidate: string | null | undefined, nameCandidate?: string | null | undefined) => {
            const normalizedSlug = normalizeTagSlug(slugCandidate ?? undefined);
            if (!normalizedSlug) return;
            if (slugList.includes(normalizedSlug)) return;
            const display = (nameCandidate ?? '').trim() || formatTagDisplayName(normalizedSlug);
            slugList.push(normalizedSlug);
            displayTags.push(display);
          };

          rawTags.forEach((tag: any) => {
            if (typeof tag === 'string') {
              pushTag(tag, tag);
            } else if (tag && typeof tag === 'object') {
              const slugCandidate = tag?.slug ?? tag?.tag_slug ?? tag?.name ?? tag?.label ?? tag?.code ?? null;
              const displayCandidate = tag?.name ?? tag?.label ?? tag?.title ?? null;
              pushTag(slugCandidate, displayCandidate);
            }
          });

          return {
            id: (p?.id ?? p?.user_id ?? idx) as number,
            user_id: (p?.user_id ?? p?.id ?? idx) as number,
            professional_id: p?.professional_id ?? p?.id?.toString() ?? undefined,
            display_name: p?.display_name || p?.name || 'Professional',
            bio: p?.bio ?? '',
            specialization: p?.specialization ?? p?.title ?? undefined,
            tags: displayTags,
            tagSlugs: slugList,
            primaryTagName: null,
            primaryTagSlug: null,
            profile_image_url: (p?.profile_image_url ?? p?.avatar_url ?? null) || undefined,
            cover_image_url: (p?.cover_image_url ?? null) || undefined,
            subscriber_count: typeof p?.subscriber_count === 'number' ? p.subscriber_count : undefined,
            is_verified: Boolean(p?.is_verified),
          };
        });

        normalizedCount = normalized.length;

        if (normalized.length > 0) {
          console.log('👤 First professional sample:', JSON.stringify(normalized[0], null, 2));
        }

        setRawProfessionals(normalized);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch professionals:', response.status, errorText);
        setError(`Failed to load professionals (${response.status})`);
        setRawProfessionals([]);
        setProfessionals([]);
        setFilteredProfessionals([]);
      }
    } catch (err: any) {
      console.error('❌ Network error:', err);
      console.error('❌ Error details:', err.message, err.stack);
      setError(`Network error: ${err.message || 'Please try again.'}`);
      setRawProfessionals([]);
      setProfessionals([]);
      setFilteredProfessionals([]);
    } finally {
      setLoading(false);
      console.log('🏁 Fetch complete - professionals count:', normalizedCount);
    }
  }, [backendUrl, token]);

  // Fetch domain tags to build category pills like LetUsKnowYou.tsx
  const fetchDomainTags = useCallback(async () => {
    try {
      const url = `${backendUrl}/professional/tags`;
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const resp = await fetch(url, { headers });
      let data: any = {};
      try {
        data = await resp.json();
      } catch {
        data = {};
      }

      if (resp.ok && data) {
        const domainList: Tag[] = Array.isArray(data.domain_tags) ? data.domain_tags : [];
        const specializationList: Tag[] = Array.isArray(data.sub_specialization_tags) ? data.sub_specialization_tags : [];

        const normalizedDomainMap = new Map<string, Tag>();
        domainList.forEach((tag) => {
          const normalizedSlug = normalizeTagSlug(tag.slug) ?? normalizeTagSlug(tag.name);
          if (!normalizedSlug) return;
          if (!DOMAIN_FILTER_SLUG_SET.has(normalizedSlug)) return;
          normalizedDomainMap.set(normalizedSlug, {
            ...tag,
            slug: normalizedSlug,
            tag_id: tag.tag_id ?? normalizedSlug,
            tag_type: tag.tag_type ?? "domain",
            parent_id: tag.parent_id ?? null,
            is_active: tag.is_active ?? true,
          });
        });

        const curatedDomains: Tag[] = DOMAIN_FILTERS.map(({ name, slug }) => {
          const matched = normalizedDomainMap.get(slug);
          if (matched) {
            return {
              ...matched,
              name: matched.name || name,
              slug,
              tag_type: "domain" as "domain", // ensure correct type
            };
          }
          return {
            tag_id: slug,
            name,
            slug,
            tag_type: "domain" as "domain", // ensure correct type
            parent_id: null,
            is_active: true,
          };
        });

        setDomainTags(curatedDomains);
        setSpecializationTags(specializationList);

        const allKnownTags = [...domainList, ...specializationList];
        const localBySlug = new Map<string, Tag>();
        const localById = new Map<string, Tag>();

        const registerLocalTag = (tag: Tag) => {
          const slug = normalizeTagSlug(tag.slug) ?? normalizeTagSlug(tag.name);
          if (slug) {
            localBySlug.set(slug, tag);
          }
          if (tag.name) {
            const nameSlug = normalizeTagSlug(tag.name);
            if (nameSlug) {
              localBySlug.set(nameSlug, tag);
            }
          }
          if (tag.tag_id !== undefined && tag.tag_id !== null) {
            localById.set(String(tag.tag_id), tag);
          }
        };

        allKnownTags.forEach(registerLocalTag);

        const extractTagInfo = (candidate: any): ProfessionalTagInfo | null => {
          if (!candidate) return null;

          if (typeof candidate === 'string') {
            const slug = normalizeTagSlug(candidate);
            if (!slug) return null;
            const known = localBySlug.get(slug);
            return {
              slug,
              name: known?.name ?? formatTagDisplayName(slug),
            };
          }

          if (typeof candidate === 'object') {
            const candidateId = candidate?.tag_id ?? candidate?.id ?? candidate?.tagId ?? candidate?.tag_uuid ?? candidate?.uuid ?? null;
            if (candidateId !== null && candidateId !== undefined) {
              const known = localById.get(String(candidateId));
              if (known) {
                const slug = normalizeTagSlug(known.slug) ?? normalizeTagSlug(known.name) ?? normalizeTagSlug(String(candidateId));
                if (slug) {
                  return {
                    slug,
                    name: known.name ?? formatTagDisplayName(slug),
                  };
                }
              }
            }

            const rawSlug = normalizeTagSlug(candidate?.slug ?? candidate?.tag_slug ?? candidate?.code ?? candidate?.name ?? candidate?.label ?? candidate?.title ?? null);
            if (!rawSlug) return null;
            const known = localBySlug.get(rawSlug);
            const displayName = candidate?.name ?? candidate?.label ?? candidate?.title ?? known?.name ?? formatTagDisplayName(rawSlug);
            return {
              slug: rawSlug,
              name: displayName,
            };
          }

          return null;
        };

        const assignments: Record<string, ProfessionalTagInfo[]> = {};
        const pushAssignment = (profKey: any, tagInfo: ProfessionalTagInfo | null) => {
          const key = profKey !== undefined && profKey !== null ? String(profKey) : null;
          if (!key || !tagInfo) return;
          const normalizedSlug = normalizeTagSlug(tagInfo.slug);
          if (!normalizedSlug) return;
          const entry = assignments[key] ?? (assignments[key] = []);
          if (!entry.some(existing => existing.slug === normalizedSlug)) {
            entry.push({ slug: normalizedSlug, name: tagInfo.name });
          }
        };

        const rawAssignments =
          data?.professional_tags ??
          data?.professionalTags ??
          data?.tag_assignments ??
          data?.tagAssignments ??
          null;

        if (Array.isArray(rawAssignments)) {
          rawAssignments.forEach((entry: any) => {
            const candidateKey =
              entry?.professional_id ??
              entry?.professionalId ??
              entry?.id ??
              entry?.user_id ??
              entry?.userId ??
              null;
            if (!candidateKey) return;

            const candidateTags: any[] = [];
            if (Array.isArray(entry?.tags)) candidateTags.push(...entry.tags);
            if (Array.isArray(entry?.tag_list)) candidateTags.push(...entry.tag_list);
            if (Array.isArray(entry?.tagIds)) candidateTags.push(...entry.tagIds);
            if (Array.isArray(entry?.tagSlugs)) candidateTags.push(...entry.tagSlugs);
            if (entry?.tag) candidateTags.push(entry.tag);
            if (entry?.slug || entry?.name || entry?.tag_id || entry?.tagId) candidateTags.push(entry);

            candidateTags.forEach((candidate) => {
              const info = extractTagInfo(candidate);
              pushAssignment(candidateKey, info);
            });
          });
        } else if (rawAssignments && typeof rawAssignments === 'object') {
          Object.entries(rawAssignments).forEach(([profKey, value]) => {
            const candidateTags = Array.isArray(value)
              ? value
              : value && typeof value === 'object'
                ? Object.values(value)
                : [];
            candidateTags.forEach((candidate) => {
              const info = extractTagInfo(candidate);
              pushAssignment(profKey, info);
            });
          });
        } else {
          console.warn('ℹ️ No professional tag assignments returned from /professional/tags');
        }

        setProfessionalTagMap(assignments);
      } else {
        console.warn('⚠️ Could not load domain tags, falling back to default categories');
        setDomainTags(buildFallbackDomainTags());
        setSpecializationTags([]);
        setProfessionalTagMap({});
      }
    } catch (error) {
      console.warn('⚠️ Tags fetch failed:', error);
      setDomainTags(buildFallbackDomainTags());
      setSpecializationTags([]);
      setProfessionalTagMap({});
    }
  }, [backendUrl, token]);

  useEffect(() => {
    // On mount, fetch both categories (domain tags) and professionals.
    fetchDomainTags();
    fetchProfessionals();

    // Cleanup: abort any in-flight requests when unmounting
    return () => {
      try {
        inFlightRef.current?.aborter?.abort();
      } catch {
        // no-op
      }
    };
  }, [fetchDomainTags, fetchProfessionals]);

  const centerPillInView = (index: number) => {
    const layout = pillLayoutsRef.current[index];
    if (!layout || !categoryScrollRef.current) return;
    const screenWidth = Dimensions.get('window').width;
    let targetX = layout.x - (screenWidth - layout.width) / 2;
    if (targetX < 0) targetX = 0;
    categoryScrollRef.current.scrollToOffset({ offset: targetX, animated: true });
  };

  const handleCategoryPress = useCallback(
    (category: CategoryOption, index?: number) => {
      setActiveCategory(category.tag);
      if (typeof index === 'number') {
        centerPillInView(index);
      }
    },
    [centerPillInView],
  );

  const renderCategoryItem = useCallback(
    ({ item, index }: ListRenderItemInfo<CategoryOption>) => {
      const isActive = activeCategory === item.tag;
      return (
        <TouchableOpacity
          style={[
            styles.categoryPill,
            isActive
              ? { backgroundColor: theme.primaryLight, borderColor: theme.primary }
              : { backgroundColor: theme.cardBackground, borderColor: theme.border },
          ]}
          activeOpacity={0.8}
          onPress={() => handleCategoryPress(item, index)}
          onLayout={(e) => {
            const { x, width } = e.nativeEvent.layout;
            pillLayoutsRef.current[index] = { x, width };
          }}
        >
          <Text
            style={[
              styles.categoryPillText,
              isActive ? { color: theme.primary } : { color: theme.textSecondary },
            ]}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      );
    },
    [activeCategory, theme, handleCategoryPress],
  );

  const renderCategorySpacer = useCallback(() => <View style={{ width: 6 }} />, []);

  // Build category pills from domain_tags plus a leading "All"
  const categories = useMemo<CategoryOption[]>(() => {
    const normalizedLookup = new Map<string, Tag>();
    domainTags.forEach((tag) => {
      const normalizedSlug = normalizeTagSlug(tag.slug) ?? normalizeTagSlug(tag.name);
      if (!normalizedSlug) return;
      normalizedLookup.set(normalizedSlug, tag);
    });

    const domain = DOMAIN_FILTERS.map(({ name, slug }) => {
      const matched = normalizedLookup.get(slug);
      return { name: matched?.name ?? name, tag: slug };
    });
    pillLayoutsRef.current = [];
    return [{ name: 'All', tag: null }, ...domain];
  }, [domainTags]);

  const scrollCategoryIntoViewBySlug = useCallback(
    (slug: string | null) => {
      if (!slug) return;
      const normalizedSlug = normalizeTagSlug(slug);
      if (!normalizedSlug) return;
      const targetIndex = categories.findIndex((category) => {
        const categorySlug = normalizeTagSlug(category.tag ?? undefined);
        return categorySlug === normalizedSlug;
      });
      if (targetIndex >= 0) {
        centerPillInView(targetIndex);
      }
    },
    [categories, centerPillInView],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        {isSearchOpen ? (
          <View style={[styles.searchRow, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Ionicons name="search" size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              ref={searchInputRef}
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search experts"
              placeholderTextColor={theme.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => { setIsSearchOpen(false); setSearchQuery(""); }}>
              <Text style={{ color: theme.primary, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Connect with Experts</Text>
            <TouchableOpacity style={styles.headerAvatar} onPress={() => {
              setIsSearchOpen(true);
              setTimeout(() => searchInputRef.current?.focus(), 50);
            }}>
              <Ionicons name="search" size={22} color={theme.primary} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Fixed Category Section */}
      <View style={[styles.fixedCategorySection, { backgroundColor: theme.background }]}>
        {/* Category Pills */}
        <FlatList
          ref={categoryScrollRef}
          horizontal
          data={categories}
          keyExtractor={(item, index) => `category-${item.tag ?? 'all'}-${index}`}
          renderItem={renderCategoryItem}
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          bounces
          contentContainerStyle={[styles.categoryScroll, { flexDirection: 'row' }]}
          style={[styles.categoryScrollSpacing, { backgroundColor: theme.background }]}
          ListHeaderComponent={renderCategorySpacer}
          ListFooterComponent={renderCategorySpacer}
          extraData={[activeCategory, theme]}
        />

        <View style={styles.showAllRow}>
          <TouchableOpacity
            onPress={() => {
              setActiveCategory(null);
              categoryScrollRef.current?.scrollToOffset({ offset: 0, animated: true });
            }}
            style={[
              styles.showAllButton,
              activeCategory === null
                ? { backgroundColor: theme.primaryLight, borderColor: theme.primary }
                : { backgroundColor: theme.cardBackground, borderColor: theme.border },
            ]}
          >
            <Ionicons
              name="layers"
              size={14}
              color={activeCategory === null ? theme.primary : theme.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.showAllText,
                activeCategory === null
                  ? { color: theme.primary }
                  : { color: theme.textSecondary },
              ]}
            >
              Show all
            </Text>
          </TouchableOpacity>
        </View>

        {/* Separator Line */}
        <View style={[styles.separatorLine, { borderColor: theme.border }]} />
      </View>

      {/* Expert Cards */}
      <ScrollView
        contentContainerStyle={[styles.scrollContentContainer, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
        style={styles.contentScrollView}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.text }]}>Loading professionals...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={theme.error} />
            <Text style={[styles.errorText, { color: theme.text }]}>{error}</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={fetchProfessionals}>
              <Text style={[styles.retryButtonText, { color: '#fff' }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredProfessionals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.text }]}>No professionals found in this category</Text>
          </View>
        ) : (
          (Array.isArray(filteredProfessionals) ? filteredProfessionals : []).map((professional) => {
            const matchesActiveCategory = doesProfessionalMatchCategory(
              professional,
              activeCategory,
            );
            const cardStyles = [
              styles.expertCard,
              { backgroundColor: theme.cardBackground, borderColor: matchesActiveCategory ? theme.primary : 'transparent' },
              matchesActiveCategory ? styles.expertCardActive : null,
            ];

            return (
              <TouchableOpacity
                key={professional.id}
                style={cardStyles}
                activeOpacity={0.9}
                onPress={() => {
                  const profId = professional.professional_id || professional.user_id.toString();
                  console.log('📍 Navigating to professional:', profId);
                  console.log('📋 Professional data:', JSON.stringify(professional, null, 2));
                  navigation.navigate("PublicMicrositePTView", {
                    professional_id: profId,
                    initialProfileImageUrl: professional.profile_image_url ?? null,
                    initialCoverImageUrl: professional.cover_image_url ?? null,
                  });
                }}
              >
                {/* Image as background */}
                <Image
                  source={{
                    uri: professional.profile_image_url || professional.cover_image_url ||
                      "https://api.builder.io/api/v1/image/assets/TEMP/a3f7b523f6fc007bf86469d0db176c386f88ec78?width=451"
                  }}
                  style={styles.cardBgImage}
                  resizeMode="cover"
                />
                {/* Overlay for chat and info */}
                <View style={styles.overlayContent}>
                  {professional.primaryTagName && (
                    <View
                      style={[
                        styles.primaryTagBadge,
                        {
                          backgroundColor: matchesActiveCategory ? theme.primary : theme.cardBackground,
                          borderColor: matchesActiveCategory ? theme.primary : theme.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name="pricetag-outline"
                        size={14}
                        color={matchesActiveCategory ? '#fff' : theme.primary}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.primaryTagBadgeText,
                          { color: matchesActiveCategory ? '#fff' : theme.primary },
                        ]}
                        numberOfLines={1}
                      >
                        {professional.primaryTagName}
                      </Text>
                    </View>
                  )}
                  {/* Chat Button */}
                  <TouchableOpacity
                    style={styles.chatButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      console.log('💬 Chat pressed for:', professional.display_name);
                      // TODO: Implement chat functionality
                    }}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color="#7B61FF" />
                    <Text style={styles.chatButtonText}>Chat</Text>
                  </TouchableOpacity>
                  {/* Info at bottom */}
                  <View style={[styles.expertInfoTransparent, { backgroundColor: theme.cardBackground }]}>
                    <View style={styles.expertNameRow}>
                      <Text style={[styles.expertName, { color: theme.text }]}>
                        {professional.display_name}
                        {professional.is_verified && (
                          <Ionicons name="checkmark-circle" size={16} color={theme.primary} style={styles.verifiedBadge} />
                        )}
                      </Text>
                      {professional.subscriber_count !== undefined && (
                        <Text style={[styles.subscriberCount, { color: theme.primary }]}>
                          {professional.subscriber_count} subscribers
                        </Text>
                      )}
                    </View>
                    {professional.specialization && (
                      <Text style={[styles.expertTitle, { color: theme.primary }]}>{professional.specialization}</Text>
                    )}
                    {professional.bio && (
                      <Text style={[styles.expertDesc, { color: theme.textSecondary }]} numberOfLines={2}>{professional.bio}</Text>
                    )}
                    {professional.tags && professional.tags.length > 0 && (
                      <View style={styles.tagsContainer}>
                        {professional.tags.slice(0, 3).map((tag, idx) => {
                          const tagSlug = professional.tagSlugs?.[idx];
                          const normalizedTag = normalizeTagSlug(tagSlug ?? tag);
                          const isActiveTag = normalizedActiveCategory
                            ? normalizedTag === normalizedActiveCategory
                            : false;
                          return (
                            <TouchableOpacity
                              key={tagSlug ?? `${tag}-${idx}`}
                              style={[
                                styles.tagPill,
                                isActiveTag
                                  ? { backgroundColor: theme.primary, borderColor: theme.primary }
                                  : { backgroundColor: theme.primaryLight, borderColor: theme.border },
                              ]}
                              activeOpacity={0.85}
                              onPress={() => {
                                if (!normalizedTag) return;
                                setActiveCategory(normalizedTag);
                                scrollCategoryIntoViewBySlug(normalizedTag);
                              }}
                            >
                              <Text
                                style={[
                                  styles.tagText,
                                  { color: isActiveTag ? '#fff' : theme.primary },
                                ]}
                              >
                                {tag}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Custom Bottom Navigation styled like Avatarhome1 */}
      <View style={styles.bottomNavContainer}>
        <CustomBottomNav
          onClockPress={() => navigation.navigate("Visualizations")}
          onWindRosePress={() => navigation.navigate("Discoverprotier")}
          onProfilePress={() => navigation.navigate("ProfileScreen")}
          activeIndex={2}
        />
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16.2,
  },
  headerTitle: {
    fontSize: 25.2,
    fontWeight: "bold",
    color: "#222",
    fontFamily: "System",
    paddingBottom: 13.5,
  },
  headerAvatar: {
    width: 34.2,
    height: 34.2,
    borderRadius: 17.1,
    backgroundColor: "#ede9fe",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryScroll: {
    paddingHorizontal: 14.4,
    paddingRight: 18,
    paddingBottom: 0.9,
    alignItems: "center",
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    height: 36,
    padding: 0,
    margin: 0,
  },
  categoryPill: {
    paddingHorizontal: 12.6,
    height: 36,
    borderRadius: 18,
    marginRight: 9,
    borderWidth: 1.5,
    minWidth: 50.4,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryPillActive: {
    backgroundColor: "#f2f0ff",
    borderColor: "#7B61FF",
  },
  categoryPillInactive: {
    backgroundColor: "#fff",
    borderColor: "#e5e7eb",
  },
  categoryPillText: {
    fontSize: 14.4,
    fontWeight: "500",
    fontFamily: "System",
  },
  categoryPillTextActive: {
    color: "#7B61FF",
  },
  categoryPillTextInactive: {
    color: "#888",
  },
  expertCard: {
    backgroundColor: "#ede9fe",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 27,
    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1.8 },
    elevation: 7,
    width: "100%",
    alignSelf: "center",
    height: 171,
    position: "relative",
    borderWidth: 1,
    borderColor: "transparent",
  },
  expertCardActive: {
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 9,
  },
  cardBgImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    borderRadius: 18,
  },
  overlayContent: {
    flex: 1,
    justifyContent: "space-between",
    height: "100%",
  },
  primaryTagBadge: {
    position: "absolute",
    top: 10.8,
    left: 14.4,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 3.6,
    borderRadius: 12.6,
    borderWidth: 1,
    zIndex: 2,
  },
  primaryTagBadgeText: {
    fontSize: 11.7,
    fontWeight: "600",
    maxWidth: 140,
  },
  chatButton: {
    position: "absolute",
    top: 10.8,
    right: 14.4,
    flexDirection: "row",
    alignItems: "center",
    opacity: 1,
    backgroundColor: "transparent",
    zIndex: 2,
  },
  chatButtonText: {
    color: "#7B61FF",
    fontSize: 14.4,
    fontWeight: "600",
    marginLeft: 3.6,
  },
  expertInfoTransparent: {
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 12.6,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  expertNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3.6,
  },
  expertName: {
    fontSize: 15.3,
    fontWeight: "500",
    color: "#222",
    marginBottom: 1.8,
    fontFamily: "System",
    flex: 1,
  },
  verifiedBadge: {
    marginLeft: 3.6,
  },
  subscriberCount: {
    fontSize: 10.8,
    color: "#7B61FF",
    fontWeight: "600",
  },
  expertTitle: {
    fontSize: 12.6,
    fontWeight: "600",
    color: "#7B61FF",
    marginBottom: 1.8,
  },
  expertDesc: {
    fontSize: 12.6,
    color: "#5f5e5eff",
    marginTop: 0.9,
    fontFamily: "System",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5.4,
    gap: 5.4,
  },
  tagPill: {
    backgroundColor: "rgba(123, 97, 255, 0.15)",
    paddingHorizontal: 7.2,
    paddingVertical: 2.7,
    borderRadius: 10.8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 9.9,
    color: "#7B61FF",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 54,
  },
  loadingText: {
    marginTop: 14.4,
    fontSize: 14.4,
    color: "#7B61FF",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 54,
  },
  errorText: {
    marginTop: 14.4,
    fontSize: 14.4,
    color: "#FF6B6B",
    fontWeight: "500",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 14.4,
    paddingHorizontal: 21.6,
    paddingVertical: 10.8,
    backgroundColor: "#7B61FF",
    borderRadius: 21.6,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14.4,
    fontWeight: "600",
  },
  emptyContainer: {
    // Do not use flex:1 here; keep the empty state just below the category row
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 7.2,
    paddingTop: 10.8,
    minHeight: 54,
  },
  emptyText: {
    marginTop: 7.2,
    fontSize: 14.4,
    color: "#999",
    fontWeight: "500",
    textAlign: "center",
  },
  categoryScrollSpacing: {
    marginBottom: 3.6,
    height: 50.4,
  },
  fixedCategorySection: {
    backgroundColor: "#fff",
    zIndex: 1,
  },
  separatorLine: {
    height: 0.9,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 14.4,
    marginBottom: 7.2,
  },
  showAllRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 18,
    paddingBottom: 6,
  },
  showAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  showAllText: {
    fontSize: 13,
    fontWeight: "600",
  },
  contentScrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 14.4,
    paddingBottom: 21.6,
    paddingTop: 7.2,
    flexGrow: 1,
  },
  bottomNavContainer: {
    marginBottom: 31.5,
  },
});
