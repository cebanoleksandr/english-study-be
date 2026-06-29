import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post('generate')
  @UsePipes(new ValidationPipe())
  async generateLesson(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.createLesson(createLessonDto);
  }

  @Get()
  async getLessons() {
    return this.lessonsService.findAll();
  }

  @Get(':id')
  async getLessonById(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }
}
