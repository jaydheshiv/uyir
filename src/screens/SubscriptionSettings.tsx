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
    paddingTop: 54,
    paddingHorizontal: 21.6,
    paddingBottom: 0,
    marginLeft: -80,
    backgroundColor: "#F7F7F7",
    justifyContent: "space-between",
  },
  backBtn: {
    padding: 0.9,
    borderRadius: 18,
    marginBottom: 72,
    marginLeft: 70,
  },
  editIcon: {
    padding: 3.6,
    borderRadius: 18,
    marginBottom: 70,
    marginLeft: 36,
  },
  headerTitle: {
    fontSize: 20.7,
    fontWeight: "bold",
    color: "#222",
    flex: 1,
    textAlign: "left",
    marginLeft: -25,
    marginTop: -10,
    fontFamily: "Outfit",
    marginBottom: -10,
  },
  scrollContent: {
    paddingHorizontal: 9,
    paddingBottom: 36,
    paddingTop: -10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16.2,
    borderWidth: 1.5,
    borderColor: "#D1C9F7",
    padding: 16.2,
    marginBottom: 9,
  },
  inputLabel: {
    fontSize: 14.4,
    color: "black",
    fontFamily: "Outfit-Bold",
    marginBottom: 7.2,
    marginLeft: 3.6,
    marginTop: 7.2,
  },
  textInput: {
    width: "100%",
    paddingHorizontal: 10.8,
    paddingVertical: 10.8,
    borderWidth: 1.5,
    borderColor: "#D1C9F7",
    borderRadius: 10.8,
    backgroundColor: "#fff",
    fontSize: 14.4,
    color: "#222",
    fontFamily: "Outfit-Regular",
    marginBottom: 7.2,
  },
  textArea: {
    height: 72,
    textAlignVertical: "top",
  },
  infoBox: {
    position: "absolute",
    right: 0,
    bottom: 32.4,
    width: 153,
    backgroundColor: "#fff",
    borderColor: "#6C5CE7",
    borderWidth: 1,
    borderRadius: 10.8,
    padding: 9,
    zIndex: 2,
    elevation: 2,
    shadowColor: "#6C5CE7",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 3.6,
  },
  infoText: {
    fontSize: 11.7,
    color: "#222",
    marginBottom: 1.8,
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
    marginTop: 7.2,
    width: "100%",
    height: 43.2,
    backgroundColor: "#6C5CE7",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 31.5,
    marginBottom: 18,
  },
  saveButtonText: {
    fontSize: 14.4,
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
    paddingRight: 32.4,
  },
  infoIconContainer: {
    position: "absolute",
    right: 7.2,
    top: 13.5,
  },
  infoBoxPositioned: {
    right: 0,
    bottom: 27,
    left: undefined,
  },
  bottomNavContainer: {
    marginBottom: 31.5,
  },
});

