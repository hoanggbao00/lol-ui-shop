export const formatPrice = (price: number) => {
	return price.toLocaleString("vi-VN", {
		style: "currency",
		currency: "VND",
	});
};

export const formatNumber = (number: number, locale: "vi-VN" | "en-US" = "vi-VN") => {
	return number.toLocaleString(locale);
};