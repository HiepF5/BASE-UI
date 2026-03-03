import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

@Injectable()
export class AuthService {
  // In-memory users cho demo - production nên dùng DB
  private users: Array<UserPayload & { password: string }> = [
    {
      id: '1',
      email: 'admin@example.com',
      password: 'admin123', // Production: dùng bcrypt hash
      name: 'Admin',
      role: 'admin',
    },
  ];

  constructor(private readonly jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<UserPayload | null> {
    const user = this.users.find(
      (u) => u.email === email && u.password === password,
    );
    if (!user) return null;

    const { password: _, ...payload } = user;
    return payload;
  }

  async generateToken(user: UserPayload) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(data: { email: string; password: string; name: string }) {
    const existing = this.users.find((u) => u.email === data.email);
    if (existing) {
      throw new Error('User already exists');
    }

    const user = {
      id: String(this.users.length + 1),
      ...data,
      role: 'user',
    };

    this.users.push(user);
    const { password: _, ...payload } = user;
    return this.generateToken(payload);
  }
}
