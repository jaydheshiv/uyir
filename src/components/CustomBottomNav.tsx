import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../theme/ThemeContext";
import ClockFolderIcon from "./ClockFolderIcon";
import UserProfileIcon from "./UserProfileIcon";
import WindRoseIcon from "./WindRoseIcon";

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

const CustomBottomNav = ({ }: Props) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { theme } = useTheme();

  // Determine which icon is active based on the current route name
  const getIconColor = (routeName: keyof RootStackParamList) =>
    route.name === routeName ? theme.primary : theme.textSecondary;

  return (
    <View style={[styles.bottomNav, { backgroundColor: theme.bottomNavBackground }]}>
      <View style={styles.navButtons}>
        {/* Home Icon */}
        <TouchableOpacity onPress={() => navigation.navigate("Avatarhome1")}>
          <Ionicons name="home-outline" size={28} color={getIconColor("Avatarhome1")} />
        </TouchableOpacity>
        {/* Clock Icon */}
        <TouchableOpacity onPress={() => navigation.navigate("Visualizations")}>
          <ClockFolderIcon width={32} height={32} color={getIconColor("Visualizations")} />
        </TouchableOpacity>
        {/* Wind Rose Icon */}
        <TouchableOpacity onPress={() => navigation.navigate("Discoverprotier")}>
          <WindRoseIcon width={28} height={28} color={getIconColor("Discoverprotier")} />
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
    paddingVertical: 31.5,
    paddingHorizontal: 0.9,
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 35,
    elevation: 5,
    marginBottom: -30,
    borderTopLeftRadius: 21.6,
    borderTopRightRadius: 21.6,
  },
  navButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
  },
});

export default CustomBottomNav;