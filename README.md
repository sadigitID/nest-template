# NestJS Template

[NestJS](https://nestjs.com/) adalah framework backend untuk Node.js yang terinspirasi dari Angular. NestJS mempermudah pembuatan REST API yang terstruktur, scalable, dan mudah di-maintain karena menggunakan konsep **module**, **controller**, dan **service** untuk memisahkan tanggung jawab kode secara rapi.

Template ini adalah starter project NestJS yang sudah dikonfigurasi lengkap dan siap pakai. Kamu tinggal clone, install, dan langsung mulai coding fitur tanpa perlu setup dari nol. Semua best practice (TypeScript strict mode, linting, formatting, testing, CI/CD, Docker) sudah terpasang.

## Tech Stack

| Teknologi                                                     | Versi | Fungsi                          |
| ------------------------------------------------------------- | ----- | ------------------------------- |
| [NestJS](https://nestjs.com/)                                 | 11    | Backend framework               |
| [TypeScript](https://www.typescriptlang.org/)                 | 5.7   | Type safety (strict mode)       |
| [Swagger](https://swagger.io/)                                | -     | API documentation               |
| [class-validator](https://github.com/typestack/class-validator) | 0.14  | DTO validation                  |
| [class-transformer](https://github.com/typestack/class-transformer) | 0.5 | DTO transformation              |
| [Helmet](https://helmetjs.github.io/)                         | 8     | Security headers                |
| [Throttler](https://docs.nestjs.com/security/rate-limiting)   | 6     | Rate limiting                   |
| [Jest](https://jestjs.io/)                                    | 29    | Unit & E2E testing              |
| [Supertest](https://github.com/ladjs/supertest)               | 7     | HTTP testing                    |
| [ESLint](https://eslint.org/)                                 | 9     | Code linting                    |
| [Prettier](https://prettier.io/)                              | 3     | Code formatting                 |
| [Husky](https://typicode.github.io/husky/)                    | 9     | Git hooks manager               |
| [Commitlint](https://commitlint.js.org/)                      | 20    | Commit message linting          |
| [Docker](https://www.docker.com/)                             | -     | Containerization                |
| [GitHub Actions](https://github.com/features/actions)         | -     | CI/CD                           |

## Fitur

- REST API dengan CRUD lengkap (contoh: Users module)
- Swagger/OpenAPI documentation otomatis
- Validation & transformation DTO
- Global exception filter dengan response terstruktur
- Global response interceptor (standar API response)
- Rate limiting (throttler)
- Security headers (helmet)
- CORS configuration
- Modular architecture (feature-based modules)
- Custom pipes, guards, decorators, dan interceptors
- Unit test & E2E test
- CI/CD pipeline (GitHub Actions)
- Docker & Docker Compose ready
- Git hooks (Husky + lint-staged + commitlint)

## Quick Start

### Prasyarat

- [Node.js](https://nodejs.org/) >= 22
- [pnpm](https://pnpm.io/) >= 9

### Membuat Project Baru

> **Apa itu `degit`?** `degit` adalah tool untuk meng-clone repository GitHub tanpa history git-nya. Jadi kamu dapat project bersih, siap dijadikan project baru. Tidak perlu install `degit` secara global — `npx` akan otomatis menjalankannya.
>
> **Kenapa `pnpm`?** `pnpm` adalah package manager yang lebih cepat dan hemat disk dibandingkan `npm`. Jika belum terinstall, jalankan `npm install -g pnpm` terlebih dahulu.

```bash
# Clone template (download tanpa history git)
npx degit sadigitid/nest-template nama-project
cd nama-project

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Jalankan dev server
pnpm run dev
```

API berjalan di [http://localhost:3000/api](http://localhost:3000/api).
Swagger docs di [http://localhost:3000/docs](http://localhost:3000/docs).

> **Catatan:** Swagger docs ada di `/docs` (bukan `/api/docs`). Path Swagger terpisah dari global prefix `/api` yang digunakan oleh endpoint API.

## Coba API Pertamamu

Setelah dev server berjalan, coba langkah-langkah berikut untuk memastikan semuanya bekerja:

### 1. Buka Swagger UI

Buka browser dan akses [http://localhost:3000/docs](http://localhost:3000/docs). Di sini kamu bisa melihat semua endpoint yang tersedia, mencoba request langsung dari browser, dan melihat format request/response.

### 2. Cek Health Endpoint

```bash
curl http://localhost:3000/api/health
```

Response yang diharapkan:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Buat User Baru

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### 4. Lihat Daftar Users

```bash
curl http://localhost:3000/api/users
```

> **Tips:** Kalau tidak terbiasa dengan `curl`, kamu juga bisa menggunakan [Postman](https://www.postman.com/) atau langsung klik "Try it out" di Swagger UI.

## Konsep Dasar NestJS

Jika kamu baru pertama kali menggunakan NestJS, berikut konsep-konsep penting yang perlu dipahami:

| Konsep | Penjelasan |
| --- | --- |
| **Module** | "Wadah" yang mengelompokkan fitur terkait (controller + service). Setiap fitur (users, products, dll) punya module-nya sendiri. Mirip seperti folder yang mengorganisir kode per fitur. |
| **Controller** | Bertugas menerima HTTP request dan mengembalikan response. Controller **tidak boleh** berisi business logic — tugasnya hanya "terima request, panggil service, kembalikan hasilnya". |
| **Service** | Tempat semua **business logic** berada. Misalnya: validasi data, cek duplikasi, kalkulasi, dsb. Service di-inject ke controller melalui constructor. |
| **DTO (Data Transfer Object)** | Class yang mendefinisikan **bentuk data** yang diterima oleh API. DTO juga berisi aturan validasi (wajib diisi, harus email, minimal 2 karakter, dsb). |
| **Decorator** | Anotasi khusus (diawali `@`) yang menambahkan metadata atau perilaku pada class/method/property. Contoh: `@Controller()`, `@Get()`, `@Body()`, `@Injectable()`. |
| **Guard** | "Penjaga" yang menentukan apakah sebuah request boleh dilanjutkan atau tidak. Biasanya digunakan untuk authentication & authorization. |
| **Interceptor** | Code yang berjalan **sebelum dan sesudah** handler (controller method). Digunakan untuk transformasi response, logging, caching, dsb. |
| **Pipe** | Digunakan untuk **transformasi** dan **validasi** data input sebelum masuk ke handler. Contoh: `ParseUuidPipe` memastikan parameter adalah UUID yang valid. |
| **Filter** | Menangkap exception/error dan mengubahnya menjadi response yang terstruktur. Template ini punya `HttpExceptionFilter` yang memformat semua error menjadi JSON yang konsisten. |
| **Dependency Injection (DI)** | Pattern di mana NestJS otomatis menyediakan ("meng-inject") instance yang dibutuhkan. Kamu cukup deklarasikan di constructor, NestJS yang membuat dan menyediakannya. |

## Struktur Project

```
nest-template/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI pipeline
├── .husky/
│   ├── pre-commit                 # Hook: lint-staged sebelum commit
│   └── commit-msg                 # Hook: validasi format commit message
├── src/
│   ├── common/                    # Shared code (cross-cutting concerns)
│   │   ├── decorators/            # Custom decorators
│   │   │   ├── client-ip.decorator.ts
│   │   │   └── public.decorator.ts
│   │   ├── dto/                   # Shared DTOs
│   │   │   └── pagination.dto.ts
│   │   ├── exceptions/            # Custom exceptions
│   │   │   └── business.exception.ts
│   │   ├── filters/               # Exception filters
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/                # Auth guards (ready to use)
│   │   ├── interceptors/          # Interceptors
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── interfaces/            # Shared interfaces
│   │   │   └── response.interface.ts
│   │   ├── pipes/                 # Custom pipes
│   │   │   └── parse-uuid.pipe.ts
│   │   └── utils/                 # Utility functions
│   │       └── helpers.ts
│   ├── config/                    # Configuration
│   │   └── app.config.ts
│   ├── modules/                   # Feature modules
│   │   ├── health/                # Health check module
│   │   │   ├── health.controller.ts
│   │   │   ├── health.module.ts
│   │   │   └── health.service.ts
│   │   └── users/                 # Users CRUD module (example)
│   │       ├── dto/
│   │       │   ├── create-user.dto.ts
│   │       │   └── update-user.dto.ts
│   │       ├── entities/
│   │       │   └── user.entity.ts
│   │       ├── users.controller.ts
│   │       ├── users.module.ts
│   │       └── users.service.ts
│   ├── app.module.ts              # Root module
│   └── main.ts                    # Entry point
├── test/
│   ├── e2e/                       # E2E tests (Supertest)
│   │   └── app.e2e-spec.ts
│   ├── unit/                      # Unit tests (Jest)
│   │   ├── health.spec.ts
│   │   └── users.spec.ts
│   └── jest-e2e.json              # Jest E2E config
├── .env.example                   # Environment variable template
├── .gitignore                     # Git ignore rules
├── .prettierignore                # Prettier ignore rules
├── .prettierrc.json               # Prettier config
├── CLAUDE.md                      # AI code review guidelines
├── commitlint.config.mjs          # Commitlint config
├── docker-compose.yml             # Docker Compose config
├── Dockerfile                     # Docker build config
├── eslint.config.mjs              # ESLint flat config
├── nest-cli.json                  # NestJS CLI config
├── package.json                   # Dependencies & scripts
├── README.md                      # Project documentation
├── RULES.md                       # Development rules & conventions
├── tsconfig.build.json            # TypeScript build config
└── tsconfig.json                  # TypeScript config
```

## NPM Scripts

### Development

| Command              | Deskripsi                           |
| -------------------- | ----------------------------------- |
| `pnpm run dev`       | Jalankan dev server (watch mode)    |
| `pnpm run start`     | Jalankan server                     |
| `pnpm run start:debug` | Jalankan server dengan debugger   |
| `pnpm run build`     | Build untuk production              |
| `pnpm run start:prod` | Jalankan production build          |

### Code Quality

| Command                | Deskripsi                          |
| ---------------------- | ---------------------------------- |
| `pnpm run lint`        | Jalankan ESLint                    |
| `pnpm run lint:fix`    | Auto-fix ESLint errors             |
| `pnpm run format`      | Format semua file dengan Prettier  |
| `pnpm run format:check`| Cek formatting tanpa mengubah file |
| `pnpm run type-check`  | TypeScript type checking           |

### Testing

| Command              | Deskripsi                                  |
| -------------------- | ------------------------------------------ |
| `pnpm run test`      | Jalankan unit tests                        |
| `pnpm run test:watch`| Jalankan unit tests (watch mode)           |
| `pnpm run test:cov`  | Jalankan unit tests dengan coverage report |
| `pnpm run test:e2e`  | Jalankan E2E tests                         |

## API Endpoints

### Health

| Method | Endpoint      | Deskripsi         |
| ------ | ------------- | ----------------- |
| GET    | `/api/health` | Health check      |

### Users

| Method | Endpoint          | Deskripsi                    |
| ------ | ----------------- | ---------------------------- |
| POST   | `/api/users`      | Buat user baru               |
| GET    | `/api/users`      | Daftar user (dengan paginasi)|
| GET    | `/api/users/:id`  | Detail user by ID            |
| PUT    | `/api/users/:id`  | Update user                  |
| DELETE | `/api/users/:id`  | Hapus user                   |

## Environment Variables

| Variable        | Default        | Deskripsi                    |
| --------------- | -------------- | ---------------------------- |
| `APP_NAME`      | `NestJS API`   | Nama aplikasi                |
| `APP_PREFIX`    | `api`          | Global route prefix          |
| `NODE_ENV`      | `development`  | Environment                  |
| `HOST`          | `0.0.0.0`      | Host binding                 |
| `PORT`          | `3000`         | Port server                  |
| `CORS_ORIGIN`   | `*`            | Allowed CORS origins         |

## Panduan Penggunaan

### Menambahkan Module Baru

1. Buat folder di `src/modules/`:

```
src/modules/products/
├── dto/
│   ├── create-product.dto.ts
│   └── update-product.dto.ts
├── entities/
│   └── product.entity.ts
├── products.controller.ts
├── products.module.ts
└── products.service.ts
```

2. Atau gunakan NestJS CLI:

```bash
nest generate module modules/products
nest generate controller modules/products
nest generate service modules/products
```

3. Import module di `app.module.ts`:

```typescript
import { ProductsModule } from '@modules/products/products.module';

@Module({
  imports: [
    // ...existing imports
    ProductsModule,
  ],
})
export class AppModule {}
```

### Menambahkan Database (TypeORM)

1. Install dependencies:

```bash
pnpm add @nestjs/typeorm typeorm pg
```

2. Uncomment konfigurasi database di dua file berikut:

   - **`.env`** — hapus tanda `#` pada variabel `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, dan `DB_NAME`
   - **`src/config/app.config.ts`** — hapus comment pada blok `database: { ... }` (baris 16-22)

3. Import TypeORM di `app.module.ts`:

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
  ],
})
```

## Docker

### Build dan jalankan dengan Docker:

```bash
# Build image
docker build -t nest-template .

# Jalankan container
docker run -p 3000:3000 nest-template
```

### Dengan Docker Compose:

```bash
docker compose up -d
```

## CI/CD

Project ini menyertakan GitHub Actions workflow (`.github/workflows/ci.yml`) yang otomatis dijalankan pada setiap push dan pull request ke branch `main`:

1. **Lint** - ESLint check
2. **Type Check** - TypeScript check
3. **Unit Tests** - Jest
4. **E2E Tests** - Supertest
5. **Build** - Production build (setelah lint, type-check, dan test lulus)

## Git Hooks (Husky)

### Pre-commit

Otomatis menjalankan `lint-staged` yang akan:

- ESLint + auto-fix untuk file `*.ts`
- Prettier formatting untuk semua file yang di-stage

### Commit Message

Menggunakan [Commitlint](https://commitlint.js.org/) dengan format [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add product module with CRUD"
git commit -m "fix: resolve validation error on user creation"
git commit -m "refactor: extract pagination logic to shared utility"
```

## Lisensi

MIT

## Referensi

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [class-validator](https://github.com/typestack/class-validator)
- [Jest](https://jestjs.io/)
- [Swagger/OpenAPI](https://swagger.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- **[RULES.md](./RULES.md)** - Aturan development lengkap
- **[CLAUDE.md](./CLAUDE.md)** - Panduan untuk AI code review tools (seperti Claude, GitHub Copilot, dsb). File ini **bukan untuk dibaca manusia** — isinya instruksi teknis agar AI bisa membantu review kode sesuai standar project ini.
