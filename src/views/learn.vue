<template>
  <div class="max-w-4xl mx-auto bg-gradient-to-br from-purple-400 to-indigo-600 rounded-lg shadow-lg p-8">
    <h2 class="text-4xl font-bold mb-8 text-white text-center">Math Adventure</h2>
    <div class="mb-8">
      <label for="difficulty" class="block text-white font-bold mb-2 text-lg">Choose your challenge Level</label>
      <select
        id="difficulty"
        v-model="difficulty"
        @change="generateQuestion"
        class="w-full px-4 py-2 rounded-full bg-white text-purple-700 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 transition:duration-300"
      >
        <option value="entry">Beginner</option>
        <option value="mid">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
    </div>

    <transition name="fade" mode="out-in">
      <div v-if="currentQuestion" key="question" class="bg-white rounded-lg p-6 mb-8 shadow-inner">
        <p class="text-2xl mb-6 font-semibold text-purple-800">{{ currentQuestion.question }}</p>
        <input
          type="text"
          v-model="userAnswer"
          @keyup.enter="checkAnswer"
          class="w-full px-4 py-2 rounded-full mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600 text-lg"
          placeholder="Your answer..."
        >
        <div class="flex space-x-4">
          <button
            @click="checkAnswer"
            class="flex-1 bg-green-500 text-white font-bold py-3 px-6 rounded-full hover:bg-green-600 transition duration-500 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
          >
            Submit Answer
          </button>
          <button
            @click="generateQuestion"
            class="flex-1 bg-blue-500 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-600 transition duration-500 transform hover:scale-105 focus:ring-opacity-50"
          >
            New Question
          </button>
        </div>
        <button @click="simulateIncorrectAnswer" class="mt-4 bg-yellow-500 text-white font-bold py-3 px-6 rounded-full hover:bg-yellow-600 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50">
        Simulate Incorrect Answer
      </button>
      </div>
      <div v-else key="loading" class="text-center text-white text-2xl">
        Loading question...
      </div>
    </transition>

    <transition name="bounce">
      <div v-if="feedback" :class="['p-6 rounded-lg mb-6 text-center text-xl font-bold', feedbackClass]">
        {{ feedback }}
        <div v-if="streakCount > 1" class="mt-2 text-lg">
        🔥 {{ streakCount }} Question Streak! Keep going!
      </div>
      </div>
    </transition>

    <transition name="slide-fade">
      <div v-if="explanation" class="bg-yellow-100 p-6 rounded-lg mb-6">
        <p class="font-bold text-yellow-800 mb-2 text-lg">Explanation:</p>
        <p class="text-yellow-800 text-lg">{{ explanation }}</p>
      </div>
    </transition>
    <transition name="slide-fade">
    <div v-if="explanation" class="bg-yellow-100 p-6 rounded-lg mb-6">
      <p class="font-bold text-yellow-800 mb-2 text-lg">Explanation:</p>
      <p class="text-yellow-800 text-lg">{{ currentQuestion?.explanation }}</p>
    </div>
  </transition>

    <!-- New section for similar question and guidance -->
    <transition name="slide-fade">
      <div v-if="similarQuestion" class="bg-blue-50 p-6 rounded-lg mb-6">
        <h3 class="text-2xl font-bold mb-4 text-blue-800">Let's try a similar question:</h3>
        <p class="text-xl mb-6 text-blue-900">{{ similarQuestion.question }}</p>
        
        <div v-if="guidanceSteps.length" class="mb-6">
          <h4 class="font-bold text-lg mb-3 text-blue-800">Step-by-step guide:</h4>
          <ul class="space-y-2">
            <li v-for="(step, index) in guidanceSteps" :key="index" class="text-blue-700">
              {{ index + 1 }}. {{ step }}
            </li>
          </ul>
        </div>

        <div v-if="keyConcepts.length" class="mb-6">
          <h4 class="font-bold text-lg mb-3 text-blue-800">Key Concepts:</h4>
          <ul class="list-disc list-inside space-y-2">
            <li v-for="(concept, index) in keyConcepts" :key="index" class="text-blue-700">
              {{ concept }}
            </li>
          </ul>
        </div>

        <input
          type="text"
          v-model="similarQuestionAnswer"
          @keyup.enter="checkSimilarAnswer"
          class="w-full px-4 py-2 rounded-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600 text-lg"
          placeholder="Try this similar question..."
        >
        <button
          @click="checkSimilarAnswer"
          class="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-600 transition duration-500"
        >
          Submit Answer
        </button>
      </div>
    </transition>
    <div class="mt-8 bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-6">
    <h3 class="text-xl font-bold mb-4 text-white">Session Progress</h3>
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white bg-opacity-90 rounded-lg p-4 text-center">
        <p class="text-2xl font-bold text-green-600">{{ sessionStats.correct }}</p>
        <p class="text-sm text-gray-600">Correct</p>
      </div>
      <div class="bg-white bg-opacity-90 rounded-lg p-4 text-center">
        <p class="text-2xl font-bold text-red-600">{{ sessionStats.incorrect }}</p>
        <p class="text-sm text-gray-600">Incorrect</p>
      </div>
      <div class="bg-white bg-opacity-90 rounded-lg p-4 text-center">
        <p class="text-2xl font-bold text-blue-600">{{ accuracyPercentage }}%</p>
        <p class="text-sm text-gray-600">Accuracy</p>
      </div>
    </div>
  </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { questions } from '@/data/data';
import type { Question } from '@/data/data';
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

    // New refs for similar question functionality
    const similarQuestion = ref<{ question: string; answer: string } | null>(null);
    const similarQuestionAnswer = ref('');
    const guidanceSteps = ref<string[]>([]);
    const keyConcepts = ref<string[]>([]);
    const isLoading = ref(false);

    const accuracyPercentage = computed(() => {
      const total = sessionStats.value.correct + sessionStats.value.incorrect;
      if (total === 0) return 0;
      return Math.round((sessionStats.value.correct / total) * 100);
    });

    const generateQuestion = () => {
      const filteredQuestions = questions.filter(q => q.difficulty === difficulty.value);
      currentQuestion.value = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
      userAnswer.value = '';
      feedback.value = '';
      explanation.value = '';
      showExplanation.value = false;
      similarQuestion.value = null;
      guidanceSteps.value = [];
      keyConcepts.value = [];
    };


    const generateSimilarQuestion = async () => {
      isLoading.value = true;
      try {
        const response = await fetch('http://localhost:3000/generate-similar-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token.value}`
          },
          body: JSON.stringify({
            originalQuestion: currentQuestion.value,
            difficulty: difficulty.value,
            userAnswer: userAnswer.value
          })
        });

        if (!response.ok) {
          throw new Error('Failed to generate similar question');
        }

        const data = await response.json();
        similarQuestion.value = {
          question: data.question,
          answer: data.answer
        };
        guidanceSteps.value = data.steps || [];
        keyConcepts.value = data.concepts || [];
        
      } catch (error) {
        console.error("Error generating similar question:", error);
        feedback.value = "Unable to generate a similar question. Please try a new question.";
      } finally {
        isLoading.value = false;
      }
    };

    const checkSimilarAnswer = async () => {
      if (!similarQuestion.value) return;

      const isCorrect = similarQuestionAnswer.value.trim().toLowerCase() === similarQuestion.value.answer.toLowerCase();
      
      if (isCorrect) {
        feedback.value = "Excellent! You've mastered this concept! 🌟";
        setTimeout(generateQuestion, 2000);
      } else {
        feedback.value = "Keep practicing! Review the steps and try again. 💪";
      }

      await updateUserProgress(isCorrect);
    };

    const checkAnswer = async () => {
      if (!currentQuestion.value) return;

      const isCorrect = userAnswer.value.trim().toLowerCase() === currentQuestion.value.answer.toLowerCase();
      
      if (isCorrect) {
        feedback.value = "Correct! You're a math wizard! 🎉";
        showExplanation.value = true;
        streakCount.value++;
        sessionStats.value.correct++;
        setTimeout(() => generateQuestion(), 3000);
      } else {
        feedback.value = "Let's try a similar question to help you understand better! 💪";
        showExplanation.value = true;
        streakCount.value = 0;
        sessionStats.value.incorrect++;
        await generateSimilarQuestion();
      }

      await updateUserProgress(isCorrect);
    };

    const updateUserProgress = async (correct: boolean) => {
      try {
        await fetch('http://localhost:3000/update-score', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token.value}`
          },
          body: JSON.stringify({ correct })
        });
        console.log('score updated');
      } catch (error) {
        console.error('Cannot update user score:', error);
      }
    };

    const feedbackClass = computed(() => {
      return feedback.value.includes('Correct') || feedback.value.includes('Excellent')
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800';
    });
    const simulateIncorrectAnswer = async () => {
      if (!currentQuestion.value) return;

      try {
        const response = await fetch('http://localhost:3000/generate-similar-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token.value}`
          },
          body: JSON.stringify({
            originalQuestion: currentQuestion.value,
            difficulty: difficulty.value,
            userAnswer: 'Simulated incorrect answer'
          })
        });

        if (!response.ok) {
          throw new Error('Failed to generate similar question');
        }

        const newQuestion = await response.json();
        console.log('New similar question generated:', newQuestion);
        
        // Update the current question with the new one
        currentQuestion.value = newQuestion;
        userAnswer.value = '';
        feedback.value = 'New question generated based on the previous one!';
        showExplanation.value = false;
      } catch (error) {
        console.error('Error simulating incorrect answer:', error);
        feedback.value = 'Error generating new question. Please try again.';
      }
    };

    onMounted(() => {
      if (!auth) {
        router.push('/login');
        return;
      }
      generateQuestion();
    });

    return {
      difficulty,
      currentQuestion,
      userAnswer,
      feedback,
      explanation,
      similarQuestion,
      similarQuestionAnswer,
      guidanceSteps,
      keyConcepts,
      checkAnswer,
      checkSimilarAnswer,
      feedbackClass,
      generateQuestion,
      accuracyPercentage,
      isLoading,
      sessionStats,
      simulateIncorrectAnswer,
      streakCount
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