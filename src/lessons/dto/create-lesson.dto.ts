import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateLessonDto {
  @IsNotEmpty({ message: 'Topic should not be empty' })
  @IsString()
  @Length(2, 100)
  topic: string;

  @IsNotEmpty({ message: 'Level should not be empty' })
  @IsString()
  level: string;
}
