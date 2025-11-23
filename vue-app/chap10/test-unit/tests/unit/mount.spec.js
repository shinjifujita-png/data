import { shallowMount, mount } from '@vue/test-utils'
// import HelloStub from './HelloStub.vue'
import App from '@/App.vue'

describe('Mountの基本', () => {
  it('shallowMount vs mount', () => {
    const shallow = shallowMount(App)
    const deep = mount(App)
    console.log(shallow.html())
    console.log(deep.html())
  })

  // it('Custom Stub', () => {
  //   const shallow = shallowMount(App, {
  //     global: {
  //       stubs: {
  //         HelloWorld: HelloStub
  //       }
  //     // HelloWorld: true
  //     }
  //   })
  //   console.log(shallow.html())
  // })
})