import { createRouter, createWebHistory } from 'vue-router'
import SalesView from '../views/SalesView.vue'
import OrdersView from '../views/OrdersView.vue'
import IncomesView from '../views/IncomesView.vue'
import StocksView from '../views/StocksView.vue'

const routes = [
  { path: '/', redirect: '/stocks' },
  { path: '/sales', component: SalesView },
  { path: '/orders', component: OrdersView },
  { path: '/stocks', component: StocksView },
  { path: '/incomes', component: IncomesView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
