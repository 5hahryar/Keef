import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashPassword, verifyHash } from '../common/hash';
import { UserEntity } from '../database/entities';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async getAccessToken(username: string, password: string): Promise<string> {
    const user = await this.users.findOne({ where: { username } });
    if (!user || !(await verifyHash(password, user.passwordHash))) {
      throw new HttpException({ error: 'wrong username or password' }, HttpStatus.BAD_REQUEST);
    }

    return this.jwt.sign(
      { sub: username },
      {
        secret: this.config.get<string>('JWT_SECRET') ?? 'secret',
        expiresIn: '720h',
      },
    );
  }

  async changePassword(username: string, request: ChangePasswordDto): Promise<void> {
    if (request.newPassword !== request.repeatNewPassword) {
      throw new HttpException({ error: 'New password not equal to repeated one' }, HttpStatus.BAD_REQUEST);
    }

    const user = await this.users.findOne({ where: { username } });
    if (!user || !(await verifyHash(request.password, user.passwordHash))) {
      throw new HttpException({ error: 'wrong username or password' }, HttpStatus.BAD_REQUEST);
    }

    user.passwordHash = await hashPassword(request.newPassword);
    await this.users.save(user);
  }
}
