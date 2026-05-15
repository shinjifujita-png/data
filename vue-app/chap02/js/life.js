const app = Vue.createApp({
  beforeCreate: function() {
    console.log('beforeCreate...');
  },
  created: function() {
    console.log('created...');
  },
  beforeMount: function() {
    console.log('beforeMount...');
  },
  mounted: function() {
    console.log('mounted...');
  },
  beforeUpdate: function() {
    console.log('beforeUpdate...');
  },
  updated: function() {
    console.log('updated...');
  },
  beforeUnmount: function() {
    console.log('beforeUnmount...');
  },
  unmounted: function() {
    console.log('unmounted...');
  }
})

app.mount('#app');

setTimeout(function() {
  console.log('test111_setTimeout');
  app.unmount();
  console.log('test222_setTimeout');
}, 3000);