import type { RouteRecordRaw } from 'vue-router'

/**
 * The businesses of the whole platform (#347). Only the administrator of the platform opens it; the API checks the
 * same with the ability `platform:businesses`.
 */
export const platformRoutes: RouteRecordRaw[] = [
  {
    path: '/plataforma/tiendas',
    name: 'platform-businesses',
    component: () => import('./BusinessesView.vue'),
    meta: { roles: ['administrador_plataforma'], title: 'Tiendas de la plataforma' },
  },
]
