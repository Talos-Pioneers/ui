<script setup lang="ts">
const config = useSanctumConfig();

type Schema = {
    username: string
}

type ProfileResponse = {
    user: {
        id: string
        username: string
        email: string
    }
}

const loading = ref(true);
const successMessage = ref<string | null>(null);

// Initialize form with empty values (will be populated after fetch)
const form = usePrecognitionForm<Schema>('put', '/api/v1/profile', {
    username: '',
});

const state = form.fields;
const { data, status, error, refresh } = await useSanctumFetch<ProfileResponse>('/api/v1/profile');
const profile = computed(() => data.value?.user ?? null);
watchEffect(() => {
    if (status.value === 'success') {
        state.username = data.value?.user?.username ?? '';
    }
});

// Handle form submission
const handleSubmit = async () => {
    successMessage.value = null;
    try {
        await form.submit();

        // If no errors after submission, consider it successful
        const hasErrors = Object.keys(form.errors).length > 0;
        if (!hasErrors) {
            successMessage.value = 'Profile updated successfully.';
            refresh();
        }
    } catch (error) {
        console.error('Failed to update profile:', error);
    }
};
</script>

<template>
    <div>
        <h1>Profile Edit</h1>

        <div v-if="status === 'pending'">
            <p>Loading profile...</p>
        </div>

        <div v-else-if="profile">
            <form @submit.prevent="handleSubmit">
                <div>
                    <label for="username">Username</label>
                    <input type="text" id="username" v-model="state.username" placeholder="Username" />
                    <div v-if="form.errors.username">
                        <p v-for="error in form.errors.username" :key="error">{{ error }}</p>
                    </div>
                </div>

                <div>
                    <label for="email">Email</label>
                    <input type="email" id="email" :value="profile.email" disabled placeholder="Email" />
                    <p>Email cannot be changed</p>
                </div>

                <div v-if="successMessage">
                    <p>{{ successMessage }}</p>
                </div>

                <button type="submit" :disabled="form.processing">
                    <span v-if="form.processing">Updating...</span>
                    <span v-else>Update Profile</span>
                </button>
            </form>
        </div>
    </div>
</template>