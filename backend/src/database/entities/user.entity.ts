import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { sqliteDateTransformer } from '../../common/dates';

@Entity('user_entities')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', transformer: sqliteDateTransformer })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', transformer: sqliteDateTransformer })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', transformer: sqliteDateTransformer, nullable: true })
  deletedAt: Date | null;

  @Column({ unique: true })
  username: string;

  @Column({ name: 'password_hash', type: 'text', nullable: true })
  passwordHash: string;
}
