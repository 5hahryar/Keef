import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { InstallmentEntity, LoanEntity, UserEntity } from '../database/entities';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([LoanEntity, InstallmentEntity, UserEntity])],
  controllers: [LoansController],
  providers: [LoansService],
})
export class LoansModule {}
