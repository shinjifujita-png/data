<template>
  <div id="search">
    <el-form :inline="true">
      <el-form-item label="キーワード">
        <el-input type="text" size="large" v-model="keyword"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onclick">検索</el-button>
      </el-form-item>
    </el-form>
    <hr />
    <BookInfo v-for="(b, i) of books"
      :linkable="true" :book="b" :index="i + 1" :key="b.isbn"></BookInfo>   
  </div>
</template>

<script>
import { ref, getCurrentInstance } from 'vue'
import BookInfo from '@/views/BookInfo.vue'

export default {
  name: 'BookSearch',
  components: {
    BookInfo
  },
  setup() {
    const app = getCurrentInstance()
    const $http = app.appContext.config.globalProperties.$http

    const keyword = ref('vuejs')
    const books = ref([])
    const onclick = () => {
      $http(`https://www.googleapis.com/books/v1/volumes?q=${keyword.value}`)
        .then((response) => {
          return response.json()
        })
        .then((data) => {
          books.value = []
          for (let b of data.items) {
            const authors = b.volumeInfo.authors
            const price = b.saleInfo.listPrice
            const img = b.volumeInfo.imageLinks
            books.value.push({
              id: b.id,
              title: b.volumeInfo.title,
              author: authors ? authors.join(',') : '',
              price: price ? price.amount : '-',
              publisher: b.volumeInfo.publisher,
              published: b.volumeInfo.publishedDate,
              image: img ? img.smallThumbnail : '',
            })
          }
        })
    }

    return {
      keyword,
      books,
      onclick
    }
  },
}
</script>

<style scoped>
#search form {
  margin-top: 15px;
}
</style>
