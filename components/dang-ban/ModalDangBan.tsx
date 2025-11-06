import { colors } from "@/libs/colors";
import type { Item } from "@/types/items";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import ModalDangBanForm from "./ModalDangBanForm";

interface ModalDangBanProps {
	onClose: () => void;
	onAddItem: (item: Item) => void;
}

export default function ModalDangBan(props: ModalDangBanProps) {
	return (
		<View>
			<Modal
				visible={true}
				onRequestClose={props.onClose}
				animationType="slide"
				transparent={true}
			>
				<View
					style={{
						height: "90%",
						width: "100%",
						backgroundColor: colors["card"],
						borderTopRightRadius: 18,
						borderTopLeftRadius: 18,
						position: "absolute",
						bottom: 0,
						padding: 16,
					}}
				>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							alignItems: "center",
							borderBottomWidth: 1,
							borderColor: colors["cardForeground"],
							paddingBottom: 16,
						}}
					>
						<Text
							style={{
								fontSize: 20,
								fontWeight: "bold",
								color: colors["lol-gold"],
							}}
						>
							Đăng bán tài khoản
						</Text>
						<TouchableOpacity onPress={props.onClose}>
							<Ionicons name="close" color="white" size={24} />
						</TouchableOpacity>
					</View>
					<ScrollView style={{ flex: 1 }}>
						<ModalDangBanForm onClose={props.onClose} onAddItem={props.onAddItem} />
					</ScrollView>
				</View>
			</Modal>
		</View>
	);
}
