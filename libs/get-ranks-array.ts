import type { AccountDetail, RankInfo } from "@/types/account";

export const getRanksArray = (account?: AccountDetail): RankInfo[] => {
	if (!account) return [];
	const ranks: RankInfo[] = [];

	// Solo/Duo rank
	if (account.soloRank && account.soloRank.trim() !== "") {
		ranks.push({
			mode: "ĐƠN/ĐÔI",
			rank: `${account.soloRank.toUpperCase()} ${account.soloDivision || ""}`.trim(),
			tier: account.soloRank.toLowerCase(),
			wins: account.soloWins || 0,
			lp: account.soloLP || 0,
			icon: "",
		});
	}

	// Flex rank
	if (account.flexRank && account.flexRank.trim() !== "") {
		ranks.push({
			mode: "LH 5V5",
			rank: `${account.flexRank.toUpperCase()} ${account.flexDivision || ""}`.trim(),
			tier: account.flexRank.toLowerCase(),
			wins: account.flexWins || 0,
			lp: account.flexLP || 0,
			icon: "",
		});
	}

	// TFT rank
	if (account.tftRank && account.tftRank.trim() !== "") {
		ranks.push({
			mode: "ĐTCL",
			rank: `${account.tftRank.toUpperCase()} ${account.tftDivision || ""}`.trim(),
			tier: account.tftRank.toLowerCase(),
			wins: account.tftWins || 0,
			lp: account.tftLP || 0,
			icon: "",
		});
	}

	return ranks;
};
