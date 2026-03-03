import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  private users = [
    { id: '1', email: 'admin@example.com', name: 'Admin', role: 'admin' },
  ];

  findAll() {
    return this.users;
  }

  findByEmail(email: string) {
    return this.users.find((u) => u.email === email);
  }
}
