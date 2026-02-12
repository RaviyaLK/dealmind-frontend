import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
  },
  {
    path: '/qualification',
    name: 'Qualification',
    component: () => import('../views/QualificationView.vue'),
  },
  {
    path: '/qualification/:dealId',
    name: 'QualificationDeal',
    component: () => import('../views/QualificationView.vue'),
    props: true,
  },
  {
    path: '/decision',
    name: 'Decision',
    component: () => import('../views/DecisionView.vue'),
  },
  {
    path: '/decision/:dealId',
    name: 'DecisionDeal',
    component: () => import('../views/DecisionView.vue'),
    props: true,
  },
  {
    path: '/proposals',
    name: 'Proposals',
    component: () => import('../views/ProposalsView.vue'),
  },
  {
    path: '/proposals/:dealId',
    name: 'ProposalsDeal',
    component: () => import('../views/ProposalsView.vue'),
    props: true,
  },
  {
    path: '/alerts',
    name: 'Alerts',
    component: () => import('../views/AlertsView.vue'),
  },
  {
    path: '/alerts/:dealId',
    name: 'AlertsDeal',
    component: () => import('../views/AlertsView.vue'),
    props: true,
  },
  {
    path: '/employees',
    name: 'Employees',
    component: () => import('../views/EmployeesView.vue'),
  },
  {
    path: '/digest',
    name: 'Digest',
    component: () => import('../views/DigestView.vue'),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Auth guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('dealmind_token')
  if (to.meta.requiresAuth === false) {
    if (token && to.path === '/login') {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    if (!token) {
      next('/login')
    } else {
      next()
    }
  }
})

export default router
