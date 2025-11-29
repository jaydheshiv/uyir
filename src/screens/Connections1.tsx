import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import ModalCard from '../components/ModalCard';
import ModalOverlay from '../components/ModalOverlay';
import TherapistCard from '../components/TherapistCard';

type RootStackParamList = {
  Avatarhome1: undefined;
  PublicMicrositePTView: { professional_id?: string } | undefined;
  // add other routes here if needed
};

type RecommendedProfessional = {
  professional_id: string;
  display_name: string;
  profile_image_url: string | null;
  session_price_per_hour: number | null;
  match_score: number;
  matched_domain_tags: any[];
  matched_sub_specialization_tags: any[];
  bio?: string;
  specialty?: string;
  experience?: string;
};

const normalizeMatchPercent = (score?: number | null): number | null => {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return null;
  }
  const normalized = score > 1 ? score / 100 : score;
  const clamped = Math.max(0, Math.min(normalized, 1));
  return Math.round(clamped * 100);
};

export default function Connections1() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loadingProfessionals, setLoadingProfessionals] = useState(false);

  // Get recommended professionals from route params
  const params = route.params as { recommendedProfessionals?: RecommendedProfessional[] } | undefined;
  const recommendedProfessionals = params?.recommendedProfessionals || [];

  const primaryProfessional = useMemo(() => {
    if (professionals.length > 0) {
      return professionals[0];
    }
    if (recommendedProfessionals.length > 0) {
      return recommendedProfessionals[0];
    }
    return null;
  }, [professionals, recommendedProfessionals]);

  const matchPercent = useMemo(() => normalizeMatchPercent(primaryProfessional?.match_score) ?? 0, [primaryProfessional]);
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: matchPercent,
      duration: 750,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [animatedProgress, matchPercent]);

  // Fetch suggested professionals or use recommended ones
  useEffect(() => {
    // If we have recommended professionals from the quiz, use them
    if (recommendedProfessionals.length > 0) {
      console.log('✅ Using recommended professionals from quiz:', recommendedProfessionals.length);
      const sorted = [...recommendedProfessionals].sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));
      setProfessionals(sorted);
      return;
    }

    // Otherwise fetch professionals from backend as a fallback feed
    const fetchProfessionals = async () => {
      setLoadingProfessionals(true);
      const backendUrl = 'http://dev.api.uyir.ai:8081/professionals/';

      console.log('📡 Fetching professionals from:', backendUrl);

      try {
        const response = await fetch(backendUrl);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Professionals fetched:', data);

          // Backend may return { items: [], suggestions: [] }
          const suggested = Array.isArray(data?.suggestions) ? data.suggestions : [];
          const items = Array.isArray(data?.items) ? data.items : [];
          const results = Array.isArray(data) ? data : [];

          const combined = [...suggested, ...items, ...results];
          const uniqueById = new Map<string, any>();
          combined.forEach((prof: any) => {
            const id = prof?.professional_id || prof?.id;
            if (!id) {
              return;
            }
            if (!uniqueById.has(id)) {
              uniqueById.set(id, prof);
            }
          });

          const normalized = Array.from(uniqueById.values()).filter((prof: any) => {
            const name = (prof?.display_name || '').toLowerCase();
            const bio = (prof?.bio || '').toLowerCase();
            const isTestProfile =
              name.includes('test') ||
              name.includes('automation') ||
              name.includes('legacy') ||
              name.includes('load') ||
              bio.includes('test') ||
              bio.includes('automation') ||
              bio.includes('legacy');
            return !isTestProfile;
          });

          normalized.sort((a, b) => (b?.match_score ?? 0) - (a?.match_score ?? 0));

          console.log(`📊 Total professionals from backend: ${combined.length}`);
          console.log(`✨ Unique professionals considered: ${normalized.length}`);
          setProfessionals(normalized);
        } else {
          console.error('❌ Failed to fetch professionals:', response.status);
          setProfessionals([]);
        }
      } catch (err) {
        console.error('❌ Error fetching professionals:', err);
        setProfessionals([]);
      } finally {
        setLoadingProfessionals(false);
      }
    };

    fetchProfessionals();
  }, [recommendedProfessionals]);

  const handleDone = () => {
    navigation.navigate("Avatarhome1");
  };
  const handleCancel = () => {
    navigation.navigate("Avatarhome1");
  };

  const handleTherapistPress = (professional_id: string) => {
    // Navigate to PublicMicrositePTView with actual professional_id
    console.log('📍 Navigating to professional:', professional_id);
    navigation.navigate("PublicMicrositePTView", { professional_id });
  };

  return (
    <View style={styles.safeArea}>
      {/* Overlay */}
      <View style={styles.overlay} />

      {/* Modal */}
      <View style={styles.modalContainer}>
        <FlatList
          data={[{}]}
          keyExtractor={(_, idx) => idx.toString()}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          renderItem={() => (
            <View style={styles.modalContent}>
              {/* Well-being Score */}
              <Text style={styles.sectionLabel}>Match score</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>{`${matchPercent}%`}</Text>
                <View style={styles.progressBarBackground}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: animatedProgress.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Suggested Therapists */}
              <Text style={styles.sectionLabel}>
                {recommendedProfessionals.length > 0 ? 'Recommended therapists for you' : 'Suggested therapists'}
              </Text>
              {loadingProfessionals ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#6C5CE7" />
                  <Text style={{ marginTop: 10, color: '#666' }}>Loading professionals...</Text>
                </View>
              ) : professionals.length > 0 ? (
                <View style={styles.therapistCardContainer}>
                  {/* Show only the first professional */}
                  {professionals.slice(0, 1).map((prof) => (
                    <TherapistCard
                      key={prof.professional_id || prof.id}
                      image={prof.profile_image_url || prof.avatar_url || "https://wallpapers.com/images/hd/sadhguru-sitting-and-smilling-4grkugynnnp8zhf2.jpg"}
                      name={prof.display_name || "Professional"}
                      experience={prof.experience || "Professional therapist"}
                      price={prof.session_price_per_hour ? `₹${prof.session_price_per_hour} per hour` : "Contact for pricing"}
                      therapyType={prof.specialty || "General therapy"}
                      therapyDesc={prof.bio || "Experienced professional"}
                      availableVia="Video, Voice, Chat, Avatar"
                      activeDot={0}
                      totalDots={0}
                      onProfilePress={() => handleTherapistPress(prof.professional_id || prof.id)}
                    />
                  ))}
                </View>
              ) : (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#666', textAlign: 'center' }}>
                    No professionals available at the moment.{'\n'}
                    Please check back later.
                  </Text>
                </View>
              )}
            </View>
          )}
        />

        {/* Done Button */}
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      <ModalOverlay />
      <ModalCard>{/* modal content */}</ModalCard>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 1,
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F7F7F9",
    borderTopLeftRadius: 25.2,
    borderTopRightRadius: 25.2,
    paddingBottom: 18,
    paddingTop: 10.8,
    paddingHorizontal: 0,
    width: "100%",
    maxHeight: "90%",
    alignSelf: "center",
    zIndex: 2,
  },
  modalContent: {
    backgroundColor: "#ECECEC",
    borderRadius: 16.2,
    margin: 14.4,
    padding: 18,
    alignItems: "stretch",
    width: width - 32,
  },
  sectionLabel: {
    fontSize: 15.3,
    color: "#222",
    fontWeight: "400",
    marginBottom: 12.6,
    alignSelf: "flex-start",
  },
  therapistCardContainer: {
    width: "100%",
    alignSelf: "stretch",
  },
  scoreText: {
    fontSize: 32.4,
    fontWeight: "bold",
    color: "#111",
    textAlign: "center",
    marginBottom: 14.4,
  },
  progressBarBackground: {
    width: "100%",
    maxWidth: width - 80,
    height: 7.2,
    backgroundColor: "#d5d5e5ff",
    borderRadius: 3.6,
    overflow: "hidden",
    alignSelf: "center",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#6C5CE7",
    borderRadius: 3.6,
  },
  therapistCard: {
    backgroundColor: "#E7E3FF",
    borderRadius: 18,
    marginTop: 1.8,
    marginBottom: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1.8 },
  },
  therapistCardTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16.2,
    paddingBottom: 8.1,
  },
  therapistImage: {
    width: 99,
    height: 108,
    borderRadius: 9,
    marginRight: 9,
    backgroundColor: "#ccc",
  },
  therapistName: {
    fontSize: 17.1,
    fontWeight: "600",
    color: "#222",
    marginBottom: 3.6,
    textAlign: "center",
  },
  therapistExp: {
    fontSize: 12.6,
    color: "#222",
    marginBottom: 1.8,
    textAlign: "right",
  },
  therapistPrice: {
    fontSize: 11.7,
    color: "#222",
    fontWeight: "500",
    marginBottom: 10.8,
    textAlign: "right",
  },
  profileButton: {
    borderWidth: 1,
    borderColor: "#6C5CE7",
    borderRadius: 9,
    paddingVertical: 5.4,
    paddingHorizontal: 18,
    alignSelf: "flex-end",
  },
  profileButtonText: {
    color: "#6C5CE7",
    fontSize: 14.4,
    fontWeight: "500",
  },
  therapyInfo: {
    backgroundColor: "#fff",
    opacity: 0.85,
    padding: 14.4,
    paddingTop: 9,
    paddingBottom: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  therapyTitle: {
    fontSize: 14.4,
    fontWeight: "600",
    color: "#222",
    marginBottom: 1.8,
  },
  therapyDesc: {
    fontSize: 11.7,
    color: "#888",
    marginBottom: 16.2,
  },
  therapyAvailableLabel: {
    fontSize: 10.8,
    color: "#888",
    marginBottom: 1.8,
  },
  therapyAvailable: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#222",
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 9,
    backgroundColor: "transparent",
  },
  dot: {
    width: 7.2,
    height: 7.2,
    borderRadius: 3.6,
    backgroundColor: "#fff",
    marginHorizontal: 3.6,
  },
  dotActive: {
    backgroundColor: "#6C5CE7",
  },
  doneButton: {
    backgroundColor: "#6C5CE7",
    borderRadius: 25.2,
    paddingVertical: 14.4,
    marginHorizontal: 21.6,
    marginTop: 7.2,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16.2,
    fontWeight: "600",
    fontFamily: "System",
  },
  cancelButton: {
    marginHorizontal: 21.6,
    marginTop: 10.8,
    marginBottom: 7.2,
    alignItems: "center",
    borderRadius: 25.2,
    paddingVertical: 12.6,
  },
  cancelButtonText: {
    color: "#6C5CE7",
    fontSize: 15.3,
    fontWeight: "600",
    fontFamily: "System",
  },
  flatListContent: {
    paddingBottom: 9,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 21.6,
    width: "100%",
  },
  progressBarWidth: {
    width: "100%",
  },
  matchScoreBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10.8,
    paddingVertical: 5.4,
    borderRadius: 18,
    alignSelf: 'flex-start',
    marginBottom: 7.2,
  },
  matchScoreText: {
    color: '#fff',
    fontSize: 11.7,
    fontWeight: '700',
    fontFamily: 'System',
  },
});
