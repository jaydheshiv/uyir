import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ModalCard from '../components/ModalCard';
import ModalOverlay from '../components/ModalOverlay';
import TherapistCard from '../components/TherapistCard';

type RootStackParamList = {
  Avatarhome1: undefined;
  // add other routes here if needed
};

export default function Connections1() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleDone = () => {
    navigation.navigate("Avatarhome1");
  };
  const handleCancel = () => {
    navigation.navigate("Avatarhome1");
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
              <Text style={styles.sectionLabel}>Well-being score</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>46%</Text>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, styles.progressBarWidth]} />
                </View>
              </View>

              {/* Suggested Therapists */}
              <Text style={styles.sectionLabel}>Suggested therapists</Text>
              <TherapistCard
                image="https://wallpapers.com/images/hd/sadhguru-sitting-and-smilling-4grkugynnnp8zhf2.jpg"
                name="Sadhguru"
                experience="7+ years of experience"
                price="₹1,500 for 50 minutes"
                therapyType="Behavioral therapy"
                therapyDesc="Action-oriented approach to mental health treatment"
                availableVia="Video, Voice, Chat, Avatar"
                activeDot={0}
                totalDots={3}
              />
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 20,
    paddingTop: 12,
    paddingHorizontal: 0,
    width: "100%",
    alignSelf: "center",
    zIndex: 2,
  },
  modalContent: {
    backgroundColor: "#ECECEC",
    borderRadius: 18,
    margin: 24,
    padding: 24,
    alignItems: "flex-start",
  },
  sectionLabel: {
    fontSize: 17,
    color: "#222",
    fontWeight: "400",
    marginBottom: 14,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#111",
    textAlign: "center",
    marginBottom: 16,
  },
  progressBarBackground: {
    width: width - 100,
    height: 8,
    backgroundColor: "#d5d5e5ff",
    borderRadius: 4,
    overflow: "hidden",
    alignSelf: "center",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#6C5CE7",
    borderRadius: 4,
  },
  therapistCard: {
    backgroundColor: "#E7E3FF",
    borderRadius: 20,
    marginTop: 2,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  therapistCardTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    paddingBottom: 9,
  },
  therapistImage: {
    width: 110,
    height: 120,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: "#ccc",
  },
  therapistName: {
    fontSize: 19,
    fontWeight: "600",
    color: "#222",
    marginBottom: 4,
    textAlign: "center",
  },
  therapistExp: {
    fontSize: 14,
    color: "#222",
    marginBottom: 2,
    textAlign: "right",
  },
  therapistPrice: {
    fontSize: 13,
    color: "#222",
    fontWeight: "500",
    marginBottom: 12,
    textAlign: "right",
  },
  profileButton: {
    borderWidth: 1,
    borderColor: "#6C5CE7",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 20,
    alignSelf: "flex-end",
  },
  profileButtonText: {
    color: "#6C5CE7",
    fontSize: 16,
    fontWeight: "500",
  },
  therapyInfo: {
    backgroundColor: "#fff",
    opacity: 0.85,
    padding: 16,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  therapyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 2,
  },
  therapyDesc: {
    fontSize: 13,
    color: "#888",
    marginBottom: 18,
  },
  therapyAvailableLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
  },
  therapyAvailable: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: "#6C5CE7",
  },
  doneButton: {
    backgroundColor: "#6C5CE7",
    borderRadius: 28,
    paddingVertical: 16,
    marginHorizontal: 24,
    marginTop: 8,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "System",
  },
  cancelButton: {
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 8,
    alignItems: "center",
    borderRadius: 28,
    paddingVertical: 14,
  },
  cancelButtonText: {
    color: "#6C5CE7",
    fontSize: 17,
    fontWeight: "600",
    fontFamily: "System",
  },
  flatListContent: {
    paddingBottom: 10,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  progressBarWidth: {
    width: "46%",
  },
});