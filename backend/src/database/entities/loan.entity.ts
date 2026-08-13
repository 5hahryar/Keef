import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { sqliteBoolTransformer, sqliteDateTransformer } from '../../common/dates';
import { InstallmentEntity } from './installment.entity';
import { UserEntity } from './user.entity';

@Entity('loan_entities')
export class LoanEntity {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @Column({ type: 'text', nullable: true })
  name: string;

  @Column({ name: 'installment_amount', type: 'integer', nullable: true })
  installmentAmount: number;

  @Column({ name: 'number_of_installments', type: 'integer', nullable: true })
  numberOfInstallments: number;

  @Column({ name: 'due_day_number', type: 'integer', nullable: true })
  dueDayNumber: number;

  @Column({ name: 'is_paid', type: 'numeric', nullable: true, transformer: sqliteBoolTransformer })
  isPaid: boolean;

  @OneToMany(() => InstallmentEntity, (installment) => installment.loan, { cascade: true })
  installments: InstallmentEntity[];

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
