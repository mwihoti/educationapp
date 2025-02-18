<template>

<div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
    <h2 class="text-3xl font-bold mb-6 text-purple-700">User Profile</h2>
    <div class="mb-6">
        <label for="about" class="block text-gray-700 font-bold mb-2">About Me</label>
        <textarea id="about" v-model="about" rows="4" class="w-full px-3 py-2 border rounded-lg 
        focus:outline-none focus:ring-2 focus:ring-purple-600" placeholder="Tell us about yourself..."></textarea>
    </div>
    <button @click="saveProfile" class="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-600 
    focus:ring-opacity-50">Save Profile</button>

    <h3 class="text-2xl font-bold mt-12 mb-6 text-purple-700">Progress</h3>
    <div class="grid grid-cols-3 gap-6">

        <div class="bg-green-100 p-6 rounded-lg text-center">
            <p class="text-3xl font-bold text-green-600">{{ correctAnswers }}</p>
            <p class="text-sm text-green-600"> Correct Answers</p>
        </div>
        <div class="bg-red-100 p-6 rounded-lg text-center">
            <p class="text-3xl font-bold text-red-600"> {{  incorrectAnswers }}</p>
            <p class="text-sm text-red-600">Incorrect Answers</p>

        </div>
        <div class="bg-blue-100 p-6 rounded-lg text-center">
            <p class="text-3xl font-bold text-blue-600">{{  totalQuestions  }}</p>
            <p class="text-sm text-blue-600">Total Questions</p>
        </div>
    </div>
</div>
</template>

<script lang="ts">
export default {
    name: 'ProfileView',
    data() {
        return {
            about: '',
            correctAnswers: 0,
            incorrectAnswers: 0,
            totalQuestions: 0
        }
    },
    methods: {
        saveProfile() {
            // Todo to implement save profile logic here
            console.log('Save profile:', this.about)
        }
    },
    mounted() {
        // Fetch user profile and progress data
        // To replace with actual api calls
        this.about = "I love learning math!"
        this.correctAnswers = 25
        this.incorrectAnswers = 5
        this.totalQuestions = 30
         
    }
}

</script>