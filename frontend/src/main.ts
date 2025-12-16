import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import './style.css'
import App from './App.vue'
import router from './router'

// Axios interceptor - attach JWT token to all requests
axios.interceptors.request.use(config => {
    const token = sessionStorage.getItem('authToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Axios response interceptor - handle 401 errors
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Token expired or invalid - logout
            sessionStorage.removeItem('authToken')
            sessionStorage.removeItem('user')
            if (router.currentRoute.value.path !== '/login') {
                router.push('/login')
            }
        }
        return Promise.reject(error)
    }
)

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')
