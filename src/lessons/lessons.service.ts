import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonEntity } from './entities/lesson.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

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

  async submitQuiz(id: string, submitQuizDto: SubmitQuizDto) {
    const lesson = await this.lessonRepository.findOne({ where: { id } });

    if (!lesson) {
      throw new NotFoundException('Урок не знайдено');
    }

    if (!lesson.quiz || lesson.quiz.length === 0) {
      throw new BadRequestException('У цьому уроці немає вікторини');
    }

    if (submitQuizDto.answers.length !== lesson.quiz.length) {
      throw new BadRequestException(
        'Кількість відповідей не збігається з кількістю запитань',
      );
    }

    let correctCount = 0;

    const detailedResults = lesson.quiz.map((question, index) => {
      const userAnswer = submitQuizDto.answers[index];
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) correctCount++;

      return {
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
      };
    });

    const scorePercentage = Math.round(
      (correctCount / lesson.quiz.length) * 100,
    );

    return {
      totalQuestions: lesson.quiz.length,
      correctAnswers: correctCount,
      score: scorePercentage,
      details: detailedResults,
    };
  }
}
