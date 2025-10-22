import { Image } from "expo-image";
import React from "react";
import { StyleSheet } from "react-native";

const backgroundImage = require("@/assets/images/app/bottom-tab.png");

export default function TabBarBackground() {
	return <Image source={backgroundImage} style={styles.backgroundImage} />;
}
const styles = StyleSheet.create({
	backgroundImage: {
		width: "100%",
		height: "100%",
	},
});
