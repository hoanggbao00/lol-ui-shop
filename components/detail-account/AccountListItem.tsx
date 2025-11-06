import React from "react";
import { View } from "react-native";
import AccountItem from "./AccountItem";

export default function AccountListItem() {
	return (
		<View
			style={{
				gap: 16,
				paddingTop: 24,
			}}
		>
			<View
				style={{
					flexDirection: "row",
					gap: 16,
				}}
			>
				<AccountItem label="Rank" value="Diamond II" icon="trophy" />
				<AccountItem label="Level" value="156" icon="star" />
			</View>
			<View
				style={{
					flexDirection: "row",
					gap: 16,
				}}
			>
				<AccountItem label="Champions" value="142" icon="people" />
				<AccountItem label="Skins" value="87" icon="shirt" />
			</View>
		</View>
	);
}
