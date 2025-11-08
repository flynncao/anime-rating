import { defineConfig, presetAttributify, presetTypography, presetUno, presetWind } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetWind(),
    presetTypography(),
  ],
  shortcuts: {
    'btn': 'px-4 py-2 rounded-lg font-semibold transition-all duration-200',
    'btn-primary': 'btn bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
    'input': 'px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    'card': 'bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300',
  },
  theme: {
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
    },
  },
})
