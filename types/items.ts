import type { ImageSourcePropType } from "react-native";

export interface Item {
	id: number;
	username: string;
	price: number;
	image: ImageSourcePropType;
	info: {
		rank: string;
		skin: string;
		champ: string;
	};
}
