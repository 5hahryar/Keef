import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('transaction_type_entities')
export class TransactionTypeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;
}
