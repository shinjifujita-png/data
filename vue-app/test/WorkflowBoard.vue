<template>
  <div class="workflow-container">
    <h1>業務ワークフロー</h1>

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
      <svg ref="svgRef" width="100%" height="500" @mousemove="onMouseMove" @mouseup="onMouseUp">
        <defs>
          <marker id="workflow-arrow" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="12" markerHeight="12"
            orient="auto-start-reverse">
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#6366f1" />
          </marker>
        </defs>

        <g v-for="(link, index) in links" :key="'link-' + index" class="link-group">
          <line :x1="getNodeCenter(link.from).x" :y1="getNodeCenter(link.from).y" :x2="getNodeCenter(link.to).x"
            :y2="getNodeCenter(link.to).y" stroke="#6366f1" stroke-width="3" marker-end="url(#workflow-arrow)" />
          <circle :cx="(getNodeCenter(link.from).x + getNodeCenter(link.to).x) / 2"
            :cy="(getNodeCenter(link.from).y + getNodeCenter(link.to).y) / 2" r="10" fill="#ef4444"
            class="delete-link-btn" @click="deleteLink(index)" />
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
            <circle cx="60" cy="40" r="35" :fill="getNodeColor(node)" stroke="#4338ca" stroke-width="2" />
          </template>

          <template v-else-if="node.type === 'condition'">
            <polygon points="60,5 130,40 60,75 -10,40" :fill="getNodeColor(node)" stroke="#b45309" stroke-width="2" />
          </template>

          <template v-else>
            <rect width="120" height="80" rx="8" :fill="getNodeColor(node)" stroke="#1d4ed8" stroke-width="2" />
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
    <div class="link-list-area" v-if="links.length > 0">
      <h3>タイムライン（現在の進行状況）</h3>
      <ul class="link-list">
        <!-- <li v-for="(link, index) in links" :key="'list-' + index">
          <strong :class="{ 'no-label': !link.text }">
            {{ link.text || '（ラベルなし）' }}
          </strong>
          <span class="node-badge">
            {{nodes.find(n => n.id === link.from)?.text || '不明'}}
          </span>
          <span class="arrow-icon">➔</span>
          <span class="node-badge">
            {{nodes.find(n => n.id === link.to)?.text || '不明'}}
          </span>
        </li> -->
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

// 1. 指定タイプのノードを追加
const addNode = (type) => {
  let defaultLabel = ''
  if (type === 'start') defaultLabel = '開始'
  if (type === 'task') defaultLabel = `タスク ${nextId.value}`
  if (type === 'condition') defaultLabel = '条件分岐'

  // 💬 画面に入力ポップアップを表示（初期値としてdefaultLabelを設定）
  const userInput = prompt('ラベルを入力してください：', defaultLabel)
  // キャンセルボタンが押された（nullだった）場合は、追加処理を中止する
  if (userInput === null) return
  // 空文字の時はデフォルトの値を使い、入力があればそれを使う
  const label = userInput.trim() === '' ? defaultLabel : userInput

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
          // 💬 矢印が繋がった瞬間に、ラベルの入力を求めるポップアップを出す
          const linkLabel = prompt('ラベルを入力してください', '')
          // キャンセルが押されたら繋ぐのをやめる場合は以下を有効に（今回は空文字でも繋ぐ仕様にします）
          // if (linkLabel === null) return;

          // 💡 入力された文字を保存（キャンセルや空欄なら空文字）
          // links.value.push({ from: selectedFromNodeId.value, to: node.id, text: linkLabel || '' })
          links.value.push({
            from: selectedFromNodeId.value,
            to: node.id,
            text: linkLabel || '',
            checked: false,    // 📝 追加：初期状態はチェックなし
            timestamp: ''      // 📝 追加：初期状態はタイムスタンプなし
          })
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

// クリックしたときにチェックとタイムスタンプを切り替える関数
const toggleLinkCheck = (index) => {
  const link = links.value[index]
  if (!link) return // 安全対策（念のため）

  // チェック状態を反転 (true ⇄ false)
  link.checked = !link.checked
  
  if (link.checked) {
    // 現在の時刻を取得して「月/日 時:分」の形にする
    const now = new Date()
    const timeStr = `${now.getMonth() + 1}/${now.getDate()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    link.timestamp = timeStr
  } else {
    // チェックが外されたらタイムスタンプを消す
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
  width: 1400px;
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

/* 各ボタン固有の色 */
.start-btn {
  background-color: #4f46e5;
  color: white;
}

.task-btn {
  background-color: #2563eb;
  color: white;
}

.condition-btn {
  background-color: #d97706;
  color: white;
}

.secondary {
  background-color: #e2e8f0;
  color: #334155;
}

.active-mode {
  background-color: #10b981;
  color: white;
  animation: pulse 1.5s infinite;
}

.danger {
  background-color: #ef4444;
  color: white;
}

.btn:hover {
  opacity: 0.9;
}

/* ボード（SVG）の外枠と背景 */
.svg-wrapper {
  /* width: 100%; */
  /* margin-left: 20px; */
  width: 1400px;
  /* 画面幅が広がっても縮まっても固定 */
  /* margin: 0 auto; 画面がxxxpxより大きいときは真ん中に寄せる場合 */
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
.pointer-events-none {
  pointer-events: none;
}

.select-none {
  user-select: none;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }

  70% {
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

/* 💡 追加：下部リンク一覧のスタイル */
.link-list-area {
  width: 1400px;
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

.link-list-area ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.link-list-area li {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed #e2e8f0;
  font-size: 14px;
}

.link-list-area li:last-child {
  border-bottom: none;
}

/* ノード名のバッジ風デザイン */
.node-badge {
  background-color: #e2e8f0;
  color: #1e293b;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.arrow-icon {
  margin: 0 10px;
  color: #6366f1;
  font-weight: bold;
}

/* ラベルがない時の薄いグレー表示 */
.no-label {
  color: #94a3b8;
  font-weight: normal;
  font-style: italic;
}

/* 💡 親要素（ul）を横並びのコンテナにする */
.link-list {
  display: flex;
  /* 中の li を横に並べる */
  flex-wrap: wrap;
  /* 画面幅からはみ出したら自動で次の行に折り返す */
  gap: 15px;
  /* 項目と項目の間に15pxの隙間を作る */
  padding: 0;
  list-style: none;
  /* 行頭の「・」マークを消す */
}

/* 💡 子要素（li）を1つずつのカード風に装飾する */
.link-list li {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 10px 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  line-height: 1.5;

  cursor: pointer;
  user-select: none; /* 文字の誤選択を防ぐ */
  transition: background-color 0.2s, border-color 0.2s;
}

/* 💡 チェックが入ったとき（is-checked クラスがついたとき）の見た目 */
.link-list li.is-checked {
  background-color: #f0fdf4; /* 薄い緑色 */
  border-color: #86efac;     /* 緑色の枠線 */
}

/* タイムスタンプの文字デザイン */
.timestamp-badge {
  font-size: 11px;
  color: #64748b;
  background-color: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  font-weight: normal;
}

.check-icon {
  font-size: 14px;
}
</style>
