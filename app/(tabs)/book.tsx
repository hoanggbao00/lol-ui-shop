import Background from "@/components/Background";
import { colors } from "@/libs/colors";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const rankImages = {
	CaoThu: require("@/assets/images/rank/cao-thu.png"),
	BachKim: require("@/assets/images/rank/bach-kim.png"),
};

const icons = {
	cart: require("@/assets/icons/cart.png"),
};

const mockData = [
	{
		id: 1,
		image: rankImages.CaoThu,
		info: {
			rank: "Cao thủ",
			skin: "1107",
			champ: "Full",
		},
		timeLeft: 60 * 60 * 3, //3h
		rentPrice: 30000,
	},
	{
		id: 2,
		image: rankImages.BachKim,
		info: {
			rank: "Bạch Kim",
			skin: "408",
			champ: "165",
		},
		timeLeft: 60 * 60 * 1 + 60 * 20, //1h20
		rentPrice: 15000,
	},
	{
		id: 3,
		image: rankImages.BachKim,
		info: {
			rank: "Bạch Kim",
			skin: "408",
			champ: "165",
		},
		timeLeft: 60 * 60 * 1 + 60 * 20, //1h20
		rentPrice: 15000,
	},
	{
		id: 4,
		image: rankImages.CaoThu,
		info: {
			rank: "Cao thủ",
			skin: "1107",
			champ: "Full",
		},
		timeLeft: 60 * 60 * 3, //3h
		rentPrice: 30000,
	},
];

export default function User() {
	const [data, setData] = useState(mockData);

	const rows = Array.from(
		{ length: Math.ceil(data.length / 2) },
		(_, index) => ({
			row: index,
			data: data.slice(index * 2, index * 2 + 2),
		}),
	);

	const formatTimeLeft = (timeLeft: number) => {
		const hours = Math.floor(timeLeft / 3600);
		const minutes = Math.floor((timeLeft % 3600) / 60);
		const seconds = timeLeft % 60;
		return `${hours.toString()}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	};

	return (
		<View style={styles.container}>
			<Background />
			<View style={styles.header}>
				<Image source={icons.cart} style={styles.icon} />
			</View>

			<View style={styles.content}>
				{rows.map((row) => (
					<View style={cardStyles.container} key={row.row}>
						{row.data.map((item) => (
							<View style={cardStyles.card} key={item.id}>
								<View style={cardStyles.header}>
									<Image source={item.image} style={cardStyles.image} />
									<View style={cardStyles.info}>
										<View style={cardStyles.infoSquareContainer}>
											<View style={cardStyles.infoSquare} />
											<Text style={cardStyles.infoText}>Rank: {item.info.rank}</Text>
										</View>
										<View style={cardStyles.infoSquareContainer}>
											<View style={cardStyles.infoSquare} />
											<Text style={cardStyles.infoText}>Skin: {item.info.skin}</Text>
										</View>
										<View style={cardStyles.infoSquareContainer}>
											<View style={cardStyles.infoSquare} />
											<Text style={cardStyles.infoText}>Champ: {item.info.champ}</Text>
										</View>
									</View>
								</View>
								<View style={timeLeftStyles.container}>
									<Text style={timeLeftStyles.timeLeftText}>{formatTimeLeft(item.timeLeft)}</Text>
								</View>
								<Text style={rentPriceStyles.text}>Thuê - {item.rentPrice.toLocaleString()}</Text>
							</View>
						))}
					</View>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors["lol-black"],
		position: "relative",
		paddingTop: 24,
	},
	icon: {
		width: 36,
		height: 36,
	},
	header: {
		flexDirection: "row",
		justifyContent: "flex-end",
		alignItems: "center",
		padding: 16,
	},
	content: {
		flex: 1,
		paddingTop: 64,
		gap: 36,
	},
});

const cardStyles = StyleSheet.create({
	container: {
		flexDirection: "row",
		gap: 16,
		justifyContent: "center",
	},
	card: {
		backgroundColor: "#012026",
		width: "45%",
		borderColor: colors["lol-gold"],
		borderWidth: 1,
		gap: 16,
		justifyContent: 'center',
		paddingVertical: 8,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		justifyContent: 'center',
		paddingHorizontal: 4,
	},
	image: {
		width: 64,
		height: 64,
	},
	info: {
		flex: 1,
		gap: 4,
	},
	infoSquareContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	infoSquare: {
		width: 10,
		height: 10,
		backgroundColor: "#045160",
	},
	infoText: {
		color: "#fff",
		fontSize: 12,
	},
	timeLeft: {
		fontSize: 12,
		color: colors["lol-gold"],
	},
	rentPrice: {
		fontSize: 12,
		color: colors["lol-gold"],
	},
});

const timeLeftStyles = StyleSheet.create({
	container: {
		backgroundColor: "black",
		padding: 8,
		borderColor: colors["lol-gold"],
		borderWidth: 1,
		borderStartWidth: 0,
		borderEndWidth: 0,
	},
	timeLeftText: {
		fontSize: 20,
		textAlign: 'center',
		color: '#fff',
		fontWeight: 'bold',
	},
});

const rentPriceStyles = StyleSheet.create({
	text: {
		fontSize: 20,
		color: '#FBE707',
		fontWeight: 'bold',
		textAlign: 'center',
		paddingTop: 8,
		paddingBottom: 24,
	},
});
