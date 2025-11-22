export const useFormatCompactNumber = (number: number) => {
	const { locale } = useI18n();

	return new Intl.NumberFormat(locale.value, {
		notation: "compact",
		compactDisplay: "short",
		maximumFractionDigits: 1,
	}).format(number);
};
