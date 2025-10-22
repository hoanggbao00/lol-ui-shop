import Background from "@/components/Background";
import ModalQR from '@/components/detail-account/ModalQR';
import BuyNowButton from '@/components/home/BuyNowButton';
import { colors } from "@/libs/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from 'expo-image';
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const screenshot = require("@/assets/images/app/screenshot.png");

const formatPrice = (price: number) => {
	return price.toLocaleString("vi-VN", {
		style: "currency",
		currency: "VND",
	});
};

const item = {
		id: 1,
		username: "Mid24#2403",
		price: 1500000,
		image: screenshot,
		info: {
			rank: "Lục bảo",
			skin: "501",
			champ: "Full",
		},
};

export default function DetailAcc() {
  const [isShowModal, setIsShowModal] = useState(false);

  const handleShowModal = () => {
    setIsShowModal(prev => !prev);
  };

  const handleCloseModal = () => {
    setIsShowModal(false);
  };

	return (
		<View style={styles.container}>
			<Background />
			<ScrollView style={styles.scrollView}>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => router.back()}>
						<Ionicons name="arrow-back" size={24} color="white" />
					</TouchableOpacity>
					<Text style={styles.title}>Chi tiết tài khoản</Text>
				</View>

        <View style={contentStyles.container}>
          <Image source={item.image} style={contentStyles.image} />
          <Text style={contentStyles.username}>{item.username}</Text>
          <View style={contentStyles.info}>
            <Text style={contentStyles.infoText} numberOfLines={1}>Rank: {item.info.rank}</Text>
            <Text style={contentStyles.infoText} numberOfLines={1}>Skin: {item.info.skin}</Text>
            <Text style={contentStyles.infoText} numberOfLines={1}>Champ: {item.info.champ}</Text>
          </View>
          <Text style={contentStyles.price}>{formatPrice(item.price)}</Text>
          <View style={contentStyles.buyNowButton}>
          <BuyNowButton onPress={handleShowModal} />
          </View>
        </View>
        {isShowModal && <ModalQR onClose={handleCloseModal} />}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors["lol-black"],
	},
	scrollView: {
		paddingTop: 64,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		gap: 16,
	},
	backButton: {
		fontSize: 20,
		fontWeight: "bold",
		color: "white",
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		color: "white",
	},
});

const contentStyles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 8,
	},
	image: {
		width: "100%",
		height: 160,
    borderRadius: 8,
	},
	username: {
		fontSize: 24,
		fontWeight: "bold",
		color: colors["lol-gold"],
		textAlign: "center",
		padding: 8,
	},
  info: {
    alignItems: "center",
    gap: 8,
    backgroundColor: 'black',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors["lol-gold"],
  },
  infoText: {
    color: colors["lol-gold"],
    fontSize: 16,
  },
  price: {
    color: "yellow",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    padding: 8,
  },
  buyNowButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    transform: [{
      scale: 1.2,
    }],
  },
});
