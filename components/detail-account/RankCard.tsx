import { colors } from "@/libs/colors";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";

interface RankInfo {
	mode: string;
	rank: string;
	tier: string;
	wins: number;
	lp: number;
	icon?: string;
}

interface RankCardProps {
	rank: RankInfo;
}

// Rank icon URLs
const getRankIcon = (tier: string): string => {
	const tierLower = tier.toLowerCase();
	return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${tierLower}.png`;
};

export default function RankCard({ rank }: RankCardProps) {
	return (
		<View
			style={{
				width: "48%",
				minHeight: 180,
				alignItems: "center",
				padding: 16,
				backgroundColor: colors.card,
				borderRadius: 12,
				borderWidth: 1,
				borderColor: colors.border,
				gap: 8,
			}}
		>
			{/* Rank Icon */}
			<View
				style={{
					width: 120,
					aspectRatio: 1,
					position: "relative",
					marginBottom: 4,
				}}
			>
				<Image
					source={{ uri: rank.icon || getRankIcon(rank.tier) }}
					style={{
						width: "100%",
						height: "100%",
						transform: [{ scale: 1.6 }],
					}}
					onError={() => {
						// Fallback to iron if image fails to load
						console.log("Failed to load rank icon");
					}}
				/>
			</View>

			{/* Mode Name */}
			<Text
				style={{
					fontSize: 11,
					color: colors.mutedForeground,
					textAlign: "center",
					fontWeight: "500",
					textTransform: "uppercase",
					letterSpacing: 0.5,
				}}
			>
				{rank.mode}
			</Text>

			{/* Rank Name */}
			<Text
				style={{
					fontSize: 13,
					fontWeight: "600",
					color: colors["lol-gold"],
					textAlign: "center",
				}}
			>
				{rank.rank}
			</Text>

			{/* Stats */}
			{rank.wins > 0 && (
				<Text
					style={{
						fontSize: 11,
						color: colors.mutedForeground,
						marginTop: 2,
						textAlign: "center",
					}}
				>
					{rank.wins} Trận | {rank.lp} ĐNG
				</Text>
			)}
		</View>
	);
}
