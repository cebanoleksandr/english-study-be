import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserById(userId: string, isFullProfile = false) {
    const fieldsToSelect = {
      id: true,
      createdAt: true,
      email: isFullProfile,
    };

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: fieldsToSelect,
    });

    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    return user;
  }
}
