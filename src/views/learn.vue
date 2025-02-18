<template>
    <div class="max-w-4xl mx-auto bg-gradient-to-br from-purple-400 to-indigo-600 rounded-lg shadow-lg p-8">
      <h2 class="text-4xl font-bold mb-8 text-white text-center">Math Adventure</h2>
      <div class="mb-8">
        <label for="difficulty" class="block text-white font-bold mb-2 text-lg">Choose your challenge Level</label>
        <select id="difficulty" v-model="difficulty" @change="generateQuestion" class="w-full px-4 py-2 rounded-full bg-white text-purple-700 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 transition:duration-300">

            <option value="entry">Beginner</option>
            <option value="mid">Intermidiate</option>
            <option value="advanced">Advanced</option>
        </select>
       
      </div>
      <transition name="fade" mode="out-in">
        <div v-if="currentQuestion" key="question" class="bg-white rounded-lg p-6 mb-8 shadow-inner">
            <p class="text-2xl mb-6 font-semibold text-purple-800">{{  currentQuestion.question }}</p>
        </div>
      </transition>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed } from 'vue';
  import { questions, Question } from '../data/data';
  
  export default defineComponent({
    name: 'LearnMath',
    setup() {
        const difficulty = ref<'entry' | 'mid' | 'advanced'>('entry');
        const currentQuestion = ref<Question | null>(null);
        const userAnswer = ref('');
        const feedback = ref('');
        const explanation = ref('');

        const generateQuestion = () => {
            const filteredQuestions = questions.filter(q => q.difficulty === difficulty.value);
            currentQuestion.value = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
            userAnswer.value = '';
            feedback.value = '';
            explanation.value = '';
        };

        const checkAnswer = () => {
            if (currentQuestion.value) {
                if (userAnswer.value.trim().toLocaleLowerCase() === currentQuestion.value.answer.toLowerCase()) {
                    feedback.value = "Correct! You are a math wizard! 🎉";
                    explanation.value = currentQuestion.value.explanation;
                } else {
                    feedback.value = "Oops! That's not quite right. Give it another try! 💪";
                    explanation.value = '';
                }
            }
        };
        const feedbackClass = computed(() => {
            return feedback.value.includes('correct') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        } );
        return {
            difficulty,
            currentQuestion,
            checkAnswer,
            userAnswer,
            feedbackClass,
            generateQuestion,
            explanation,
            feedback
        };
    },
    mounted() {
        this.generateQuestion();
    }

  });
  </script>
  
  <style scoped>
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
  
  .bounce-enter-active {
    animation: bounce-in 0.5s;
  }
  .bounce-leave-active {
    animation: bounce-in 0.5s reverse;
  }
  @keyframes bounce-in {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.25);
    }
    100% {
      transform: scale(1);
    }
  }
  
  .slide-fade-enter-active {
    transition: all 0.3s ease;
  }
  .slide-fade-leave-active {
    transition: all 0.3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }
  .slide-fade-enter, .slide-fade-leave-to {
    transform: translateY(20px);
    opacity: 0;
  }
  </style>
  
  