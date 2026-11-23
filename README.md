# ArchivumParfums Web

Cliente web de ArchivumParfums. La SPA en Vue 3 y TypeScript consume la API del [backend](https://github.com/JAguilar4k/ArchivumParfums-Hexagonal), que calcula los precios, los montos y la disponibilidad.

## Requisitos

| Herramienta | Versión |
|---|---|
| Node.js | 26 LTS (26.11 o superior dentro de la 26, fijada en `engines` de `package.json`) |
| npm | 11, el que trae Node.js 26 |
| API | Backend en ejecución para desarrollo. [Guía de instalación](https://github.com/JAguilar4k/ArchivumParfums-Hexagonal/tree/main/archivum-api-hexagonal#readme) |

`node -v` y `npm -v` muestran lo instalado. Con otra versión de Node.js, `npm install` avisa con `EBADENGINE`.

## Instalación

En Windows, [`instalar.bat`](https://github.com/JAguilar4k/ArchivumParfums-Hexagonal/blob/main/instalar.bat) del backend clona este repositorio junto a `ArchivumParfums-Hexagonal`, instala sus dependencias y prepara la API y la base de datos; se puede repetir sin duplicar datos. Lo que sigue es la instalación a mano.

Los comandos sirven en PowerShell, en Git Bash y en una terminal de Linux o macOS.

1. Clonar el repositorio y entrar en su raíz.

   ```bash
   git clone https://github.com/JAguilar4k/ArchivumParfums-Web.git
   cd ArchivumParfums-Web
   ```

2. Instalar las dependencias exactas de `package-lock.json`:

   ```bash
   npm ci
   ```

3. Revisar la configuración. Con el backend clonado al lado, en `../ArchivumParfums-Hexagonal`, el cliente lee sus variables `VITE_` del único `.env` del proyecto, `../ArchivumParfums-Hexagonal/archivum-api-hexagonal/.env`, y no hace falta otro archivo. Sin el backend al lado, se copia el ejemplo:

   ```bash
   cp .env.example .env              # Git Bash, Linux o macOS
   Copy-Item .env.example .env       # PowerShell
   ```

   Si la API corre en otra dirección o puerto, se cambia `VITE_API_URL` en el `.env` que corresponda.

4. Levantar el servidor de desarrollo, con la API ya en ejecución:

   ```bash
   npm run dev
   ```

   Vite muestra la dirección local de la SPA, por defecto `http://localhost:5173`.

## Variables de entorno

Vite solo expone al navegador las variables que empiezan con `VITE_`. Todas se declaran en `.env.example`, con su tipo en `env.d.ts`, y se leen desde `src/shared/config.ts`; ningún archivo del código tiene una dirección escrita. `.env` nunca se versiona.

`vite.config.ts` toma las variables de `../ArchivumParfums-Hexagonal/archivum-api-hexagonal/.env` cuando ese archivo existe, para que el proyecto tenga un solo `.env`; en ese caso se ignora el `.env` de esta carpeta. Ese archivo también guarda los secretos de la API, pero el navegador solo recibe las variables `VITE_`. Sin el backend al lado, como en CI, se usa el `.env` de esta carpeta.

| Variable | Ejemplo | Para qué sirve |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000/api/v1` | Dirección base de la API, con el prefijo `/api/v1`. |
| `VITE_DEFAULT_BUSINESS_SLUG` | `archivumparfums` | Tienda que abre la raíz del cliente (`/`); `archivumparfums` es la tienda piloto de los seeders. |
| `VITE_STORE_WHATSAPP` | Vacío | Número público de WhatsApp de la tienda, incluido el código del país. Se admite un `+` inicial. El enlace se oculta si la variable está vacía o el formato es inválido. |

Las variables se leen al compilar: después de cambiar `.env`, se reinicia `npm run dev` o se vuelve a ejecutar `npm run build`.

En el despliegue, definí las variables `VITE_*` antes de compilar y publicá `dist/`. Configurá el alojamiento para entregar `index.html` al abrir directamente una ruta de Vue Router. En el backend, `ARCHIVUM_WEB_ORIGIN` lleva el origen público de la SPA y `PAYMENTS_RETURN_URL` y `PAYMENTS_CANCEL_URL` llevan las rutas de retorno de ese mismo sitio.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta la SPA con recarga en caliente. |
| `npm run build` | Revisa los tipos y genera la versión de producción en `dist/`. |
| `npm run preview` | Sirve localmente la versión de `dist/`. |
| `npm run type-check` | Revisa los tipos con `vue-tsc` en modo estricto. |
| `npm run lint` | Revisa el código con ESLint y las reglas de Vue y TypeScript, sin modificarlo. |
| `npm run lint:fix` | Corrige con ESLint lo que se puede corregir solo. |
| `npm run test` | Ejecuta las pruebas unitarias con Vitest una vez. |
| `npm run test:watch` | Ejecuta las pruebas cada vez que cambia un archivo. |
| `npm run test:e2e` | Ejecuta las pruebas de flujos, accesibilidad y tiempos de navegación con Playwright y respuestas simuladas. |
| `npm run api:types` | Regenera `src/api/schema.ts` desde `openapi/v1.json`. |
| `npm run api:check` | Falla si `src/api/schema.ts` no coincide con `openapi/v1.json`. |

Antes de abrir un pull request pasan `npm run lint`, `npm run type-check`, `npm run test`, `npm run build`, `npm run api:check` y `npm run test:e2e`. Ejecute `npx playwright install chromium` antes de la primera corrida de Playwright. El servidor de pruebas de Playwright usa respuestas simuladas y arranca sin una API local.

## Integración continua

El job `Web` valida el cliente en cada pull request y en cada push a `main`. Usa la versión de Node.js de `engines` y ejecuta `npm ci`, `npm run api:check`, `npm run lint`, `npm run type-check`, `npm run test`, `npm run build`, `npm run test:e2e` con Chromium y `npm audit --audit-level=critical`. Las capturas y las trazas de Playwright quedan 14 días como artefacto `playwright` de la corrida. [Configuración de CI](.github/workflows/ci.yml).

La separación conserva el umbral `critical` adoptado en el seguimiento de picomatch. GitHub retiró el aviso que motivó el cambio el 18 de noviembre de 2026. `npm audit` sigue mostrando los avisos de otras severidades. [Seguimiento #335](https://github.com/JAguilar4k/ArchivumParfums-Hexagonal/issues/335), [aviso de seguridad](https://github.com/advisories/GHSA-fc5q-39xc-vjpf).

Dependabot revisa npm y GitHub Actions cada lunes. Las actualizaciones menores y de parche de npm se agrupan con el prefijo `build`. [Configuración de Dependabot](.github/dependabot.yml).

## Tipos de la API

Scramble genera el contrato de la API en el backend. Este repositorio versiona una copia exacta en `openapi/v1.json` y anota su commit de origen en `openapi/source.txt`. `openapi-typescript` genera `src/api/schema.ts` desde esa copia y `openapi-fetch` da el cliente tipado de `src/api/client.ts`. Una llamada fuera del contrato hace fallar `npm run type-check`.

Si cambia un endpoint, el PR del backend regenera el contrato con `composer openapi`. En el PR de Web, sustituí `SHA_DEL_BACKEND` por el SHA completo de un commit del backend que contenga el contrato y ejecutá desde la raíz de Web los siguientes comandos. En PowerShell usá `curl.exe`.

```bash
curl -fsSL "https://raw.githubusercontent.com/JAguilar4k/ArchivumParfums-Hexagonal/SHA_DEL_BACKEND/archivum-api-hexagonal/openapi/v1.json" -o openapi/v1.json
npm run api:types
npm run api:check
```

Escribí ese SHA en `openapi/source.txt` e incluí los tres archivos en el PR. `npm run api:check` compara los tipos versionados con los generados en memoria, usando la copia del contrato. El desarrollo y la CI de Web usan este archivo local.

El cliente `api` toma la dirección de `VITE_API_URL`, envía `Accept: application/json` y, cuando hay sesión, su token como `Authorization: Bearer`. Cada llamada devuelve `data` si la respuesta fue exitosa o `error` con el problema RFC 9457 que documenta el contrato (`Problem` o, en una validación fallida, `ValidationProblem` con `errores` por campo):

```ts
import { api } from '@/api/client'

const { data, error } = await api.GET('/tiendas/{tienda}/perfumes', {
  params: { path: { tienda: 'archivum' }, query: { nota: 'vainilla' } },
})
```

La sesión ([#126](https://github.com/JAguilar4k/ArchivumParfums-Hexagonal/issues/126)) registra una vez cómo leer su token con `setTokenProvider(() => token)` y qué hacer ante un 401 con `setUnauthenticatedHandler`; mientras no lo haga, las peticiones salen sin token.

## Sesión y permisos de navegación

El store `session` de Pinia (`src/features/session/store.ts`, [#126](https://github.com/JAguilar4k/ArchivumParfums-Hexagonal/issues/126)) guarda el token, su `vence_en` y la cuenta con su rol y su tienda:

- **Iniciar sesión:** `POST /sesiones` y luego `GET /cuenta`. Unas credenciales incorrectas responden 401 `credenciales-invalidas` y la vista "Iniciar sesión" (`/iniciar-sesion`) muestra su mensaje; un 422 marca los campos.
- **Dónde vive el token:** en `sessionStorage` (se pierde al cerrar la pestaña), nunca en la URL ni en los registros. La contraseña no se guarda en ningún lado.
- **Renovación:** `POST /sesiones/actual/renovacion` cinco minutos antes de `vence_en`; si no hay respuesta, se reintenta cada 30 segundos mientras el token siga vigente.
- **Un 401 con token** (vencido o revocado, que ya no se puede renovar) borra la sesión y lleva al inicio de sesión, que después regresa a la ruta que estaba abierta. Un 401 sin token, como una contraseña equivocada, no termina ninguna sesión.
- **Cerrar sesión:** `DELETE /sesiones/actual`, y se borran el token y la cuenta del navegador.

`installSession(router)` en `main.ts` conecta la sesión con el router. Cada ruta declara en `meta.roles` quién puede abrirla, y una ruta hija hereda los roles de su padre:

```ts
{ path: '/cuenta/citas', component: AppointmentsView, meta: { roles: ['cliente'] } }
{ path: '/panel', meta: { roles: ['dueno'] }, children: [...] }
{ path: '/panel/agenda', component: AgendaView, meta: { roles: ['dueno', 'colaborador'] } }
```

Una ruta sin `meta.roles` es pública. El visitante que abre una ruta con roles va al inicio de sesión; una cuenta cuyo rol no está en la lista ve "Sin permiso". Los guardias solo ayudan a navegar: los permisos los decide la API (#102, #104).

### Crear cuenta

La vista "Crear cuenta" (`/crear-cuenta`, `src/features/registration`, [#194](https://github.com/JAguilar4k/ArchivumParfums-Hexagonal/issues/194)) registra una cuenta de cliente con `POST /cuentas`: envía `nombre`, `correo`, `contrasena` y `acepta_privacidad`, nunca un rol ni una tienda.

- **Aviso de privacidad.** `PrivacyNotice.vue` dice qué datos guarda la cuenta, para qué y quién los ve. La casilla de aceptación empieza sin marcar. Al aceptar, la API guarda la fecha y la versión (`ARCHIVUM_PRIVACY_NOTICE_VERSION`), que se actualiza cuando cambia el aviso. [Política de privacidad del proyecto](https://github.com/JAguilar4k/ArchivumParfums-Hexagonal/blob/main/docs/privacy.md).
- **Errores.** La política de contraseñas la decide la API: un 422 marca cada campo con su mensaje, conserva lo escrito salvo la contraseña y lleva el foco al primer campo con error. Mientras la solicitud está en curso el botón lleva `aria-disabled`: conserva el foco y un segundo clic no manda otro registro.
- **Después del 201** se inicia sesión como en "Iniciar sesión" y se regresa a la ruta que el visitante quería abrir (`?redirect=`), o a la vitrina. Si la cuenta se creó pero el inicio de sesión falla, se abre "Iniciar sesión" con el correo ya escrito y el aviso "Se creó su cuenta": el correo pasa en memoria, nunca por la URL ni por el almacenamiento.
- **Accesibilidad (AAA).** Cada campo tiene una pista antes del control, ligada con `aria-describedby`: para qué sirven el nombre y el correo, y un consejo para la contraseña que no repite la política de la API (#194): si la contraseña no la cumple, el 422 dice junto al campo qué le falta. "Mostrar la contraseña" deja revisarla. Si se envía sin marcar la casilla, el foco va a la casilla, que lee su mensaje, y el mensaje se va al marcarla. El aviso de privacidad va enmarcado dentro del formulario, y "Ayuda y glosario" explica la cuenta en "Su cuenta".
- La contraseña solo vive en el formulario y en las dos solicitudes. "Iniciar sesión" enlaza a "Crear cuenta" con la misma ruta de regreso, y una cuenta con sesión que abre cualquiera de las dos vuelve al inicio.

### Tiendas de la plataforma

La vista "Tiendas de la plataforma" (`/plataforma/tiendas`, `src/features/platform`, [#347](https://github.com/JAguilar4k/ArchivumParfums-Hexagonal/issues/347)) es solo del rol `administrador_plataforma`, que llega ahí al iniciar sesión sin otra ruta de regreso y la encuentra en el menú de la sesión. Lista las tiendas de `GET /plataforma/tiendas`, cada una con el enlace a su vitrina, y registra una nueva con su dueño en `POST /plataforma/tiendas`.

- **Errores.** Un slug o un correo ya usados, o un dato inválido, llegan como 422: cada campo muestra su mensaje, conserva lo escrito salvo la contraseña y el foco va al primer campo con error.
- **Después del 201** una línea con `role="status"` dice qué tienda se registró y con qué correo inicia sesión su dueño, el formulario se vacía y la lista se vuelve a cargar.
- **Accesibilidad (AAA).** Cada campo tiene su pista antes del control, ligada con `aria-describedby`; el botón lleva `aria-disabled` mientras la solicitud está en curso, y cada enlace a una vitrina nombra su tienda.

## Vitrina y recomendaciones

Las páginas públicas de una tienda ([#128](https://github.com/JAguilar4k/ArchivumParfums-Hexagonal/issues/128)) llevan su slug en la ruta y no piden sesión. La raíz (`/`) abre la tienda de `VITE_DEFAULT_BUSINESS_SLUG`.

| Ruta | Vista | API |
|---|---|---|
| `/tiendas/:tienda` | Inicio, con la colección y accesos a la vitrina, citas y recomendador | `GET /tiendas/{tienda}/perfumes` |
| `/tiendas/:tienda/vitrina` | Vitrina, paginada y con filtros | `GET /tiendas/{tienda}/perfumes` |
| `/tiendas/:tienda/perfumes/:perfume` | Detalle: notas por capa, etiquetas, presentaciones y decants | `GET /tiendas/{tienda}/perfumes/{perfume}` |
| `/tiendas/:tienda/recomendaciones` | Recomendador | `POST /tiendas/{tienda}/recomendaciones` |

Inicio, vitrina, detalle, recomendador, carrito y reserva comparten una ruta padre (`StoreLayout`) y un perfil de tienda (`GET /tiendas/{tienda}`) con el marco de `App.vue`. La cabecera muestra el nombre, logo y lugar de las citas. Fuera de esas rutas usa la tienda predeterminada. Una tienda que no existe o un perfume que la API devuelve como 404 muestra «No encontrado», también en la pestaña.

- **Filtros en la URL.** Texto, familia, nota, momento, clima, ocasión y precio máximo viven en el query (`?nota=vainilla&momento=noche`). Los enlaces antiguos con filtros en `/tiendas/:tienda` redirigen a la vitrina con la misma consulta. Cambiar un filtro vuelve a la primera página. Las opciones se aplican al elegirlas y los campos escritos esperan 300 ms. Un 422 se marca junto a su campo en el panel «Filtrar».
- **Precios.** Se muestran tal como los manda la API, en colones enteros con separador de miles (`formatColones` de `src/shared/money.ts`). El navegador no calcula ningún precio.
- **Vitrina.** La región de estado anuncia el rango visible y el total. La paginación mantiene los filtros y puede mostrar 12, 24 o 48 perfumes por página. Mientras se carga una consulta sin caché, la lista anterior conserva su lugar y la región de resultados indica que está ocupada.
- **Detalle.** La ruta de enlaces indica la ubicación dentro de la tienda. Cada tamaño se expresa con `MlAmount` y `concentrationLabel` desarrolla las abreviaturas de concentración. Al elegir una presentación y agregarla, el carrito lateral abre con el anuncio y devuelve el foco al control de origen cuando se cierra.
- **Caché pública.** El perfil, la lista y el detalle de perfumes, los servicios y los paquetes pueden reutilizar respuestas en memoria por URL completa. Una vista muestra enseguida los datos guardados y confirma su vigencia en segundo plano. Las respuestas de pedidos y citas personales se consultan en cada vista. Las tarjetas y los enlaces de paginación cargan por adelantado al recibir el puntero o el foco.
- **Recomendador.** Junto al campo de texto da un ejemplo y avisa que lo escrito se envía a un proveedor externo de inteligencia artificial y que no conviene incluir datos personales; la API igual reemplaza correos y teléfonos antes de enviarlo (R51). Un texto vacío no se envía: el campo se marca y toma el foco. Mientras espera la respuesta, que puede tardar hasta 10 segundos, el botón queda ocupado (`aria-disabled`) y una línea con `role="status"` anuncia la espera y después cuántos perfumes recomienda. Cada perfume muestra su razón como texto (nunca como HTML), sus precios y un enlace al detalle, con "Recomendado con inteligencia artificial" o "Recomendado con las reglas de la tienda" según `origen`. Un 429 dice en cuánto tiempo volver a intentar.
- **Ayuda y glosario** (`/ayuda`, en `src/features/help`). Explica cómo buscar, cómo pedir una recomendación, cómo funcionan los pedidos y los pagos (#130) y las citas de prueba con sus estados (#129), y define las palabras de perfumería y de los pedidos: bajo pedido, concentración, decant, familia olfativa, notas, pasarela de pago, por cobrar ahora, presentación, prueba de olores, saldo, ml, ₡ e inteligencia artificial. Cada término tiene un id, así que una página puede enlazarlo (`/ayuda#notas`) y el foco llega a ese término. El pie de todas las páginas enlaza la ayuda.

## Carrito, pedidos y pagos

El cliente arma un pedido y lo paga en línea ([#130](https://github.com/JAguilar4k/ArchivumParfums-Hexagonal/issues/130)). La API calcula todos los montos y confirma el pago; el navegador solo envía qué se pide y muestra lo que la API responde.

| Ruta | Vista | API |
|---|---|---|
| `/tiendas/:tienda/carrito` | Carrito de la tienda | `POST /tiendas/{tienda}/pedidos` |
| `/cuenta/pedidos` | "Mis pedidos" | `GET /cuenta/pedidos` |
| `/cuenta/pedidos/:pedido` | Un pedido, con "Pagar" y "Cancelar el pedido" | `GET /cuenta/pedidos/{pedido}`, `POST .../pagos`, `POST .../cancelacion` |
| `/pagos/procesando` | Regreso de la pasarela y estado del intento | `GET /cuenta/pedidos/{pedido}` y `GET /cuenta/pagos/{pago}` |

Las rutas de `/cuenta` y `/pagos` piden una sesión con el rol `cliente`.

- **Carrito.** El detalle de un perfume agrega cada presentación (botella bajo pedido) y cada decant. El carrito vive en el store `cart` de Pinia y en `localStorage` bajo `archivum.carrito.<tienda>`, así que sobrevive a una recarga. No calcula un total: muestra el precio de la vitrina de cada línea solo como referencia.
- **Crear el pedido.** El cuerpo lleva solo identificadores y cantidades (`presentacion_id` y `cantidad`, o `botella_id` y `ml`), nunca un precio. Un 422 marca cada línea por su posición (`lineas.0.presentacion_id`). Un 409 por ml agotados no dice qué línea falló, así que el carrito vuelve a leer el detalle de cada perfume y marca los decants que la vitrina ya no ofrece. Un visitante ve "Inicie sesión para crear el pedido", que regresa al carrito.
- **El pedido** muestra el subtotal, lo que se cobra ahora, lo pagado y el saldo tal como los calcula la API; un pedido cancelado o vencido ya no debe nada, así que no muestra el saldo. Si no hay nada que cobrar, queda "Confirmado" sin pasar por la pasarela.
- **Pagar.** `POST /cuenta/pedidos/{pedido}/pagos` cobra lo que guardó la API: el depósito o el total mientras el pedido espera su pago, y el saldo cuando está listo. El botón queda ocupado (`aria-disabled`) desde el primer clic, así que un doble clic envía una sola solicitud, y la API además devuelve el pago pendiente si llega otra (#92). Una pista avisa antes que se abre la página de la pasarela. Con PayPal, antes de ir a la pasarela se muestra el monto en dólares de `monto_cobrado`, y el foco pasa a "Continuar al pago", que lee ese monto. Solo se sigue una dirección `http` o `https`.
- **Procesando.** La pasarela regresa a `PAYMENTS_RETURN_URL` (por defecto `http://localhost:5173/pagos/procesando`). La pestaña guarda en `sessionStorage` los identificadores del pedido y del intento, junto con el monto previamente pagado. Cada 3 s consulta el pedido y, mientras siga a la espera de acreditación, el intento. Un rechazo o vencimiento guardado por la API termina la espera y se anuncia en la página. El pago se confirma cuando la API acredita el pedido después de procesar un aviso verificado o la conciliación (#94, #96). La vista ignora `?estado=exito` y los demás parámetros de la dirección. Pasados 2 min de espera, indica que el estado se verá en «Mis pedidos». Un pago cancelado en la pasarela vuelve a `PAYMENTS_CANCEL_URL`, «Mis pedidos».
- **Mis pedidos** muestra el estado en español, lo pagado y el saldo (salvo en un pedido cancelado o vencido), y ofrece pagar o cancelar cuando la API lo admite. Mientras un pedido espera su pago, también muestra lo que se cobra ahora, que es el monto de su "Pagar". La API decide: si rechaza la cancelación, se muestra su 409.
- **Accesibilidad (AAA).** Cada pedido se nombra por su fecha y hora ("Pedido del 16 nov 2026, 10:42"), así que dos enlaces nunca dicen lo mismo, y su página tiene una ruta de enlaces (Mis pedidos › pedido). En una lista, "Pagar" y "Cancelar el pedido" leen el pedido al que pertenecen. "Cancelar el pedido" pregunta antes y lleva el foco a "No, mantener el pedido". Cuando un botón desaparece (quitar una línea del carrito o cancelar un pedido), el foco pasa al título de la página y una línea con `role="status"` dice qué pasó. "Procesando" dice cada estado en una sola línea con `role="status"`. El pedido muestra en negrita hasta cuándo se puede pagar (R25) y enlaza la ayuda sobre los montos y los estados.

## Citas de prueba

El cliente reserva, cambia de hora y cancela sus citas de prueba de olores ([#129](https://github.com/JAguilar4k/ArchivumParfums-Hexagonal/issues/129)). La API decide qué horas están libres, quién atiende y hasta cuándo se puede cambiar una cita; el navegador solo muestra lo que responde.

| Ruta | Vista | API |
|---|---|---|
| `/tiendas/:tienda/citas/nueva` | Reservar una cita de prueba | `GET /tiendas/{tienda}/servicios`, `GET /tiendas/{tienda}/disponibilidad`, `POST /tiendas/{tienda}/citas` |
| `/cuenta/citas` y `/cuenta/citas/pasadas` | "Mis citas", próximas y pasadas | `GET /cuenta/citas?periodo=proximas` o `pasadas` |
| `/cuenta/citas/:cita` | Una cita, con "Cambiar la hora" y "Cancelar la cita" | `GET /cuenta/citas/{cita}`, `POST .../cancelacion` |
| `/cuenta/citas/:cita/reprogramar` | Cambiar la hora de la cita | `GET /tiendas/{tienda}/disponibilidad`, `PATCH /cuenta/citas/{cita}` |

Las rutas de `/cuenta/citas` piden una sesión con el rol `cliente`. Reservar es una página de la tienda, abierta a todos: el visitante elige antes de iniciar sesión, y el personal de una tienda lee que las citas se reservan con una cuenta de cliente.

- **Reservar.** Con un solo servicio, la página lo nombra con su duración y su precio; con varios, se elige uno. Después del día, "Ver los horarios libres" pide `GET /tiendas/{tienda}/disponibilidad` y muestra cada hora con quién puede atenderla: el navegador nunca calcula un horario. Si una hora la atienden varias personas, se puede elegir una; si no, la API asigna a quien tenga menos citas ese día. Los perfumes se buscan en la vitrina y se eligen hasta el máximo del servicio (`maximo_perfumes`).
- **Horario tomado.** Un 409 deja el mensaje de la API ("Ese horario ya no está disponible."), vuelve a pedir los horarios del mismo día y lleva el foco a la primera hora que queda. El servicio, el día, la persona y los perfumes se conservan. Un 422 marca su campo, también el grupo de los perfumes.
- **Visitante.** "Inicie sesión para reservar" guarda la elección en la ruta de regreso (`servicio`, `fecha`, `inicio`, `persona` y `perfumes`); al volver, la página la recupera y pide otra vez los horarios de ese día. El detalle de un perfume ofrece "Reservar una cita para probar" con ese perfume ya elegido.
- **Hora de la tienda.** Las horas se leen tal como las escribe la API, con el desfase de la tienda: `2026-11-21T09:00:00-06:00` es "9:00 a. m." en cualquier zona del navegador (`src/features/appointments/time.ts`). El primer día que se puede elegir es hoy en la zona del perfil de la tienda (`zona_horaria`).
- **Mis citas** separa las próximas de las pasadas y escribe el estado en español ("No asistió" para `no_asistio`). Una cita confirmada o apartada que todavía no empieza ofrece "Cambiar la hora" y "Cancelar la cita". El plazo para hacerlo lo decide la API: el cliente no repite esa regla y muestra el mensaje de su 409.
- **Cambiar la hora** abre con los horarios libres del día de la cita, de la misma persona y en la misma tienda (`tienda.slug` de la cita), y se puede pedir otro día. Envía solo la hora nueva (`inicia_en`); un 409 vuelve a pedir los horarios, como al reservar.
- **Accesibilidad (AAA).** Cada cita se nombra por su día y su hora ("Cita del sábado, 21 de noviembre de 2026, 9:00 a. m."), y su página tiene una ruta de enlaces (Mis citas › cita). En "Mis citas", todo estado distinto de confirmada se suma al enlace, así que una hora reservada otra vez después de cancelarla no repite su texto. Las horas son un grupo de opciones con su leyenda, y cada opción entera, con su texto, es el objetivo de 44 px. Cuántos horarios hay y cuántos perfumes se eligieron se anuncia con `role="status"`; al quitar un perfume, el foco pasa al conteo. "Cancelar la cita" pregunta antes y lleva el foco a "No, mantener la cita"; después de cancelar, el foco pasa al título y un aviso dice que se canceló. "Ayuda y glosario" explica las citas y cada estado.

## Estados de una vista

Toda vista que pide datos muestra tres estados con los componentes de `src/shared`: `LoadingState` mientras espera, `ErrorState` si falla (con el aviso de `ProblemNotice` y, si tiene sentido, el botón "Intentar de nuevo") y `EmptyState` si no hay nada que mostrar. `useApiData` lleva esos estados:

```vue
<script setup lang="ts">
import { onMounted } from 'vue'

import { api } from '@/api/client'
import { callApi } from '@/api/problem'
import EmptyState from '@/shared/EmptyState.vue'
import ErrorState from '@/shared/ErrorState.vue'
import LoadingState from '@/shared/LoadingState.vue'
import { useApiData } from '@/shared/useApiData'

const perfumes = useApiData(
  () => callApi(() => api.GET('/tiendas/{tienda}/perfumes', { params: { path: { tienda: 'archivum' } } })),
  (page) => page.data.length === 0,
)

onMounted(perfumes.reload)
</script>

<template>
  <LoadingState v-if="perfumes.loading.value" />
  <ErrorState v-else-if="perfumes.problem.value" :problem="perfumes.problem.value" @retry="perfumes.reload" />
  <EmptyState v-else-if="perfumes.empty.value" message="La tienda todavía no publica perfumes." />
  <ul v-else-if="perfumes.data.value">...</ul>
</template>
```

`src/shared/__tests__/ExampleListView.vue` es el ejemplo completo, con sus pruebas.

## Accesibilidad

El cliente apunta a WCAG 2.2 en el nivel AAA ([#126](https://github.com/JAguilar4k/ArchivumParfums-Hexagonal/issues/126)). La base vale para todas las vistas:

- **Estilos** (`src/styles/base.css`): texto con contraste de al menos 7:1 y bordes de los controles con 3:1; interlineado de 1.5, párrafos de hasta 70 caracteres y texto alineado a la izquierda; botones, campos y enlaces sueltos de al menos 44 × 44 px; anillo de foco de 3 px; sin animaciones cuando el sistema pide menos movimiento, y los colores del sistema en el modo de contraste alto. Las medidas van en `rem`, así que la página crece con el texto hasta el 200 % y se reacomoda desde 320 px de ancho.
- **Marco de la página** (`App.vue`): el enlace "Saltar al contenido", la cabecera con la sesión y un solo `main` (`#contenido`). Las vistas no declaran otro `main`.
- **Título y foco al navegar** (`src/shared/pageChanges.ts`). Cada ruta declara `meta.title`. Al navegar, la pestaña muestra ese título junto con la tienda, el foco pasa al `h1` y un anunciador con `role="status"` lee el nombre de la página. Los cambios de consulta dejan el foco a cargo de la vista. `usePageTitle()` precisa el título cuando llegan los datos, como el nombre de un perfume.
- **Botones que esperan una respuesta**: llevan `aria-disabled="true"` en lugar de `disabled`, para que el foco no se pierda, y la función ignora el segundo clic.
- **Avisos**: los errores usan `role="alert"`; los demás mensajes, una región `.status-message` o `.results-summary` con `role="status"` que existe desde el principio, para que el lector de pantalla la lea al cambiar.
- **Ayuda en los campos** ([#128](https://github.com/JAguilar4k/ArchivumParfums-Hexagonal/issues/128)): una pista con `field-hint` y un id, que `fieldAttributes(problem, campo, 'pista-campo')` une al control junto con su error. En un grupo de opciones (`fieldset`), `groupAttributes(problem, campo, 'pista-campo')` une la pista y el error al grupo, sin `aria-invalid`, que un `fieldset` no admite (#129).
- **Palabras difíciles y abreviaturas** (#128): la página "Ayuda y glosario" las explica y el pie de cada página la enlaza. Las abreviaturas se escriben completas la primera vez o con `<abbr title="…">`.
- **Enlaces a una parte de una página** (#128): con `#id` en la ruta, el foco va a ese elemento, que lleva `tabindex="-1"`, en lugar del inicio del contenido.

Clases de apoyo: `page` (columna de una vista), `page-section`, `form`, `form-field`, `field-hint`, `form-actions`, `checkbox-field` (casilla con su texto, toda clicable), `choice-group` y `choice` (grupo de opciones de radio, cada una clicable con su texto y su detalle), `sub-nav` (enlaces entre páginas hermanas, como "Próximas" y "Pasadas"), `action-link` (enlace fuera de una oración, con la altura de un botón), `button` y `button--secondary`, `prose` (bloques de texto, con dos líneas y media entre párrafos), `results-summary`, `card-list` y `card`, `breadcrumbs`, `facts` (pares de nombre y valor), `glossary` y `visually-hidden`.

Para revisar una vista a mano: recorrerla solo con el teclado (Tab, Mayús+Tab, Enter y Espacio), ampliarla al 200 % y verla a 320 px de ancho.

## Errores de la API

Ninguna vista muestra el JSON de un error. `src/api/problem.ts` ([#127](https://github.com/JAguilar4k/ArchivumParfums-Hexagonal/issues/127)) interpreta cada respuesta fallida y devuelve un `ApiProblem` con su tipo (`kind`), el texto en español que se muestra, los mensajes de cada campo y el identificador de la solicitud:

| Respuesta | `kind` | Qué se muestra |
|---|---|---|
| 422 `datos-invalidos` | `validation` | El `detail` y, junto a cada control, los mensajes de su campo en `errores`; el foco va al primer campo con error. |
| 401 | `unauthenticated` | Lo atiende la sesión (#126). |
| 403 | `forbidden` | La vista "Sin permiso". |
| 404 | `not-found` | La vista "No encontrado". |
| 409 `conflicto` y cualquier otro problema | `conflict`, `other` | El `detail`, o el `title` si no trae `detail`. |
| 429 | `rate-limited` | En cuánto tiempo volver a intentar, según `Retry-After`. |
| 500 `error-interno` o una respuesta que no es `application/problem+json` | `internal` | Un mensaje genérico con el identificador de la solicitud para soporte. |
| Sin respuesta (falla de red) | `network` | Un mensaje genérico con el identificador de la solicitud para soporte. |

El cliente envía su propio `X-Request-Id` (un UUID nuevo en cada solicitud), así que conoce el identificador aunque no llegue respuesta: una solicitud sin respuesta lanza `NetworkError` con él. Con respuesta, el identificador sale de `instance` (`urn:uuid:...`) o del encabezado `X-Request-Id`, que la API expone por CORS junto con `Retry-After`.

`callApi` hace la llamada y nunca lanza: devuelve los datos o el problema. `ProblemNotice` muestra el problema en un aviso con `role="alert"`, o la vista que corresponde a un 403 o un 404:

```vue
<script setup lang="ts">
import { ref } from 'vue'

import { api } from '@/api/client'
import { callApi, type ApiProblem } from '@/api/problem'
import ProblemNotice from '@/shared/ProblemNotice.vue'

const problem = ref<ApiProblem | null>(null)

async function load() {
  const result = await callApi(() =>
    api.GET('/tiendas/{tienda}', { params: { path: { tienda: 'archivum' } } }),
  )
  problem.value = result.problem
}
</script>

<template>
  <ProblemNotice v-if="problem" :problem="problem" />
</template>
```

En un formulario, cada control lleva `name` igual a su campo de la API y `v-bind="fieldAttributes(problem, 'correo')"` (`aria-invalid` y `aria-describedby`), y `<FieldError :problem="problem" field="correo" />` muestra sus mensajes. Después de un 422, `focusFirstInvalidField(form, problem)` lleva el foco al primer control con error. `src/shared/__tests__/ExampleForm.vue` es un ejemplo completo.

## Estructura

```
ArchivumParfums-Web/
├── .env.example          variables de entorno del cliente
├── env.d.ts              tipos de las variables de entorno
├── index.html
├── openapi/              contrato v1 y commit de origen
├── src/
│   ├── main.ts           crea la aplicación con Pinia, la sesión, los estilos y Vue Router
│   ├── App.vue           marco de la página: "Saltar al contenido", cabecera, main, pie y anunciador
│   ├── styles/base.css   estilos base para WCAG 2.2 AAA
│   ├── router/           routes.ts junta las rutas de cada funcionalidad e index.ts crea el router
│   ├── api/              schema.ts (generado), client.ts, el cliente tipado de la API,
│   │                     y problem.ts, que interpreta sus errores
│   ├── features/         una carpeta por funcionalidad
│   │   ├── storefront/   perfil de la tienda, vitrina con filtros y detalle de un perfume
│   │   ├── recommendations/  recomendador con IA o por reglas
│   │   ├── cart/         carrito de cada tienda y creación del pedido
│   │   ├── orders/       pedidos del cliente, pago, cancelación y "procesando"
│   │   ├── appointments/ citas de prueba: reservar, "Mis citas", cambiar la hora y cancelar
│   │   ├── help/         "Ayuda y glosario"
│   │   ├── session/      store de la sesión, guardias por rol, "Iniciar sesión" y menú
│   │   ├── platform/     "Tiendas de la plataforma", para quien la administra (#347)
│   │   ├── registration/ "Crear cuenta" con el aviso de privacidad
│   │   └── errors/       rutas de "Sin permiso" y "No encontrado"
│   └── shared/           lo que usan varias funcionalidades: config.ts, money.ts,
│                         navigation.ts, ProblemNotice,
│                         FieldError, las vistas "Sin permiso" y "No encontrado",
│                         LoadingState, ErrorState, EmptyState, useApiData,
│                         MlAmount (cantidad en ml) y pageChanges.ts (título y
│                         foco al navegar)
└── vite.config.ts
```

El código se organiza por funcionalidad. Cada una vive en `src/features/<funcionalidad>` con sus vistas, sus componentes, sus stores de Pinia, un `routes.ts` con sus rutas y una carpeta `__tests__` con sus pruebas. Lo que usan varias funcionalidades va en `src/shared`. Para agregar una funcionalidad:

1. Crear `src/features/<funcionalidad>/` con su vista y su `routes.ts`, como `src/features/storefront`.
2. Sumar sus rutas en `src/router/routes.ts`, antes de `errorRoutes`, que atrapa toda ruta que no existe.
3. Escribir sus pruebas en `src/features/<funcionalidad>/__tests__/`.

## Idioma

El código, los nombres y los comentarios van en inglés. Los textos de la interfaz están en español. [Convenciones del proyecto](AGENTS.md).

## Uso de IA

El registro de asistencia y revisiones previo a la separación está en el README del proyecto original. [Registro de Uso de IA](https://github.com/JAguilar4k/ArchivumParfums-Hexagonal/blob/aa5d6f596f3694ba0c3cbffa957bc81eb391de1c/README.md#uso-de-ia).

| Parte | Asistente | Qué generó la IA | Qué verificó el equipo |
|---|---|---|---|
| Un solo `.env` con el backend ([#349](https://github.com/JAguilar4k/ArchivumParfums-Hexagonal/issues/349)) | Claude Code | `envDir` en `vite.config.ts` hacia `../ArchivumParfums-Hexagonal/archivum-api-hexagonal` cuando ese `.env` existe, y la documentación. | Se compiló con el `.env` del backend al lado y sin él: en el primer caso el bundle toma `VITE_API_URL` de ese archivo y no contiene su `APP_KEY` ni nombres de la base; en el segundo usa el `.env` propio. Lint, tipos y Vitest (215 pruebas) pasan. Revisión humana pendiente. |
| Separación del cliente web | Codex | Extracción del historial, configuración de CI y Dependabot, copia versionada del contrato y actualización de las instrucciones de instalación. | Codex verificó el contrato, lint, tipos, compilación, las 210 pruebas de Vitest, los 16 recorridos de Playwright y la auditoría con el umbral de CI. Revisión humana pendiente. |
| Enlace de WhatsApp de la tienda ([#166](https://github.com/JAguilar4k/ArchivumParfums-Hexagonal/issues/166)) | Codex y Claude Code | Codex escribió la validación de `VITE_STORE_WHATSAPP` (código de país, `+` inicial opcional, hasta 15 dígitos) y sus pruebas. Claude Code la trasladó desde el backend. | Lint, tipos y las 215 pruebas de Vitest pasaron en una copia limpia. Revisión humana pendiente. |
| Fotos de perfumes desde Cloudflare R2 ([#340](https://github.com/JAguilar4k/ArchivumParfums-Hexagonal/issues/340)) | Codex y Claude Code | Codex escribió `srcset`, `sizes` y el respaldo a la foto original en `PerfumeArt`, la tarjeta y el detalle, con sus pruebas. Claude Code los trasladó desde el backend con el contrato de #341. | `api:check`, lint, tipos, las 216 pruebas de Vitest y los 5 recorridos de `e2e/catalog.spec.ts` pasaron. Revisión humana pendiente. |
| Tiendas de la plataforma ([#347](https://github.com/JAguilar4k/ArchivumParfums-Hexagonal/issues/347)) | Claude Code | La vista "Tiendas de la plataforma" con su ruta para el rol `administrador_plataforma`, el enlace del menú, el destino al iniciar sesión, los tipos regenerados con el contrato del backend, las pruebas de Vitest y las de Playwright con axe. | `npm run api:check`, `lint`, `type-check`, las 216 pruebas de Vitest, `build` y los 17 recorridos de Playwright pasan en local, con 0 hallazgos de axe en la vista en tema claro y oscuro a 1280 y 390 px y sin desborde a 320 px. Revisión humana pendiente. |
