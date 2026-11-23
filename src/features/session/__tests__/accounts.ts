import type { Account } from '../store'
import { json } from '@/api/__tests__/fakeApi'

export function tokenResponse(token: string, expiresAt: string): Response {
  return json(201, { data: { token, tipo: 'Bearer', vence_en: expiresAt } })
}

const NAMES: Partial<Record<Account['rol'], string>> = { cliente: 'Ana Cliente', administrador_plataforma: 'Equipo de desarrollo' }

export function accountOf(rol: Account['rol']): Account {
  return {
    id: '0193b0d4-0000-7000-8000-000000000020',
    nombre: NAMES[rol] ?? 'Dana Dueña',
    correo: 'cuenta@example.test',
    rol,
    // A customer and the administrator of the platform (#347) belong to no store.
    tienda: rol === 'cliente' || rol === 'administrador_plataforma'
      ? null
      : { id: '0193b0d4-0000-7000-8000-000000000030', nombre: 'ArchivumParfums', slug: 'archivum' },
  }
}
