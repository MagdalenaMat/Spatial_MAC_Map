import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'viewer',
      component: () => import('../views/SlideViewer.vue'),
      meta: {
        title: 'Spatial Macs Map Viewer'
      }
    }, 
    {
      path: '/files',
      name: 'files',
      component: () => import('../views/FileViewer.vue')
    },
  ]
})

export default router
