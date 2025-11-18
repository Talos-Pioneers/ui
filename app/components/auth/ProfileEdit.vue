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

const profile = ref<ProfileResponse['user'] | null>(null);
const loading = ref(true);
const successMessage = ref<string | null>(null);

// Initialize form with empty values (will be populated after fetch)
const form = usePrecognitionForm<Schema>('put', '/api/v1/profile', {
    username: '',
});

const state = form.fields;

// Fetch initial profile data
const fetchProfile = async () => {
    loading.value = true;
    const { data, status, error, refresh } = await useSanctumFetch<ProfileResponse>('/api/v1/profile');
    if (status.value === 'success') {
        profile.value = data.value?.user ?? null;
        state.username = profile.value?.username ?? '';
    }
    if (status.value === 'error' || error.value) {
        console.log(error.value);

    }
    loading.value = false;
};

// Handle form submission
const handleSubmit = async () => {
    successMessage.value = null;
    try {
        await form.submit();

        // If no errors after submission, consider it successful
        const hasErrors = Object.keys(form.errors).length > 0;
        if (!hasErrors) {
            successMessage.value = 'Profile updated successfully.';
            // Refresh profile data
            await fetchProfile();
        }
    } catch (error) {
        console.error('Failed to update profile:', error);
    }
};

// Fetch profile on mount
onMounted(() => {
    fetchProfile();
});
</script>

<template>
    <div>
        <h1>Profile Edit</h1>

        <div v-if="loading">
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