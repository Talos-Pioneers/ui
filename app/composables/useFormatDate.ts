export const useFormatDate = (date: string) => {
	const { locale } = useI18n();

	return new Date(date).toLocaleDateString(locale.value, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};
