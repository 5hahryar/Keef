import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('category_entities')
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;
}
