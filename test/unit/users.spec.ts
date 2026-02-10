import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/modules/users/users.service';
import { CreateUserDto } from '../../src/modules/users/dto/create-user.dto';
import { EntityNotFoundException, DuplicateEntityException } from '../../src/common/exceptions/business.exception';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', () => {
      const dto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
      };

      const user = service.create(dto);

      expect(user).toHaveProperty('id');
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.role).toBe('user');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
    });

    it('should throw DuplicateEntityException for duplicate email', () => {
      const dto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      service.create(dto);

      expect(() => service.create(dto)).toThrow(DuplicateEntityException);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', () => {
      service.create({ name: 'User 1', email: 'user1@example.com' });
      service.create({ name: 'User 2', email: 'user2@example.com' });
      service.create({ name: 'User 3', email: 'user3@example.com' });

      const result = service.findAll({ page: 1, perPage: 2 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(3);
      expect(result.meta.totalPages).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.perPage).toBe(2);
    });

    it('should return empty array for empty store', () => {
      const result = service.findAll({});

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', () => {
      const created = service.create({
        name: 'John Doe',
        email: 'john@example.com',
      });

      const user = service.findOne(created.id);

      expect(user.id).toBe(created.id);
      expect(user.name).toBe('John Doe');
    });

    it('should throw EntityNotFoundException for non-existent user', () => {
      expect(() => service.findOne('non-existent-id')).toThrow(
        EntityNotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a user', () => {
      const created = service.create({
        name: 'John Doe',
        email: 'john@example.com',
      });

      const updated = service.update(created.id, { name: 'Jane Doe' });

      expect(updated.name).toBe('Jane Doe');
      expect(updated.email).toBe('john@example.com');
    });

    it('should throw EntityNotFoundException for non-existent user', () => {
      expect(() =>
        service.update('non-existent-id', { name: 'Jane' }),
      ).toThrow(EntityNotFoundException);
    });

    it('should throw DuplicateEntityException for duplicate email', () => {
      service.create({ name: 'User 1', email: 'user1@example.com' });
      const user2 = service.create({
        name: 'User 2',
        email: 'user2@example.com',
      });

      expect(() =>
        service.update(user2.id, { email: 'user1@example.com' }),
      ).toThrow(DuplicateEntityException);
    });
  });

  describe('remove', () => {
    it('should remove a user', () => {
      const created = service.create({
        name: 'John Doe',
        email: 'john@example.com',
      });

      service.remove(created.id);

      expect(() => service.findOne(created.id)).toThrow(
        EntityNotFoundException,
      );
    });

    it('should throw EntityNotFoundException for non-existent user', () => {
      expect(() => service.remove('non-existent-id')).toThrow(
        EntityNotFoundException,
      );
    });
  });
});
