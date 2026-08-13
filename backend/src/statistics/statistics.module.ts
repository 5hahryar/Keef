import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CategoryEntity, TransactionEntity, UserEntity } from '../database/entities';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([TransactionEntity, UserEntity, CategoryEntity])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
