import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import ImportOrders from '../views/ImportOrders.vue'
import Orders from '../views/Orders.vue'
import Products from '../views/Products.vue'
import Customers from '../views/Customers.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Setup from '../views/Setup.vue'
import Settings from '../views/Settings.vue'
import Profile from '../views/Profile.vue'
import EtsyConnect from '../views/EtsyConnect.vue'
import ShippingSettings from '../views/ShippingSettings.vue'

const routes = [
    // Auth routes (public)
    { path: '/login', component: Login, meta: { public: true } },
    { path: '/register', component: Register, meta: { public: true } },

    // Setup (authenticated, accessible)
    { path: '/setup', component: Setup },

    // Protected routes
    { path: '/', component: Dashboard },
    { path: '/import', component: ImportOrders },
    { path: '/orders', component: Orders },
    { path: '/products', component: Products },
    { path: '/customers', component: Customers },
    { path: '/settings', component: Settings },
    { path: '/settings/shipping', component: ShippingSettings },
    { path: '/profile', component: Profile },
    { path: '/etsy-connect', component: EtsyConnect },
    {
        path: '/activity-log',
        name: 'activity-log',
        component: () => import('../views/ActivityLog.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/login'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Simple navigation guard - just auth check
router.beforeEach((to, _from, next) => {
    const token = localStorage.getItem('authToken')
    const isPublicRoute = to.meta.public

    if (!isPublicRoute && !token) {
        return next('/login')
    }

    if (isPublicRoute && token) {
        return next('/')
    }

    next()
})

export default router
