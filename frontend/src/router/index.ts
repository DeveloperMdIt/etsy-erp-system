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
import LandingPage from '../views/LandingPage.vue'
import Pricing from '../views/Pricing.vue'

const routes = [
    // Auth routes (public)
    { path: '/login', component: Login, meta: { public: true } },
    { path: '/register', component: Register, meta: { public: true } },

    // Setup (authenticated, accessible)
    { path: '/setup', component: Setup },

    // Public Landing Page (Root)
    { path: '/', component: LandingPage, meta: { public: true } },
    { path: '/pricing', component: Pricing, meta: { public: true } },

    // Protected routes
    { path: '/dashboard', component: Dashboard, meta: { title: 'Dashboard' } },
    { path: '/import', component: ImportOrders, meta: { title: 'Import' } },
    { path: '/orders', component: Orders, meta: { title: 'Bestellungen' } },
    { path: '/products', component: Products, meta: { title: 'Produkte' } },
    { path: '/customers', component: Customers, meta: { title: 'Kunden' } },
    {
        path: '/settings',
        component: () => import('../views/SettingsOverview.vue'),
        meta: { title: 'Einstellungen' }
    },
    {
        path: '/settings/config',
        component: Settings,
        meta: { title: 'Konfiguration', parent: '/settings' }
    },
    {
        path: '/settings/shipping',
        component: ShippingSettings,
        meta: { title: 'Versandwege', parent: '/settings' }
    },
    // Nested Settings Pages (Billbee Style)
    {
        path: '/settings/profile',
        component: Profile,
        meta: { title: 'Profil', parent: '/settings' }
    },
    {
        path: '/settings/import',
        component: ImportOrders,
        meta: { title: 'Datenimport', parent: '/settings' }
    },
    {
        path: '/settings/channels',
        component: EtsyConnect,
        meta: { title: 'Kanäle', parent: '/settings' }
    },
    {
        path: '/settings/activity-log',
        component: () => import('../views/ActivityLog.vue'),
        meta: { title: 'Ereignisse', requiresAuth: true, parent: '/settings' }
    },
    {
        path: '/settings/automation',
        component: () => import('../views/AutomationRules.vue'),
        meta: { title: 'Automatisierung', requiresAuth: true, parent: '/settings' }
    },
    {
        path: '/settings/automation/:id',
        component: () => import('../views/AutomationRuleEditor.vue'),
        meta: { title: 'Regel bearbeiten', requiresAuth: true, parent: '/settings' }
    },
    {
        path: '/settings/templates/documents',
        component: () => import('../views/DocumentTemplates.vue'),
        meta: { title: 'Dokumentvorlagen', parent: '/settings' }
    },
    {
        path: '/settings/templates/emails',
        component: () => import('../views/EmailTemplates.vue'),
        meta: { title: 'E-Mail Vorlagen', parent: '/settings' }
    },
    {
        path: '/settings/templates/edit/:type',
        component: () => import('../views/TemplateEditor.vue'),
        meta: { title: 'Vorlage bearbeiten', parent: '/settings' }
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
        // If logged in and on landing/login/register, go to actual app dashboard
        // Check if it's explicitly the landing page (which is public), we might want to allow viewing it even if logged in?
        // Usually SaaS apps redirect logged-in users to dashboard from root.
        if (to.path === '/' || to.path === '/login' || to.path === '/register') {
            return next('/dashboard')
        }
    }

    next()
})

export default router
