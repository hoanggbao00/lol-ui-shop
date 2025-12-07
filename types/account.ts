export interface RankInfo {
	mode: string;
	rank: string;
	tier: string;
	wins: number;
	lp: number;
	icon?: string;
}

export interface AccountDetail {
	id: string | number;
	username: string;
	level: number;
	avatarUrl: string;
	server: string;
	price: number;
	ranks: RankInfo[];
	honorLevel: number;
	masteryPoints: number;
	region: string;
	champions: number;
	skins: number;
	blueEssence: number;
	orangeEssence: number;
	description: string;
}
