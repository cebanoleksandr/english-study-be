import { IsArray, IsString, IsNotEmpty } from 'class-validator';

export class SubmitQuizDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ message: 'Відповіді не можуть бути порожніми' })
  answers: string[];
}
