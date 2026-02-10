# NestJS Template - AI Code Review Guidelines

This document provides AI-specific guidelines for reviewing and contributing to this NestJS project.

## Project Overview

- **Framework**: NestJS 11
- **Language**: TypeScript (strict mode)
- **Architecture**: Modular (feature-based modules)
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest (unit) + Supertest (E2E)
- **Code Quality**: ESLint 9 + Prettier 3

## Code Review Priorities

When reviewing code, prioritize these aspects in order:

1. **Type Safety** - TypeScript strict mode compliance
2. **Separation of Concerns** - Controller, Service, Module boundaries
3. **Validation** - Input validation with DTOs and class-validator
4. **Error Handling** - Proper exception throwing and filtering
5. **Testing** - Adequate coverage (80%+ target)
6. **Security** - No hardcoded secrets, proper input sanitization

## NestJS Architecture

### Module Structure

```
src/modules/<feature>/
├── dto/                    # Data Transfer Objects (validation)
│   ├── create-<feature>.dto.ts
│   └── update-<feature>.dto.ts
├── entities/               # Entity definitions
│   └── <feature>.entity.ts
├── <feature>.controller.ts # HTTP layer (routes, params, responses)
├── <feature>.module.ts     # Module definition (DI container)
└── <feature>.service.ts    # Business logic layer
```

### Controller Best Practices

```typescript
// GOOD: Controller only handles HTTP concerns
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}

// BAD: Business logic in controller
@Controller('users')
export class UsersController {
  @Post()
  create(@Body() dto: CreateUserDto) {
    // Don't put business logic here!
    const exists = this.repository.findByEmail(dto.email);
    if (exists) throw new ConflictException();
    return this.repository.save(dto);
  }
}
```

### Service Best Practices

```typescript
// GOOD: Service contains all business logic
@Injectable()
export class UsersService {
  create(createUserDto: CreateUserDto): User {
    // Check for duplicates
    const existing = this.findByEmail(createUserDto.email);
    if (existing) {
      throw new DuplicateEntityException('User', 'email');
    }

    // Create user
    const user: User = {
      id: uuidv4(),
      ...createUserDto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return user;
  }
}
```

### DTO Best Practices

```typescript
// GOOD: DTO with validation decorators and Swagger docs
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

// BAD: No validation
export class CreateUserDto {
  name: string;
  email: string;
}
```

## TypeScript Guidelines

### Strict Mode Compliance

```typescript
// GOOD: Explicit types, no any
interface UserResponse {
  id: string;
  name: string;
  email: string;
}

async function getUser(id: string): Promise<UserResponse> {
  // ...
}

// BAD: Using any
async function getUser(id: string): Promise<any> { ... }

// GOOD: Use unknown with type guards
function processInput(input: unknown): string {
  if (typeof input === 'string') {
    return input.trim();
  }
  throw new BadRequestException('Input must be a string');
}
```

### Interface vs Type

```typescript
// GOOD: Interface for object shapes (extendable)
interface User {
  id: string;
  name: string;
  email: string;
}

// GOOD: Type for unions, intersections, primitives
type UserRole = 'admin' | 'user' | 'guest';
type CreateUserInput = Omit<User, 'id'>;
```

## Dependency Injection

```typescript
// GOOD: Constructor injection (NestJS standard)
@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}
}

// BAD: Manual instantiation
@Injectable()
export class UsersService {
  private configService = new ConfigService(); // Wrong!
}
```

## Error Handling

```typescript
// GOOD: Use custom exceptions from common/exceptions
import { EntityNotFoundException, DuplicateEntityException } from '@common/exceptions/business.exception';

// In service:
findOne(id: string): User {
  const user = this.users.find(u => u.id === id);
  if (!user) {
    throw new EntityNotFoundException('User', id);
  }
  return user;
}

// GOOD: Use NestJS built-in exceptions
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Invalid credentials');
throw new ForbiddenException('Access denied');

// BAD: Throwing generic errors
throw new Error('User not found'); // Wrong! Use NestJS exceptions
```

## Response Format

All responses follow a standard format via the `TransformInterceptor`:

```json
// Success
{
  "success": true,
  "data": { ... }
}

// Error (via HttpExceptionFilter)
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/users"
}

// Paginated
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "perPage": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

## Testing Guidelines

### Unit Tests

```typescript
// GOOD: Test service logic in isolation
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

### E2E Tests

```typescript
// GOOD: Test full HTTP request/response cycle
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

  it('should reject invalid input', () => {
    return request(app.getHttpServer())
      .post('/api/users')
      .send({ name: '', email: 'invalid' })
      .expect(400);
  });
});
```

## Security Considerations

```typescript
// GOOD: Validate all input with DTOs
@Post()
create(@Body() dto: CreateUserDto) { // DTO validates input
  return this.service.create(dto);
}

// GOOD: Use ParseUuidPipe for ID params
@Get(':id')
findOne(@Param('id', ParseUuidPipe) id: string) { ... }

// BAD: No validation
@Post()
create(@Body() body: any) { // No validation!
  return this.service.create(body);
}

// GOOD: Use environment variables, never hardcode secrets
const secret = this.configService.get<string>('JWT_SECRET');

// BAD: Hardcoded secret
const secret = 'my-super-secret-key'; // Never do this!
```

## Common Anti-Patterns to Avoid

```typescript
// BAD: Circular dependencies
// Module A imports Module B, Module B imports Module A

// GOOD: Use forwardRef() if truly needed
@Module({
  imports: [forwardRef(() => ModuleB)],
})

// BAD: Sync operations in controllers
@Get()
findAll() {
  return fs.readFileSync('data.json'); // Blocks event loop!
}

// GOOD: Always use async
@Get()
async findAll() {
  return fs.promises.readFile('data.json', 'utf-8');
}

// BAD: Not using NestJS DI
const service = new UsersService(); // Wrong!

// GOOD: Let NestJS inject dependencies
constructor(private readonly usersService: UsersService) {}
```

## Code Review Checklist

Before approving code, verify:

- [ ] TypeScript strict mode - no `any` types
- [ ] Controllers only handle HTTP concerns
- [ ] Business logic is in services
- [ ] DTOs have proper validation decorators
- [ ] Swagger decorators are present on controllers
- [ ] Custom exceptions used for domain errors
- [ ] Proper error handling (no generic `throw new Error()`)
- [ ] No hardcoded values or secrets
- [ ] No `console.log` - use NestJS `Logger`
- [ ] Tests added/updated (80%+ coverage)
- [ ] ESLint passes without warnings
- [ ] Prettier formatting applied
- [ ] Module is properly imported in parent module

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [NestJS Recipes](https://docs.nestjs.com/recipes)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [class-validator Decorators](https://github.com/typestack/class-validator#validation-decorators)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
