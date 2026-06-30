import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const userExists = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (userExists) {
      throw new BadRequestException('Користувач з таким email вже існує');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const newUser = this.userRepository.create({
      email: dto.email,
      passwordHash,
    });

    const savedUser = await this.userRepository.save(newUser);
    const accessToken = await this.generateToken(savedUser.id, savedUser.email);

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
      },
      accessToken,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Невірні облікові дані');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Невірні облікові дані');
    }

    const accessToken = await this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      accessToken,
    };
  }

  private async generateToken(userId: string, email: string): Promise<string> {
    const jwtPayload = { sub: userId, email };

    return this.jwtService.signAsync(jwtPayload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '7d',
    });
  }
}
