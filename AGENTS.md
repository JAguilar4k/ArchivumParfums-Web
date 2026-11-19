# ArchivumParfums Web

Cliente Vue 3 con TypeScript, Vite, Vue Router y Pinia para el proyecto ISW-621 de la UTN. Antes de trabajar, leé la [especificación](https://github.com/JAguilar4k/ArchivumParfums-Hexagonal/blob/main/docs/especificacion.md) y el [plan](https://github.com/JAguilar4k/ArchivumParfums-Hexagonal/blob/main/docs/plan.md). El enunciado del curso está en `docs/enunciado.pdf` en la copia local del backend.

- Seguí las convenciones de [SodaYa-Hexagonal](https://github.com/BryanChavesSalas/SodaYa-Hexagonal), que es de solo lectura. Si necesitás clonarlo, usá `--depth 1` en una carpeta temporal fuera del proyecto y quitá su remoto.
- La SPA consume la API `/api/v1`. Los permisos, los importes, la disponibilidad y el estado de los pagos se resuelven en el backend.
- Organizá las vistas y los componentes por funcionalidad en `src/features/`. El código y los comentarios van en inglés y los mensajes al usuario, en español.
- Versioná `openapi/v1.json` y `openapi/source.txt` junto a los tipos generados. Seguí las instrucciones del [README](README.md) para actualizarlos. Conservá `.env.example` al día y los `.env` locales fuera de Git. Usá datos ficticios y medios de pago en sandbox.
- Trabajá desde un issue y entregá por pull request con revisión de otra persona. Usá Conventional Commits con `Refs: #N` (o `Refs: propietario/repositorio#N` si el issue vive en otro repositorio) y agregá `Closes #N` a la descripción del PR cuando corresponda.
- Verificá el contrato, lint, tipos, pruebas, build y los recorridos Playwright. Registrá en «Uso de IA» del README qué se generó y qué verificó el equipo.
