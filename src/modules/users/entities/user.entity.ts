export type UserRole = 'admin' | 'user' | 'guest';

export class User {
  id!: string;
  name!: string;
  email!: string;
  role!: UserRole;
  createdAt!: string;
  updatedAt!: string;
}
