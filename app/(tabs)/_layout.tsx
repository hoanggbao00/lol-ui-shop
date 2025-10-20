import { Image } from "expo-image";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Mask, Path } from "react-native-svg";

const icons = {
  Home: require("@/assets/icons/shopping-cart.png"),
  Book: require("@/assets/icons/borrow-book.png"),
  Document: require("@/assets/icons/document.png"),
  User: require("@/assets/icons/user.png"),
};

// Custom SVG Icon Components for React Native
const HomeIcon = ({ color, focused }) => (
  <View style={focused && styles.activeIconContainer}>
    {focused && <View style={styles.activeCircle} />}
    {focused && <View style={styles.activeCircle2} />}
    <Image source={icons.Home} style={{ width: 24, height: 24 }} />
  </View>
);

const BookIcon = ({ color, focused }) => (
  <View style={focused && styles.activeIconContainer}>
    {focused && <View style={styles.activeCircle} />}
    {focused && <View style={styles.activeCircle2} />}
    <Image source={icons.Book} style={{ width: 24, height: 24 }} />
  </View>
);

const DocumentIcon = ({ color, focused }) => (
  <View style={focused && styles.activeIconContainer}>
    {focused && <View style={styles.activeCircle} />}
    {focused && <View style={styles.activeCircle2} />}
    <Image source={icons.Document} style={{ width: 24, height: 24 }} />
  </View>
);

const UserIcon = ({ color, focused }) => (
  <View style={focused && styles.activeIconContainer}>
    {focused && <View style={styles.activeCircle} />}
    {focused && <View style={styles.activeCircle2} />}
    <Image source={icons.User} style={{ width: 24, height: 24 }} />
  </View>
);

// Custom Tab Bar Background Component
const CustomTabBarBackground = () => (
  <View
    style={{
      position: "absolute",
      top: -55,
      left: -291,
      transform: "scale(0.4)",
    }}
  >
    <Svg width="1000" height="195" viewBox="0 0 1000 195" fill="none">
      <Mask id="path-1-inside-1_0_1" fill="white">
        <Path d="M967.104 0C967.092 0.331979 967.083 0.665281 967.083 1C967.083 17.0163 981.82 30 1000 30V211H0V29C18.1796 29 32.917 16.0163 32.917 0H967.104Z" />
      </Mask>
      <Path
        d="M967.104 0C967.092 0.331979 967.083 0.665281 967.083 1C967.083 17.0163 981.82 30 1000 30V211H0V29C18.1796 29 32.917 16.0163 32.917 0H967.104Z"
        fill="#09333B"
      />
      <Path
        d="M967.104 0L972.101 0.192193L972.301 -5H967.104V0ZM1000 30H1005V25L1000 25V30ZM1000 211V216H1005V211H1000ZM0 211H-5V216H0V211ZM0 29V24H-5V29H0ZM32.917 0V-5H27.917V0H32.917ZM967.104 0L962.108 -0.192193C962.094 0.178995 962.083 0.580415 962.083 1H967.083H972.083C972.083 0.750147 972.09 0.484963 972.101 0.192193L967.104 0ZM967.083 1H962.083C962.083 20.3541 979.673 35 1000 35V30V25C983.968 25 972.083 13.6784 972.083 1H967.083ZM1000 30H995V211H1000H1005V30H1000ZM1000 211V206H0V211V216H1000V211ZM0 211H5V29H0H-5V211H0ZM0 29V34C20.327 34 37.917 19.3541 37.917 0H32.917H27.917C27.917 12.6784 16.0323 24 0 24V29ZM32.917 0V5H967.104V0V-5H32.917V0Z"
        fill="#958860"
        mask="url(#path-1-inside-1_0_1)"
      />
      <Mask id="path-3-inside-2_0_1" fill="white">
        <Path d="M957.749 10C957.736 10.3242 957.728 10.6497 957.728 10.9766C957.728 26.5851 972.17 39.2382 989.986 39.2383C989.991 39.2383 989.995 39.2373 990 39.2373V215.63H10V38.2607C27.8099 38.2544 42.2451 25.6047 42.2451 10H957.749Z" />
      </Mask>
      <Path
        d="M957.749 10C957.736 10.3242 957.728 10.6497 957.728 10.9766C957.728 26.5851 972.17 39.2382 989.986 39.2383C989.991 39.2383 989.995 39.2373 990 39.2373V215.63H10V38.2607C27.8099 38.2544 42.2451 25.6047 42.2451 10H957.749Z"
        fill="#010A13"
      />
      <Path
        d="M957.749 10L962.745 10.1937L962.947 5H957.749V10ZM957.728 10.9766L952.728 10.9765V10.9766H957.728ZM989.986 39.2383V44.2383V39.2383ZM990 39.2373H995V34.2355L989.998 34.2373L990 39.2373ZM990 215.63V220.63H995V215.63H990ZM10 215.63H5V220.63H10V215.63ZM10 38.2607L9.99821 33.2607L5 33.2625V38.2607H10ZM42.2451 10V5H37.2451V10H42.2451ZM957.749 10L952.753 9.80629C952.739 10.1659 952.728 10.5614 952.728 10.9765L957.728 10.9766L962.728 10.9766C962.728 10.738 962.734 10.4825 962.745 10.1937L957.749 10ZM957.728 10.9766H952.728C952.728 29.9474 970.051 44.2382 989.986 44.2383V39.2383V34.2383C974.29 34.2382 962.728 23.2229 962.728 10.9766H957.728ZM989.986 39.2383V44.2383C990.077 44.2383 990.157 44.2358 990.223 44.2327C990.289 44.2296 990.346 44.2256 990.389 44.2222C990.411 44.2204 990.43 44.2187 990.447 44.2172C990.463 44.2157 990.477 44.2144 990.488 44.2133C990.499 44.2122 990.507 44.2113 990.513 44.2107C990.516 44.2104 990.518 44.2102 990.519 44.21C990.521 44.2099 990.522 44.2098 990.522 44.2098C990.523 44.2097 990.519 44.2101 990.515 44.2105C990.51 44.211 990.502 44.2119 990.492 44.2129C990.481 44.2139 990.468 44.2152 990.452 44.2166C990.437 44.2181 990.418 44.2197 990.397 44.2214C990.355 44.2248 990.299 44.2287 990.235 44.2318C990.169 44.2348 990.091 44.2373 990.002 44.2373L990 39.2373L989.998 34.2373C989.908 34.2373 989.828 34.2398 989.762 34.2429C989.696 34.2461 989.64 34.25 989.596 34.2535C989.575 34.2552 989.555 34.2569 989.539 34.2584C989.523 34.2599 989.509 34.2613 989.498 34.2624C989.487 34.2634 989.479 34.2643 989.473 34.2649C989.471 34.2652 989.468 34.2654 989.467 34.2656C989.466 34.2656 989.466 34.2657 989.465 34.2657C989.465 34.2658 989.465 34.2658 989.465 34.2658C989.464 34.2659 989.467 34.2655 989.472 34.265C989.477 34.2645 989.485 34.2637 989.495 34.2627C989.505 34.2616 989.519 34.2603 989.535 34.2589C989.55 34.2574 989.569 34.2558 989.591 34.2541C989.633 34.2507 989.688 34.2468 989.753 34.2438C989.818 34.2407 989.897 34.2383 989.986 34.2383V39.2383ZM990 39.2373H985V215.63H990H995V39.2373H990ZM990 215.63V210.63H10V215.63V220.63H990V215.63ZM10 215.63H15V38.2607H10H5V215.63H10ZM10 38.2607L10.0018 43.2607C29.9306 43.2536 47.2451 28.9662 47.2451 10H42.2451H37.2451C37.2451 22.2432 25.6891 33.2551 9.99821 33.2607L10 38.2607ZM42.2451 10V15H957.749V10V5H42.2451V10Z"
        fill="#958860"
        mask="url(#path-3-inside-2_0_1)"
      />
    </Svg>
  </View>
);

// Tabs Layout Component
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#E4B831",
        tabBarInactiveTintColor: "#8B7355",
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        headerShown: false,
        tabBarBackground: () => <CustomTabBarBackground />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <HomeIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="book"
        options={{
          title: "Book",
          tabBarIcon: ({ color, focused }) => (
            <BookIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="document"
        options={{
          title: "Document",
          tabBarIcon: ({ color, focused }) => (
            <DocumentIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: "User",
          tabBarIcon: ({ color, focused }) => (
            <UserIcon color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    paddingTop: 23,
    shadowColor: "transparent",
    position: "absolute",
    borderTopColor: 'transparent',
  },
  activeIconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  activeCircle: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#FBE5A2",
    zIndex: -1,
  },
  activeCircle2: {
    position: "absolute",
    width: 45,
    height: 45,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#FBE5A2",
    zIndex: -1,
  },
  tabBarBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backgroundSvg: {
    position: "absolute",
    bottom: -20,
  },
});
