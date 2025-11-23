import { shallowMount } from '@vue/test-utils'
import MyCompute from '@/components/MyCompute.vue'

describe('算出プロパティのテスト', () => {
  it('Computed Test', () => {
    const email = 'HOGE@example.com'
    const wrapper = shallowMount(MyCompute, {
      props: { email }
    })
    expect(wrapper.vm.localEmail).toBe('hoge')
  })
})