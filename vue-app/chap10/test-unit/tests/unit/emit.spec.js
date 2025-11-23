import { shallowMount } from '@vue/test-utils'
import MyEmit from '@/components/MyEmit.vue'

describe('カスタムイベントのテスト', () => {
  it('$emit Test', () => {
    const wrapper = shallowMount(MyEmit)
    wrapper.find('input').trigger('click')
    const emit = wrapper.emitted()
    console.dir(emit)

    expect(emit.update).toBeTruthy()
    expect(emit.update.length).toBe(2)
    expect(emit.update[1][0].version).toBe('3.2.0')
  })
})