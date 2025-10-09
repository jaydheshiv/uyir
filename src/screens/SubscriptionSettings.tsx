import { useNavigation } from "@react-navigation/native";
import { Edit, Info } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import CustomBottomNav from "../components/CustomBottomNav";

export default function SubscriptionSettings() {
  const navigation = useNavigation();
  const [tiers, setTiers] = useState<Array<{ title: string; price: string; benefits: string }>>([
    {
      title: "Per Day",
      price: "5.00",
      benefits: "Exclusive updates\nAccess to community chat\nYour name in credits",
    },
    { title: "", price: "", benefits: "" },
    { title: "", price: "", benefits: "" },
  ]);
  const [showInfo, setShowInfo] = useState([false, false, false]);

  // Example calculation for info box
  const uyirFee = 0.25;

  const handleInfoToggle = (idx: number) => {
    setShowInfo(prev => prev.map((v, i) => (i === idx ? !v : v)));
  };
  const handleTierChange = (idx: number, field: string, value: string) => {
    setTiers(prev => prev.map((tier, i) => (i === idx ? { ...tier, [field]: value } : tier)));
  };

  return (
    <View style={styles.container}>
      {/* Header: custom layout as in Editing.tsx */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription Settings</Text>
        <TouchableOpacity style={styles.editIcon}>
          <Edit color="black" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Subscription Tier Cards */}
        {tiers.map((tier, idx) => (
          <View style={styles.card} key={idx}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.textInput}
              value={tier.title}
              onChangeText={val => handleTierChange(idx, "title", val)}
              placeholder="Title"
              placeholderTextColor="#BDBDBD"
            />
            <Text style={styles.inputLabel}>Price</Text>
            <View style={styles.priceRow}>
              <TextInput
                style={[styles.textInput, styles.priceInput]}
                value={tier.price}
                onChangeText={val => handleTierChange(idx, "price", val)}
                placeholder="$0.00"
                placeholderTextColor="#BDBDBD"
                keyboardType="numeric"
              />
              <View style={styles.infoIconContainer}>
                <TouchableOpacity onPress={() => handleInfoToggle(idx)}>
                  <Info color="#6C5CE7" size={20} />
                </TouchableOpacity>
                {showInfo[idx] && (
                  <View style={[styles.infoBox, styles.infoBoxPositioned]}>
                    <Text style={styles.infoTitle}>Earnings updates</Text>
                    <Text style={styles.infoText}>
                      Tier Price ${parseFloat(tier.price || "0").toFixed(2)}
                    </Text>
                    <Text style={styles.infoText}>
                      Uyir Fee (25%) -${(parseFloat(tier.price || "0") * uyirFee).toFixed(2)}
                    </Text>
                    <Text style={styles.infoText}>
                      You Earn $
                      {(
                        parseFloat(tier.price || "0") -
                        parseFloat(tier.price || "0") * uyirFee
                      ).toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.inputLabel}>Benefits</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={tier.benefits}
              onChangeText={val => handleTierChange(idx, "benefits", val)}
              placeholder="Benefits"
              placeholderTextColor="#BDBDBD"
              multiline
              numberOfLines={3}
            />
          </View>
        ))}

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <CustomBottomNav />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 0,
    marginLeft: -80,
    backgroundColor: "#F7F7F7",
    justifyContent: "space-between",
  },
  backBtn: {
    padding: 1,
    borderRadius: 20,
    marginBottom: 80,
    marginLeft: 70,
  },
  editIcon: {
    padding: 4,
    borderRadius: 20,
    marginBottom: 80,
    marginLeft: 70,
  },
  headerTitle: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#222",
    flex: 1,
    textAlign: "left",
    marginLeft: -25,
    marginTop: 10,
    fontFamily: "Outfit",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    paddingTop: -10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#D1C9F7",
    padding: 18,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: "black",
    fontFamily: "Outfit-Bold",
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 8,
  },
  textInput: {
    width: "100%",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: "#D1C9F7",
    borderRadius: 12,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#222",
    fontFamily: "Outfit-Regular",
    marginBottom: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  infoBox: {
    position: "absolute",
    right: 0,
    bottom: 36,
    width: 170,
    backgroundColor: "#fff",
    borderColor: "#6C5CE7",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    zIndex: 2,
    elevation: 2,
    shadowColor: "#6C5CE7",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#222",
    marginBottom: 2,
  },
  infoValue: {
    color: "#222",
    fontWeight: "bold",
  },
  infoEarn: {
    color: "#6C5CE7",
    fontWeight: "bold",
  },
  saveButton: {
    marginTop: 8,
    width: "100%",
    height: 48,
    backgroundColor: "#6C5CE7",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 35,
    marginBottom: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "Outfit-Bold",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  priceInput: {
    flex: 1,
    paddingRight: 36,
  },
  infoIconContainer: {
    position: "absolute",
    right: 8,
    top: 15,
  },
  infoBoxPositioned: {
    right: 0,
    bottom: 30,
    left: undefined,
  },
  bottomNavContainer: {
    marginBottom: 30,
  },
});
