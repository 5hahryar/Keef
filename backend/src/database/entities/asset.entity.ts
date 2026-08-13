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
import { UserEntity } from './user.entity';

@Entity('asset_entities')
export class AssetEntity {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @Column({ type: 'text', nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  symbol: string;

  @Column({ type: 'text', nullable: true })
  type: string;

  @Column({ type: 'real', nullable: true })
  quantity: number;

  @Column({ name: 'current_price', type: 'real', nullable: true })
  currentPrice: number;

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
