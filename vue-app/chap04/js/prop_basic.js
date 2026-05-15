Vue.createApp({})
  .component('my-hello', {
    // props: [ 'yourName' ],
    // props: [ 'yourName', 'aaaBBB' ],
    // props: { yourName : [ String, true ]},
    props: {
      yourName: {
        type: String,
        default: '名無権兵衛aaaaaaaaa',
        // required: true
        validator(value){
          return value.length <= 5;
        }
      }
    },
    // props: {
    //   details: {
    //     type: Object,
    //     default() {
    //       return { value: 'Hoge'}
    //     }
    //   }
    // },
    template: `<div>こんにちは、{{ yourName }}さん！</div>`,
    // template: `<div>こんにちは、{{ yourName }}さん{{aaaBBB}}！</div>`,
  })
  .mount('#app');
