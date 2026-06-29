import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonEntity } from './entities/lesson.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(LessonEntity)
    private readonly lessonRepository: Repository<LessonEntity>,
    private readonly configService: ConfigService,
  ) {}

  async createLesson(createLessonDto: CreateLessonDto): Promise<LessonEntity> {
    const n8nUrl = this.configService.get<string>('N8N_WEBHOOK_URL');
    const { topic, level } = createLessonDto;

    try {
      const response = await axios.post(n8nUrl, { topic, level });
      const aiGeneratedData = response.data;

      const newLesson = this.lessonRepository.create({
        topic,
        level,
        words: aiGeneratedData.words,
        text: aiGeneratedData.text,
        quiz: aiGeneratedData.quiz,
      });

      return await this.lessonRepository.save(newLesson);
    } catch (error) {
      console.error('Error in createLesson:', error.message);
      throw new InternalServerErrorException(
        'Failed to generate or save lesson',
      );
    }
  }

  async findAll(): Promise<LessonEntity[]> {
    return await this.lessonRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<LessonEntity> {
    return await this.lessonRepository.findOne({ where: { id } });
  }
}
