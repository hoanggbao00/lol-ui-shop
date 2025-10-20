import { ImageBackground } from "expo-image";
import React from "react";
import { StyleSheet } from "react-native";

const backgroundImage = require("@/assets/images/app/background.png");

export default function Background() {
	return (
		<ImageBackground
			source={backgroundImage}
			style={styles.backgroundImage}
			imageStyle={styles.backgroundImageStyle}
		/>
	);
}

const styles = StyleSheet.create({
	backgroundImage: {
		position: "absolute",
		inset: 0,
	},
	backgroundImageStyle: {
		opacity: 1,
		transform: [{ scale: 1.3 }],
	},
});
