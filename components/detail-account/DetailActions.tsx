import { colors } from "@/libs/colors";
import { formatPrice } from "@/libs/format";
import React, { useState } from "react";
import { View } from "react-native";
import ActionButton from "./ActionButton";
import ModalQR from "./ModalQR";

export default function DetailActions() {
	const [isShowModal, setIsShowModal] = useState(false);

	const handleShowModal = () => {
		setIsShowModal((prev) => !prev);
	};

	const handleCloseModal = () => {
		setIsShowModal(false);
	};

	return (
		<>
			<View
				style={{
					gap: 16,
					flexDirection: "row",
					justifyContent: "space-between",
				}}
			>
				<ActionButton
					onPress={handleShowModal}
					icon="alarm"
					title="Thuê"
					text={formatPrice(100000)}
					iconColor="white"
					textColor="white"
				/>
				<ActionButton
					onPress={handleShowModal}
					icon="alarm"
					title="Mua ngay"
					text={formatPrice(50000)}
					iconColor="black"
					textColor="black"
					backgroundColor={colors["primary"]}
				/>
			</View>
			{isShowModal && <ModalQR onClose={handleCloseModal} />}
		</>
	);
}
