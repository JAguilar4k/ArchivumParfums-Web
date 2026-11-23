import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'

import { fakeApi, json, problem } from '@/api/__tests__/fakeApi'
import { accountOf, tokenResponse } from '@/features/session/__tests__/accounts'
import { cleanUp, open, page, profile, STORE } from '@/features/storefront/__tests__/fixtures'

afterEach(cleanUp)

const IN_ONE_HOUR = new Date(Date.now() + 60 * 60 * 1000).toISOString()
const PASSWORD = 'una-frase-secreta-larga'

const archivum = { id: '0192f0c4-0000-7000-8000-000000000001', nombre: 'ArchivumParfums', slug: 'archivumparfums', zona_horaria: 'America/Costa_Rica' }
const aromas = { id: '0192f0c4-0000-7000-8000-000000000003', nombre: 'Aromas del Valle', slug: 'aromas-del-valle', zona_horaria: 'America/Costa_Rica' }

async function fill(wrapper: Awaited<ReturnType<typeof open>>['wrapper']): Promise<void> {
  await wrapper.get('#nombre').setValue('Aromas del Valle')
  await wrapper.get('#slug').setValue('aromas-del-valle')
  await wrapper.get('#nombre_dueno').setValue('Laura Jiménez')
  await wrapper.get('#correo_dueno').setValue('laura@aromasdelvalle.test')
  await wrapper.get('#contrasena_dueno').setValue(PASSWORD)
}

describe('"Tiendas de la plataforma"', () => {
  it('lists the businesses of the platform, each with a link to its storefront', async () => {
    fakeApi({ 'GET /plataforma/tiendas': () => json(200, { data: [archivum, aromas] }) })
    const { wrapper } = await open('/plataforma/tiendas', 'administrador_plataforma')

    // The page belongs to no store, so the title ends with the generic name of the site.
    expect(document.title).toBe('Tiendas de la plataforma · Tienda de perfumes')
    expect(wrapper.findAll('h1').map((title) => title.text())).toEqual(['Tiendas de la plataforma'])
    expect(wrapper.findAll('.platform-businesses__list h3').map((title) => title.text())).toEqual(['ArchivumParfums', 'Aromas del Valle'])
    expect(wrapper.findAll('.platform-businesses__list a').map((link) => [link.text(), link.attributes('href')])).toEqual([
      ['Ver la vitrina de ArchivumParfums', '/tiendas/archivumparfums/vitrina'],
      ['Ver la vitrina de Aromas del Valle', '/tiendas/aromas-del-valle/vitrina'],
    ])
  })

  it('registers a business with its owner, announces it, clears the form and lists it', async () => {
    let registered = false
    const { requests } = fakeApi({
      'GET /plataforma/tiendas': () => json(200, { data: registered ? [archivum, aromas] : [archivum] }),
      'POST /plataforma/tiendas': () => {
        registered = true

        return json(201, { data: aromas })
      },
    })
    const { wrapper } = await open('/plataforma/tiendas', 'administrador_plataforma')

    await fill(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    const creation = requests.find((request) => request.method === 'POST')
    expect(await creation?.json()).toEqual({
      nombre: 'Aromas del Valle',
      slug: 'aromas-del-valle',
      nombre_dueno: 'Laura Jiménez',
      correo_dueno: 'laura@aromasdelvalle.test',
      contrasena_dueno: PASSWORD,
    })
    expect(wrapper.get('.status-message[role="status"]').text())
      .toBe('Se registró la tienda Aromas del Valle. Su dueño ya puede iniciar sesión con laura@aromasdelvalle.test.')
    for (const field of ['nombre', 'slug', 'nombre_dueno', 'correo_dueno', 'contrasena_dueno']) {
      expect((wrapper.get(`#${field}`).element as HTMLInputElement).value).toBe('')
    }
    expect(wrapper.findAll('.platform-businesses__list h3').map((title) => title.text())).toEqual(['ArchivumParfums', 'Aromas del Valle'])
  })

  it('marks the field of a slug already in use, focuses it and clears the password', async () => {
    fakeApi({
      'GET /plataforma/tiendas': () => json(200, { data: [archivum] }),
      'POST /plataforma/tiendas': () => problem(422, 'datos-invalidos', 'Los datos no son válidos.', {
        errores: { slug: ['Ya existe una tienda con ese slug.'] },
      }),
    })
    const { wrapper } = await open('/plataforma/tiendas', 'administrador_plataforma')

    await fill(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    const slug = wrapper.get('#slug')
    expect(slug.attributes('aria-invalid')).toBe('true')
    expect(slug.attributes('aria-describedby')).toContain('pista-slug')
    expect(wrapper.text()).toContain('Ya existe una tienda con ese slug.')
    expect(document.activeElement).toBe(slug.element)
    expect((wrapper.get('#contrasena_dueno').element as HTMLInputElement).value).toBe('')
    expect((wrapper.get('#nombre').element as HTMLInputElement).value).toBe('Aromas del Valle')
  })

  it('says what each field is for before the administrator writes', async () => {
    fakeApi({ 'GET /plataforma/tiendas': () => json(200, { data: [] }) })
    const { wrapper } = await open('/plataforma/tiendas', 'administrador_plataforma')

    for (const field of ['nombre', 'slug', 'nombre_dueno', 'correo_dueno', 'contrasena_dueno']) {
      expect(wrapper.get(`#${field}`).attributes('aria-describedby')).toBe(`pista-${field}`)
      expect(wrapper.get(`#pista-${field}`).text()).not.toBe('')
    }
    expect(wrapper.text()).toContain('Todavía no hay tiendas.')
  })

  it('shows "Sin permiso" to the owner of a store and to a customer', async () => {
    for (const role of ['dueno', 'cliente'] as const) {
      fakeApi({
        [`GET /tiendas/${STORE}`]: () => json(200, { data: profile }),
        [`GET /tiendas/${STORE}/perfumes`]: () => json(200, page([])),
      })
      const { router } = await open('/plataforma/tiendas', role)

      expect(router.currentRoute.value.name).toBe('forbidden')
      cleanUp()
    }
  })

  it('takes the administrator to the businesses of the platform after signing in', async () => {
    fakeApi({
      'POST /sesiones': () => tokenResponse('1|plataforma', IN_ONE_HOUR),
      'GET /cuenta': () => json(200, { data: accountOf('administrador_plataforma') }),
      'GET /plataforma/tiendas': () => json(200, { data: [archivum] }),
    })
    const { wrapper, router } = await open('/iniciar-sesion')

    await wrapper.get('#correo').setValue('dev@archivumparfums.test')
    await wrapper.get('#contrasena').setValue(PASSWORD)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('platform-businesses'))
  })
})
