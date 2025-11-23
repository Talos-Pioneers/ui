export const useFormatCompactNumber = (number: number) => {
	const { locale } = useI18n();

	if (isNaN(number)) {
		return "N/A";
	}

	return new Intl.NumberFormat(locale.value, {
		notation: "compact",
		compactDisplay: "short",
		maximumFractionDigits: 1,
	}).format(number);
};
