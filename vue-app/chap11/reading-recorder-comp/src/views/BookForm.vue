<template>
  <div id="form">
    <BookInfo :book="book"></BookInfo>
    <hr />
    <el-form ref="myform" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="読了日">
        <el-date-picker type="date" v-model="form.read"></el-date-picker>
      </el-form-item>
      <el-form-item label="感想" prop="memo">
        <el-input type="textarea" size="large" v-model="form.memo"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onsubmit">登録</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ref, computed, onMounted, h } from 'vue'
import { useStore } from 'vuex';
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import BookInfo from '@/views/BookInfo.vue'
import { UPDATE_CURRENT, UPDATE_BOOK } from '@/store/mutation-types'

export default {
  name: 'BookForm',
  components: {
    BookInfo
  },
  setup() {
    const store = useStore()
    const router = useRouter()

    const myform = ref(null)
    const book = ref({})
    const form = ref({
      read: new Date(),
       memo: ''
    })
    const rules = ref({
      memo: [
        { required: true, message: 'メモが未入力です。', trigger: 'blur' }
      ]
    })
    const current = computed(() => store.getters.current)
    const getBookById = (id) => store.getters.getBookById(id)

    if (!current.value) {
      router.push('/')
    }
    Object.assign(book.value, current.value)

    onMounted(() => {
      const b = getBookById(book.value.id)
      if (b) {
        form.value.read = b.read
        form.value.memo = b.memo
      }
    })

    const onsubmit = () => {
      myform.value.validate(valid => {
        if (valid) {
          store.dispatch(
            UPDATE_BOOK, 
            Object.assign({}, book.value, form.value)
          )
          store.dispatch(UPDATE_CURRENT, null)
          ElNotification.success({
            title: 'Reading Recorder',
            message: h('p', { style: 'color: #009' },
              '読書情報の登録／更新に成功しました。'),
            duration: 2000
          })
          form.value.read = new Date()
          form.value.memo = ''
          router.push('/')
        }
      })
    }    

    return {
      book,
      form,
      rules,
      onsubmit,
      myform
    }
  },
}
</script>

<style scoped>
#form {
  margin-top: 15px;
}
</style>
