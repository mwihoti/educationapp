<template>

<div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">

    <h2 class="text-3xl font-bold mb-6 text-purple-700">Register</h2>

    <forn @submit.prevent="register">
        <div class="mb-4">
            <label for="username" class="block text-gray-700 font-bold mb-2">Username</label>
            <input type="text" id="username" v-model="username" class="w-full px-3 py-2 border rounded-lg fccus:outline-none focus:ring-2  focus:ring-purple-600" required>
        </div>
        <div class="mb-6">
            <label for="email" class="block text-gray-700 font-bold mb-2 ">Email</label>
            <input type="text" id="email" v-model="email" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" required>

        </div>
        <div class="mb-6">
            <label for="password" class="bloock text-gray-700 font-bold mb-2">Password</label>
            <input type="text" id="password" v-model="password" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" required>
        </div>
        <button type="submit" class="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition 
         duration-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50">Register</button>
    </forn>
    <p class="mt-4 text-center">
        Already have an account? <router-link to="/login" class="text-purple-600 font-bold hover:underline">Login</router-link>
    </p>
</div>
</template>

<script lang="ts">

export default { 
    name:'RegisterVue',
    data() {
        return {
            username: '',
            email: '',
            password: '',
        }
    },
    methods: {
        register() {
            console.log('Register', this.username, this.email, this.password)
        }
    }
}
</script>