import { createRouter, createWebHashHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import DashboardView from '../views/DashboardView.vue'
import PurchaseView from '../views/PurchaseView.vue'
import InventoryView from '../views/InventoryView.vue'
import PendingView from '../views/PendingView.vue'
import ShippedView from '../views/ShippedView.vue'
import ShipmentDetailView from '../views/ShipmentDetailView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: AdminLayout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: DashboardView,
        },
        {
          path: 'purchase',
          name: 'purchase',
          component: PurchaseView,
        },
        {
          path: 'inventory',
          name: 'inventory',
          component: InventoryView,
        },
        {
          path: 'pending',
          name: 'pending',
          component: PendingView,
        },
        {
          path: 'shipped',
          name: 'shipped',
          component: ShippedView,
        },
      ],
    },
    {
      path: '/shipments/:id',
      name: 'shipment-detail',
      component: ShipmentDetailView,
    },
  ],
})

export default router
