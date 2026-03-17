<script setup lang="ts">
import { Button } from '~/components/ui/button'
import Logo from '../icons/Logo.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import SignInButton from './SignInButton.vue'
import ThemeSelector from './ThemeSelector.vue'
import ThemeSelectorInline from './ThemeSelectorInline.vue'
import LogoMobileIcon from '../icons/LogoMobileIcon.vue'
import UserIcon from '../icons/UserIcon.vue'
import AddBlueprintIcon from '../icons/AddBlueprintIcon.vue'
import AddCollectionIcon from '../icons/AddCollectionIcon.vue'
import MenuIcon from '../icons/MenuIcon.vue'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '~/components/ui/sheet'

const { t } = useI18n()
const { isAuthenticated, logout } = useSanctumAuth()
const router = useRouter()
const route = useRoute()
const mobileMenuOpen = ref(false)

// Dynamic nav collapse (replaces fixed nav: breakpoint)
const { headerRef, navMeasureRef, isCollapsed } = useNavCollapse()

// Auto-close mobile menu when nav expands to desktop
watch(isCollapsed, (collapsed) => {
	if (!collapsed) mobileMenuOpen.value = false
})

const handleLogout = async () => {
	try {
		await logout()
		await router.push('/')
	} catch (error) {
		console.error('Failed to logout:', error)
	}
}

const navigationItems = [
	{
		label: 'components.navigation.header.nav.blueprints',
		to: '/',
	},
	{
		label: 'components.navigation.header.nav.collections',
		to: '/collections',
	},
]
</script>
<template>
	<header
		ref="headerRef"
		class="sticky top-0 z-40 bg-background flex items-center h-16.5 px-7.5 border-b border-border"
	>
		<!-- Hidden measurement element: always in DOM for measuring nav text width -->
		<div
			ref="navMeasureRef"
			class="absolute invisible pointer-events-none flex items-center gap-7.5"
			aria-hidden="true"
		>
			<span v-for="item in navigationItems" :key="item.to">{{ t(item.label) }}</span>
		</div>

		<div>
			<NuxtLinkLocale to="/" class="text-(--logo)" data-scroll-top>
				<Logo class="hidden navd:block" />
				<LogoMobileIcon class="block navd:hidden" />
			</NuxtLinkLocale>
		</div>
		<nav class="hidden navd:block ml-7.5 h-full relative">
			<ul class="flex items-center gap-7.5 h-full">
				<li
					v-for="item in navigationItems"
					:key="item.to"
					class="h-full flex items-center"
				>
					<NuxtLinkLocale
						active-class="text-nav-link-active nav-link-active"
						class="text-nav-link hover:text-nav-link-active h-full flex items-center"
						:to="item.to"
					>
						{{ t(item.label) }}
					</NuxtLinkLocale>
				</li>
			</ul>
			<span class="nav-underline absolute bottom-0 h-0.5 bg-nav-underline" />
		</nav>
		<div class="ml-auto flex items-center gap-2">
			<ThemeSelector />
			<LanguageSwitcher />
			<template v-if="!isAuthenticated">
				<SignInButton v-if="!route.path.includes('/login')" />
			</template>
			<template v-else>
				<DropdownMenu :modal="false">
					<DropdownMenuTrigger as-child>
						<Button
							variant="default"
							class="hidden navd:flex min-w-40 px-4.5 justify-between bg-(--create-btn-bg) before:border-(--create-btn-outline)"
						>
							<span class="flex items-center gap-2.5">
								<AddBlueprintIcon class="h-5 text-(--create-btn-icon)" />
								<span class="h-3.5 w-px bg-(--create-btn-outline)"></span>
							</span>
							<span class="text-(--create-btn-text)">{{ t('components.navigation.header.nav.create') }}</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" class="min-w-[var(--reka-dropdown-menu-trigger-width)]">
						<DropdownMenuItem as-child>
							<NuxtLinkLocale
								to="/blueprints/create"
								class="flex items-center gap-2 cursor-pointer"
							>
								<AddBlueprintIcon class="w-4 h-4" />
								{{
									t(
										'components.navigation.header.nav.createBlueprint'
									)
								}}
							</NuxtLinkLocale>
						</DropdownMenuItem>
						<DropdownMenuItem as-child>
							<NuxtLinkLocale
								to="/collections/create"
								class="flex items-center gap-2 cursor-pointer"
							>
								<AddCollectionIcon class="w-4 h-4" />
								{{
									t(
										'components.navigation.header.nav.createCollection'
									)
								}}
							</NuxtLinkLocale>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu :modal="false">
					<DropdownMenuTrigger as-child>
						<Button variant="default" size="icon-lg" class="navd:size-11.5 bg-(--profile-btn-bg) before:border-(--profile-btn-outline)">
							<UserIcon class="h-5 text-(--profile-btn-icon)" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" class="min-w-[var(--reka-dropdown-menu-trigger-width)]">
						<DropdownMenuItem as-child>
							<NuxtLinkLocale to="/profile">
								{{
									t(
										'components.navigation.header.menu.editProfile'
									)
								}}
							</NuxtLinkLocale>
						</DropdownMenuItem>
						<DropdownMenuItem as-child>
							<NuxtLinkLocale to="/profile/blueprints">
								{{
									t(
										'components.navigation.header.menu.myBlueprints'
									)
								}}
							</NuxtLinkLocale>
						</DropdownMenuItem>
						<DropdownMenuItem as-child>
							<NuxtLinkLocale to="/profile/collections">
								{{
									t(
										'components.navigation.header.menu.myCollections'
									)
								}}
							</NuxtLinkLocale>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant="destructive"
							@click="handleLogout"
						>
							{{ t('components.navigation.header.menu.logout') }}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</template>
			<Sheet v-model:open="mobileMenuOpen">
				<SheetTrigger as-child>
					<Button variant="default" size="icon-lg" class="navd:hidden bg-(--burger-bg) before:border-(--burger-outline)">
						<MenuIcon class="w-4.5 h-4 text-(--burger-icon)" />
					</Button>
				</SheetTrigger>
				<SheetContent side="right">
					<SheetHeader>
						<SheetTitle class="text-left text-(--logo)">
							<NuxtLinkLocale to="/" data-scroll-top class="inline-block" @click="mobileMenuOpen = false">
								<Logo />
							</NuxtLinkLocale>
						</SheetTitle>
					</SheetHeader>
					<div class="flex flex-col px-4 -mt-2">
						<NuxtLinkLocale
							v-for="item in navigationItems"
							:key="item.to"
							:to="item.to"
							active-class="text-nav-link-active"
							class="text-nav-link hover:text-nav-link-active flex items-center py-2"
							@click="mobileMenuOpen = false"
						>
							{{ t(item.label) }}
						</NuxtLinkLocale>

						<template v-if="isAuthenticated">
							<div class="h-px bg-border my-2" />
							<p
								class="text-sm text-muted-foreground font-medium mb-2"
							>
								{{
									t('components.navigation.header.nav.create')
								}}
							</p>
							<NuxtLinkLocale
								active-class="text-nav-link-active"
								class="text-nav-link hover:text-nav-link-active flex items-center gap-2 py-2"
								to="/blueprints/create"
								@click="mobileMenuOpen = false"
							>
								<span class="w-6 flex items-center shrink-0">
									<AddBlueprintIcon class="size-5" />
								</span>
								{{
									t(
										'components.navigation.header.nav.createBlueprint'
									)
								}}
							</NuxtLinkLocale>
							<NuxtLinkLocale
								active-class="text-nav-link-active"
								class="text-nav-link hover:text-nav-link-active flex items-center gap-2 py-2"
								to="/collections/create"
								@click="mobileMenuOpen = false"
							>
								<span class="w-6 flex items-center shrink-0">
									<AddCollectionIcon class="size-5" />
								</span>
								{{
									t(
										'components.navigation.header.nav.createCollection'
									)
								}}
							</NuxtLinkLocale>
						</template>

						<div class="h-px bg-border my-2" />
						<p class="text-sm text-muted-foreground font-medium mb-2">
							{{ t('theme.label') }}
						</p>
						<ThemeSelectorInline />
					</div>
				</SheetContent>
			</Sheet>
		</div>
	</header>
</template>
<style scoped>
/*
 * Sliding nav underline via CSS Anchor Positioning:
 * The active NuxtLink registers itself as a CSS anchor (anchor-name).
 * The underline <span> binds to that anchor (position-anchor) and
 * stretches its left/right edges to match the anchor's bounds.
 * Transition on all properties animates the slide between nav items.
 * When no link is active, :has() hides the underline.
 */
.nav-link-active {
	anchor-name: --active-nav;
}

.nav-underline {
	position-anchor: --active-nav;
	left: anchor(left);
	right: anchor(right);
	transition: left 0.3s ease-in-out, right 0.3s ease-in-out;
}

nav:not(:has(.nav-link-active)) .nav-underline {
	opacity: 0;
}
</style>
