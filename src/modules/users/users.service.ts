import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { PaginationDto } from '@common/dto/pagination.dto';
import {
  EntityNotFoundException,
  DuplicateEntityException,
} from '@common/exceptions/business.exception';
import { createPaginatedResponse } from '@common/utils/helpers';
import { IPaginatedResponse } from '@common/interfaces/response.interface';

@Injectable()
export class UsersService {
  // In-memory storage for demo purposes.
  // Replace with a real database (TypeORM, Prisma, etc.) in production.
  private readonly users: User[] = [];

  create(createUserDto: CreateUserDto): User {
    // Check for duplicate email
    const existing = this.users.find(
      (user) => user.email === createUserDto.email,
    );
    if (existing) {
      throw new DuplicateEntityException('User', 'email');
    }

    const user: User = {
      id: uuidv4(),
      ...createUserDto,
      role: createUserDto.role ?? 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.push(user);
    return user;
  }

  findAll(paginationDto: PaginationDto): IPaginatedResponse<User> {
    const { page = 1, perPage = 10, sort, order = 'asc' } = paginationDto;

    let sortedUsers = [...this.users];

    // Sort
    if (sort && sort in sortedUsers[0]!) {
      sortedUsers.sort((a, b) => {
        const aVal = String(a[sort as keyof User] ?? '');
        const bVal = String(b[sort as keyof User] ?? '');
        return order === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    }

    // Paginate
    const total = sortedUsers.length;
    const start = (page - 1) * perPage;
    const paginatedUsers = sortedUsers.slice(start, start + perPage);

    return createPaginatedResponse(paginatedUsers, { page, perPage, total });
  }

  findOne(id: string): User {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new EntityNotFoundException('User', id);
    }
    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto): User {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new EntityNotFoundException('User', id);
    }

    // Check for duplicate email if email is being updated
    if (updateUserDto.email) {
      const existing = this.users.find(
        (user) => user.email === updateUserDto.email && user.id !== id,
      );
      if (existing) {
        throw new DuplicateEntityException('User', 'email');
      }
    }

    const existingUser = this.users[index]!;
    const updatedUser: User = {
      ...existingUser,
      ...updateUserDto,
      updatedAt: new Date().toISOString(),
    };

    this.users[index] = updatedUser;
    return updatedUser;
  }

  remove(id: string): void {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new EntityNotFoundException('User', id);
    }
    this.users.splice(index, 1);
  }
}
