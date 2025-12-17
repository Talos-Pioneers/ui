<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { useLoginModal } from '~/composables/useLoginModal'
import Logo from '../icons/Logo.vue'
import LoginIcon from '../icons/LoginIcon.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import LogoMobileIcon from '../icons/LogoMobileIcon.vue'
import UserIcon from '../icons/UserIcon.vue'
import AddBlueprintIcon from '../icons/AddBlueprintIcon.vue'
import AddCollectionIcon from '../icons/AddCollectionIcon.vue'
import { Menu, Plus } from 'lucide-vue-next'
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
const { open } = useLoginModal()
const router = useRouter()

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
		class="sticky top-0 z-40 bg-white flex items-center h-16.5 px-7.5 border-b border-cool-gray-20"
	>
		<div>
			<NuxtLinkLocale to="/">
				<Logo class="hidden md:block" />
				<LogoMobileIcon class="block md:hidden" />
			</NuxtLinkLocale>
		</div>
		<nav class="hidden md:block ml-7.5 h-full">
			<ul class="flex items-center gap-7.5 h-full">
				<li
					v-for="item in navigationItems"
					:key="item.to"
					class="h-full flex items-center"
				>
					<NuxtLinkLocale
						active-class="text-cool-gray-80 border-b-2 h-full border-black"
						class="text-cool-gray-60 hover:text-cool-gray-80 h-full flex items-center"
						:to="item.to"
					>
						{{ t(item.label) }}
					</NuxtLinkLocale>
				</li>
			</ul>
		</nav>
		<div class="ml-auto flex items-center gap-2">
			<LanguageSwitcher />
			<template v-if="!isAuthenticated">
				<Button
					class="min-w-40 px-4.5 justify-between hidden md:flex"
					variant="default"
					@click="open"
				>
					<span class="flex items-center gap-2.5">
						<LoginIcon class="h-5" />
						<span class="h-3.5 w-px bg-cool-gray-50" />
					</span>
					{{ t('components.navigation.header.signIn') }}
				</Button>
				<Button
					class="md:hidden"
					variant="default"
					size="icon-lg"
					@click="open"
				>
					<LoginIcon class="h-5" />
				</Button>
			</template>
			<template v-else>
				<DropdownMenu>
					<DropdownMenuTrigger as-child>
						<Button
							variant="default"
							class="hidden md:flex items-center gap-2 mr-2"
						>
							<Plus class="h-4 w-4" />
							{{ t('components.navigation.header.nav.create') }}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
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

				<DropdownMenu>
					<DropdownMenuTrigger as-child>
						<Button variant="default" size="icon-lg">
							<UserIcon class="h-5 text-cool-gray-100" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
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
			<Sheet>
				<SheetTrigger as-child>
					<Button variant="ghost" size="icon" class="md:hidden ml-2">
						<Menu class="h-6 w-6" />
					</Button>
				</SheetTrigger>
				<SheetContent side="right">
					<SheetHeader>
						<SheetTitle class="text-left">
							<Logo />
						</SheetTitle>
					</SheetHeader>
					<div class="flex flex-col gap-4 px-4">
						<NuxtLinkLocale
							v-for="item in navigationItems"
							:key="item.to"
							:to="item.to"
							active-class="text-cool-gray-80 h-full"
							class="text-cool-gray-60 hover:text-cool-gray-80 h-full flex items-center"
						>
							{{ t(item.label) }}
						</NuxtLinkLocale>

						<template v-if="isAuthenticated">
							<div class="h-px bg-cool-gray-20 my-2" />
							<p
								class="text-sm text-cool-gray-60 font-medium mb-2"
							>
								{{
									t('components.navigation.header.nav.create')
								}}
							</p>
							<NuxtLinkLocale
								active-class="text-cool-gray-80 border-b-2 h-full border-black"
								class="text-cool-gray-60 hover:text-cool-gray-80 h-full flex items-center gap-2"
								to="/blueprints/create"
							>
								<AddBlueprintIcon class="size-5" />
								{{
									t(
										'components.navigation.header.nav.createBlueprint'
									)
								}}
							</NuxtLinkLocale>
							<NuxtLinkLocale
								active-class="text-cool-gray-80 border-b-2 h-full border-black"
								class="text-cool-gray-60 hover:text-cool-gray-80 h-full flex items-center gap-2"
								to="/collections/create"
							>
								<AddCollectionIcon class="size-6" />
								{{
									t(
										'components.navigation.header.nav.createCollection'
									)
								}}
							</NuxtLinkLocale>
						</template>
					</div>
				</SheetContent>
			</Sheet>
		</div>
	</header>
</template>
