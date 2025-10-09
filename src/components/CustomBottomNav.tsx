import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import ClockFolderIcon from "./ClockFolderIcon";
import WindRoseIcon from "./WindRoseIcon";
import UserProfileIcon from "./UserProfileIcon";
import { useNavigation, NavigationProp, useRoute } from "@react-navigation/native";

type Props = {
  onClockPress?: () => void;
  onWindRosePress?: () => void;
  onProfilePress?: () => void;
  activeIndex?: number;
};

type RootStackParamList = {
  Avatarhome1: undefined;
  Visualizations: undefined;
  Discoverprotier: undefined;
  ProfileScreen: undefined;
};

const CustomBottomNav = ({}: Props) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();

  // Determine which icon is active based on the current route name
  const getIconColor = (routeName: keyof RootStackParamList) =>
    route.name === routeName ? "#9170FF" : "#222";

  return (
    <View style={styles.bottomNav}>
      <View style={styles.navButtons}>
        {/* Home Icon */}
        <TouchableOpacity onPress={() => navigation.navigate("Avatarhome1")}>
          <Ionicons name="home-outline" size={32} color={getIconColor("Avatarhome1")} />
        </TouchableOpacity>
        {/* Clock Icon */}
        <TouchableOpacity onPress={() => navigation.navigate("Visualizations")}>
          <ClockFolderIcon width={32} height={32} color={getIconColor("Visualizations")} />
        </TouchableOpacity>
        {/* Wind Rose Icon */}
        <TouchableOpacity onPress={() => navigation.navigate("Discoverprotier")}>
          <WindRoseIcon width={32} height={32} color={getIconColor("Discoverprotier")} />
        </TouchableOpacity>
        {/* User Profile Icon */}
        <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
          <UserProfileIcon width={32} height={32} color={getIconColor("ProfileScreen")} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    backgroundColor: "#F6F6F6",
    paddingVertical: 35,
    paddingHorizontal: 1,
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 35,
    elevation: 5,
    marginBottom: -30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  navButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
  },
});

export default CustomBottomNav;