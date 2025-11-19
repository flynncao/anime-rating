import antfu from '@antfu/eslint-config'

export default antfu({
  unocss: true,
}, {
  rules: {
    'no-console': 'warn',
    'node/prefer-global/process': 'warn',
  },
})
