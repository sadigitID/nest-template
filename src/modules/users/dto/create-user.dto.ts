import { IsString, IsEmail, IsOptional, IsIn, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ description: 'User email address', example: 'john@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({
    description: 'User role',
    enum: ['admin', 'user', 'guest'],
    default: 'user',
  })
  @IsOptional()
  @IsIn(['admin', 'user', 'guest'])
  role?: UserRole = 'user';
}
