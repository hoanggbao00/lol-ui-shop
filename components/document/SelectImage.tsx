import { Image } from 'expo-image';
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

interface SelectImageProps {
	onImageSelected: (image: string) => void;
	image: string | undefined;
	onAddItem: () => void;
}

export default function SelectImage(props: SelectImageProps) {
	const { onImageSelected, image } = props;
	const pickImageAsync = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			quality: 1,
		});

		if (!result.canceled) {
			onImageSelected(result.assets[0].uri);
		} else {
			alert("You did not select any image.");
		}
	};

	return (
		<View style={[selectImageStyles.item, selectImageStyles.item2]}>
			<TouchableOpacity style={selectImageStyles.button} onPress={pickImageAsync}>
				{!image && <Text style={selectImageStyles.buttonText}>Chọn ảnh</Text>}
        {image && <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} />}
			</TouchableOpacity>

			<TouchableOpacity onPress={props.onAddItem}>
				<Svg
					width="413"
					height="128"
					viewBox="0 0 413 128"
					fill="none"
					style={selectImageStyles.svg}
				>
					<Path d="M413 128H0V0H413V128Z" fill="url(#paint0_linear_140_85)" />
					<Defs>
						<LinearGradient
							id="paint0_linear_140_85"
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

				<Text style={selectImageStyles.svgText}>Đăng bài</Text>
			</TouchableOpacity>
		</View>
	);
}

const selectImageStyles = StyleSheet.create({
	item: {
		flex: 1,
		width: "50%",
	},
	item2: {
		gap: 24,
	},
	button: {
		borderWidth: 1,
		borderColor: "#B8B8B8",
		borderRadius: 8,
		padding: 8,
		alignItems: "center",
		justifyContent: "center",
		aspectRatio: 1,
	},
	buttonText: {
		color: "white",
		fontSize: 18,
		fontWeight: "bold",
	},
	svg: {
		position: "absolute",
		transform: [{ scaleX: 0.3 }, { scaleY: 0.35 }],
		top: -50,
		left: -115,
	},
	svgText: {
		textAlign: "center",
		color: "black",
		fontSize: 18,
		fontWeight: "bold",
	},
});
