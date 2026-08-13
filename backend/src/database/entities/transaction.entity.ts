import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { sqliteDateTransformer } from '../../common/dates';
import { BankEntity } from './bank.entity';
import { CategoryEntity } from './category.entity';
import { TransactionTypeEntity } from './transaction-type.entity';
import { UserEntity } from './user.entity';

@Entity('transaction_entities')
export class TransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', transformer: sqliteDateTransformer })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', transformer: sqliteDateTransformer })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', transformer: sqliteDateTransformer, nullable: true })
  deletedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  title: string;

  @Column({ type: 'integer', nullable: true })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'datetime', nullable: true, transformer: sqliteDateTransformer })
  date: Date;

  @Column({ name: 'bank_id', type: 'integer', nullable: true })
  bankId: number;

  @ManyToOne(() => BankEntity)
  @JoinColumn({ name: 'bank_id' })
  bank: BankEntity;

  @Column({ name: 'category_id', type: 'integer', nullable: true })
  categoryId: number;

  @ManyToOne(() => CategoryEntity)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @Column({ name: 'type_id', type: 'integer', nullable: true })
  typeId: number;

  @ManyToOne(() => TransactionTypeEntity)
  @JoinColumn({ name: 'type_id' })
  type: TransactionTypeEntity;

  @Column({ name: 'user_id', type: 'integer', nullable: true })
  userId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
