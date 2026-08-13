import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AssetEntity, AssetTransactionEntity, UserEntity } from '../database/entities';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([AssetEntity, AssetTransactionEntity, UserEntity])],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
