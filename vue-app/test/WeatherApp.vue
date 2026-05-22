<script setup>
import { ref } from 'vue'

const cityName = ref('')
const weatherData = ref(null)
const loading = ref(false) // 読み込み中状態
const errorMessage = ref('') // エラーメッセージ用

// 取得した天気の英語名を日本語に変換するマッピング（簡易版）
const weatherMap = {
  Clear: '晴れ',
  Clouds: '曇り',
  Rain: '雨',
  Drizzle: '霧雨',
  Thunderstorm: '雷雨',
  Snow: '雪'
}

const handleSearch = async () => {
  if (!cityName.value.trim()) return

  // 状態の初期化
  loading.value = true
  errorMessage.value = ''
  weatherData.value = null

  // 🚨 注意: 本番環境では環境変数（.env）に格納してください
  const API_KEY = 'f8c43d4a7233fe7a3b6933fca623fb45' 
  
  // OpenWeatherMapのAPI URL（都市名で検索、日本語化指定、摂氏度指定）
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName.value)}&appid=${API_KEY}&units=metric&lang=ja`

  try {
    const response = await fetch(url)
    
    // レスポンスがエラー（404エラーなど）の場合のハンドリング
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('都市名が見つかりませんでした。正しい英語名（例: Tokyo）を試してください。')
      }
      throw new Error('データの取得に失敗しました。')
    }

    const data = await response.json()

    // 取得したデータをVueの状態（Ref）にセット
    weatherData.value = {
      location: data.name,
      // APIから返ってくる英語の天気を日本語マッピングから探す。なければAPIのdescriptionを使用
      condition: weatherMap[data.weather[0].main] || data.weather[0].description,
      temp: Math.round(data.main.temp), // 小数点を四捨五入して見やすく
      humidity: data.main.humidity,
      windSpeed: data.wind.speed
    }

  } catch (error) {
    console.error(error)
    errorMessage.value = error.message || '予期せぬエラーが発生しました。'
  } finally {
    // 成功・失敗に関わらず最後はローディングを解除
    loading.value = false
  }
}
</script>

<template>
  <div class="weather-app">
    <header class="weather-app__header">
      <h1>☀️ お天気検索アプリ</h1>
      <form @submit.prevent="handleSearch" class="weather-form">
        <input 
          v-model="cityName"
          type="text" 
          placeholder="都市名を入力（例: 東京）" 
          class="weather-form__input"
        />
        <button type="submit" class="weather-form__btn">検索</button>
      </form>
    </header>

    <main v-if="weatherData" class="weather-app__main">
      <article class="weather-card">
        <h2 class="weather-card__location">{{ weatherData.location }} の天気</h2>
        
        <div class="weather-card__overview">
          <span class="weather-card__condition">{{ weatherData.condition }}</span>
          <span class="weather-card__temp">{{ weatherData.temp }}°C</span>
        </div>

        <ul class="weather-card__details">
          <li>💧 湿度: {{ weatherData.humidity }}%</li>
          <li>🍃 風速: {{ weatherData.windSpeed }} m/s</li>
        </ul>
      </article>
    </main>

    <footer v-else class="weather-app__footer">
      <p>都市名を入力して検索してください。</p>
    </footer>
  </div>
</template>

<style scoped>
/* BEM設計をベースにしたシンプルなスタイリング */
.weather-app {
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  font-family: sans-serif;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
}

.weather-app__header h1 {
  font-size: 1.5rem;
  text-align: center;
  color: #333;
}

/* フォームのスタイル */
.weather-form {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.weather-form__input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

.weather-form__btn {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}

.weather-form__btn:hover {
  background-color: #0056b3;
}

/* 天気カードのスタイル */
.weather-card {
  margin-top: 24px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #eee;
}

.weather-card__location {
  margin: 0 0 12px 0;
  font-size: 1.25rem;
  color: #555;
}

.weather-card__overview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.weather-card__condition {
  font-size: 1.5rem;
  font-weight: bold;
  color: #f39c12;
}

.weather-card__temp {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
}

.weather-card__details {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: space-around;
  color: #666;
  font-size: 0.9rem;
}

.weather-app__footer {
  margin-top: 24px;
  text-align: center;
  color: #999;
}
</style>
