import { installQuasar } from '@quasar/quasar-app-extension-testing-unit-vitest'
import { usePromptStore } from 'src/stores'
import { describe, expect, it } from 'vitest'
import { installPinia } from './install-pinia'

// Documentation: https://pinia.vuejs.org/cookbook/testing.html#unit-testing-a-store

installQuasar()
installPinia()

describe('sum method', () => {
  it('should sum 1 + 1', async () => {
    expect(1 + 1).toBe(2)
  })
})

describe('prompt store', () => {
  it('should fetch all the prompts', async () => {
    // TODO: Check if import works with dotenv
    const store = usePromptStore()
    console.log(store)
    expect(store.getPrompts).not.toBeUndefined()
  })
})