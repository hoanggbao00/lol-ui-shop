import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	type ViewStyle,
} from "react-native";

interface SelectImageProps {
	onImageSelected: (image: string) => void;
	image: string | undefined;
	style?: ViewStyle;
}

export default function SelectImage(props: SelectImageProps) {
	const { onImageSelected, image } = props;
	const pickImageAsync = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			quality: 1,
		});

		if (!result.canceled) {
			onImageSelected(result.assets[0].uri);
		} else {
			alert("You did not select any image.");
		}
	};

	return (
		<TouchableOpacity
			style={[selectImageStyles.button, props.style]}
			onPress={pickImageAsync}
		>
			{!image && <Text style={selectImageStyles.buttonText}>Chọn ảnh</Text>}
			{image && (
				<Image
					source={{ uri: image }}
					style={{ width: "100%", height: "100%" }}
				/>
			)}
		</TouchableOpacity>
	);
}

const selectImageStyles = StyleSheet.create({
	button: {
		borderWidth: 1,
		borderColor: "#B8B8B8",
		borderRadius: 8,
		padding: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonText: {
		color: "white",
		fontSize: 18,
		fontWeight: "bold",
	}
});
