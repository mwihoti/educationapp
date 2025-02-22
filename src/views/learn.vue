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
            <input type="text" v-model="userAnswer" @keyup.enter="checkAnswer" class="w-full px-4 py-2 rounded-full mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600 text-lg" placeholder="Your answer...">
            <div class="flex space-x-4">

                <button @click="checkAnswer" class="flex-1 bg-green-500 text-white font-bold py-3 px-6 rounded-full hover:bg-green-600 transition duration-500 
                transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50">
            Submit Answer</button>

                <button @click="generateQuestion" class="flex-1 bg-blue-500 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-600 transition duration-500 transform hover:scale-105 focus:ring-opacity-50">
                    New Question
                </button>

            </div>

        </div>
        <div v-else key="loading" class="text-center text-white text-2xl">
            loading question...
        </div>
      </transition>
      <transition name="bounce">
        <div v-if="feedback" :class="['p-6 rounded-lg mb-6 text-center text-xl font-bold', feedbackClass]">
            {{  feedback }}
        </div>
      </transition>
      <transition name="slide-fade">
        <div v-if="explanation" class="bg-yellow-100 p-6 rounded-lg mb-6">
            <p class="font-bold text-yellow-800 mb-2 text-lg">Explanation:</p>
            <p class="text-yellow-800 text-lg">{{ explanation }}</p>
        </div>
      </transition>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, onMounted } from 'vue';
  import { questions, Question } from '@/data/data';
  import { useAuth } from '@/contexts/AuthContext';
  import { useRouter } from 'vue-router';
  
  export default defineComponent({
    name: 'LearnMath',
    setup() {
        const auth = useAuth();
        const router = useRouter();
        const difficulty = ref<'entry' | 'mid' | 'advanced'>('entry');
        const currentQuestion = ref<Question | null>(null);
        const userAnswer = ref('');
        const feedback = ref('');
        const explanation = ref('');
        const showExplanation = ref(false);
        const streakCount = ref(0);
        const sessionStats = ref({
          correct: 0,
          incorrect: 0,
        });

        const accuracyPercentage = computed(() => {
          const total = sessionStats.value.correct + sessionStats.value.incorrect;
          if (total === 0) return 0;
          return Math.round((sessionStats.value.correct / total) * 100);
        })

        const generateQuestion = () => {
            const filteredQuestions = questions.filter(q => q.difficulty === difficulty.value);
            currentQuestion.value = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
            userAnswer.value = '';
            feedback.value = '';
            explanation.value = '';
            showExplanation.value = false;
        };
        const updateUserProgress = async (correct: boolean) => {
          try {
            await fetch('http://localhost:3000/update-score', {
              method: `PUT`,
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token.value}`
              },
              body: JSON.stringify({ correct })
            });
            console.log('score updated')
          } catch (error) {
            console.error('Cannot update user score', error);

          }
        }
        const checkAnswer = async () => {
          if (!currentQuestion.value) return;

          const isCorrect = userAnswer.value.trim().toLowerCase() === currentQuestion.value.answer.toLowerCase();
          if (isCorrect) {
            feedback.value ="Correct! You're a math wizard! 🎉";
            showExplanation.value = true;
            streakCount.value++;
            sessionStats.value.correct++;
          } else {
            feedback.value = "Ooops! That's not quite right. Give it another try! 💪";
            showExplanation.value = true;
            streakCount.value = 0;
            sessionStats.value.incorrect++;
          }

          // update progress on database
          await updateUserProgress(isCorrect)


          // Generate a new question after a delay
          setTimeout(() => {
            generateQuestion();
          }, 3000)
        }
        
        const feedbackClass = computed(() => {
            return feedback.value.includes('correct') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        } );
        onMounted(() => {
          if (!auth) {
            router.push('/login');
            return
          }
          generateQuestion();
        })
        return {
            difficulty,
            currentQuestion,
            checkAnswer,
            userAnswer,
            feedbackClass,
            generateQuestion,
            explanation,
            feedback,
            updateUserProgress,
            accuracyPercentage
        };
    },
   

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
  
  