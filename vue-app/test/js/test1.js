//MyChildは親コンポーネントで使用するため先に書く
const MyChildtest2 = {
  template: `<div>テスト２</div>`,
  // template: `<div>テスト２_{{current}}`,
  // <input type="button" v-on:click="onclick" value="増やす" /></div>`,
  // props:['init'],
  // data(){
  //   return {
  //     current: this.init
  //   };
  // },
  // methods:{
  //   onclick(){
  //     this.current++;
  //   }
  // }
};
const MyChildtest3 = {
  template: `<div>テスト３</div>`,
};
const MyChild = {
  inject: ['title'],
  template: `
    <div id="child">
      {{titletest}}<br>
      <input type="text" v-model="titletest"/>
    </div>
    `,
  data() {
    return {
      titletest: this.title + 'bbb'
    }
  }
};
const MyMy = {
  components: {
    'my-child': MyChild,
  },
  template: `
    <div id="my">
      <my-child/>
    </div>
    `,
};
//オブジェクトリテラル、連想配列
const MyParent = {
  //templateは１つ？
  // template: `
  // <div>Vueアプリテスト１</div>
  // <my-child />
  // `,
  components: {
    'my-childtest2': MyChildtest2,
    'my-childtest3': MyChildtest3,
    'my-my': MyMy,
  },
  template: `<div>こんにちは、{{yourName1}}{{yourName2}}{{testMoji1}}さん!_{{current}}_{{name}}
    <my-childtest2 />
    <my-childtest3 />
    <my-my/>
    <input type="button" v-on:click="onclick" value="増やす" />
    </div>`,
  //プロパティ
  //値を引き渡す
  // props:['yourName1','yourName2','testMoji1','init'],
  //検証ルールを指定できる,コンソールにwarningを返す、実行エラーではない
  props: {
    yourName1: {
      type: [String, Number],
      required: true,
      // default: 'default_test'
      default(props) {
        return props.yourName2
      },
      //falseだとwarningが出る
      validator(value) {
        return value.length <= 10;
      }
    },
    yourName2: {
      type: String,
      required: true
    },
    testMoji1: {
      type: String,
      required: true
    },
    init: {
      type: Number,
      required: true
    },
    name: {
      type: String,
    }
  },
  //データオブジェクトで値の操作をする
  data() {
    return {
      current: this.init,
      // current2: this.init 全体のreturnの例
      title: 'dataVue3実践入門'
    };
  },
  methods: {
    onclick() {
      this.current++;
      // this.init++;読み取り専用のためエラー
    }
  },
  // provide:{
  //   title: 'Vue3実践入門'
  // },
  provide() {
    return {
      title: this.title + 'aaa'
    }
  },
};

const MyCounter = {
  //プロパティ
  props: ['step'],
  //カスタムイベント宣言（明示しなくてもよい）
  emits: ['plusMinus'],
  //カスタムイベントの検証
  emits: {
    plusMinus(step) {
      if (step && Number.isInteger(step)) {
        console.log('plusMinus event step_number_true.');
        return true;
      } else {
        console.log('plusMinus event object must be integer.');
        return false;
      }
    }
  },
  template: `<button type="button" v-on:click="onclick">{{step}}</button>`,
  // data(){
  //   return {
  //     //カウンター値
  //     current:0
  //   };
  // },
  data() {
    return {
      testcurrent: 0
    };
  },
  methods: {
    onclick() {
      //Vue.jsの組み込みメソッド、カスタムイベントを発火させる,Props down, Event up,this.stepをonplusに渡す
      this.$emit('plusMinus', Number(this.step));
    },
    //テスト用
    test_onclick(e) {
      //クリックされた要素のテキスト（文字）を数字として読み取る
      this.testcurrent += Number(e.target.textContent);
      console.log('onclick_test111' + this.testcurrent);
    },
    // onplus(e){
    //   this.current += e;
    // }
    onmounted(e) {
      console.log('onmounted_test222' + e);
    }
  },
};

const MyUpdate = {
  inject: ['title', 'updateTitle'],
  template: `
    <div id="child">
      <input type="button" value="更新" v-on:click="updateTitle" />
      {{title.value}}
    </div>
  `
};

const MySlot = {
  template: `
    <div id="child2">
    <p>MySlot_test</p>
    aaaaa,<slot>guest</slot>bbbbb!
    </div>
    `,
};

const MySlot2 = {
  template: `
    <div>
      <header>
        <slot name="header">DEFAULT HEADER</slot>
      </header>
      <div>
        <slot>DEFAULT MAIN</slot>
      </div>
      <footer>
        <slot name="footer">DEFAULT HEADER</slot>
      </footer>
    </div>
  `
};

const MySlot3 = {
  data() {
    return {
      bookb: {
        isbn: '978-4-8222-5389-9',
        title: '作って楽しむプログラミング HTML5超入門 ',
        price: 2000,
        publish: '日経BP'
      }
    };
  },
  template: `<div>
      <slot name="ccc" v-bind:booka="bookb">{{bookb.title}}（{{bookb.publish}}）</slot>
    </div>`
};

Vue.createApp({
  //親コンポーネント、ルートコンポーネントらしい
  // ローカル、プロパティ
  components: {
    //const無しで直接書いてもよい
    'my-parent': MyParent,
    'my-counter': MyCounter,
    'my-update': MyUpdate,
    'my-slot': MySlot,
    'my-slot2': MySlot2,
    'my-slot3': MySlot3,
  },
  data() {
    return {
      current: 0,
      title: 'title初期値'
    };
  },
  methods: {
    onplus(e) {
      this.current += e;
    },
    onmounted(e) {
      console.log('onmounted_test111' + e);
    },
    updateTitle() {
      this.title = 'Vue.js徹底攻略'
    }
  },
  provide() {
    return {
      //titleプロパティの値を返す算出プロパティの定義
      title: Vue.computed(() => this.title),
      updateTitle: this.updateTitle
    };
  },
  // props:['name']
},
  //ルートコンポーネントにプロパティを渡すglobalじゃないとできない？
  // {name:'YMD'}
)
  //global、メソッド
  // .component(
  //     'my-parent',MyParent,
  // )
  .mount('#app');