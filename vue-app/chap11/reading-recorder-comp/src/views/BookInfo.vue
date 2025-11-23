<template>
<div class="clearfix" :class="{ linkable }" @click="onclick">
  <div class="image"><img :src="book.image" /></div>
  <div class="details">
    <ul>
      <li v-if="index">{{ index }}.</li>
      <li>{{book.title}}（{{ book.price }}円）</li>
      <li>{{book.author}} 著</li>
      <li>{{book.publisher}} /刊</li>
      <li>{{book.published}} /発売</li>
    </ul>
  </div>
</div>
</template>

<script>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router'
import { UPDATE_CURRENT } from '@/store/mutation-types'

export default {
  name: 'BookInfo',
  props: {
    index: { type: Number },
    linkable: { type: Boolean, default: false },
    book: { type: Object }
  },
  setup(props) {
    const store = useStore()
    const router = useRouter()
    const onclick = () => {
      if(props.linkable) {
        store.dispatch(UPDATE_CURRENT, props.book)
        router.push('/form')
      }
    }
    return {
      onclick
    }
  },
}
</script>

<style scoped>
.linkable:hover {
    cursor: pointer;
    background-color: #ff9;
}

.image {
  float:left;
}

.image img {
  height: 180px;
}

.details {
  float: left;
}

.details li {
  list-style-type: none;
  text-align: left;
}

.clearfix {
  width: 100%;
  margin-bottom: 10px;
}

.clearfix:after {
  content: "";
  display: block;
  clear: both;
}
</style>