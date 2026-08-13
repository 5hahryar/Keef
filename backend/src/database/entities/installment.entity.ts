import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { sqliteDateTransformer } from '../../common/dates';
import { LoanEntity } from './loan.entity';
import { UserEntity } from './user.entity';

@Entity('installment_entities')
export class InstallmentEntity {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @Column({ name: 'installment_number', type: 'integer', nullable: true })
  installmentNumber: number;

  @Column({ type: 'integer', nullable: true })
  amount: number;

  @Column({ name: 'due_date', type: 'datetime', nullable: true, transformer: sqliteDateTransformer })
  dueDate: Date;

  @Column({ name: 'paid_date', type: 'datetime', nullable: true, transformer: sqliteDateTransformer })
  paidDate: Date | null;

  @Column({ name: 'loan_id', type: 'text', nullable: true })
  loanId: string;

  @ManyToOne(() => LoanEntity, (loan) => loan.installments)
  @JoinColumn({ name: 'loan_id' })
  loan: LoanEntity;

  @Column({ name: 'user_id', type: 'integer', nullable: true })
  userId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', transformer: sqliteDateTransformer })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', transformer: sqliteDateTransformer })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', transformer: sqliteDateTransformer, nullable: true })
  deletedAt: Date | null;
}
