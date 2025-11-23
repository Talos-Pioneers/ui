import RegionValleyIcon from '~/components/icons/RegionValleyIcon.vue';
import RegionWulingIcon from '~/components/icons/RegionWulingIcon.vue';

export const versionOptions = [
	{ value: '', label: 'All' },
	{ value: 'cbt_3', label: 'CBT 3' },
];

export const tierOptions = [
	{ value: '', label: 'All' },
	{ value: 'I', label: 'Tier I' },
	{ value: 'II', label: 'Tier II' },
	{ value: 'III', label: 'Tier III' },
	{ value: 'IV', label: 'Tier IV' },
];

export const regionOptions = [
	{ value: 'valley_iv', label: 'Valley IV', icon: RegionValleyIcon },
	{ value: 'wuling', label: 'Wuling', icon: RegionWulingIcon },
];

