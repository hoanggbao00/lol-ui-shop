import { colors } from "@/libs/colors";
import { Image } from "expo-image";
import React from "react";
import { type ImageSourcePropType, Text, View } from "react-native";

interface AccountImageNameProps {
	image: ImageSourcePropType;
	username: string;
	description: string;
}
export default function AccountImageName(props: AccountImageNameProps) {
	return (
		<>
			<Image
				source={props.image}
				style={{
					width: "100%",
					height: 160,
					borderRadius: 8,
				}}
			/>
			<View
				style={{
					padding: 16,
					backgroundColor: colors["card"],
					borderRadius: 16,
					borderWidth: 1,
					borderColor: colors["primary"],
					marginTop: -20,
					transform: [
						{
							scale: 0.98,
						},
					],
				}}
			>
				<Text
					style={{
						fontSize: 20,
						fontWeight: "bold",
						color: colors["lol-gold"],
					}}
				>
					{props.username}
				</Text>
				<Text
					style={{
						color: colors["lol-gold"],
						fontSize: 14,
					}}
				>
					{props.description}
				</Text>
			</View>
		</>
	);
}
