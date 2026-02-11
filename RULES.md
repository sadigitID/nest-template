# Aturan Development - NestJS Template

Dokumen ini mendefinisikan aturan dan standar development untuk project NestJS. Semua anggota tim wajib mengikuti panduan ini.

> **Istilah yang sering muncul dalam dokumen ini:**
>
> - **DTO (Data Transfer Object)** — Class yang mendefinisikan bentuk/format data yang diterima atau dikirim API. DTO juga berisi aturan validasi input (wajib diisi, harus email, dsb).
> - **DI (Dependency Injection)** — Pattern di mana NestJS otomatis menyediakan instance class yang dibutuhkan. Kamu cukup tulis di constructor, NestJS yang membuat dan menyediakannya.
> - **DI Container** — Sistem internal NestJS yang mengelola semua instance (service, controller, dsb) dan meng-inject-nya saat dibutuhkan.
> - **Cross-cutting concerns** — Kode yang dibutuhkan di banyak tempat tapi bukan bagian dari fitur spesifik. Contoh: logging, error handling, validasi, security. Di template ini, kode tersebut ada di folder `src/common/`.
> - **`registerAs`** — Fungsi dari `@nestjs/config` untuk membuat konfigurasi yang typed dan terkelompok. Lihat contohnya di `src/config/app.config.ts`.
> - **`!` (Definite Assignment Assertion)** — Tanda seru setelah nama property di TypeScript (contoh: `name!: string`). Ini memberitahu TypeScript bahwa property ini pasti akan diisi (oleh class-validator), meskipun tidak diisi di constructor.

## Daftar Isi

- [Prinsip Umum](#prinsip-umum)
- [Aturan Arsitektur](#aturan-arsitektur)
- [Aturan Penamaan File](#aturan-penamaan-file)
- [Aturan Struktur Folder](#aturan-struktur-folder)
- [Aturan Controller](#aturan-controller)
- [Aturan Service](#aturan-service)
- [Aturan DTO & Validation](#aturan-dto--validation)
- [Aturan Module](#aturan-module)
- [Aturan TypeScript](#aturan-typescript)
- [Aturan Error Handling](#aturan-error-handling)
- [Aturan Testing](#aturan-testing)
- [Aturan Git Workflow](#aturan-git-workflow)
- [Aturan Code Style](#aturan-code-style)
- [Aturan Keamanan](#aturan-keamanan)
- [Aturan Performa](#aturan-performa)
- [Checklist Sebelum Commit](#checklist-sebelum-commit)

---

## Prinsip Umum

Berikut adalah prinsip-prinsip dasar yang menjadi fondasi semua aturan di dokumen ini. Jika ragu, selalu kembali ke prinsip-prinsip ini:

1. **Readability First** - Code dibaca lebih sering daripada ditulis
2. **Explicit over Implicit** - Buat niat sejelas mungkin
3. **Separation of Concerns** - Controller, Service, dan Module punya tanggung jawab masing-masing
4. **Type Safety** - Manfaatkan TypeScript strict mode sepenuhnya
5. **Immutability** - Hindari mutasi, gunakan spread operator
6. **DRY (Don't Repeat Yourself)** - Hindari duplikasi, ekstrak ke shared module
7. **KISS (Keep It Simple, Stupid)** - Jangan over-engineer
8. **SOLID Principles** - Ikuti prinsip SOLID dalam OOP

---

## Aturan Arsitektur

NestJS menggunakan arsitektur berlapis (layered architecture) untuk memisahkan tanggung jawab kode. Setiap layer punya tugas spesifik dan tidak boleh mencampuri tugas layer lain.

### Layered Architecture

```
Controller Layer  → HTTP concerns (routes, params, status codes, Swagger)
       ↓
Service Layer     → Business logic (validation, transformasi, orchestration)
       ↓
Data Layer        → Akses data (database, in-memory storage, external API)
```

> **Catatan:** Template ini menggunakan **in-memory storage** (array di dalam service) sebagai contoh sederhana. Ketika kamu menambahkan database (TypeORM, Prisma, dsb), data access akan dipindahkan ke **Repository layer** yang terpisah dari service. Lihat panduan "Menambahkan Database" di README.md.

### Aturan per Layer

| Layer          | BOLEH                                        | DILARANG                                        |
| -------------- | -------------------------------------------- | ----------------------------------------------- |
| **Controller** | Parsing params, DTO validation, HTTP status  | Business logic, database queries, direct imports |
| **Service**    | Business logic, exception throwing, logging  | HTTP-specific code, request/response objects     |
| **Data Layer** | Database queries, data mapping               | Business logic, HTTP concerns                    |

### Module Boundaries

```typescript
// WAJIB: Setiap module hanya mengakses module lain melalui exported services
@Module({
  imports: [UsersModule],        // Import module, bukan service langsung
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}

// WAJIB: Export service yang akan digunakan module lain
@Module({
  providers: [UsersService],
  exports: [UsersService],       // Eksplisit export
})
export class UsersModule {}
```

---

## Aturan Penamaan File

Konsistensi penamaan file dan variabel sangat penting agar codebase mudah dinavigasi dan dipahami oleh semua anggota tim.

### Konvensi Penamaan

| Jenis File          | Format                          | Contoh                                      |
| ------------------- | ------------------------------- | ------------------------------------------- |
| **Modules**         | `kebab-case.module.ts`          | `users.module.ts`, `order-items.module.ts`  |
| **Controllers**     | `kebab-case.controller.ts`      | `users.controller.ts`                       |
| **Services**        | `kebab-case.service.ts`         | `users.service.ts`                          |
| **DTOs**            | `kebab-case.dto.ts`             | `create-user.dto.ts`, `update-user.dto.ts`  |
| **Entities**        | `kebab-case.entity.ts`          | `user.entity.ts`, `order-item.entity.ts`    |
| **Interfaces**      | `kebab-case.interface.ts`       | `response.interface.ts`                     |
| **Guards**          | `kebab-case.guard.ts`           | `auth.guard.ts`, `roles.guard.ts`           |
| **Interceptors**    | `kebab-case.interceptor.ts`     | `transform.interceptor.ts`                  |
| **Filters**         | `kebab-case.filter.ts`          | `http-exception.filter.ts`                  |
| **Pipes**           | `kebab-case.pipe.ts`            | `parse-uuid.pipe.ts`                        |
| **Decorators**      | `kebab-case.decorator.ts`       | `public.decorator.ts`                       |
| **Test Files**      | `kebab-case.spec.ts`            | `users.spec.ts`, `health.spec.ts`           |
| **E2E Test Files**  | `kebab-case.e2e-spec.ts`        | `app.e2e-spec.ts`                           |
| **Config Files**    | `kebab-case.config.ts`          | `app.config.ts`, `database.config.ts`       |
| **Utility Files**   | `camelCase.ts`                  | `helpers.ts`, `validators.ts`               |

### Aturan Nama Variable & Function

```typescript
// --- Variables ---
// Boolean: gunakan prefix is, has, can, should
const isLoading = false;
const hasPermission = true;
const canDelete = false;

// Array: gunakan bentuk jamak (plural)
const users: User[] = [];
const selectedItems: string[] = [];

// Object/single entity: gunakan bentuk tunggal (singular)
const user: User | null = null;
const currentItem: Item | undefined = undefined;

// --- Functions ---
// Action: gunakan kata kerja di depan
async function fetchUsers(): Promise<User[]> { ... }
function handleSubmit(): void { ... }
function formatDate(date: Date): string { ... }
function validateEmail(email: string): boolean { ... }

// --- Classes ---
// PascalCase, suffix menunjukkan tipe
class UsersService { ... }
class UsersController { ... }
class CreateUserDto { ... }
class UserEntity { ... }
class AuthGuard { ... }
```

### Nama yang DILARANG

```typescript
// DILARANG: Singkatan tidak jelas
const usr = null;        // Gunakan: user
const svc = null;        // Gunakan: service
const req = null;        // Gunakan: request (kecuali di parameter Express)
const res = null;        // Gunakan: response (kecuali di parameter Express)
const e = (error) => {}; // Gunakan: error

// DILARANG: Nama generik tanpa konteks
const data = {};         // Gunakan: userData, responseData
const list = [];         // Gunakan: userList, productList
const temp = null;       // Jangan gunakan variable temporary

// DILARANG: any type
const data: any = {};    // Selalu gunakan type yang spesifik
```

---

## Aturan Struktur Folder

Struktur folder yang konsisten mempermudah navigasi project. Semua file harus ditempatkan di folder yang tepat sesuai fungsinya.

### Folder `src/`

```
src/
├── common/                  # Shared code (cross-cutting concerns)
│   ├── decorators/          # Custom decorators (@Public, @ClientIp, dll)
│   ├── dto/                 # Shared DTOs (PaginationDto, dll)
│   ├── exceptions/          # Custom exceptions
│   ├── filters/             # Exception filters
│   ├── guards/              # Auth & role guards
│   ├── interceptors/        # Interceptors (transform, logging, cache)
│   ├── interfaces/          # Shared interfaces/types
│   ├── pipes/               # Custom pipes (ParseUuidPipe, dll)
│   └── utils/               # Utility/helper functions (pure functions)
│
├── config/                  # Configuration (registerAs configs)
│   ├── app.config.ts
│   ├── database.config.ts   # (opsional)
│   └── jwt.config.ts        # (opsional)
│
├── modules/                 # Feature modules (domain-driven)
│   ├── health/              # Health check module
│   │   ├── health.controller.ts
│   │   ├── health.module.ts
│   │   └── health.service.ts
│   └── users/               # Users module (contoh CRUD)
│       ├── dto/
│       │   ├── create-user.dto.ts
│       │   └── update-user.dto.ts
│       ├── entities/
│       │   └── user.entity.ts
│       ├── users.controller.ts
│       ├── users.module.ts
│       └── users.service.ts
│
├── app.module.ts            # Root module
└── main.ts                  # Entry point (bootstrap)
```

### Aturan Penempatan File

| Jenis                  | Folder                           | Aturan                                                               |
| ---------------------- | -------------------------------- | -------------------------------------------------------------------- |
| **Common/Shared**      | `common/<jenis>/`                | Code yang digunakan di banyak module                                 |
| **Config**             | `config/`                        | Semua konfigurasi aplikasi (registerAs)                              |
| **Feature Module**     | `modules/<feature>/`             | Satu folder per feature/domain                                       |
| **DTOs**               | `modules/<feature>/dto/`         | Satu file per DTO, prefix create/update/query                        |
| **Entities**           | `modules/<feature>/entities/`    | Satu file per entity                                                 |
| **Tests (Unit)**       | `test/unit/`                     | Mirror struktur module                                                |
| **Tests (E2E)**        | `test/e2e/`                      | Test full HTTP request/response                                       |

---

## Aturan Controller

Controller adalah "pintu masuk" request HTTP. Controller menerima request, memvalidasi input (via DTO dan Pipe), lalu menyerahkan pemrosesan ke service. Controller **tidak boleh** berisi business logic apapun.

### Struktur Controller

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Users')                    // WAJIB: Swagger tag
@Controller('users')                 // WAJIB: Kebab-case route
export class UsersController {
  constructor(
    private readonly usersService: UsersService,  // WAJIB: readonly
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)      // WAJIB: Explicit status code
  @ApiOperation({ summary: '...' }) // WAJIB: Swagger operation
  @ApiResponse({ status: 201 })     // WAJIB: Swagger response
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  @ApiParam({ name: 'id' })         // WAJIB: Swagger param
  findOne(@Param('id', ParseUuidPipe) id: string) {  // WAJIB: Pipe validation
    return this.usersService.findOne(id);
  }
}
```

### Aturan Controller

1. **Tidak boleh** ada business logic di controller
2. **Wajib** menggunakan DTO untuk `@Body()` parameters
3. **Wajib** menggunakan Pipe untuk validasi `@Param()` dan `@Query()`
4. **Wajib** menggunakan Swagger decorators untuk dokumentasi API
5. **Wajib** menggunakan `HttpCode` untuk response status yang tidak default
6. **Wajib** constructor injection dengan `readonly`

---

## Aturan Service

Service adalah tempat semua business logic berada. Controller hanya menerima request dan memanggil service — semua logika pemrosesan, validasi bisnis, dan penanganan error domain dilakukan di service.

### Struktur Service

```typescript
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly users: User[] = []; // Contoh: in-memory storage

  constructor(
    // Inject dependencies via constructor
  ) {}

  // WAJIB: Explicit return type
  create(createUserDto: CreateUserDto): User {
    // Business logic di sini
    this.logger.log(`Creating user: ${createUserDto.email}`);

    // Cek duplikasi sebelum menyimpan
    const existing = this.users.find((u) => u.email === createUserDto.email);
    if (existing) {
      throw new DuplicateEntityException('User', 'email');
    }

    // Buat user baru dan simpan
    const user: User = { id: uuidv4(), ...createUserDto };
    this.users.push(user);
    return user;
  }
}
```

### Aturan Service

1. **Semua** business logic harus ada di service
2. **Wajib** menggunakan NestJS `Logger`, bukan `console.log`
3. **Wajib** throw custom exceptions untuk domain errors
4. **Wajib** explicit return type untuk semua public methods
5. **Tidak boleh** mengakses `Request` atau `Response` object

---

## Aturan DTO & Validation

DTO (Data Transfer Object) mendefinisikan bentuk data yang diterima oleh API endpoint. Setiap property di DTO harus punya decorator validasi dari `class-validator` dan decorator dokumentasi dari `@nestjs/swagger`.

### Struktur DTO

```typescript
import { IsString, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ description: 'User email', example: 'john@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ enum: ['admin', 'user', 'guest'], default: 'user' })
  @IsOptional()
  @IsIn(['admin', 'user', 'guest'])
  role?: UserRole = 'user';
}
```

### Aturan DTO

1. **Setiap** property harus punya validation decorator
2. **Wajib** menggunakan `@ApiProperty` atau `@ApiPropertyOptional` untuk Swagger
3. **Wajib** menggunakan `!` definite assignment assertion untuk required properties
4. **Update DTO** harus extend dari `PartialType(CreateDto)`
5. **Tidak boleh** ada logic di DTO, hanya deklarasi dan validasi

---

## Aturan Module

Module adalah unit organisasi utama di NestJS. Setiap fitur/domain memiliki module-nya sendiri yang mengelompokkan controller, service, dan dependencies terkait.

### Struktur Module

```typescript
@Module({
  imports: [],           // Module yang dibutuhkan
  controllers: [],       // Controller di module ini
  providers: [],         // Service dan provider lainnya
  exports: [],           // Service yang di-expose ke module lain
})
export class UsersModule {}
```

### Aturan Module

1. **Satu module per feature/domain**
2. **Wajib** export service jika akan digunakan module lain
3. **Tidak boleh** circular dependency tanpa `forwardRef()`
4. **Global module** (`@Global()`) hanya untuk shared infrastructure

---

## Aturan TypeScript

Project ini menggunakan TypeScript dengan **strict mode** aktif. Ini berarti compiler akan menangkap lebih banyak error saat development, bukan saat production. Jangan nonaktifkan strict mode.

### Strict Mode

TypeScript strict mode aktif dan tidak boleh dinonaktifkan. Aturan:

- **Tidak boleh** menggunakan `any`. Gunakan `unknown` lalu type guard
- **Wajib** explicit return type untuk function/method publik
- **Wajib** mendefinisikan interface di file terpisah untuk shared types
- **Wajib** menggunakan `!` assertion untuk DTO properties (non-nullable after validation)

### Type Definitions

```typescript
// WAJIB: Interface untuk object shapes
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// WAJIB: Union type untuk enum-like values
export type UserRole = 'admin' | 'user' | 'guest';

// WAJIB: Gunakan `import type` untuk type-only imports
import type { User, UserRole } from '../entities/user.entity';
```

### Error Handling

```typescript
// WAJIB: Try-catch untuk async operations
async function fetchData(id: string): Promise<Data> {
  try {
    const result = await this.repository.findOne(id);
    if (!result) {
      throw new EntityNotFoundException('Data', id);
    }
    return result;
  } catch (error) {
    if (error instanceof HttpException) throw error;
    this.logger.error('Failed to fetch data', error);
    throw new InternalServerErrorException('Failed to fetch data');
  }
}
```

---

## Aturan Error Handling

Error handling yang konsisten memastikan client selalu mendapat response yang terstruktur dan informatif, sementara error detail hanya muncul di log server.

### Custom Exceptions

Gunakan custom exceptions dari `common/exceptions/`:

```typescript
// Entity tidak ditemukan
throw new EntityNotFoundException('User', id);

// Duplicate entity
throw new DuplicateEntityException('User', 'email');

// Business logic error
throw new BusinessException('Insufficient balance');
```

### Aturan Error

1. **Tidak boleh** throw `Error` generic - gunakan NestJS `HttpException` atau custom exception
2. **Wajib** catch dan re-throw dengan proper exception type
3. **Tidak boleh** expose internal error details ke client
4. **Wajib** log error dengan `Logger` sebelum throwing

---

## Aturan Testing

Testing memastikan code bekerja sesuai harapan dan tidak rusak saat ada perubahan. Template ini menggunakan Jest untuk unit test dan Supertest untuk E2E test.

### Struktur Test

```
test/
├── unit/                    # Unit tests (Jest)
│   ├── health.spec.ts       # Test per service/controller
│   └── users.spec.ts
└── e2e/                     # E2E tests (Supertest)
    └── app.e2e-spec.ts
```

### Unit Test

```typescript
describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a user with valid data', () => {
      const dto = { name: 'John', email: 'john@example.com' };
      const result = service.create(dto);
      expect(result).toHaveProperty('id');
      expect(result.name).toBe('John');
    });

    it('should throw on duplicate email', () => {
      service.create({ name: 'John', email: 'john@example.com' });
      expect(() =>
        service.create({ name: 'Jane', email: 'john@example.com' }),
      ).toThrow(DuplicateEntityException);
    });
  });
});
```

### E2E Test

```typescript
describe('POST /api/users', () => {
  it('should create a user', () => {
    return request(app.getHttpServer())
      .post('/api/users')
      .send({ name: 'John', email: 'john@example.com' })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe('John');
      });
  });
});
```

### Coverage Target

| Jenis          | Minimum Coverage |
| -------------- | ---------------- |
| Overall        | 80%              |
| Services       | 90%              |
| Controllers    | 80%              |
| Utils/Helpers  | 90%              |
| Critical paths | 100%             |

---

## Aturan Git Workflow

Konsistensi dalam naming branch dan commit message mempermudah tracking perubahan dan kolaborasi tim.

### Branch Naming

```
<type>/<deskripsi-singkat>
```

| Prefix      | Fungsi                | Contoh                        |
| ----------- | --------------------- | ----------------------------- |
| `feature/`  | Fitur baru            | `feature/user-authentication` |
| `fix/`      | Bug fix               | `fix/validation-error`        |
| `refactor/` | Refactoring           | `refactor/user-service`       |
| `hotfix/`   | Fix urgent production | `hotfix/security-patch`       |
| `chore/`    | Maintenance           | `chore/update-dependencies`   |
| `docs/`     | Dokumentasi           | `docs/api-documentation`      |

### Commit Message Format

Menggunakan [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <deskripsi singkat>
```

**Types:**

| Type       | Kapan Digunakan                        |
| ---------- | -------------------------------------- |
| `feat`     | Menambah fitur baru                    |
| `fix`      | Memperbaiki bug                        |
| `refactor` | Mengubah code tanpa mengubah behavior  |
| `docs`     | Perubahan dokumentasi saja             |
| `test`     | Menambah atau memperbaiki test         |
| `chore`    | Maintenance (update deps, konfigurasi) |
| `perf`     | Peningkatan performa                   |
| `ci`       | Perubahan CI/CD pipeline               |
| `style`    | Perubahan formatting, bukan logic      |
| `revert`   | Revert commit sebelumnya               |
| `build`    | Perubahan build system                 |

**Contoh:**

```bash
feat: add user registration endpoint with email validation
fix: resolve 500 error on user creation with duplicate email
refactor: extract pagination logic to shared utility
docs: update API endpoint documentation
test: add unit tests for UsersService
```

---

## Aturan Code Style

Aturan formatting dan import order berikut diterapkan secara otomatis melalui ESLint dan Prettier. Pastikan editor kamu sudah terpasang extension ESLint dan Prettier.

### Import Order (Wajib)

```typescript
// 1. NestJS core imports
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// 2. External libraries
import { v4 as uuidv4 } from 'uuid';

// 3. Internal modules (gunakan path alias)
import { UsersService } from '@modules/users/users.service';
import { EntityNotFoundException } from '@common/exceptions/business.exception';

// 4. Types (import type)
import type { User } from '@modules/users/entities/user.entity';
import type { IApiResponse } from '@common/interfaces/response.interface';
```

### Prettier Config

Konfigurasi Prettier yang digunakan:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

Artinya:

- **Pakai** semicolon (`;`) - standar NestJS
- Gunakan single quote (`'`)
- Indent 2 spasi
- Trailing comma di semua contexts
- Max 100 karakter per baris
- Selalu pakai parentheses di arrow function

---

## Aturan Keamanan

Keamanan adalah prioritas utama. Berikut aturan keamanan yang wajib diikuti untuk mencegah vulnerability umum.

### Input Validation

```typescript
// WAJIB: Validasi semua input dengan DTO dan class-validator
@Post()
create(@Body() dto: CreateUserDto) { ... }

// WAJIB: Validasi UUID params
@Get(':id')
findOne(@Param('id', ParseUuidPipe) id: string) { ... }

// WAJIB: Validasi query params
@Get()
findAll(@Query() pagination: PaginationDto) { ... }
```

### Environment Variables

```typescript
// WAJIB: Gunakan ConfigService, bukan process.env langsung
const secret = this.configService.get<string>('JWT_SECRET');

// DILARANG: Hardcode secrets
const secret = 'my-secret-key'; // JANGAN!

// DILARANG: Akses process.env langsung di service/controller
const port = process.env.PORT; // Gunakan ConfigService
```

### Rate Limiting

Rate limiting sudah dikonfigurasi secara global via ThrottlerModule. Untuk skip:

```typescript
@SkipThrottle()
@Controller('health')
export class HealthController { ... }
```

---

## Aturan Performa

Performa yang baik dimulai dari kebiasaan coding yang benar. Berikut aturan untuk memastikan API tetap responsif.

### Async Operations

```typescript
// WAJIB: Gunakan async/await untuk I/O operations
async findAll(): Promise<User[]> {
  return this.repository.find();
}

// DILARANG: Sync file operations
const data = fs.readFileSync('file.json'); // Blocks event loop!
```

### Caching

```typescript
// BAIK: Cache data yang jarang berubah
@UseInterceptors(CacheInterceptor)
@Get()
findAll() { ... }
```

### Logging

```typescript
// WAJIB: Gunakan NestJS Logger
private readonly logger = new Logger(UsersService.name);

this.logger.log('User created');
this.logger.warn('Suspicious activity');
this.logger.error('Failed to create user', error.stack);

// DILARANG: console.log
console.log('User created'); // Jangan gunakan console.log
```

---

## Checklist Sebelum Commit

Jalankan semua command berikut sebelum commit:

```bash
pnpm run lint          # Cek linting errors
pnpm run format        # Format code
pnpm run type-check    # Cek TypeScript types
pnpm run test          # Jalankan unit tests
pnpm run test:e2e      # Jalankan E2E tests
```

### Review Checklist

- [ ] TypeScript strict mode - tidak ada `any`
- [ ] Controller hanya handle HTTP concerns
- [ ] Business logic ada di service
- [ ] DTO punya validation decorators
- [ ] Swagger decorators lengkap di controller
- [ ] Custom exceptions digunakan untuk domain errors
- [ ] Tidak ada `console.log` - gunakan `Logger`
- [ ] File diberi nama sesuai konvensi
- [ ] File ditempatkan di folder yang benar
- [ ] Import menggunakan path alias (`@common/`, `@modules/`, `@config/`)
- [ ] Import types menggunakan `import type`
- [ ] Error handling dengan proper exceptions
- [ ] Tidak ada hardcoded values atau secrets
- [ ] Test ditambahkan/diupdate
- [ ] ESLint lulus tanpa warning
- [ ] Prettier formatting sudah applied

---

## Referensi

- [NestJS Documentation](https://docs.nestjs.com/)
- [class-validator](https://github.com/typestack/class-validator)
- [class-transformer](https://github.com/typestack/class-transformer)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest](https://jestjs.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)

Untuk panduan AI code review, lihat [CLAUDE.md](./CLAUDE.md).
