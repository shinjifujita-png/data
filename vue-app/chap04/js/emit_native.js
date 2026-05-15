Vue
  .createApp({
    data() {
      return {
        current: 0
      };
    },
    methods: {
      onclick(e) {
        this.current += Number(e.target.textContent);
        // console.log(e)
      },
    }
  })
  .component('my-counter', {
    inheritAttrs: true,
    props: [ 'step' ], 
    // emits: [ 'plusMinus' ],
    template: `<button type="button" v-on:click="onclick">
    {{ step }}</button>`,
    // methods: {
    //   onclick() {
    //     this.$emit('aa', Number(this.step));
    //   }
    // }
  })
.mount('#app');