import { colors } from "@/libs/colors";
import { formatPrice } from "@/libs/format";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
	Modal,
	Pressable,
	StyleSheet,
	Text,
	ToastAndroid,
	TouchableOpacity,
	View,
} from "react-native";

interface ModalQRProps {
	onClose?: () => void;
}

export default function ModalQR(props: ModalQRProps) {
	const [qrUrl, setQrUrl] = useState("");
	const [soDu, setSoDu] = useState(() => {
		const random = Math.random();
		if (random > 0.5) {
			return 1000000;
		}
		return 0;
	});

	const handleGenerateQR = () => {
		// Docs https://qr.sepay.vn/
		const url = new URL("https://qr.sepay.vn/img");
		url.searchParams.set("bank", "Vietcombank"); // Ngân hàng
		url.searchParams.set("acc", "hoanggbao"); // Số tài khoản
		url.searchParams.set("template", ""); // Template QR
		url.searchParams.set("amount", "80000"); // Giá tiền
		url.searchParams.set("des", "ui lol shop"); // Nội dung
		setQrUrl(url.toString());
	};

	const handleCheckPayment = () => {
		const random = Math.random();
		if (random > 0.5) {
			ToastAndroid.show("Thanh toán thành công", ToastAndroid.SHORT);
		} else {
			ToastAndroid.show("Bạn chưa thanh toán", ToastAndroid.SHORT);
		}
	};

	const handlePayWithBalance = () => {
		if(soDu < 50000) {
			ToastAndroid.show("Số dư của bạn không đủ", ToastAndroid.SHORT);
			return;
		}
		setSoDu(soDu - 50000);
		ToastAndroid.show("Thanh toán bằng số dư thành công", ToastAndroid.SHORT);
	};

	useEffect(() => {
		handleGenerateQR();
	}, []);

	return (
		<View>
			<Modal
				visible={true}
				onRequestClose={props.onClose}
				animationType="slide"
				transparent={true}
			>
				<View style={styles.modalContent}>
					<View style={styles.titleContainer}>
						<Text style={styles.title}>Thanh toán</Text>
						<View style={styles.closeButtonContainer}>
							<Text style={styles.soDuText}>Số dư: {formatPrice(soDu)}</Text>
							<Pressable onPress={props.onClose}>
								<Ionicons name="close" color="#fff" size={22} />
							</Pressable>
						</View>
					</View>
					<View style={styles.qrImageContainer}>
						<Image source={{ uri: qrUrl }} style={styles.qrImage} />
						<View>
							<Text style={styles.infoText}>
								Số tài khoản:{" "}
								<Text style={styles.highlightText}>0909090909</Text>
							</Text>
							<Text style={styles.infoText}>
								Ngân hàng: <Text style={styles.highlightText}>Vietcombank</Text>
							</Text>
							<Text style={styles.infoText}>
								Giá tiền:{" "}
								<Text style={styles.highlightText}>{formatPrice(50000)}</Text>
							</Text>
							<Text style={styles.infoText}>
								Nội dung chuyển khoản:{" "}
								<Text style={styles.highlightText}>ui lol shop</Text>
							</Text>
						</View>

						<View style={styles.buttonContainer}>
							<TouchableOpacity style={styles.button} onPress={handlePayWithBalance}>
								<Text style={styles.buttonText}>Thanh toán bằng số dư</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.button} onPress={handleCheckPayment}>
								<Text style={styles.buttonText}>Kiểm tra chuyển khoản</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	modalContent: {
		height: "60%",
		width: "100%",
		backgroundColor: "#25292e",
		borderTopRightRadius: 18,
		borderTopLeftRadius: 18,
		position: "absolute",
		bottom: 0,
	},
	closeButtonContainer: {
		flexDirection: "row",
		gap: 4,
		alignItems: "center",
	},
	soDuText: {
		color: colors["lol-gold"],
		fontSize: 12,
	},
	titleContainer: {
		height: "10%",
		backgroundColor: "#464C55",
		borderTopRightRadius: 10,
		borderTopLeftRadius: 10,
		paddingHorizontal: 20,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	title: {
		color: "#fff",
		fontSize: 16,
	},
	qrImageContainer: {
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
		paddingBlock: 20,
	},
	qrImage: {
		height: 250,
		width: 250,
		resizeMode: "contain",
	},
	infoText: {
		color: "#fff",
		fontSize: 14,
	},
	highlightText: {
		color: "#00FF00",
		fontSize: 14,
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		padding: 20,
		gap: 10,
	},
	button: {
		backgroundColor: colors["lol-gold"],
		flex: 1,
		padding: 8,
		paddingBlock: 12,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonText: {
		color: "#fff",
		fontSize: 14,
		fontFamily: "Inter_700Bold",
	},
});
