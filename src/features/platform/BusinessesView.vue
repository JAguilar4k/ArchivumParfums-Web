<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from 'vue'
import { RouterLink } from 'vue-router'

import { api } from '@/api/client'
import { callApi, fieldAttributes, focusFirstInvalidField, type ApiProblem } from '@/api/problem'
import EmptyState from '@/shared/EmptyState.vue'
import ErrorState from '@/shared/ErrorState.vue'
import FieldError from '@/shared/FieldError.vue'
import LoadingState from '@/shared/LoadingState.vue'
import ProblemNotice from '@/shared/ProblemNotice.vue'
import { useApiData } from '@/shared/useApiData'

/**
 * "Tiendas de la plataforma" (#347), for the administrator of the platform: the businesses of `GET
 * /plataforma/tiendas` and a form that registers a new one with its owner through `POST /plataforma/tiendas`. The
 * owner signs in with the email and the password written here; the password lives only in this form and is cleared
 * after each attempt. A 422 marks each field with its message, and a business already registered says so in a line
 * that screen readers announce.
 */
const form = useTemplateRef<HTMLFormElement>('form')
const nombre = ref('')
const slug = ref('')
const nombreDueno = ref('')
const correoDueno = ref('')
const contrasenaDueno = ref('')
const showPassword = ref(false)
const problem = ref<ApiProblem | null>(null)
const notice = ref('')
const sending = ref(false)

const businesses = useApiData(
  () => callApi(() => api.GET('/plataforma/tiendas')),
  (result) => result.data.length === 0,
)

void businesses.reload()

async function submit(): Promise<void> {
  if (sending.value) {
    return
  }

  sending.value = true
  problem.value = null
  notice.value = ''

  const created = await callApi(() =>
    api.POST('/plataforma/tiendas', {
      body: {
        nombre: nombre.value,
        slug: slug.value,
        nombre_dueno: nombreDueno.value,
        correo_dueno: correoDueno.value,
        contrasena_dueno: contrasenaDueno.value,
      },
    }),
  )

  contrasenaDueno.value = ''
  sending.value = false

  if (created.problem) {
    problem.value = created.problem
    await nextTick()

    if (form.value) {
      focusFirstInvalidField(form.value, created.problem)
    }

    return
  }

  notice.value = `Se registró la tienda ${created.data.data.nombre}. Su dueño ya puede iniciar sesión con ${correoDueno.value}.`
  nombre.value = ''
  slug.value = ''
  nombreDueno.value = ''
  correoDueno.value = ''
  showPassword.value = false
  await businesses.reload()
}
</script>

<template>
  <div class="page account-page platform-businesses">
    <div class="account-page__header">
      <h1 id="platform-heading">Tiendas de la plataforma</h1>
      <p class="form-intro">Registre una perfumería nueva con su dueño. Usted no ve los datos de ninguna tienda.</p>
    </div>

    <!-- Always in the page, so screen readers announce the new business. -->
    <p class="status-message" role="status">{{ notice }}</p>
    <ProblemNotice v-if="problem" :problem="problem" />

    <div class="account-page__columns">
      <form ref="form" class="form account-panel" aria-labelledby="register-business-heading" novalidate @submit.prevent="submit">
        <h2 id="register-business-heading">Registrar una tienda</h2>

        <div class="form-field">
          <label for="nombre">Nombre de la tienda</label>
          <p id="pista-nombre" class="field-hint">El nombre que verán los clientes en la vitrina.</p>
          <input
            id="nombre"
            v-model="nombre"
            name="nombre"
            type="text"
            autocomplete="organization"
            required
            v-bind="fieldAttributes(problem, 'nombre', 'pista-nombre')"
          />
          <FieldError :problem="problem" field="nombre" />
        </div>

        <div class="form-field">
          <label for="slug">Dirección de la vitrina</label>
          <p id="pista-slug" class="field-hint">
            Solo letras minúsculas, números y guiones, sin espacios ni tildes. Por ejemplo, aromas-del-valle.
          </p>
          <input
            id="slug"
            v-model="slug"
            name="slug"
            type="text"
            autocomplete="off"
            autocapitalize="none"
            :spellcheck="false"
            required
            v-bind="fieldAttributes(problem, 'slug', 'pista-slug')"
          />
          <FieldError :problem="problem" field="slug" />
        </div>

        <div class="form-field">
          <label for="nombre_dueno">Nombre del dueño</label>
          <p id="pista-nombre_dueno" class="field-hint">La persona que administrará la tienda.</p>
          <input
            id="nombre_dueno"
            v-model="nombreDueno"
            name="nombre_dueno"
            type="text"
            autocomplete="off"
            required
            v-bind="fieldAttributes(problem, 'nombre_dueno', 'pista-nombre_dueno')"
          />
          <FieldError :problem="problem" field="nombre_dueno" />
        </div>

        <div class="form-field">
          <label for="correo_dueno">Correo del dueño</label>
          <p id="pista-correo_dueno" class="field-hint">Con este correo iniciará sesión. No puede tener ya una cuenta.</p>
          <input
            id="correo_dueno"
            v-model="correoDueno"
            name="correo_dueno"
            type="email"
            autocomplete="off"
            required
            v-bind="fieldAttributes(problem, 'correo_dueno', 'pista-correo_dueno')"
          />
          <FieldError :problem="problem" field="correo_dueno" />
        </div>

        <div class="form-field">
          <label for="contrasena_dueno">Contraseña inicial del dueño</label>
          <p id="pista-contrasena_dueno" class="field-hint">
            Entréguesela al dueño por un medio privado; podrá cambiarla en su cuenta. Si hay un error, se indica aquí qué
            le falta.
          </p>
          <input
            id="contrasena_dueno"
            v-model="contrasenaDueno"
            name="contrasena_dueno"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            autocapitalize="none"
            :spellcheck="false"
            required
            v-bind="fieldAttributes(problem, 'contrasena_dueno', 'pista-contrasena_dueno')"
          />
          <FieldError :problem="problem" field="contrasena_dueno" />
          <label class="checkbox-field">
            <input id="mostrar_contrasena" v-model="showPassword" type="checkbox" />
            Mostrar la contraseña
          </label>
        </div>

        <div class="form-actions">
          <!-- aria-disabled and not disabled: the button keeps the focus while the request is on its way. -->
          <button type="submit" :aria-disabled="sending ? 'true' : undefined">
            {{ sending ? 'Registrando la tienda…' : 'Registrar la tienda' }}
          </button>
        </div>
      </form>

      <section class="account-panel" aria-labelledby="businesses-heading">
        <h2 id="businesses-heading">Tiendas registradas</h2>
        <LoadingState v-if="businesses.loading.value" message="Cargando las tiendas…" />
        <ErrorState v-else-if="businesses.problem.value" :problem="businesses.problem.value" @retry="businesses.reload" />
        <EmptyState v-else-if="businesses.empty.value" message="Todavía no hay tiendas." />
        <ul v-else-if="businesses.data.value" class="platform-businesses__list">
          <li v-for="business in businesses.data.value.data" :key="business.id">
            <h3>{{ business.nombre }}</h3>
            <dl class="facts">
              <div>
                <dt>Dirección</dt>
                <dd>/tiendas/{{ business.slug }}</dd>
              </div>
              <div>
                <dt>Zona horaria</dt>
                <dd>{{ business.zona_horaria }}</dd>
              </div>
            </dl>
            <RouterLink :to="{ name: 'storefront', params: { tienda: business.slug } }" class="action-link">
              Ver la vitrina de {{ business.nombre }}
            </RouterLink>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.platform-businesses__list {
  display: grid;
  gap: 1rem;
  padding: 0;
  list-style: none;
}

.platform-businesses__list > li {
  display: grid;
  gap: 0.5rem;
  padding-block-end: 1rem;
  border-block-end: 1px solid var(--color-divider);
}

.platform-businesses__list > li:last-child {
  padding-block-end: 0;
  border-block-end: 0;
}

.platform-businesses__list h3 {
  font-size: 1.125rem;
  overflow-wrap: anywhere;
}

.platform-businesses__list dd {
  overflow-wrap: anywhere;
}
</style>
