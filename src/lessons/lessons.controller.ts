import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  @UsePipes(new ValidationPipe())
  async generateLesson(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.createLesson(createLessonDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getLessons() {
    return this.lessonsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getLessonById(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }
}
