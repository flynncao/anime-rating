import antfu from '@antfu/eslint-config'

export default antfu({
  unocss: true,
}, {
  rules: {
    'no-console': 'warn',
    'node/prefer-global/process': 'warn',
    'ts/no-explicit-any': 'off',
    'unicorn/no-null':1
  },
})
