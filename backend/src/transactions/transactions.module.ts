import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BankEntity, CategoryEntity, TransactionEntity, TransactionTypeEntity, UserEntity } from '../database/entities';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      TransactionEntity,
      UserEntity,
      CategoryEntity,
      BankEntity,
      TransactionTypeEntity,
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
