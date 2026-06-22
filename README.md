# RDPR OS

Sistema SaaS ERP modular para pequeñas y medianas empresas.

---

## 🚀 Inicio rápido

### 1. Clonar e instalar dependencias

```bash
cd C:\Users\X\Desktop\RDPR-OS
npm install
```

### 2. Configurar variables de entorno

```bash
copy .env.example .env.local
```

Edita `.env.local` y rellena al menos:

```
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/rdpr_os"
NEXTAUTH_SECRET="cadena-aleatoria-de-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"
```

> Para generar un NEXTAUTH_SECRET puedes usar:
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 3. Crear la base de datos

Necesitas PostgreSQL instalado localmente o usar [Supabase](https://supabase.com) (gratuito).

```bash
# Generar cliente Prisma
npm run db:generate

# Crear tablas en la base de datos
npm run db:push
```

### 4. Iniciar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 📁 Estructura del proyecto

```
RDPR-OS/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Página de login
│   │   └── register/       # Registro de empresa
│   ├── (dashboard)/
│   │   ├── page.tsx        # Dashboard principal
│   │   ├── crm/            # Gestión de clientes
│   │   ├── projects/       # Proyectos y tareas
│   │   ├── invoices/       # Facturación
│   │   ├── documents/      # Documentos
│   │   └── settings/       # Configuración
│   └── api/
│       ├── auth/           # Register, NextAuth
│       ├── customers/      # API CRM
│       ├── projects/       # API Proyectos
│       ├── invoices/       # API Facturación
│       └── documents/      # API Documentos
├── components/
│   ├── layout/             # Sidebar, Header
│   ├── ui/                 # Componentes reutilizables
│   └── modules/            # Componentes por módulo
├── lib/
│   ├── prisma/             # Cliente de base de datos
│   ├── auth/               # Configuración NextAuth
│   ├── stripe/             # Pagos
│   └── utils/              # Helpers
├── prisma/
│   └── schema.prisma       # Esquema de base de datos
├── types/
│   └── index.ts            # Tipos TypeScript
└── styles/
    └── globals.css         # Estilos globales
```

---

## 🗄️ Módulos MVP

| Módulo       | Estado    | Ruta                    |
|--------------|-----------|-------------------------|
| Empresa      | ✅ Listo  | `/dashboard/settings`   |
| CRM          | ✅ Listo  | `/dashboard/crm`        |
| Proyectos    | ✅ Listo  | `/dashboard/projects`   |
| Facturación  | ✅ Listo  | `/dashboard/invoices`   |
| Documentos   | 🔜 Próximo| `/dashboard/documents`  |
| IA           | 🔜 Futuro | —                       |

---

## 🛠️ Stack tecnológico

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de datos**: PostgreSQL + Prisma ORM
- **Autenticación**: NextAuth v5
- **Pagos**: Stripe
- **Almacenamiento**: Cloudflare R2 / Amazon S3
- **Hosting**: Vercel

---

## 📋 Comandos útiles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run db:generate  # Regenerar cliente Prisma
npm run db:push      # Sincronizar schema con DB
npm run db:migrate   # Crear migración
npm run db:studio    # UI visual de la base de datos
```

---

## 🔒 Seguridad

- Separación total de datos entre empresas (multi-tenant)
- Validación backend con Zod
- Contraseñas hasheadas con bcrypt (12 rounds)
- Sesiones JWT seguras
- HTTPS obligatorio en producción

---

## 📈 Roadmap

- [ ] Módulo Documentos completo con upload
- [ ] Generación de PDF de facturas
- [ ] Notificaciones por email
- [ ] Módulo IA (presupuestos automáticos)
- [ ] Módulo Restaurante
- [ ] Módulo Comercio / Inventario
- [ ] Módulo RRHH
- [ ] Marketplace de módulos
