import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

export default function BuyNowButton() {
	return (
		<View style={styles.container}>
			<Svg width="413" height="128" viewBox="0 0 413 128" fill="none" style={styles.svgStyles}>
				<Path
					d="M413 31.3105L377.274 63.4414L413 95.5713V128H0V95.5752L35.7256 63.4453L0 31.3145V0H413V31.3105Z"
					fill="url(#paint0_linear_115_340)"
				/>
				<Defs>
					<LinearGradient
						id="paint0_linear_115_340"
						x1="206.5"
						y1="0"
						x2="206.5"
						y2="128"
						gradientUnits="userSpaceOnUse"
					>
						<Stop stopColor="#958860" />
						<Stop offset="1" stopColor="#CDBE91" />
					</LinearGradient>
				</Defs>
			</Svg>

			<Text style={styles.text}>MUA NGAY</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 10,
		borderRadius: 10,
		position: "relative",
    paddingRight: 20
	},
  svgStyles: {
    position: 'absolute',
    left:-155,
    top:-45,
    transform: [{ scale: 0.3 }],
  },
	text: {
		color: "black",
		fontSize: 16,
		fontWeight: "bold",
	},
});
