

<template>
  <div class="text-center py-12">
    <h1 class="text-5xl font-bold text-white mb-6 animate-bounce">
      Welcome to MathWhiz
    </h1>
    <p class="text-2xl text-white mb-12">Learn math in a fun and interactive way!</p>
    <router-link to="/learn" class="bg-white text-purple-600 font-bold py-3 px-6 rounded-full hover:bg-purple-100  transition duration-300 text-lg shadow-lg hover:shadow-xl transform 
    hover:translate-y-1">Start learning</router-link>
  </div>
 
</template>


<script  lang="ts">
export default { name: 'HomeView'}
</script>