import { colors } from "@/libs/colors";
import { Image } from "expo-image";
import type React from "react";
import { Text, View } from "react-native";

const frameIcon = require("@/assets/icons/settings/frame.png");

interface ProfileAvatarProps {
	avatarUrl?: string;
	username: string;
	userId: string | number;
}

export default function ProfileAvatar({
	username,
	userId,
	avatarUrl,
}: ProfileAvatarProps) {
	return (
		<View
			style={{
				alignItems: "center",
				paddingTop: 60,
			}}
		>
			{/* Avatar Frame */}
			<View
				style={{
					position: "relative",
					width: 140,
					height: 140,
				}}
			>
				<Image
					source={frameIcon}
					style={{
						width: 140,
						height: 140,
					}}
					contentFit="contain"
				/>
			</View>

			{/* Username */}
			<Text
				style={{
					fontSize: 24,
					fontFamily: "Inter_700Bold",
					color: colors["lol-gold"],
					marginBottom: 4,
				}}
			>
				{username}
			</Text>

			{/* User ID */}
			<Text
				style={{
					fontSize: 16,
					color: colors["lol-gold"],
					fontFamily: "Inter_600SemiBold",
				}}
			>
				ID: {userId}
			</Text>
		</View>
	);
}
