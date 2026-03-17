<script setup lang="ts">
const lastUpdatedDate = 'February 26, 2026'
useHead({
	title: $t('pages.apiTerms.title'),
	meta: [
		{
			property: 'og:title',
			content: $t('pages.apiTerms.title'),
		},
		{
			name: 'description',
			content: $t('pages.apiTerms.description'),
		},
		{
			property: 'og:description',
			content: $t('pages.apiTerms.description'),
		},
	],
})
</script>
<template>
	<div
		class="wave-bg bg-(--wave-bg) min-h-[calc(100vh-var(--header-height))]"
	>
		<div class="container mx-auto px-4 py-6">
			<div class="max-w-4xl mx-auto">
				<div
					class="bg-card rounded-lg border border-border p-6 space-y-8"
				>
					<div>
						<h1
							class="font-bold text-3xl text-foreground mb-2"
						>
							API Terms of Use
						</h1>
						<p
							class="text-sm text-muted-foreground"
						>
							Last updated {{ lastUpdatedDate }}
						</p>
					</div>
					<div
						class="prose prose-cool-gray dark:prose-invert max-w-none"
					>
						<p>
							By accessing or using the Talos Pioneers API, you
							agree to the following terms. If you do not agree,
							do not use the API.
						</p>
						<h2 id="permitted-use">Permitted Use</h2>
						<ul>
							<li>
								You may freely access the Talos Pioneers API for
								personal, non-commercial purposes.
							</li>
							<li>
								You may build tools, apps, bots, or integrations
								that consume the API, provided they add
								meaningful new functionality or experience
								beyond what Talos Pioneers already offers (e.g.,
								planners, calculators, analytics tools, Discord
								bots with unique features).
							</li>
						</ul>
						<h2 id="prohibited-use">Prohibited Use</h2>
						<ul>
							<li>
								<strong>No monetization.</strong> You may not
								generate revenue of any kind from API data. This
								includes but is not limited to: advertisements,
								donations, paid subscriptions, sponsorships, or
								any other form of direct or indirect profit. If
								you wish to monetize a project that uses our
								API, you must obtain explicit written permission
								from Talos Pioneers first.
							</li>
							<li>
								<strong>No mirroring or republishing.</strong>
								You may not use the API to display, reproduce,
								or redistribute Talos Pioneers content as-is on
								another website, app, or service. Creating a
								substitute or replica of the Talos Pioneers
								browsing experience is not permitted, regardless
								of whether money is involved.
							</li>
							<li>
								<strong>No bulk redistribution.</strong> You may
								not download, repackage, or re-serve the API
								data as your own dataset or through your own
								API.
							</li>
							<li>
								<strong>No abuse.</strong> You may not use the
								API in any way that disrupts, degrades, or
								interferes with the service for other users.
								This includes denial-of-service attacks,
								excessive request volume, or attempting to
								circumvent any rate limits or access controls.
							</li>
						</ul>
						<h2 id="content-ownership">Content Ownership</h2>
						<p>
							All blueprint data and community-created content
							accessible through the API belongs to its respective
							contributors and Talos Pioneers. Accessing it
							through the API does not grant you ownership or
							redistribution rights.
						</p>
						<h2 id="attribution">Attribution</h2>
						<p>
							If you build something using the Talos Pioneers API,
							you must provide visible attribution with a link
							back to
							<a href="https://talospioneers.com"
								>talospioneers.com</a
							>.
						</p>
						<h2 id="termination">Termination</h2>
						<p>
							We reserve the right to revoke API access at any
							time, for any reason, including but not limited to
							violation of these terms. This may include IP bans,
							request blocking, or any other technical measures we
							deem appropriate.
						</p>
						<h2 id="no-warranty">No Warranty</h2>
						<p>
							The API is provided &quot;as is&quot; with no
							guarantees of availability, accuracy, or uptime. We
							may modify, rate-limit, or discontinue the API at
							any time without notice.
						</p>
						<h2 id="changes-to-these-terms">
							Changes to These Terms
						</h2>
						<p>
							We may update these terms at any time. Continued use
							of the API after changes are posted constitutes
							acceptance of the updated terms.
						</p>
						<h2 id="contact">Contact</h2>
						<p>
							If you have questions about these terms or want to
							request permission for a use case not covered here,
							reach out to us at talospioneers@gmail.com.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
