import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity('lessons')
export class LessonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  topic: string;

  @Column({ type: 'varchar', length: 50 })
  level: string;

  @Column({ type: 'jsonb', nullable: true })
  words: Array<{
    word: string;
    translation: string;
    transcription: string;
  }>;

  @Column({ type: 'text', nullable: true })
  text: string;

  @Column({ type: 'jsonb', nullable: true })
  quiz: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.lessons, { onDelete: 'CASCADE' })
  user: User;
}
