import { colors } from "@/libs/colors";
import type { Order, OrderStatus } from "@/types/order";
import { Image } from "expo-image";
import {
	Calendar,
	CheckCircle,
	Clock,
	RefreshCw,
	XCircle,
} from "lucide-react-native";
import type React from "react";
import { Text, View } from "react-native";

interface StatusConfig {
	label: string;
	color: string;
	bgColor: string;
	icon: React.ReactNode;
}

const statusConfig: Record<OrderStatus, StatusConfig> = {
	pending: {
		label: "Đang chờ",
		color: "#facc15",
		bgColor: "#facc1533",
		icon: <Clock size={12} color="#facc15" />,
	},
	paid: {
		label: "Đã thanh toán",
		color: "#22c55e",
		bgColor: "#22c55e33",
		icon: <CheckCircle size={12} color="#22c55e" />,
	},
	renting: {
		label: "Đang thuê",
		color: "#06b6d4",
		bgColor: "#06b6d433",
		icon: <Calendar size={12} color="#06b6d4" />,
	},
	completed: {
		label: "Hoàn thành",
		color: "#10b981",
		bgColor: "#10b98133",
		icon: <CheckCircle size={12} color="#10b981" />,
	},
	refunded: {
		label: "Hoàn tiền",
		color: "#f97316",
		bgColor: "#f9731633",
		icon: <RefreshCw size={12} color="#f97316" />,
	},
	cancelled: {
		label: "Đã hủy",
		color: "#ef4444",
		bgColor: "#ef444433",
		icon: <XCircle size={12} color="#ef4444" />,
	},
};

interface OrderCardProps {
	order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
	const status = statusConfig[order.status];

	return (
		<View
			style={{
				backgroundColor: `${colors.card}99`,
				borderRadius: 16,
				borderWidth: 1,
				borderColor: `${colors.border}80`,
				padding: 16,
			}}
		>
			<View
				style={{
					flexDirection: "row",
					gap: 12,
				}}
			>
				{/* Avatar */}
				<View
					style={{
						width: 64,
						height: 64,
						borderRadius: 12,
						overflow: "hidden",
						borderWidth: 1,
						borderColor: `${colors.border}80`,
					}}
				>
					<Image
						source={{ uri: order.account_avatar }}
						style={{
							width: "100%",
							height: "100%",
						}}
						contentFit="cover"
					/>
				</View>

				{/* Info */}
				<View
					style={{
						flex: 1,
						gap: 8,
					}}
				>
					{/* Header */}
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							alignItems: "flex-start",
							gap: 8,
						}}
					>
						<View style={{ flex: 1 }}>
							<Text
								style={{
									fontSize: 16,
									fontWeight: "600",
									color: colors.foreground,
								}}
								numberOfLines={1}
							>
								{order.account_name}
							</Text>
							<Text
								style={{
									fontSize: 12,
									color: colors.mutedForeground,
									marginTop: 2,
								}}
							>
								{order.rank}
							</Text>
						</View>

						{/* Status Badge */}
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								gap: 4,
								paddingHorizontal: 8,
								paddingVertical: 4,
								borderRadius: 12,
								backgroundColor: status.bgColor,
								borderWidth: 1,
								borderColor: `${status.color}4D`,
							}}
						>
							{status.icon}
							<Text
								style={{
									fontSize: 11,
									fontWeight: "500",
									color: status.color,
								}}
							>
								{status.label}
							</Text>
						</View>
					</View>

					{/* Type and Amount */}
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<View
							style={{
								paddingHorizontal: 8,
								paddingVertical: 4,
								borderRadius: 8,
								backgroundColor:
									order.type === "purchase"
										? `${colors.primary}33`
										: `${colors.accent}33`,
							}}
						>
							<Text
								style={{
									fontSize: 11,
									fontWeight: "500",
									color:
										order.type === "purchase" ? colors.primary : colors.accent,
								}}
							>
								{order.type === "purchase"
									? "Mua"
									: `Thuê ${order.rent_days} ngày`}
							</Text>
						</View>

						<Text
							style={{
								fontSize: 16,
								fontWeight: "bold",
								color: colors.primary,
							}}
						>
							{order.amount.toLocaleString("vi-VN")}đ
						</Text>
					</View>

					{/* Date */}
					<Text
						style={{
							fontSize: 11,
							color: colors.mutedForeground,
						}}
					>
						{new Date(order.created_at).toLocaleDateString("vi-VN", {
							day: "2-digit",
							month: "2-digit",
							year: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</Text>
				</View>
			</View>
		</View>
	);
}
