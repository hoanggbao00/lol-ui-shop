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
					fontWeight: "bold",
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
					fontWeight: "600",
				}}
			>
				ID: {userId}
			</Text>

			{/* Status Badge */}
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					gap: 8,
					marginTop: 12,
					paddingHorizontal: 16,
					paddingVertical: 6,
					backgroundColor: `${colors.primary}1A`,
					borderRadius: 20,
					borderWidth: 1,
					borderColor: `${colors.primary}33`,
				}}
			>
				<View
					style={{
						width: 8,
						height: 8,
						borderRadius: 4,
						backgroundColor: colors.primary,
					}}
				/>
				<Text
					style={{
						fontSize: 12,
						color: colors.primary,
						fontWeight: "500",
					}}
				>
					Đang hoạt động
				</Text>
			</View>
		</View>
	);
}
