import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ModalCard from '../components/ModalCard';
import ModalOverlay from '../components/ModalOverlay';
import QuestionOptions from '../components/QuestionOptions';
import type { RootStackParamList } from '../navigation/AppNavigator'; // Adjust path if needed
import AvatarHome1 from "./Avatarhome1"; // Import your AvatarHome1 screen

const options = [
  "All of the time",
  "Most of the time",
  "More than half of the time",
  "Less than half of the time",
  "Some of the time",
  "At no time",
];

export default function Connections() {
  const [selectedOption, setSelectedOption] = useState("All of the time");
  const [currentStep, setCurrentStep] = useState(1);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Example questions array for demonstration
  const questions = [
    "I have felt cheerful and in good spirits",
    "I have felt calm and relaxed",
    "I have felt active and vigorous",
    "I woke up feeling fresh and rested",
    "My daily life has been filled with things that interest me",
  ];

  const handleNext = () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
      setSelectedOption("All of the time");
    } else {
      navigation.navigate("Connections1"); // Navigate to Connections1 screen
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
        <View style={styles.modalContent}>
          {/* Question */}
          <Text style={styles.questionText} />

          {/* Options */}
          <QuestionOptions
            question={questions[currentStep - 1]}
            options={options}
            selectedOption={selectedOption}
            onSelect={setSelectedOption}
          />

          {/* Progress */}
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>{currentStep}</Text>
            <Text style={styles.progressTotal}>/5</Text>
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
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentStep < questions.length ? "Next" : "Finish"}
          </Text>
        </TouchableOpacity>

        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 24,
    paddingTop: 12,
    paddingHorizontal: 0,
    width: "100%",
    alignSelf: "center",
    zIndex: 2,
  },
  modalContent: {
    backgroundColor: "#ECECEC",
    borderRadius: 5,
    margin: 22,
    padding: 20,
    alignItems: "center",
  },
  questionText: {
    fontSize: 18,
    marginRight: 20,
    color: "#111",
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "System",
  },
  optionButton: {
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 28,
    paddingVertical: 14,
    marginBottom: 14,
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
    fontSize: 15,
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
    marginBottom: 10,
  },
  progressText: {
    fontSize: 18,
    color: "#222",
    fontWeight: "400",
  },
  progressTotal: {
    fontSize: 13,
    color: "#222",
    marginLeft: 2,
    marginBottom: 1,
  },
  progressBarBackground: {
    width: "100%",
    height: 8,
    backgroundColor: "#E5E5EA",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 0,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#6C5CE7",
    borderRadius: 4,
  },
  nextButton: {
    backgroundColor: "#6C5CE7",
    borderRadius: 28,
    paddingVertical: 16,
    marginHorizontal: 28,
    marginTop: 12,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "System",
  },
  closeButton: {
    marginHorizontal: 28,
    marginTop: 14,
    marginBottom: 10,
    alignItems: "center",
    borderRadius: 28,
    paddingVertical: 14,
  },
  closeButtonText: {
    color: "#6C5CE7",
    fontSize: 17,
    fontWeight: "600",
    fontFamily: "System",
  },
  container: {
    flex: 1,
  },
});