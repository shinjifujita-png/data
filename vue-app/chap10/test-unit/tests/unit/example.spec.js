import { shallowMount } from '@vue/test-utils'
import HelloWorld from '@/components/HelloWorld.vue'
// import { nextTick } from 'vue'

describe('HelloWorld.vue', () => {
  // it('renders props.msg when passed', () => {
  it('renders props.msg when passed', async () => {
    const msg = 'new message'
    const wrapper = shallowMount(HelloWorld, {
      props: { msg }
    })
    // expect(wrapper.text()).toMatch(msg)
    // expect(wrapper.find('h1').text()).toMatch(msg)

    const new_msg = 'こんにちは、Vue!!'
    await wrapper.setProps({ msg: new_msg })

    // wrapper.setProps({ msg: new_msg })
    // await nextTick()

    expect(wrapper.find('h1').text()).toBe(new_msg)
  })
})
