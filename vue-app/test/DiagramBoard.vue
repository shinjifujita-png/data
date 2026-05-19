<template>
  <h1>業務ワークフロー</h1>
  <div class="board-container">

    <div class="toolbar">
      <button @click="addBox" class="btn primary">＋ 四角形を追加</button>
      <button 
        @click="toggleConnectMode" 
        :class="['btn', isConnectMode ? 'active' : 'secondary']"
      >
        {{ isConnectMode ? '接続モード：ON (元を選んで次をクリック)' : '🔗 矢印で繋ぐ' }}
      </button>
      <button @click="clearBoard" class="btn danger">全消去</button>
    </div>

    <div class="svg-wrapper">
      <svg
        ref="svgRef"
        width="1000"
        height="500"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 2 L 10 5 L 0 8 z" fill="#4f46e5" />
          </marker>
        </defs>

        <line
          v-for="(link, index) in links"
          :key="'link-' + index"
          :x1="getBoxCenter(link.from).x"
          :y1="getBoxCenter(link.from).y"
          :x2="getBoxCenter(link.to).x"
          :y2="getBoxCenter(link.to).y"
          stroke="#4f46e5"
          stroke-width="3"
          marker-end="url(#arrow)"
        />

        <g
          v-for="box in boxes"
          :key="box.id"
          :transform="`translate(${box.x}, ${box.y})`"
          @mousedown.stop="onMouseDownBox($event, box)"
          class="box-group"
          :class="{ 'connect-target': isConnectMode }"
        >
          <rect
            width="120"
            height="60"
            rx="8"
            :fill="selectedFromBoxId === box.id ? '#ef4444' : '#ffffff'"
            stroke="#4f46e5"
            stroke-width="2"
          />
          <text
            x="60"
            y="35"
            text-anchor="middle"
            fill="#333"
            font-weight="bold"
            class="select-none"
          >
            {{ box.text }}
          </text>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// データ管理
const boxes = ref([]) // 四角形の一覧
const links = ref([]) // 矢印の一覧
const nextId = ref(1)

// モード・選択状態の管理
const isConnectMode = ref(false)
const selectedFromBoxId = ref(null)

// ドラッグ移動用の一時変数
const draggingBox = ref(null)
let offset = { x: 0, y: 0 }

// 1. 四角形を追加する関数
const addBox = () => {
  boxes.value.push({
    id: nextId.value,
    x: 50 + (boxes.value.value ? boxes.value.length * 20 : 0),
    y: 100,
    text: `アイテム ${nextId.value}`
  })
  nextId.value++
}

// 2. 矢印接続モードの切り替え
const toggleConnectMode = () => {
  isConnectMode.value = !isConnectMode.value
  selectedFromBoxId.value = null // リセット
}

// 3. ボックスをクリック（マウスダウン）した時の処理
const onMouseDownBox = (event, box) => {
  if (isConnectMode.value) {
    // 接続モードの場合
    if (!selectedFromBoxId.value) {
      // 1つ目のボックスを選択
      selectedFromBoxId.value = box.id
    } else {
      // 2つ目のボックスを選択（自分自身以外の場合のみ繋ぐ）
      if (selectedFromBoxId.value !== box.id) {
        links.value.push({
          from: selectedFromBoxId.value,
          to: box.id
        })
      }
      // 接続完了したらモードを解除
      selectedFromBoxId.value = null
      isConnectMode.value = false
    }
  } else {
    // 通常モードの場合はドラッグ移動を開始
    draggingBox.value = box
    offset.x = event.clientX - box.x
    offset.y = event.clientY - box.y
  }
}

// 4. マウスを動かしている時の処理（ドラッグ移動）
const onMouseMove = (event) => {
  if (!draggingBox.value) return
  draggingBox.value.x = event.clientX - offset.x
  draggingBox.value.y = event.clientY - offset.y
}

// 5. マウスを離した時の処理（移動終了）
const onMouseUp = () => {
  draggingBox.value = null
}

// 6. ボックスの中心座標を計算する便利関数（矢印の始点・終点用）
const getBoxCenter = (id) => {
  const box = boxes.value.find(b => b.id === id)
  if (!box) return { x: 0, y: 0 }
  return {
    x: box.x + 60, // 幅120の半分
    y: box.y + 30  // 高さ60の半分
  }
}

// 7. 全消去
const clearBoard = () => {
  boxes.value = []
  links.value = []
  nextId.value = 1
  selectedFromBoxId.value = null
  isConnectMode.value = false
}
</script>

<style scoped>
.board-container {
  display: flex;
  max-width: 4000px;
  margin: 0 auto;
  font-family: sans-serif;
}

h1 {
  text-align: center;
  color: #333;
}

/* ツールバー */
.toolbar {
  display: flex;
  gap: 12px;
  background-color: #f3f4f6;
  padding: 12px;
  border-radius: 8px 8px 0 0;
  border: 1px solid #ccc;
  border-bottom: none;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.primary { background-color: #4f46e5; color: white; }
.secondary { background-color: #e5e7eb; color: #374151; }
.active { background-color: #10b981; color: white; }
.danger { background-color: #ef4444; color: white; margin-left: auto; }

.btn:hover { opacity: 0.9; }

/* ボード本体（SVGの外枠） */
.svg-wrapper {
  background-color: #fafafa;
  /* ドット模様の背景を作る（ホワイトボードっぽさの演出） */
  background-image: radial-gradient(#e5e7eb 1.5px, transparent 1.5px);
  background-size: 20px 20px;
  border: 1px solid #ccc;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

svg {
  display: block;
}

/* オブジェクトのスタイル */
.box-group {
  cursor: grab;
}
.box-group:active {
  cursor: grabbing;
}

/* 接続モード時のホバーエフェクト */
.connect-target {
  cursor: cell;
}
.connect-target:hover rect {
  stroke: #10b981;
  stroke-width: 3;
}

.select-none {
  user-select: none;
}
</style>
