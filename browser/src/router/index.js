import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'viewer',
      component: () => import('../views/SlideViewer.vue')
    }, 
    {
      path: '/files',
      name: 'files',
      component: () => import('../views/FileViewer.vue')
    },
  ]
})

export default router
