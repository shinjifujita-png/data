<template>
  <div class="workflow-container">
    <h1>業務ワークフロー</h1>

    <div class="toolbar">
      <div class="add-buttons">
        <button @click="addNode('start')" class="btn start-btn">＋ 開始ノード</button>
        <button @click="addNode('task')" class="btn task-btn">＋ タスク</button>
        <button @click="addNode('condition')" class="btn condition-btn">＋ 分岐条件</button>
      </div>

      <div class="mode-buttons">
        <button 
          @click="toggleConnectMode" 
          :class="['btn', isConnectMode ? 'active-mode' : 'secondary']"
        >
          {{ isConnectMode ? '接続中：元 → 先 をクリック' : '🔗 矢印を繋ぐ' }}
        </button>
        <button @click="clearBoard" class="btn danger">全消去</button>
      </div>
    </div>

    <div class="svg-wrapper">
      <svg
        ref="svgRef"
        width="100%"
        height="600"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
      >
        <defs>
          <marker
            id="workflow-arrow"
            viewBox="0 0 10 10"
            refX="22" 
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#6366f1" />
          </marker>
        </defs>

        <g v-for="(link, index) in links" :key="'link-' + index" class="link-group">
          <line
            :x1="getNodeCenter(link.from).x"
            :y1="getNodeCenter(link.from).y"
            :x2="getNodeCenter(link.to).x"
            :y2="getNodeCenter(link.to).y"
            stroke="#6366f1"
            stroke-width="3"
            marker-end="url(#workflow-arrow)"
          />
          <circle
            :cx="(getNodeCenter(link.from).x + getNodeCenter(link.to).x) / 2"
            :cy="(getNodeCenter(link.from).y + getNodeCenter(link.to).y) / 2"
            r="10"
            fill="#ef4444"
            class="delete-link-btn"
            @click="deleteLink(index)"
          />
          <text
            :x="(getNodeCenter(link.from).x + getNodeCenter(link.to).x) / 2"
            :y="((getNodeCenter(link.from).y + getNodeCenter(link.to).y) / 2) + 4"
            text-anchor="middle"
            fill="white"
            font-size="12"
            font-weight="bold"
            class="pointer-events-none select-none"
          >
            ×
          </text>
        </g>

        <g
          v-for="node in nodes"
          :key="node.id"
          :transform="`translate(${node.x}, ${node.y})`"
          @mousedown.stop="onMouseDownNode($event, node)"
          class="node-group"
          :class="{ 'connect-mode-target': isConnectMode }"
        >
          <template v-if="node.type === 'start'">
            <circle cx="60" cy="40" r="35" :fill="getNodeColor(node)" stroke="#4338ca" stroke-width="2" />
          </template>

          <template v-else-if="node.type === 'condition'">
            <polygon points="60,5 130,40 60,75 -10,40" :fill="getNodeColor(node)" stroke="#b45309" stroke-width="2" />
          </template>

          <template v-else>
            <rect width="120" height="80" rx="8" :fill="getNodeColor(node)" stroke="#1d4ed8" stroke-width="2" />
          </template>

          <text
            x="60"
            y="45"
            text-anchor="middle"
            fill="#1f2937"
            font-weight="bold"
            font-size="13"
            class="select-none pointer-events-none"
          >
            {{ node.text }}
          </text>

          <g class="delete-node-btn" @click.stop="deleteNode(node.id)" transform="translate(110, 0)">
            <circle cx="0" cy="0" r="9" fill="#9ca3af" />
            <text x="0" y="4" text-anchor="middle" fill="white" font-size="12" font-weight="bold">×</text>
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// データ管理
const nodes = ref([])
const links = ref([])
const nextId = ref(1)

// 状態管理
const isConnectMode = ref(false)
const selectedFromNodeId = ref(null)
const draggingNode = ref(null)
let offset = { x: 0, y: 0 }

// 1. 指定タイプのノードを追加
const addNode = (type) => {
  let label = ''
  if (type === 'start') label = '開始'
  if (type === 'task') label = `タスク ${nextId.value}`
  if (type === 'condition') label = '条件分岐'

  nodes.value.push({
    id: nextId.value,
    type: type,
    x: 100 + (nodes.value.length * 15),
    y: 150,
    text: label
  })
  nextId.value++
}

// 2. 接続モード切り替え
const toggleConnectMode = () => {
  isConnectMode.value = !isConnectMode.value
  selectedFromNodeId.value = null
}

// 3. ノードクリック時
const onMouseDownNode = (event, node) => {
  if (isConnectMode.value) {
    if (!selectedFromNodeId.value) {
      selectedFromNodeId.value = node.id
    } else {
      if (selectedFromNodeId.value !== node.id) {
        // 重複チェック
        const exists = links.value.some(l => l.from === selectedFromNodeId.value && l.to === node.id)
        if (!exists) {
          links.value.push({ from: selectedFromNodeId.value, to: node.id })
        }
      }
      selectedFromNodeId.value = null
      isConnectMode.value = false
    }
  } else {
    draggingNode.value = node
    offset.x = event.clientX - node.x
    offset.y = event.clientY - node.y
  }
}

// 4. マウス移動（ドラッグ）
const onMouseMove = (event) => {
  if (!draggingNode.value) return
  draggingNode.value.x = event.clientX - offset.x
  draggingNode.value.y = event.clientY - offset.y
}

// 5. ドラッグ終了
const onMouseUp = () => {
  draggingNode.value = null
}

// 6. 各種ノードの中心座標の計算
const getNodeCenter = (id) => {
  const node = nodes.value.find(n => n.id === id)
  if (!node) return { x: 0, y: 0 }
  // 今回はどの形状もベースの基準幅を120、高さを80付近に揃えています
  return {
    x: node.x + 60,
    y: node.y + 40
  }
}

// 7. ノードのタイプや状態に応じた色分け
const getNodeColor = (node) => {
  if (selectedFromNodeId.value === node.id) return '#fecaca' // 接続選択中（薄赤）
  if (node.type === 'start') return '#e0e7ff' // 開始（薄青）
  if (node.type === 'condition') return '#fef3c7' // 分岐（薄黄）
  return '#eff6ff' // 通常タスク（白・薄青）
}

// 8. ノードの削除（紐づく矢印も一緒に消す）
const deleteNode = (id) => {
  nodes.value = nodes.value.filter(n => n.id !== id)
  links.value = links.value.filter(l => l.from !== id && l.to !== id)
  if (selectedFromNodeId.value === id) selectedFromNodeId.value = null
}

// 9. 矢印（リンク）の削除
const deleteLink = (index) => {
  links.value.splice(index, 1)
}

// 10. 全消去
const clearBoard = () => {
  nodes.value = []
  links.value = []
  nextId.value = 1
  selectedFromNodeId.value = null
  isConnectMode.value = false
}
</script>

<style scoped>
.workflow-container {
  max-width: 1100px;
  margin: 0 auto;
  font-family: sans-serif;
}

h1 {
  text-align: center;
  color: #1f2937;
}

/* ツールバー設定 */
.toolbar {
  display: flex;
  justify-content: space-between;
  background-color: #f8fafc;
  padding: 14px;
  border-radius: 8px 8px 0 0;
  border: 1px solid #cbd5e1;
  border-bottom: none;
}

.add-buttons, .mode-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 14px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  border: 1px solid transparent;
  font-size: 13px;
  transition: all 0.2s;
}

/* 各ボタン固有の色 */
.start-btn { background-color: #4f46e5; color: white; }
.task-btn { background-color: #2563eb; color: white; }
.condition-btn { background-color: #d97706; color: white; }
.secondary { background-color: #e2e8f0; color: #334155; }
.active-mode { background-color: #10b981; color: white; animation: pulse 1.5s infinite; }
.danger { background-color: #ef4444; color: white; }

.btn:hover { opacity: 0.9; }

/* ボード（SVG）の外枠と背景 */
.svg-wrapper {
  background-color: #ffffff;
  background-image: 
    linear-gradient(to right, #f1f5f9 1px, transparent 1px),
    linear-gradient(to bottom, #f1f5f9 1px, transparent 1px);
  background-size: 20px 20px;
  border: 1px solid #cbd5e1;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.05);
}

svg {
  display: block;
}

/* 各グラフィック要素の挙動 */
.node-group {
  cursor: grab;
}
.node-group:active {
  cursor: grabbing;
}

/* 接続モード時の見た目 */
.connect-mode-target {
  cursor: cell;
}
.connect-mode-target:hover circle,
.connect-mode-target:hover rect,
.connect-mode-target:hover polygon {
  stroke: #10b981 !important;
  stroke-width: 3px;
}

/* ホバーした時だけ表示されるノード削除ボタン */
.delete-node-btn {
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}
.node-group:hover .delete-node-btn {
  opacity: 1;
}

/* 矢印の削除ボタン */
.delete-link-btn {
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.2s;
}
.link-group:hover .delete-link-btn {
  opacity: 1;
}

/* ユーティリティ */
.pointer-events-none { pointer-events: none; }
.select-none { user-select: none; }

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}
</style>
