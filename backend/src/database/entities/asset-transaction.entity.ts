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
import { AssetEntity } from './asset.entity';
import { UserEntity } from './user.entity';

@Entity('asset_transaction_entities')
export class AssetTransactionEntity {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @Column({ type: 'text', nullable: true })
  type: string;

  @Column({ type: 'real', nullable: true })
  quantity: number;

  @Column({ type: 'real', nullable: true })
  price: number;

  @Column({ type: 'text', nullable: true })
  date: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'asset_id', type: 'text', nullable: true })
  assetId: string;

  @ManyToOne(() => AssetEntity)
  @JoinColumn({ name: 'asset_id' })
  asset: AssetEntity;

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
