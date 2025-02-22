<template>
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
      <!-- User Identity Section -->
      <div class="flex items-center mb-8 p-6 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg">
        <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
          {{ userInitials }}
        </div>
        <div class="ml-6">
          <h1 class="text-2xl font-bold text-gray-800">{{ username }}</h1>
          <div class="mt-2 flex items-center">
            <div class="text-sm text-gray-600">
              <span class="font-semibold">Success Rate: </span>
              <span :class="successRateColor">{{ successRate }}%</span>
            </div>
            <div class="mx-4 text-gray-300">|</div>
            <div class="text-sm text-gray-600">
              <span class="font-semibold">Member since: </span>
              {{ formattedJoinDate }}
            </div>
          </div>
        </div>
      </div>
  
      <h2 class="text-3xl font-bold mb-6 text-purple-700">User Profile</h2>
      <div class="mb-6">
        <label for="about" class="block text-gray-700 font-bold mb-2">About Me</label>
        <textarea
          id="about"
          v-model="about"
          rows="4"
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          placeholder="Tell us about yourself..."
        ></textarea>
      </div>
      <button
        @click="saveProfile"
        class="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50"
      >
        Save Profile
      </button>
  
      <h3 class="text-2xl font-bold mt-12 mb-6 text-purple-700">Progress Stats</h3>
      <div class="grid grid-cols-3 gap-6">
        <div class="bg-green-100 p-6 rounded-lg text-center">
          <p class="text-3xl font-bold text-green-600">{{ correctAnswers }}</p>
          <p class="text-sm text-green-600">Correct Answers</p>
        </div>
        <div class="bg-red-100 p-6 rounded-lg text-center">
          <p class="text-3xl font-bold text-red-600">{{ incorrectAnswers }}</p>
          <p class="text-sm text-red-600">Incorrect Answers</p>
        </div>
        <div class="bg-blue-100 p-6 rounded-lg text-center">
          <p class="text-3xl font-bold text-blue-600">{{ totalQuestions }}</p>
          <p class="text-sm text-blue-600">Total Questions</p>
        </div>
      </div>
      
      <div v-if="lastUpdated" class="mt-6 text-sm text-gray-500 text-right">
        Last updated: {{ formattedLastUpdate }}
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted, onBeforeUnmount, computed } from 'vue';
  import { useAuth } from '@/contexts/AuthContext';
  
  export default defineComponent({
    name: 'profileView',
    setup() {
      const auth = useAuth();
      const about = ref('');
      const correctAnswers = ref(0);
      const incorrectAnswers = ref(0);
      const totalQuestions = ref(0);
      const lastUpdated = ref<Date | null>(null);
      const refreshInterval = ref<number | null>(null);
      const username = ref('');
      const joinDate = ref<Date | null>(null);
      
      const userInitials = computed(() => {
        return username.value
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
      });
  
      const successRate = computed(() => {
        if (totalQuestions.value === 0) return 0;
        return Math.round((correctAnswers.value / totalQuestions.value) * 100);
      });
  
      const successRateColor = computed(() => {
        if (successRate.value >= 80) return 'text-green-600';
        if (successRate.value >= 60) return 'text-yellow-600';
        return 'text-red-600';
      });
  
      const formattedJoinDate = computed(() => {
        if (!joinDate.value) return '';
        return new Date(joinDate.value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      });
      
      const formattedLastUpdate = computed(() => {
        if (!lastUpdated.value) return '';
        return lastUpdated.value.toLocaleTimeString();
      });
  
      const fetchProfile = async () => {
        try {
          const response = await fetch('http://localhost:3000/profile', {
            headers: {
              'Authorization': `Bearer ${auth.token.value}`
            }
          });
          
          if (!response.ok) {
            throw new Error("Failed to fetch profile");
          }
          
          const data = await response.json();
          about.value = data.profile.about;
          correctAnswers.value = data.profile.correctAnswers;
          incorrectAnswers.value = data.profile.incorrectAnswers;
          totalQuestions.value = data.profile.totalQuestions;
          username.value = data.username;
          joinDate.value = new Date(data.createdAt);
          lastUpdated.value = new Date();
        } catch (error) {
          console.error('Failed to fetch profile', error);
        }
      };
  
      const saveProfile = async () => {
        try {
          const response = await fetch(`http://localhost:3000/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${auth.token.value}`
            },
            body: JSON.stringify({ about: about.value })
          });
          
          if (!response.ok) {
            throw new Error('Failed to update profile');
          }
          
          console.log('Profile updated successfully');
          fetchProfile(); // Refresh data after update
        } catch (error) {
          console.error('Error updating profile!', error);
        }
      };
  
      onMounted(() => {
        fetchProfile();
        refreshInterval.value = window.setInterval(() => {
          fetchProfile();
        }, 5000);
        document.addEventListener('visibilitychange', handleVisibilityChange);
      });
  
      onBeforeUnmount(() => {
        if (refreshInterval.value) {
          clearInterval(refreshInterval.value);
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      });
      
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          fetchProfile();
        }
      };
  
      return {
        about,
        correctAnswers,
        incorrectAnswers,
        totalQuestions,
        saveProfile,
        lastUpdated,
        formattedLastUpdate,
        username,
        userInitials,
        formattedJoinDate,
        successRate,
        successRateColor
      };
    }
  });
  </script>