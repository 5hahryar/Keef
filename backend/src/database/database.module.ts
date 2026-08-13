import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseBootstrapService, ensureDatabaseDirectory } from './database-bootstrap.service';
import {
  AssetEntity,
  AssetTransactionEntity,
  BankEntity,
  CategoryEntity,
  InstallmentEntity,
  LoanEntity,
  TransactionEntity,
  TransactionTypeEntity,
  UserEntity,
} from './entities';
import { SeedService } from './seed.service';

const entities = [
  UserEntity,
  BankEntity,
  CategoryEntity,
  TransactionTypeEntity,
  TransactionEntity,
  LoanEntity,
  InstallmentEntity,
  AssetEntity,
  AssetTransactionEntity,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const database = config.get<string>('DB_PATH') ?? './data/keef.db';
        ensureDatabaseDirectory(database);
        return {
          type: 'better-sqlite3' as const,
          database,
          entities,
          synchronize: false,
          enableWAL: false,
        };
      },
    }),
    TypeOrmModule.forFeature([BankEntity, CategoryEntity, TransactionTypeEntity, UserEntity]),
  ],
  providers: [SeedService, DatabaseBootstrapService],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
