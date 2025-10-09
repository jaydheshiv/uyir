import { NavigationProp, useNavigation } from "@react-navigation/native";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import CustomBottomNav from "../components/CustomBottomNav";

const experts = [
  {
    id: 1,
    name: "Anu",
    title: "Behavioral therapy",
    description: "Action-oriented approach to mental health treatment",
    image:
      "https://api.builder.io/api/v1/image/assets/TEMP/a3f7b523f6fc007bf86469d0db176c386f88ec78?width=451",
  },
  {
    id: 2,
    name: "Joe",
    title: "Psychiatrist",
    description:
      "Medication management by prescribing psychotropic medication",
    image:
      "https://api.builder.io/api/v1/image/assets/TEMP/a8f5418417718bb843d5b8dd7ee743c18d07d350?width=448",
  },
  {
    id: 3,
    name: "Arya",
    title: "Marriage and Family Therapist",
    description:
      "Trained in using psychotherapy and other mental health approaches",
    image:
      "https://api.builder.io/api/v1/image/assets/TEMP/0edd0d5d2bdd99ee80dd0ba27960ffe528d11e9c?width=572",
  },
];

const categories = [
  { name: "Therapists", active: true },
  { name: "Fitness coach", active: false },
  { name: "Dietitian", active: false },
  { name: "Improve Focus", active: false },
];



export default function Discoverprotier() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<any>>();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Connect with Experts</Text>
        <TouchableOpacity style={styles.headerAvatar}>
          <Ionicons name="search" size={22} color="#7B61FF" />
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
        style={styles.categoryScrollSpacing}
      >
        {categories.map((category, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.categoryPill,
              category.active
                ? styles.categoryPillActive
                : styles.categoryPillInactive,
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.categoryPillText,
                category.active
                  ? styles.categoryPillTextActive
                  : styles.categoryPillTextInactive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Expert Cards */}
      <ScrollView
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {experts.map((expert) => (
          <View key={expert.id} style={styles.expertCard}>
            {/* Image as background */}
            <Image
              source={{ uri: expert.image }}
              style={styles.cardBgImage}
              resizeMode="cover"
            />
            {/* Overlay for chat and info */}
            <View style={styles.overlayContent}>
              {/* Chat Button */}
              <TouchableOpacity style={styles.chatButton}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color="#7B61FF" />
                <Text style={styles.chatButtonText}>Chat</Text>
              </TouchableOpacity>
              {/* Info at bottom */}
              <View style={styles.expertInfoTransparent}>
                <Text style={styles.expertName}>
                  {expert.name} - {expert.title}
                </Text>
                <Text style={styles.expertDesc}>{expert.description}</Text>
              </View>
            </View>
          </View>
        ))}
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
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    fontFamily: "System",
    paddingBottom: 15,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ede9fe",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryScroll: {
    paddingHorizontal: 20,
    paddingBottom: 1,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 99,
    marginRight: 10,
    borderWidth: 2,
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryPillActive: {
    backgroundColor: "#fff",
    borderColor: "#7B61FF",
  },
  categoryPillInactive: {
    backgroundColor: "#fff",
    borderColor: "#e5e7eb",
  },
  categoryPillText: {
    fontSize: 20,
    fontWeight: "200",
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
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 7,
    width: "100%",
    alignSelf: "center",
    height: 190,
    position: "relative",
  },
  cardBgImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  overlayContent: {
    flex: 1,
    justifyContent: "space-between",
    height: "100%",
  },
  chatButton: {
    position: "absolute",
    top: 12,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    opacity: 1,
    backgroundColor: "transparent",
    zIndex: 2,
  },
  chatButtonText: {
    color: "#7B61FF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 4,
  },
  expertInfoTransparent: {
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  expertName: {
    fontSize: 17,
    fontWeight: "500",
    color: "#222",
    marginBottom: 2,
    fontFamily: "System",
  },
  expertDesc: {
    fontSize: 14,
    color: "#5f5e5eff",
    marginTop: 1,
    fontFamily: "System",
  },
  categoryScrollSpacing: {
    marginBottom: 18,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  bottomNavContainer: {
    marginBottom: 25,
  },
});