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
		name: 'Lens The Martyr',
		role: 'designer',
		avatar: '/avatars/lens.webp',
	},
	{
		name: 'patupatu',
		role: 'designer',
		avatar: '/avatars/patupatu.webp',
	},
	{
		name: '十二獣Zodiac',
		role: 'illustrator',
		avatar: '/avatars/zodiac.jpg',
	},
]

// Special thanks
const specialThanks = ['Xela', 'SethFire', 'Namtar']

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

const friends = [
	{
		name: 'Sanity Gone',
		url: 'https://sanitygone.help/',
	},
	{
		name: 'Warfarin Wiki',
		url: 'https://warfarin.wiki/',
	},
	{
		name: 'Open Endfield Map',
		url: 'https://opendfieldmap.org/',
	},
	{
		name: 'Enka Network',
		url: 'https://enka.network/?ef',
	},
	{
		name: 'Data Field',
		url: 'https://datafield.cc/',
	},
]
</script>

<template>
	<div
		class="wave-bg bg-(--wave-bg) min-h-[calc(100vh-var(--header-height))]"
	>
		<div class="container mx-auto px-4 py-6">
			<div
				class="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 lg:gap-8"
			>
				<!-- Team Members Sidebar -->
				<aside
					class="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] h-fit"
				>
					<div
						class="bg-card rounded-lg border border-border p-6"
					>
						<h2
							class="font-bold text-xl mb-4 text-foreground"
						>
							{{ $t('pages.about.teamTitle') }}
						</h2>
						<div class="flex flex-col gap-4">
							<div
								v-for="member in teamMembers"
								:key="member.name"
								class="flex items-center gap-3"
							>
								<div
									class="size-12 rounded-full bg-muted overflow-hidden flex-shrink-0"
								>
									<img
										v-if="member.avatar"
										:src="member.avatar"
										:alt="member.name"
										class="w-full h-full object-cover"
									/>
									<div
										v-else
										class="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm font-medium"
									>
										{{ member.name.charAt(0) }}
									</div>
								</div>
								<div class="flex-1 min-w-0">
									<p
										class="font-medium text-foreground truncate"
									>
										{{ member.name }}
									</p>
									<p
										class="text-sm text-muted-foreground"
									>
										{{
											$t(
												`pages.about.teamMember.${member.role}`
											)
										}}
									</p>
								</div>
							</div>
						</div>
					</div>
					<div class="mt-6">
						<a
							href="https://discord.gg/yuBpRqGzAh"
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-2 text-xl border border-border bg-card justify-center p-4 hover:bg-accent transition-colors"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								fill="currentColor"
								class="bi bi-discord"
								viewBox="0 0 16 16"
							>
								<path
									d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"
								/>
							</svg>
							Join us on Discord
						</a>
					</div>
				</aside>

				<!-- Main Content -->
				<main class="space-y-6">
					<!-- Project Description -->
					<section
						class="bg-card rounded-lg border border-border p-6 space-y-4"
					>
						<h1
							class="font-bold text-3xl text-foreground"
						>
							{{ $t('pages.about.projectTitle') }}
						</h1>
						<p
							class="text-muted-foreground leading-relaxed"
						>
							{{ $t('pages.about.projectDescription') }}
						</p>
					</section>

					<!-- Disclaimer -->
					<section
						class="bg-card rounded-lg border border-border p-6 space-y-4"
					>
						<h2
							class="font-bold text-xl text-foreground"
						>
							{{ $t('pages.about.disclaimerTitle') }}
						</h2>
						<p
							class="text-muted-foreground leading-relaxed"
						>
							{{ $t('pages.about.disclaimerText') }}
						</p>
					</section>

					<!-- Feedback -->
					<section
						class="bg-card rounded-lg border border-border p-6 space-y-4"
					>
						<h2
							class="font-bold text-xl text-foreground"
						>
							{{ $t('pages.about.feedbackTitle') }}
						</h2>
						<p
							class="text-muted-foreground leading-relaxed"
						>
							{{ $t('pages.about.feedbackDescription') }}
						</p>
						<a
							:href="feedbackUrl"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 text-foreground hover:text-foreground hover:underline transition-colors"
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
					<section
						class="bg-card rounded-lg border border-border p-6 space-y-4"
					>
						<h2
							class="font-bold text-xl text-foreground"
						>
							{{ $t('pages.about.specialThanksTitle') }}
						</h2>
						<p
							class="text-muted-foreground leading-relaxed"
						>
							{{ $t('pages.about.specialThanksDescription') }}
						</p>
						<ul
							class="list-disc list-inside space-y-2 text-muted-foreground"
						>
							<li v-for="person in specialThanks" :key="person">
								{{ person }}
							</li>
						</ul>
					</section>

					<section
						class="bg-card rounded-lg border border-border p-6 space-y-4"
					>
						<h2
							class="font-bold text-xl text-foreground"
						>
							Friends
						</h2>
						<ul
							class="list-disc list-inside space-y-2 text-muted-foreground"
						>
							<li v-for="friend in friends" :key="friend.name">
								<a
									:href="friend.url"
									target="_blank"
									class="text-foreground hover:text-foreground underline transition-colors"
								>
									{{ friend.name }}
								</a>
							</li>
						</ul>
					</section>
				</main>
			</div>
		</div>
	</div>
</template>
