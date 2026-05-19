<template>
  <div class="tier-container">
    <h1>ティア表ワークフロー</h1>

    <div 
      v-for="row in tierRows" 
      :key="row.rank" 
      class="tier-row"
      @dragover.prevent
      @drop="onDrop($event, row.rank)"
    >
      <div class="tier-label" :style="{ backgroundColor: row.color }">
        {{ row.rank }}
      </div>
      
      <div class="tier-items">
        <div 
          v-for="item in row.items" 
          :key="item.id" 
          class="tier-item"
          draggable="true"
          @dragstart="onDragStart($event, item, row.rank)"
        >
          {{ item.name }}
        </div>
      </div>
    </div>

    <div 
      class="item-pool"
      @dragover.prevent
      @drop="onDrop($event, 'pool')"
    >
      <h3>未配置のアイテム</h3>
      <div class="pool-items">
        <div 
          v-for="item in itemPool" 
          :key="item.id" 
          class="tier-item pool-item"
          draggable="true"
          @dragstart="onDragStart($event, item, 'pool')"
        >
          {{ item.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Tier行のデータ定義（S, A, B, C）
const tierRows = ref([
  { rank: 'S', color: '#ff7f7f', items: [] },
  { rank: 'A', color: '#ffbf7f', items: [] },
  { rank: 'B', color: '#ffdf7f', items: [] },
  { rank: 'C', color: '#ffff7f', items: [] },
  { rank: 'D', color: '#fcfbcc', items: [] },
])

// まだ配置されていないアイテムの初期データ
const itemPool = ref([
  { id: 1, name: 'タスク1' },
  { id: 2, name: 'タスク2' },
  { id: 3, name: 'タスク3' },
  { id: 4, name: 'タスク4' },
  { id: 5, name: 'タスク5' },
  { id: 6, name: 'タスク6' },
])

// ドラッグ中の状態を一時保存する変数
let draggedItem = null
let sourceRank = null

// ドラッグが始まったときの処理
const onDragStart = (event, item, rank) => {
  draggedItem = item
  sourceRank = rank
  // 文字データとしてIDを渡す（HTML5標準の仕組み）
  event.dataTransfer.setData('text/plain', item.id)
}

// ドロップされたときの処理
const onDrop = (event, targetRank) => {
  if (!draggedItem) return

  // 1. 移動元のリストからアイテムを削除する
  if (sourceRank === 'pool') {
    itemPool.value = itemPool.value.filter(i => i.id !== draggedItem.id)
  } else {
    const sourceRow = tierRows.value.find(r => r.rank === sourceRank)
    if (sourceRow) {
      sourceRow.items = sourceRow.items.filter(i => i.id !== draggedItem.id)
    }
  }

  // 2. 移動先のリストにアイテムを追加する
  if (targetRank === 'pool') {
    itemPool.value.push(draggedItem)
  } else {
    const targetRow = tierRows.value.find(r => r.rank === targetRank)
    if (targetRow) {
      targetRow.items.push(draggedItem)
    }
  }

  // データの初期化
  draggedItem = null
  sourceRank = null
}
</script>

<style scoped>
.tier-container {
  max-width: 800px;
  margin: 0 auto;
  font-family: sans-serif;
  color: #333;
}

h1 {
  text-align: center;
}

/* Tier行のスタイル */
.tier-row {
  display: flex;
  background-color: #1a1a1a;
  margin-bottom: 4px;
  min-height: 80px;
  border: 1px solid #333;
}

.tier-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  font-size: 24px;
  font-weight: bold;
  color: #000;
  user-select: none;
}

.tier-items {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 10px;
  flex-grow: 1;
  gap: 10px;
}

/* 各アイテムのスタイル */
.tier-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  background-color: #4f46e5;
  color: white;
  font-weight: bold;
  font-size: 14px;
  border-radius: 8px;
  cursor: grab;
  text-align: center;
  padding: 4px;
  box-sizing: border-box;
}

.tier-item:active {
  cursor: grabbing;
}

/* 未配置エリアのスタイル */
.item-pool {
  margin-top: 30px;
  background-color: #f3f4f6;
  padding: 20px;
  border-radius: 8px;
  border: 2px dashed #ccc;
  min-height: 120px;
}

.item-pool h3 {
  margin-top: 0;
}

.pool-items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pool-item {
  background-color: #4b5563;
}
</style>
