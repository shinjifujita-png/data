Vue.createApp({})
  .component('my-parent', {
    data() {
      return {
        title: 'Vue 3実践入門'
      };
    },    
    provide() {
      return {
        titlea: Vue.computed(() => this.title)
      }
    },
    template: `
      <div id="parent">
        <input type="text" v-model="title" />
        <my-my />
      </div>
    `
  })
  .component('my-my', {
    template: `
      <div id="my">
        <my-child />
      </div>
    `
  })
  .component('my-child', {
    inject: ['titlea'],
    template: `
      <div id="child">
        {{ titlea.value }}
      </div>
    `
  })
  .mount('#app');