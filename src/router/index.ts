import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SymText from '../components/SymText.vue'
import BonHomme from '../components/BonHomme.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    children: [
        {
            path: '/sym-text',
            name: 'sym-text',
            component: SymText
          },
          {
            path: '/bon-homme',
            name: 'bon-homme',
            component: BonHomme
          },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
