<template>
  <div class="list">
    <p>{{ bookCount }}件の読書情報が記録されています。</p>
    <BookInfo v-for="(b, i) of books"
      :linkable="true" :book="b" :index="i + 1" :key="b.isbn"></BookInfo>
    <div>
      <el-pagination background layout="prev, pager, next"
        :total="bookCount" :page-size="3" @current-change="onchange"></el-pagination>
    </div>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex';
import { useStore } from 'vuex';
import { ref, computed, onMounted } from 'vue';
import BookInfo from '@/views/BookInfo.vue'

export default {
  name: 'Home',
  components: {
    BookInfo
  },
  setup() {
    const store = useStore()
    const books = ref([])
    const bookCount = computed(() => store.getters.bookCount)
    const getRangeByPage = (page) => store.getters.getRangeByPage(page)
    const onchange = (page) => {
      books.value = []
      books.value.push(...getRangeByPage(page))
    }
    onMounted(() => {
      books.value.push(...getRangeByPage(1))
    })
    return {
      books,
      bookCount,
      onchange
    }
  },
}
</script>
