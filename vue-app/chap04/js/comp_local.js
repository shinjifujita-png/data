const MyHello = {
  // template: `<div>こんにちは、Vue.js！</div>`,
  template: `<div>こんにちは、{{name}}！</div>`,
  data() {
    return {
      name: 'Vue.js'
    };
  }
};

Vue.createApp({
  components: {
    'my-hello': MyHello
  }
}).mount('#app');