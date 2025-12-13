
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

interface BuyNowButtonProps {
	onPress?: () => void;
	text?: string;
}

export default function BuyNowButton(props: BuyNowButtonProps) {
	const { onPress, text = "MUA NGAY" } = props;

	return (
		<TouchableOpacity onPress={onPress}>
			<View style={styles.container}>
				<Svg
					width={413 / 4.5}
					height={128 / 4.5}
					viewBox="0 0 413 128"
					fill="none"
				>
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

				<Text style={styles.text}>{text}</Text>
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "relative",
	},
	text: {
		position: "absolute",
		left: "50%",
		top: "50%",
		transform: [{ translateX: "-50%" }, { translateY: "-50%" }],
		color: "black",
		fontSize: 16,
		fontFamily: "Inter_600SemiBold",
	},
});
