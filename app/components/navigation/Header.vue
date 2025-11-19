<script setup lang="ts">
const { isAuthenticated } = useSanctumAuth();
</script>
<template>
    <header>
        <div>
            <NuxtLink to="/">
                <Logo />
            </NuxtLink>
        </div>
        <nav>
            <ul>
                <li>
                    <NuxtLink to="/blueprints">
                        Blueprints
                    </NuxtLink>
                </li>
                <li>
                    <NuxtLink to="/collections">
                        Collections
                    </NuxtLink>
                </li>
                <li>
                    <NuxtLink to="/privacy-policy">
                        Privacy Policy
                    </NuxtLink>
                </li>
                <li>
                    <NuxtLink to="/about">
                        About
                    </NuxtLink>
                </li>
                <li>
                    <NuxtLink to="/contact">
                        Contact
                    </NuxtLink>
                </li>
            </ul>
        </nav>
        <div>
            <LanguageSwitcher />
            <template v-if="!isAuthenticated">
                <!-- TODO: Login Form Modal -->
            </template>
            <template v-else>
                <!-- TODO: Profile Menu -->
            </template>
        </div>
    </header>
</template>