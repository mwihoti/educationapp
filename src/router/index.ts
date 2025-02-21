import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LearnMath from '@/views/learn.vue'
import ProfileView from '@/views/profile.vue'
import RegisterVue from '@/views/Register.vue'
import LoginVue from '@/views/Login.vue'
import { useAuth } from '@/contexts/AuthContext'
import process from 'process'

const routes: Array<RouteRecordRaw> =[
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/learn',
      name: 'LearnMath',
      component: LearnMath,
      meta: { requiresAuth: true}
    },
    {
      path: '/profile',
      name: 'ProfileView',
      component: ProfileView,
      meta: { requiresAuth: true}
    }, 
    {
      path: '/register',
      name: 'RegisterVue',
      component: RegisterVue
    },
    {
      path: '/login',
      name: 'LoginVue',
      component: LoginVue
    },

  ]
  
  const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
  })

  router.beforeEach((to, from, next) => {
    const auth = useAuth()
    if ( to.matched.some((record) => record.meta.requiresAuth) && !auth.token.value) {
      next('/login')
    } else {
      next()
    }

})

export default router
