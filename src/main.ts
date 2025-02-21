import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { AuthKey, provideAuth} from './contexts/AuthContext'

const app = createApp(App);
const authProvider = provideAuth();
app.provide(AuthKey, authProvider)
app.provide('auth', authProvider);



app.use(createPinia())
app.use(router)

app.mount('#app')
