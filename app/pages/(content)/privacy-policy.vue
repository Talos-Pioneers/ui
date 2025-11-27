<script setup lang="ts">
const { t } = useI18n()

const feedbackUrl = 'https://github.com/orgs/Talos-Pioneers/discussions'
const lastUpdatedDate = t('pages.privacy.lastUpdatedDate')

useHead({
	title: t('pages.privacy.title'),
	meta: [
		{
			property: 'og:title',
			content: t('pages.privacy.title'),
		},
		{
			name: 'description',
			content: t('pages.privacy.description'),
		},
		{
			property: 'og:description',
			content: t('pages.privacy.description'),
		},
	],
})
</script>

<template>
	<div class="wave-bg bg-cool-gray-10 dark:bg-cool-gray-90 before:bg-size-[400px] min-h-[calc(100vh-var(--header-height))]">
		<div class="container mx-auto px-4 py-6">
			<div class="max-w-4xl mx-auto">
				<div class="bg-white dark:bg-cool-gray-90 rounded-lg border border-cool-gray-20 dark:border-cool-gray-80 p-6 space-y-8">
					<!-- Title -->
					<div>
						<h1 class="font-bold text-3xl text-cool-gray-80 dark:text-cool-gray-20 mb-2">
							{{ t('pages.privacy.title') }}
						</h1>
						<p class="text-sm text-cool-gray-60 dark:text-cool-gray-40">
							{{ t('pages.privacy.lastUpdated', { date: lastUpdatedDate }) }}
						</p>
					</div>

					<!-- Introduction -->
					<section class="space-y-4">
						<h2 class="font-bold text-xl text-cool-gray-80 dark:text-cool-gray-20">
							{{ t('pages.privacy.introductionTitle') }}
						</h2>
						<p class="text-cool-gray-70 dark:text-cool-gray-30 leading-relaxed">
							{{ t('pages.privacy.introductionText') }}
						</p>
					</section>

					<!-- Information We Collect -->
					<section class="space-y-4">
						<h2 class="font-bold text-xl text-cool-gray-80 dark:text-cool-gray-20">
							{{ t('pages.privacy.informationWeCollectTitle') }}
						</h2>
						<p class="text-cool-gray-70 dark:text-cool-gray-30 leading-relaxed">
							{{ t('pages.privacy.informationWeCollectDescription') }}
						</p>

						<div class="space-y-4 pl-4 border-l-2 border-cool-gray-20 dark:border-cool-gray-80">
							<div>
								<h3 class="font-semibold text-lg text-cool-gray-80 dark:text-cool-gray-20 mb-2">
									{{ t('pages.privacy.userAccountDataTitle') }}
								</h3>
								<p class="text-cool-gray-70 dark:text-cool-gray-30 leading-relaxed">
									{{ t('pages.privacy.userAccountDataText') }}
								</p>
							</div>

							<div>
								<h3 class="font-semibold text-lg text-cool-gray-80 dark:text-cool-gray-20 mb-2">
									{{ t('pages.privacy.blueprintDataTitle') }}
								</h3>
								<p class="text-cool-gray-70 dark:text-cool-gray-30 leading-relaxed">
									{{ t('pages.privacy.blueprintDataText') }}
								</p>
							</div>

							<div>
								<h3 class="font-semibold text-lg text-cool-gray-80 dark:text-cool-gray-20 mb-2">
									{{ t('pages.privacy.commentDataTitle') }}
								</h3>
								<p class="text-cool-gray-70 dark:text-cool-gray-30 leading-relaxed">
									{{ t('pages.privacy.commentDataText') }}
								</p>
							</div>

							<div>
								<h3 class="font-semibold text-lg text-cool-gray-80 dark:text-cool-gray-20 mb-2">
									{{ t('pages.privacy.automaticallyCollectedTitle') }}
								</h3>
								<p class="text-cool-gray-70 dark:text-cool-gray-30 leading-relaxed">
									{{ t('pages.privacy.automaticallyCollectedText') }}
								</p>
							</div>
						</div>
					</section>

					<!-- How We Use Your Information -->
					<section class="space-y-4">
						<h2 class="font-bold text-xl text-cool-gray-80 dark:text-cool-gray-20">
							{{ t('pages.privacy.howWeUseTitle') }}
						</h2>
						<p class="text-cool-gray-70 dark:text-cool-gray-30 leading-relaxed">
							{{ t('pages.privacy.howWeUseDescription') }}
						</p>
						<ul class="list-disc list-inside space-y-2 text-cool-gray-70 dark:text-cool-gray-30 pl-4">
							<li>{{ t('pages.privacy.howWeUseList1') }}</li>
							<li>{{ t('pages.privacy.howWeUseList2') }}</li>
							<li>{{ t('pages.privacy.howWeUseList3') }}</li>
							<li>{{ t('pages.privacy.howWeUseList4') }}</li>
							<li>{{ t('pages.privacy.howWeUseList5') }}</li>
							<li>{{ t('pages.privacy.howWeUseList6') }}</li>
						</ul>
					</section>

					<!-- Authentication & OAuth Providers -->
					<section class="space-y-4">
						<h2 class="font-bold text-xl text-cool-gray-80 dark:text-cool-gray-20">
							{{ t('pages.privacy.authenticationTitle') }}
						</h2>
						<p class="text-cool-gray-70 dark:text-cool-gray-30 leading-relaxed mb-2">
							{{ t('pages.privacy.authenticationText') }}
						</p>
						<ul class="list-disc list-inside space-y-2 text-cool-gray-70 dark:text-cool-gray-30 pl-4">
							<li>{{ t('pages.privacy.authenticationEmail') }}</li>
							<li>{{ t('pages.privacy.authenticationOAuth') }}</li>
						</ul>
					</section>

					<!-- Cookies & Session Management -->
					<section class="space-y-4">
						<h2 class="font-bold text-xl text-cool-gray-80 dark:text-cool-gray-20">
							{{ t('pages.privacy.cookiesTitle') }}
						</h2>
						<p class="text-cool-gray-70 dark:text-cool-gray-30 leading-relaxed">
							{{ t('pages.privacy.cookiesText') }}
						</p>
					</section>

					<!-- Content Moderation -->
					<section class="space-y-4">
						<h2 class="font-bold text-xl text-cool-gray-80 dark:text-cool-gray-20">
							{{ t('pages.privacy.contentModerationTitle') }}
						</h2>
						<p class="text-cool-gray-70 dark:text-cool-gray-30 leading-relaxed">
							{{ t('pages.privacy.contentModerationText') }}
						</p>
					</section>

					<!-- Data Storage & Security -->
					<section class="space-y-4">
						<h2 class="font-bold text-xl text-cool-gray-80 dark:text-cool-gray-20">
							{{ t('pages.privacy.dataStorageTitle') }}
						</h2>
						<p class="text-cool-gray-70 dark:text-cool-gray-30 leading-relaxed">
							{{ t('pages.privacy.dataStorageText') }}
						</p>
					</section>

					<!-- Your Rights -->
					<section class="space-y-4">
						<h2 class="font-bold text-xl text-cool-gray-80 dark:text-cool-gray-20">
							{{ t('pages.privacy.userRightsTitle') }}
						</h2>
						<p class="text-cool-gray-70 dark:text-cool-gray-30 leading-relaxed mb-2">
							{{ t('pages.privacy.userRightsText') }}
						</p>
						<ul class="list-disc list-inside space-y-2 text-cool-gray-70 dark:text-cool-gray-30 pl-4">
							<li>{{ t('pages.privacy.userRightsList1') }}</li>
							<li>{{ t('pages.privacy.userRightsList2') }}</li>
							<li>{{ t('pages.privacy.userRightsList3') }}</li>
							<li>{{ t('pages.privacy.userRightsList4') }}</li>
							<li>{{ t('pages.privacy.userRightsList5') }}</li>
						</ul>
					</section>

					<!-- Third-Party Services -->
					<section class="space-y-4">
						<h2 class="font-bold text-xl text-cool-gray-80 dark:text-cool-gray-20">
							{{ t('pages.privacy.thirdPartyTitle') }}
						</h2>
						<p class="text-cool-gray-70 dark:text-cool-gray-30 leading-relaxed mb-2">
							{{ t('pages.privacy.thirdPartyText') }}
						</p>
						<ul class="list-disc list-inside space-y-2 text-cool-gray-70 dark:text-cool-gray-30 pl-4">
							<li>{{ t('pages.privacy.thirdPartyList1') }}</li>
							<li>{{ t('pages.privacy.thirdPartyList2') }}</li>
							<li>{{ t('pages.privacy.thirdPartyList3') }}</li>
						</ul>
						<p class="text-cool-gray-70 dark:text-cool-gray-30 leading-relaxed mt-4">
							{{ t('pages.privacy.thirdPartyNote') }}
						</p>
					</section>

					<!-- Changes to Privacy Policy -->
					<section class="space-y-4">
						<h2 class="font-bold text-xl text-cool-gray-80 dark:text-cool-gray-20">
							{{ t('pages.privacy.changesTitle') }}
						</h2>
						<p class="text-cool-gray-70 dark:text-cool-gray-30 leading-relaxed">
							{{ t('pages.privacy.changesText') }}
						</p>
					</section>

					<!-- Contact Us -->
					<section class="space-y-4">
						<h2 class="font-bold text-xl text-cool-gray-80 dark:text-cool-gray-20">
							{{ t('pages.privacy.contactTitle') }}
						</h2>
						<p class="text-cool-gray-70 dark:text-cool-gray-30 leading-relaxed">
							{{ t('pages.privacy.contactText') }}
						</p>
						<a
							:href="feedbackUrl"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 text-primary hover:text-primary/80 hover:underline transition-colors"
						>
							{{ t('pages.privacy.contactLink') }}
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
				</div>
			</div>
		</div>
	</div>
</template>
