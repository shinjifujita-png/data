Vue.createApp({
  // provide: {
  //   name: '鈴木'
  // },

  props: ['name']
},
  {
    name: 'test'

  })
  .component('my-hello', {
    props: {
      name: {
        type: String,
      },
      nickname: {
        type: String,
        default(props) {
          // return props.name
          // injectメソッドを利用する場合
          return Vue.inject('name', 'noname');
        },
        // validator(value) {
        //   return value.length <= 5;
        // }
      }
    },
    // template: `<div>こんにちは、{{ nickname }}さん！</div>`,
    template: `<div>こんにちは、{{ name }}さん！</div>`,
  })
  .mount('#app');