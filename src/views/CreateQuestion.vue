<template>
  <div class="min-h-screen bg-gray-100">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 class="text-2xl font-bold mb-6">問題を作成</h1>

          <form @submit.prevent="submitQuestion" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                問題文
              </label>
              <textarea
                v-model="question.question"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="問題文を入力してください"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                正解
              </label>
              <input
                v-model="question.answer"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="正解を入力してください"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ
              </label>
              <select
                v-model="question.category"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">一般</option>
                <option value="science">科学</option>
                <option value="history">歴史</option>
                <option value="sports">スポーツ</option>
                <option value="entertainment">エンターテイメント</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                難易度
              </label>
              <select
                v-model="question.difficulty"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="easy">簡単</option>
                <option value="medium">普通</option>
                <option value="hard">難しい</option>
              </select>
            </div>

            <div class="flex gap-4">
              <button
                type="submit"
                class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              >
                問題を保存
              </button>
              <button
                type="button"
                @click="goBack"
                class="flex-1 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500"
              >
                戻る
              </button>
            </div>
          </form>
        </div>

        <div v-if="savedQuestions.length > 0" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold mb-4">保存された問題</h2>
          <div class="space-y-3">
            <div
              v-for="(q, index) in savedQuestions"
              :key="index"
              class="p-4 border border-gray-200 rounded-lg"
            >
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-semibold">{{ q.question }}</h3>
                <div class="flex gap-2">
                  <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {{ q.category }}
                  </span>
                  <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {{ q.difficulty }}
                  </span>
                </div>
              </div>
              <p class="text-sm text-gray-600">正解: {{ q.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const question = ref({
  question: '',
  answer: '',
  category: 'general',
  difficulty: 'medium'
})

const savedQuestions = ref<Array<{
  question: string
  answer: string
  category: string
  difficulty: string
}>>([])

const submitQuestion = () => {
  if (question.value.question.trim() && question.value.answer.trim()) {
    savedQuestions.value.push({ ...question.value })
    question.value = {
      question: '',
      answer: '',
      category: 'general',
      difficulty: 'medium'
    }
    alert('問題を保存しました！')
  }
}

const goBack = () => {
  router.push('/')
}
</script>

