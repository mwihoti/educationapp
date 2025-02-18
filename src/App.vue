

<template>
 
 <div id="app" class="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600">
  <nav class="p-4 bg-white bg-opacity-20 backdrop-blur-lg">
    <div class="container mx-auto flex items-center justify-between">
      <router-link to="/" class="text-white font-bold text-2xl"> Educational app</router-link>

      <div class="space-x-4">
        <router-link to="/profile" class="text-white hover:text-purple-200 transition duration-300">Profile</router-link>
        <router-link to="/Learn" class="text-white hover:text-purple-200 transition duration-300">Learn</router-link>
        <router-link to="/Login" class="text-white hover:text-purple-200 transition duration-300">Login</router-link>


      </div>
    </div>
    
  </nav>
  <main class="container mx-auto p-4">
    <transition name="fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </main>


 </div>

</template>

<script lang="ts">
export default {
  name: 'App'
}
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, fade-leave-to {
  opacity: 0;
}
</style>
