// Couleurs sémantiques : leurs valeurs changent avec le thème (voir src/index.css)
import daisyui from 'daisyui'
const v = (n) => `var(--${n})`
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: { colors: { ink: v('ink'), body: v('body'), mute: v('mute'), mute2: v('mute2'), line: v('line'), surface: v('surface'), nav: v('nav'), danger: v('danger'), warn: v('warn') } } },
  plugins: [daisyui],
  daisyui: { themes: ['light', 'dark'] },
}
