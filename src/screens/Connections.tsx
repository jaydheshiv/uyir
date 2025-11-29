import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import ModalCard from '../components/ModalCard';
import ModalOverlay from '../components/ModalOverlay';
import QuestionOptions from '../components/QuestionOptions';
import type { RootStackParamList } from '../navigation/AppNavigator'; // Adjust path if needed
import { useAuth } from '../store/useAppStore';
import AvatarHome1 from "./Avatarhome1"; // Import your AvatarHome1 screen

// Response shapes from POST /therapist/recommendations
type OptionKey = 'A' | 'B' | 'C' | 'D';
type RecommendationQuestion = {
  question: string;
  options: Record<OptionKey, string>;
};

type RecommendedProfessional = {
  professional_id: string;
  display_name: string;
  profile_image_url: string | null;
  session_price_per_hour: number | null;
  match_score: number;
  matched_domain_tags: any[];
  matched_sub_specialization_tags: any[];
};

type TherapistRecommendationResponse = {
  questions: RecommendationQuestion[];
  recommended_professionals: RecommendedProfessional[];
};

export default function Connections() {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(1);
  const [questions, setQuestions] = useState<RecommendationQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendedPros, setRecommendedPros] = useState<RecommendedProfessional[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Array<{ index: number; key: OptionKey; value: string }>>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { token } = useAuth();

  // Get prompt from navigation params
  const params = route.params as { prompt?: string } | undefined;
  const prompt = params?.prompt || '';
  const questionCount = Math.min(10, Math.max(1, (params as any)?.questionCount ?? 5));
  const recommendationLimit = Math.min(10, Math.max(1, (params as any)?.recommendationLimit ?? 3));

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!token) {
        Alert.alert('Authentication error', 'Please login again');
        navigation.goBack();
        return;
      }

      if (!prompt) {
        Alert.alert('Error', 'No prompt provided');
        navigation.goBack();
        return;
      }

      const backendUrl = 'http://dev.api.uyir.ai:8081/therapist/recommendations';

      try {
        console.log('🔗 Fetching questions from:', backendUrl);
        console.log('🔗 Using prompt:', prompt);

        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            question_count: questionCount,
            recommendation_limit: recommendationLimit,
          }),
        });

        console.log('🔗 Response status:', response.status);
        const text = await response.text();
        console.log('🔗 Raw response:', text);

        let data: TherapistRecommendationResponse | null = null;
        try {
          data = text ? JSON.parse(text) : null;
          console.log('🔗 Parsed data:', JSON.stringify(data, null, 2));
        } catch (e) {
          console.error('Failed to parse response JSON:', e);
          Alert.alert('Error', 'Invalid response from server');
          setLoading(false);
          return;
        }

        if (!response.ok) {
          const errAny: any = data as any;
          const errMsg = (errAny && (errAny.detail || errAny.message)) || text || `Status ${response.status}`;
          Alert.alert('Error', errMsg.toString());
          navigation.goBack();
          return;
        }

        if (!data || !Array.isArray((data as any).questions)) {
          console.error('❌ Unexpected response format:', data);
          Alert.alert('Error', 'Invalid recommendations response');
          navigation.goBack();
          return;
        }

        setQuestions(data.questions);
        setRecommendedPros(data.recommended_professionals || []);
        console.log('✅ Loaded questions:', JSON.stringify(data.questions, null, 2));
        console.log('✅ Recommended professionals:', JSON.stringify(data.recommended_professionals || [], null, 2));
      } catch (error) {
        console.error('❌ Failed to fetch questions:', error);
        Alert.alert('Network error', 'Failed to load questions. Please try again.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [token, prompt, navigation]);

  // Map current question's options to an array for the UI component
  const currentOptions: string[] = useMemo(() => {
    const q = questions[currentStep - 1];
    if (!q) return [];
    // Ensure consistent A->D order, filter out any missing/empty options
    return (['A', 'B', 'C', 'D'] as OptionKey[])
      .map(k => q.options?.[k])
      .filter((v): v is string => typeof v === 'string' && v.length > 0);
  }, [questions, currentStep]);

  const handleNext = async () => {
    const q = questions[currentStep - 1];
    if (q && selectedOption) {
      // Find which key (A-D) corresponds to the selected option string
      const entry = Object.entries(q.options).find(([_, v]) => v === selectedOption) as [OptionKey, string] | undefined;
      if (entry) {
        setAnswers(prev => {
          const next = prev.filter(a => a.index !== currentStep - 1);
          next.push({ index: currentStep - 1, key: entry[0], value: entry[1] });
          return next;
        });
      }
    }

    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
      setSelectedOption("");
      return;
    }

    // Finished all questions: submit answers to get final recommendations
    setSubmitting(true);
    try {
      // Build the final answers array including the current question
      const finalAnswers = [...answers];
      if (q && selectedOption) {
        const entry = Object.entries(q.options).find(([_, v]) => v === selectedOption) as [OptionKey, string] | undefined;
        if (entry && !finalAnswers.some(a => a.index === currentStep - 1)) {
          finalAnswers.push({ index: currentStep - 1, key: entry[0], value: entry[1] });
        }
      }

      // Submit answers to get updated recommendations
      const backendUrl = 'http://dev.api.uyir.ai:8081/therapist/recommendations';

      console.log('📤 Submitting answers:', JSON.stringify(finalAnswers, null, 2));

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          question_count: questionCount,
          recommendation_limit: recommendationLimit,
          answers: finalAnswers.sort((a, b) => a.index - b.index).map(a => ({
            question_index: a.index,
            selected_option: a.key,
            option_text: a.value
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Final recommendations received:', JSON.stringify(data, null, 2));

        const finalRecommendations = data.recommended_professionals || [];

        navigation.navigate("Connections1", {
          recommendedProfessionals: finalRecommendations,
          answers: finalAnswers.sort((a, b) => a.index - b.index),
        } as any);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to get final recommendations:', response.status, errorText);
        Alert.alert('Error', 'Failed to get recommendations. Using initial results.');

        // Fallback to initial recommendations if submission fails
        navigation.navigate("Connections1", {
          recommendedProfessionals: recommendedPros,
          answers: finalAnswers.sort((a, b) => a.index - b.index),
        } as any);
      }
    } catch (error) {
      console.error('❌ Error submitting answers:', error);
      Alert.alert('Network Error', 'Failed to submit answers. Using initial results.');

      // Fallback to initial recommendations on network error
      navigation.navigate("Connections1", {
        recommendedProfessionals: recommendedPros,
        answers: answers.sort((a, b) => a.index - b.index),
      } as any);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Render AvatarHome1 in the background */}
      <AvatarHome1 />

      {/* Overlay and Modal */}
      <View style={styles.overlay} pointerEvents="box-none" />

      <View style={styles.modalContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6C5CE7" />
            <Text style={styles.loadingText}>Generating personalized questions...</Text>
          </View>
        ) : questions.length === 0 ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No questions available</Text>
          </View>
        ) : (
          <>
            <View style={styles.modalContent}>
              {/* Options */}
              <QuestionOptions
                question={questions[currentStep - 1]?.question ?? ''}
                options={currentOptions}
                selectedOption={selectedOption}
                onSelect={setSelectedOption}
              />

              {/* Progress */}
              <View style={styles.progressRow}>
                <Text style={styles.progressText}>{currentStep}</Text>
                <Text style={styles.progressTotal}>/{questions.length}</Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${(currentStep / questions.length) * 100}%` },
                  ]}
                />
              </View>
            </View>

            {/* Next Button */}
            <TouchableOpacity
              style={[
                styles.nextButton,
                (!selectedOption || submitting) && styles.nextButtonDisabled
              ]}
              onPress={handleNext}
              disabled={!selectedOption || submitting}
            >
              <Text style={[
                styles.nextButtonText,
                (!selectedOption || submitting) && styles.nextButtonTextDisabled
              ]}>
                {currentStep < questions.length ? "Next" : "Finish"}
              </Text>
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <ModalOverlay />
      <ModalCard>{/* modal content */}</ModalCard>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 2,
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F7F7F9",
    borderTopLeftRadius: 25.2,
    borderTopRightRadius: 25.2,
    paddingBottom: 21.6,
    paddingTop: 10.8,
    paddingHorizontal: 0,
    width: "100%",
    alignSelf: "center",
    zIndex: 2,
  },
  modalContent: {
    backgroundColor: "#ECECEC",
    borderRadius: 4.5,
    margin: 19.8,
    padding: 18,
    alignItems: "center",
  },
  questionText: {
    fontSize: 16.2,
    marginRight: 18,
    color: "#111",
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 7.2,
    fontFamily: "System",
  },
  optionButton: {
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 25.2,
    paddingVertical: 12.6,
    marginBottom: 12.6,
    backgroundColor: "#ECECEC",
    alignItems: "center",
    width: width - 150,
    alignSelf: "center",
  },
  optionButtonSelected: {
    backgroundColor: "#A393FA",
    borderColor: "#A393FA",
  },
  optionText: {
    fontSize: 13.5,
    color: "#222",
    fontWeight: "400",
    fontFamily: "System",
  },
  optionTextSelected: {
    color: "#fff",
    fontWeight: "500",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginBottom: 9,
  },
  progressText: {
    fontSize: 16.2,
    color: "#222",
    fontWeight: "400",
  },
  progressTotal: {
    fontSize: 11.7,
    color: "#222",
    marginLeft: 1.8,
    marginBottom: 0.9,
  },
  progressBarBackground: {
    width: "100%",
    height: 7.2,
    backgroundColor: "#E5E5EA",
    borderRadius: 3.6,
    overflow: "hidden",
    marginBottom: 0,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#6C5CE7",
    borderRadius: 3.6,
  },
  nextButton: {
    backgroundColor: "#6C5CE7",
    borderRadius: 25.2,
    paddingVertical: 14.4,
    marginHorizontal: 25.2,
    marginTop: 10.8,
    alignItems: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "#D1D1D6",
    opacity: 0.6,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16.2,
    fontWeight: "600",
    fontFamily: "System",
  },
  nextButtonTextDisabled: {
    color: "#8E8E93",
  },
  closeButton: {
    marginHorizontal: 25.2,
    marginTop: 12.6,
    marginBottom: 9,
    alignItems: "center",
    borderRadius: 25.2,
    paddingVertical: 12.6,
  },
  closeButtonText: {
    color: "#6C5CE7",
    fontSize: 15.3,
    fontWeight: "600",
    fontFamily: "System",
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    backgroundColor: "#ECECEC",
    borderRadius: 4.5,
    margin: 19.8,
    padding: 36,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 180,
  },
  loadingText: {
    marginTop: 14.4,
    fontSize: 14.4,
    color: "#6C5CE7",
    fontWeight: "500",
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "#ECECEC",
    borderRadius: 4.5,
    margin: 19.8,
    padding: 36,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 180,
  },
  errorText: {
    fontSize: 14.4,
    color: "#FF3B30",
    fontWeight: "500",
    textAlign: "center",
  },
});
