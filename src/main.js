import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import './style.css'

const dealMindTheme = {
  dark: true,
  colors: {
    background: '#0a0a14',
    surface: '#12121f',
    'surface-bright': '#1a1a2e',
    'surface-light': '#16213e',
    'surface-variant': '#1e1e38',
    'on-surface-variant': '#d1d5db',
    primary: '#a855f7',
    'primary-darken-1': '#7c3aed',
    secondary: '#ec4899',
    'secondary-darken-1': '#db2777',
    accent: '#06b6d4',
    error: '#ef4444',
    info: '#06b6d4',
    success: '#22c55e',
    warning: '#f59e0b',
  },
}

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dealMindTheme',
    themes: {
      dealMindTheme,
    },
  },
  defaults: {
    VCard: { rounded: 'lg', elevation: 0 },
    VBtn: { rounded: 'lg' },
    VChip: { rounded: 'lg' },
  },
})

const app = createApp(App)
app.use(router)
app.use(vuetify)
app.mount('#app')
