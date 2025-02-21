<template>

<div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">

    <h2 class="text-3xl font-bold mb-6 text-purple-700">Register</h2>

    <form @submit.prevent="register">
        <div class="mb-4">
            <label for="username" class="block text-gray-700 font-bold mb-2">Username</label>
            <input type="text" id="username" v-model="username" class="w-full px-3 py-2 border rounded-lg fccus:outline-none focus:ring-2  focus:ring-purple-600" required>
        </div>
        <div class="mb-6">
            <label for="email" class="block text-gray-700 font-bold mb-2 ">Email</label>
            <input type="text" id="email" v-model="email" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" required>

        </div>
        <div class="mb-6">
            <label for="password" class="block text-gray-700 font-bold mb-2">Password</label>
            <input type="password" id="password" v-model="password" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" required>
        </div>
        <button type="submit" class="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition 
         duration-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50">Register</button>
    </form>
    <p class="mt-4 text-center">
        Already have an account? <router-link to="/login" class="text-purple-600 font-bold hover:underline">Login</router-link>
    </p>
</div>
</template>

<script lang="ts">

import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
    name: 'RegisterVue',
    setup() {
        const username = ref('');
        const email = ref('');
        const password = ref('');
        const router = useRouter();

        const handleRegiter = async () => {
            try {
                const response = await fetch(`http://localhost:3000/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        username: username.value,
                        email: email.value, 
                        password: password.value}),
                });

                if (!response.ok) {
                    throw new Error('Registration failed');

                }
                router.push('/learn');
            } catch (error) {
    console.error("Error during registration:", error);
}

        }
        return {
            username,
            email,
            password,
            register: handleRegiter
        }
    }
})

</script>