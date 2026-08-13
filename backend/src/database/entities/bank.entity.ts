import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bank_entities')
export class BankEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;
}
