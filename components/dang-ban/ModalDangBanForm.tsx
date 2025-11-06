import { colors } from "@/libs/colors";
import type { Item } from "@/types/items";
import React, { useState } from "react";
import { ToastAndroid, TouchableOpacity, View } from "react-native";
import { Text } from "../ui/Text";
import Input from "./Input";
import SelectImage from "./SelectImage";

interface ModalDangBanFormProps {
	onClose: () => void;
	onAddItem: (item: Item) => void;
}

export default function ModalDangBanForm(props: ModalDangBanFormProps) {
	const [username, setUsername] = useState("");
	const [description, setDescription] = useState("");
	const [rank, setRank] = useState("");
	const [level, setLevel] = useState("");

	const [champions, setChampions] = useState("");
	const [skins, setSkins] = useState("");
	const [blueEssence, setBlueEssence] = useState("");
	const [rp, setRp] = useState("");

	const [highlightSkin, setHighlightSkin] = useState("");
	const [rentPrice, setRentPrice] = useState("");
	const [buyNowPrice, setBuyNowPrice] = useState("");

	const [image, setImage] = useState<string | undefined>(undefined);

	const handleAddItem = () => {
		if (
			!username ||
			!description ||
			!rank ||
			!level ||
			!champions ||
			!skins ||
			!blueEssence ||
			!rp ||
			!rentPrice ||
			!buyNowPrice ||
			!image ||
			!highlightSkin
		) {
			return alert("Vui lòng điền đầy đủ thông tin");
		}

		const item: Item = {
			id: Math.random() * 1000000,
			name: username,
			description: description,
			rank: rank,
			level: Number.parseInt(level, 10),
			championCount: Number.parseInt(champions, 10),
			skinCount: Number.parseInt(skins, 10),
			blueEssence: Number.parseInt(blueEssence, 10),
			riotPoints: Number.parseInt(rp, 10),
			notableSkins: highlightSkin,
			rentPrice: Number.parseInt(rentPrice, 10),
			buyPrice: Number.parseInt(buyNowPrice, 10),
			status: "available",
			image: image,
		};
		props.onAddItem(item);

		ToastAndroid.show("Đăng bài thành công", ToastAndroid.SHORT);
		props.onClose?.();
	};

	const handleClose = () => {
		props.onClose?.();
	};

	return (
		<View
			style={{
				gap: 8,
				paddingBottom: 24,
			}}
		>
			<Input
				label="Tên tài khoản"
				placeholder="Nhập tên tài khoản"
				value={username}
				onChangeText={setUsername}
			/>
			<Input
				label="Description"
				placeholder="Nhập description"
				value={description}
				onChangeText={setDescription}
				numberOfLines={4}
			/>
			<View style={{ flexDirection: "row", gap: 16 }}>
				<Input
					label="Rank"
					placeholder="Nhập rank"
					value={rank}
					onChangeText={setRank}
					style={{
						flex: 1,
					}}
				/>
				<Input
					label="Level"
					placeholder="Nhập level"
					value={level}
					onChangeText={setLevel}
					style={{
						flex: 1,
					}}
				/>
			</View>
			<View style={{ flexDirection: "row", gap: 16 }}>
				<Input
					label="Champions"
					placeholder="Nhập rank"
					value={champions}
					onChangeText={setChampions}
					style={{
						flex: 1,
					}}
				/>
				<Input
					label="Skins"
					placeholder="Nhập skins"
					value={skins}
					onChangeText={setSkins}
					style={{
						flex: 1,
					}}
				/>
			</View>
			<View style={{ flexDirection: "row", gap: 16 }}>
				<Input
					label="Blue Essence"
					placeholder="Nhập blue essence"
					value={blueEssence}
					onChangeText={setBlueEssence}
					style={{
						flex: 1,
					}}
				/>
				<Input
					label="RP"
					placeholder="Nhập rp"
					value={rp}
					onChangeText={setRp}
					style={{
						flex: 1,
					}}
				/>
			</View>
			<View style={{ flexDirection: "row", gap: 16 }}>
				<Input
					label="Giá thuê"
					placeholder="Nhập giá thuê"
					value={rentPrice}
					onChangeText={setRentPrice}
					style={{
						flex: 1,
					}}
					isNumber
				/>
				<Input
					label="Giá mua ngay"
					placeholder="Nhập giá mua ngay"
					value={buyNowPrice}
					onChangeText={setBuyNowPrice}
					style={{
						flex: 1,
					}}
					isNumber
				/>
			</View>
			<Input
				label="Skin nỗi bật"
				placeholder="Nhập skins (cách nhau bằng dấu phẩy)"
				value={highlightSkin}
				onChangeText={setHighlightSkin}
			/>

			<View style={{ gap: 8 }}>
				<Text>Ảnh bài đăng</Text>
				<SelectImage
					onImageSelected={setImage}
					image={image}
					style={{ width: "100%", aspectRatio: "2/1" }}
				/>
			</View>

			<View
				style={{
					flexDirection: "row",
					gap: 16,
					paddingTop: 16,
					borderTopWidth: 1,
					borderColor: colors["cardForeground"],
				}}
			>
				<TouchableOpacity
					style={{
						flex: 1,
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: colors["lol-dark-blue"],
						padding: 16,
						borderRadius: 8,
					}}
					onPress={handleClose}
				>
					<Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
						Đóng
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={{
						flex: 1,
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: colors["lol-gold"],
						padding: 16,
						borderRadius: 8,
					}}
					onPress={handleAddItem}
				>
					<Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
						Đăng bài
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}
