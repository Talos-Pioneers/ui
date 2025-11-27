<script setup lang="ts">
// Team members data
const teamMembers = [
	{
		name: 'Danbo',
		role: 'lead',
		avatar: '/avatars/danbo.webp',
	},
	{
		name: 'Blede',
		role: 'webDeveloper',
		avatar: '/avatars/blede.webp',
	},
	{
		name: 'Stinggyray',
		role: 'webDeveloper',
		avatar: '/avatars/stinggy.webp',
	},
	{
		name: 'Yurihaia',
		role: 'webDeveloper',
		avatar: '/avatars/rime.webp',
	},
	{
		name: 'Lens The Martyr',
		role: 'designer',
		avatar: '/avatars/lens.webp',
	},
	{
		name: 'patupatu',
		role: 'designer',
		avatar: '/avatars/patupatu.webp',
	},
]

// Special thanks
const specialThanks = [
	'Xela',
	'SethFire',
	'Namtar',
]

const feedbackUrl = 'https://github.com/orgs/Talos-Pioneers/discussions'

useHead({
	title: $t('pages.about.title'),
	meta: [
		{
			property: 'og:title',
			content: $t('pages.about.title'),
		},
		{
			name: 'description',
			content: $t('pages.about.description'),
		},
		{
			property: 'og:description',
			content: $t('pages.about.description'),
		},
	],
})
</script>

<template>
	<div class="wave-bg bg-cool-gray-10 dark:bg-cool-gray-90 before:bg-size-[400px] min-h-[calc(100vh-var(--header-height))]">
		<div class="container mx-auto px-4 py-6">
			<div class="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 lg:gap-8">
				<!-- Team Members Sidebar -->
				<aside class="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] h-fit">
					<div class="bg-white dark:bg-cool-gray-90 rounded-lg border border-cool-gray-20 dark:border-cool-gray-80 p-6">
						<h2 class="font-bold text-xl mb-4 text-cool-gray-80 dark:text-cool-gray-20">
							{{ $t('pages.about.teamTitle') }}
						</h2>
						<div class="flex flex-col gap-4">
							<div
								v-for="member in teamMembers"
								:key="member.name"
								class="flex items-center gap-3"
							>
								<div class="size-12 rounded-full bg-cool-gray-20 dark:bg-cool-gray-80 overflow-hidden flex-shrink-0">
									<img
										v-if="member.avatar"
										:src="member.avatar"
										:alt="member.name"
										class="w-full h-full object-cover"
									>
									<div
										v-else
										class="w-full h-full flex items-center justify-center bg-cool-gray-30 dark:bg-cool-gray-70 text-cool-gray-60 dark:text-cool-gray-40 text-sm font-medium"
									>
										{{ member.name.charAt(0) }}
									</div>
								</div>
								<div class="flex-1 min-w-0">
									<p class="font-medium text-cool-gray-80 dark:text-cool-gray-20 truncate">
										{{ member.name }}
									</p>
									<p class="text-sm text-cool-gray-60 dark:text-cool-gray-40">
										{{ $t(`pages.about.teamMember.${member.role}`) }}
									</p>
								</div>
							</div>
						</div>
					</div>
				</aside>

				<!-- Main Content -->
				<main class="space-y-6">
					<!-- Project Description -->
					<section class="bg-white dark:bg-cool-gray-90 rounded-lg border border-cool-gray-20 dark:border-cool-gray-80 p-6 space-y-4">
						<h1 class="font-bold text-3xl text-cool-gray-80 dark:text-cool-gray-20">
							{{ $t('pages.about.projectTitle') }}
						</h1>
						<p class="text-cool-gray-70 dark:text-cool-gray-30 leading-relaxed">
							{{ $t('pages.about.projectDescription') }}
						</p>
					</section>

					<!-- Disclaimer -->
					<section class="bg-white dark:bg-cool-gray-90 rounded-lg border border-cool-gray-20 dark:border-cool-gray-80 p-6 space-y-4">
						<h2 class="font-bold text-xl text-cool-gray-80 dark:text-cool-gray-20">
							{{ $t('pages.about.disclaimerTitle') }}
						</h2>
						<p class="text-cool-gray-70 dark:text-cool-gray-30 leading-relaxed">
							{{ $t('pages.about.disclaimerText') }}
						</p>
					</section>

					<!-- Feedback -->
					<section class="bg-white dark:bg-cool-gray-90 rounded-lg border border-cool-gray-20 dark:border-cool-gray-80 p-6 space-y-4">
						<h2 class="font-bold text-xl text-cool-gray-80 dark:text-cool-gray-20">
							{{ $t('pages.about.feedbackTitle') }}
						</h2>
						<p class="text-cool-gray-70 dark:text-cool-gray-30 leading-relaxed">
							{{ $t('pages.about.feedbackDescription') }}
						</p>
						<a
							:href="feedbackUrl"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 text-cool-gray-80 hover:text-cool-gray-80 hover:underline transition-colors"
						>
							{{ $t('pages.about.feedbackButton') }}
							<svg
								width="12"
								height="12"
								viewBox="0 0 12 12"
								fill="none"
								class="opacity-70"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M1 11L11 1M11 1H1M11 1V11"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</a>
					</section>

					<!-- Special Thanks -->
					<section class="bg-white dark:bg-cool-gray-90 rounded-lg border border-cool-gray-20 dark:border-cool-gray-80 p-6 space-y-4">
						<h2 class="font-bold text-xl text-cool-gray-80 dark:text-cool-gray-20">
							{{ $t('pages.about.specialThanksTitle') }}
						</h2>
						<p class="text-cool-gray-70 dark:text-cool-gray-30 leading-relaxed">
							{{ $t('pages.about.specialThanksDescription') }}
						</p>
						<ul class="list-disc list-inside space-y-2 text-cool-gray-70 dark:text-cool-gray-30">
							<li
								v-for="person in specialThanks"
								:key="person"
							>
								{{ person }}
							</li>
						</ul>
					</section>
				</main>
			</div>
		</div>
	</div>
</template>
