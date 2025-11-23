<template>
  <div id="emit">
    <input type="button" value="送信" v-on:click="onupdate" />
  </div>
</template>

<script>
export default {
  emits: [ 'update' ],
  methods: {
    onupdate() {
      this.$emit('update')
      this.$emit('update', { name: 'Vue.js', version: '3.2.0' })
    }
  }
}
</script>