<template>
  <div class="workflow-container">
    <h1>業務ワークフロー</h1>

    <div class="main-layout">
      
      <div class="left-panel">
        <div class="toolbar">
          <div class="add-buttons">
            <!-- <button @click="addNode('start')" class="btn start-btn">＋ 開始ノード</button> -->
            <button @click="addNode('task')" class="btn task-btn">＋ ノード追加</button>
            <!-- <button @click="addNode('condition')" class="btn condition-btn">＋ 分岐条件</button> -->
          </div>

          <div class="mode-buttons">
            <button @click="toggleConnectMode" :class="['btn', isConnectMode ? 'active-mode' : 'secondary']">
              {{ isConnectMode ? '接続中：元 → 先 をクリック' : '🔗 矢印を繋ぐ' }}
            </button>
            <button @click="clearBoard" class="btn danger">全消去</button>
          </div>
        </div>

        <div class="svg-wrapper">
          <svg ref="svgRef" width="100%" height="500" @mousemove="onMouseMove" @mouseup="onMouseUp" @mousedown="deselectAll">
            <defs>
              <marker id="workflow-arrow" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="12" markerHeight="12"
                orient="auto-start-reverse">
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#6366f1" />
              </marker>
            </defs>

            <g v-for="(link, index) in links" :key="'link-' + index" class="link-group" @mousedown.stop="selectLink(link)">
              <line :x1="getNodeCenter(link.from).x" :y1="getNodeCenter(link.from).y" :x2="getNodeCenter(link.to).x"
                :y2="getNodeCenter(link.to).y" :stroke="link.color || '#6366f1'" stroke-width="3" :class="{'selected-element': selectedLink === link}" marker-end="url(#workflow-arrow)" />
              <circle :cx="(getNodeCenter(link.from).x + getNodeCenter(link.to).x) / 2"
                :cy="(getNodeCenter(link.from).y + getNodeCenter(link.to).y) / 2" r="10" fill="#ef4444"
                class="delete-link-btn" @click.stop="deleteLink(index)" />
              <text :x="(getNodeCenter(link.from).x + getNodeCenter(link.to).x) / 2"
                :y="((getNodeCenter(link.from).y + getNodeCenter(link.to).y) / 2) + 4" text-anchor="middle" fill="black"
                font-size="16" font-weight="bold" class="pointer-events-none select-none">
                <tspan :x="(getNodeCenter(link.from).x + getNodeCenter(link.to).x) / 2" dy="0">×</tspan>
                <tspan v-if="link.text" :x="(getNodeCenter(link.from).x + getNodeCenter(link.to).x) / 2" dy="20">
                  {{ link.text }}
                </tspan>
              </text>
            </g>

            <g v-for="node in nodes" :key="node.id" :transform="`translate(${node.x}, ${node.y})`"
              @mousedown.stop="onMouseDownNode($event, node)" class="node-group"
              :class="{ 'connect-mode-target': isConnectMode }">
              <template v-if="node.type === 'start'">
                <circle cx="60" cy="40" r="35" :fill="getNodeColor(node)" :stroke="selectedNode?.id === node.id ? '#10b981' : '#4338ca'" :stroke-width="selectedNode?.id === node.id ? 3 : 2" />
              </template>

              <template v-else-if="node.type === 'condition'">
                <polygon points="60,5 130,40 60,75 -10,40" :fill="getNodeColor(node)" :stroke="selectedNode?.id === node.id ? '#10b981' : '#b45309'" :stroke-width="selectedNode?.id === node.id ? 3 : 2" />
              </template>

              <template v-else>
                <rect width="120" height="80" rx="8" :fill="getNodeColor(node)" :stroke="selectedNode?.id === node.id ? '#10b981' : '#1d4ed8'" :stroke-width="selectedNode?.id === node.id ? 3 : 2" />
              </template>

              <text x="60" y="45" text-anchor="middle" fill="#1f2937" font-weight="bold" font-size="16"
                class="select-none pointer-events-none">
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

      <div class="property-panel">
        <h3>🛠️ プロパティ</h3>
        
        <div v-if="selectedNode" class="property-group">
          <div class="badge node-type-badge">選択中: ノード</div>
          
          <label>テキスト（名前）</label>
          <input type="text" v-model="selectedNode.text" class="prop-input" />

          <label>背景色変更</label>
          <input type="color" v-model="selectedNode.color" class="prop-color" />
          
          <div class="info-text">
            <p>ID: {{ selectedNode.id }}</p>
            <p>タイプ: {{ selectedNode.type }}</p>
            <p>座標: X({{ Math.round(selectedNode.x) }}), Y({{ Math.round(selectedNode.y) }})</p>
          </div>
        </div>

        <div v-else-if="selectedLink" class="property-group">
          <div class="badge link-type-badge">選択中: 矢印（リンク）</div>
          
          <label>ラベルテキスト</label>
          <input type="text" v-model="selectedLink.text" class="prop-input" />

          <label>線の色</label>
          <input type="color" v-model="selectedLink.color" class="prop-color" />

          <div class="info-text">
            <p>接続元 ID: {{ selectedLink.from }}</p>
            <p>接続先 ID: {{ selectedLink.to }}</p>
            <p>ステータス: {{ selectedLink.checked ? '✅ 完了' : '⬜ 未着手' }}</p>
          </div>
        </div>

        <div v-else class="no-selection">
          <p>キャンバス上のノードや矢印をクリックすると、ここに詳細設定が表示されます。</p>
        </div>
      </div>

    </div>

    <div class="link-list-area" v-if="links.length > 0">
      <h3>タイムライン（現在の進行状況）</h3>
      <ul class="link-list">
        <li v-for="(link, index) in links" :key="'list-' + index" @click="toggleLinkCheck(index)"
          :class="{ 'is-checked': link.checked }">
          <span class="check-icon">{{ link.checked ? '✅ ' : '⬜ ' }}</span>

          <strong :class="{ 'no-label': !link.text }">
            {{ link.text || '（ラベルなし）' }}
          </strong>

          <span v-if="link.timestamp" class="timestamp-badge">
            {{ link.timestamp }}
          </span>

          <br />

          <span class="node-badge">
            {{nodes.find(n => n.id === link.from)?.text || '不明'}}
          </span>
          <span class="arrow-icon">➔</span>
          <span class="node-badge">
            {{nodes.find(n => n.id === link.to)?.text || '不明'}}
          </span>
        </li>
      </ul>
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

// 💡 選択中の要素を管理する状態
const selectedNode = ref(null)
const selectedLink = ref(null)

// 1. 指定タイプのノードを追加
const addNode = (type) => {
  let defaultLabel = ''
  let defaultColor = ''
  
  if (type === 'start') {
    defaultLabel = '開始'
    defaultColor = '#e0e7ff' // 開始（薄青）
  }
  if (type === 'task') {
    defaultLabel = `タスク ${nextId.value}`
    defaultColor = '#eff6ff' // 通常タスク（白・薄青）
  }
  if (type === 'condition') {
    defaultLabel = '条件分岐'
    defaultColor = '#fef3c7' // 分岐（薄黄）
  }

  // 💬 ポップアップでの入力
  const userInput = prompt('ラベルを入力してください：', defaultLabel)
  if (userInput === null) return
  const label = userInput.trim() === '' ? defaultLabel : userInput

  const newNode = {
    id: nextId.value,
    type: type,
    x: 100 + (nodes.value.length * 15),
    y: 150,
    text: label,
    color: defaultColor // 💡 初期カラーを設定
  }

  nodes.value.push(newNode)
  nextId.value++
  
  // 作成したノードを自動選択
  selectNode(newNode)
}

// 選択状態をリセットする関数
const deselectAll = () => {
  selectedNode.value = null
  selectedLink.value = null
}

// ノードを選択する
const selectNode = (node) => {
  selectedLink.value = null
  selectedNode.value = node
}

// 矢印を選択する
const selectLink = (link) => {
  selectedNode.value = null
  selectedLink.value = link
}

// 2. 接続モード切り替え
const toggleConnectMode = () => {
  isConnectMode.value = !isConnectMode.value
  selectedFromNodeId.value = null
}

// 3. ノードクリック時
const onMouseDownNode = (event, node) => {
  selectNode(node) // 💡 クリック時にプロパティ対象として選択

  if (isConnectMode.value) {
    if (!selectedFromNodeId.value) {
      selectedFromNodeId.value = node.id
    } else {
      if (selectedFromNodeId.value !== node.id) {
        const exists = links.value.some(l => l.from === selectedFromNodeId.value && l.to === node.id)
        if (!exists) {
          const linkLabel = prompt('ラベルを入力してください', '')
          
          const newLink = {
            from: selectedFromNodeId.value,
            to: node.id,
            text: linkLabel || '',
            checked: false,
            timestamp: '',
            color: '#6366f1' // 💡 矢印の初期カラー
          }
          links.value.push(newLink)
          selectLink(newLink) // 繋いだ矢印を選択状態にする
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
  return {
    x: node.x + 60,
    y: node.y + 40
  }
}

// 7. ノードのカラー取得（プロパティで変更された色、または選択中カラー）
const getNodeColor = (node) => {
  if (selectedFromNodeId.value === node.id) return '#fecaca' // 接続選択中（薄赤）
  return node.color || '#eff6ff'
}

// 8. ノードの削除
const deleteNode = (id) => {
  if (selectedNode.value?.id === id) selectedNode.value = null
  nodes.value = nodes.value.filter(n => n.id !== id)
  links.value = links.value.filter(l => l.from !== id && l.to !== id)
  if (selectedFromNodeId.value === id) selectedFromNodeId.value = null
}

// 9. 矢印（リンク）の削除
const deleteLink = (index) => {
  const targetLink = links.value[index]
  if (selectedLink.value === targetLink) selectedLink.value = null
  links.value.splice(index, 1)
}

// タイムラインのチェック切り替え
const toggleLinkCheck = (index) => {
  const link = links.value[index]
  if (!link) return

  link.checked = !link.checked
  if (link.checked) {
    const now = new Date()
    const timeStr = `${now.getMonth() + 1}/${now.getDate()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    link.timestamp = timeStr
  } else {
    link.timestamp = ''
  }
}

// 10. 全消去
const clearBoard = () => {
  nodes.value = []
  links.value = []
  nextId.value = 1
  selectedFromNodeId.value = null
  isConnectMode.value = false
  deselectAll()
}
</script>

<style scoped>
.workflow-container {
  max-width: 1400px; /* 💡 右パネルが増えたので全体の最大幅を拡張 */
  margin: 0 auto;
  font-family: sans-serif;
}

h1 {
  text-align: center;
  color: #1f2937;
}

/* 💡 メインレイアウトを左右に分割 */
.main-layout {
  display: flex;
  gap: 20px;
  width: 1400px;
}

.left-panel {
  flex: 1; /* 左側は引き伸ばす */
  min-width: 0;
}

/* 💡 プロパティパネルの装飾 */
.property-panel {
  width: 320px;
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
  height: 565px; /* ツールバーとSVGを合わせた高さに近く固定 */
  box-sizing: border-box;
}

.property-panel h3 {
  margin-top: 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #cbd5e1;
  color: #334155;
  font-size: 16px;
}

.property-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.property-group label {
  font-size: 12px;
  font-weight: bold;
  color: #64748b;
  margin-bottom: -4px;
}

.prop-input {
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
}

.prop-input:focus {
  outline: none;
  border-color: #6366f1;
}

.prop-color {
  width: 100%;
  height: 40px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
  background: none;
  padding: 0;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  align-self: flex-start;
}
.node-type-badge { background-color: #dbeafe; color: #1e40af; }
.link-type-badge { background-color: #e0e7ff; color: #3730a3; }

.info-text {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px dashed #cbd5e1;
  font-size: 12px;
  color: #64748b;
  line-height: 1.6;
}
.info-text p { margin: 4px 0; }

.no-selection {
  color: #94a3b8;
  font-size: 13px;
  text-align: center;
  margin-top: 100px;
  line-height: 1.6;
}

/* 選択された矢印の強調スタイル */
.selected-element {
  stroke: #10b981 !important; /* 選択中は緑色に */
  stroke-width: 4px;
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

.add-buttons,
.mode-buttons {
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

svg { display: block; }
.node-group { cursor: grab; }
.node-group:active { cursor: grabbing; }
.connect-mode-target { cursor: cell; }

.connect-mode-target:hover circle,
.connect-mode-target:hover rect,
.connect-mode-target:hover polygon {
  stroke: #10b981 !important;
  stroke-width: 3px;
}

.delete-node-btn { cursor: pointer; opacity: 0; transition: opacity 0.2s; }
.node-group:hover .delete-node-btn { opacity: 1; }
.delete-link-btn { cursor: pointer; opacity: 0.3; transition: opacity 0.2s; }
.link-group:hover .delete-link-btn { opacity: 1; }

.pointer-events-none { pointer-events: none; }
.select-none { user-select: none; }

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

/* 下部リンク一覧のスタイル */
.link-list-area {
  margin-top: 20px;
  padding: 20px;
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.link-list-area h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  color: #334155;
  border-bottom: 2px solid #6366f1;
  padding-bottom: 5px;
}

.link-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 0;
  list-style: none;
}

.link-list li {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 10px 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  line-height: 1.5;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s, border-color 0.2s;
}

.link-list li.is-checked {
  background-color: #f0fdf4;
  border-color: #86efac;
}

.node-badge {
  background-color: #e2e8f0;
  color: #1e293b;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.arrow-icon { margin: 0 10px; color: #6366f1; font-weight: bold; }
.no-label { color: #94a3b8; font-weight: normal; font-style: italic; }
.timestamp-badge { font-size: 11px; color: #64748b; background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; margin-left: 8px; }
.check-icon { font-size: 14px; }
</style>
