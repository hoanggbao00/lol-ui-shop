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
	title?: string;
	level: number;
	avatarUrl?: string;
	server?: string;
	
	// Stats
	champions: number;
	skins: number;
	blueEssence: number;
	orangeEssence: number;
	rp?: number;
	honorLevel: number;
	masteryPoints: number;
	region: string;
	
	// Ranks - separate fields instead of array
	soloRank?: string;
	soloDivision?: string;
	soloLP?: number;
	soloWins?: number;
	flexRank?: string;
	flexDivision?: string;
	flexLP?: number;
	flexWins?: number;
	tftRank?: string;
	tftDivision?: string;
	tftLP?: number;
	tftWins?: number;
	
	// Pricing
	price: number;
	rentPricePerHour?: number;
	description: string;
}
