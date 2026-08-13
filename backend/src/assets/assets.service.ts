import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { AssetEntity, AssetTransactionEntity, UserEntity } from '../database/entities';
import {
  AssetResponse,
  AssetTransactionResponse,
  CreateAssetDto,
  CreateAssetTransactionDto,
  UpdateAssetDto,
} from './dto/asset.dto';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(AssetEntity) private readonly assets: Repository<AssetEntity>,
    @InjectRepository(AssetTransactionEntity) private readonly assetTransactions: Repository<AssetTransactionEntity>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
  ) {}

  async create(username: string, asset: CreateAssetDto): Promise<string> {
    const user = await this.requireUser(username);
    const entity = this.assets.create({
      id: uuidv7(),
      name: asset.name,
      symbol: asset.symbol,
      type: asset.type,
      quantity: 0,
      currentPrice: asset.currentPrice,
      userId: user.id,
    });
    const saved = await this.assets.save(entity);
    return saved.id;
  }

  async findAll(username: string): Promise<AssetResponse[]> {
    const user = await this.requireUser(username);
    const entities = await this.assets.find({ where: { userId: user.id } });
    return entities.map((entity) => this.toAsset(entity));
  }

  async findOne(username: string, assetId: string): Promise<AssetResponse> {
    const user = await this.requireUser(username);
    const entity = await this.assets.findOne({ where: { id: assetId, userId: user.id } });
    if (!entity) {
      throw new HttpException({ message: 'Asset not found' }, HttpStatus.NOT_FOUND);
    }
    return this.toAsset(entity);
  }

  async update(username: string, assetId: string, updates: UpdateAssetDto): Promise<void> {
    const user = await this.requireUser(username);
    const entity = await this.assets.findOne({ where: { id: assetId, userId: user.id } });
    if (!entity) {
      throw new HttpException({ message: 'Asset not found' }, HttpStatus.NOT_FOUND);
    }

    if (updates.name) {
      entity.name = updates.name;
    }
    if (updates.symbol) {
      entity.symbol = updates.symbol;
    }
    if (updates.type) {
      entity.type = updates.type;
    }
    if (updates.currentPrice && updates.currentPrice > 0) {
      entity.currentPrice = updates.currentPrice;
    }

    await this.assets.save(entity);
  }

  async remove(username: string, assetId: string): Promise<void> {
    const user = await this.requireUser(username);
    await this.assetTransactions.softDelete({ assetId, userId: user.id });
    await this.assets.softDelete({ id: assetId, userId: user.id });
  }

  async createTransaction(username: string, transaction: CreateAssetTransactionDto): Promise<string> {
    const user = await this.requireUser(username);
    const asset = await this.assets.findOne({ where: { id: transaction.assetId, userId: user.id } });
    if (!asset) {
      throw new HttpException({ message: 'Asset not found' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (transaction.type === 'sell' && transaction.quantity > asset.quantity) {
      throw new HttpException({ message: 'insufficient quantity to sell' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const entity = this.assetTransactions.create({
      id: uuidv7(),
      assetId: transaction.assetId,
      type: transaction.type,
      quantity: transaction.quantity,
      price: transaction.price,
      date: transaction.date,
      description: transaction.description ?? '',
      userId: user.id,
    });
    const saved = await this.assetTransactions.save(entity);

    if (transaction.type === 'buy') {
      const oldTotal = asset.quantity * asset.currentPrice;
      const newTotal = transaction.quantity * transaction.price;
      const newQuantity = asset.quantity + transaction.quantity;
      asset.quantity = newQuantity;
      if (newQuantity > 0) {
        asset.currentPrice = (oldTotal + newTotal) / newQuantity;
      }
    } else if (transaction.type === 'sell') {
      asset.quantity -= transaction.quantity;
    }

    await this.assets.save(asset);
    return saved.id;
  }

  async findTransactions(username: string, assetId?: string): Promise<AssetTransactionResponse[]> {
    const user = await this.requireUser(username);
    const query = this.assetTransactions
      .createQueryBuilder('tx')
      .where('tx.userId = :userId', { userId: user.id })
      .orderBy('tx.date', 'DESC')
      .addOrderBy('tx.createdAt', 'DESC');

    if (assetId) {
      query.andWhere('tx.assetId = :assetId', { assetId });
    } else {
      query.leftJoinAndSelect('tx.asset', 'asset');
    }

    const entities = await query.getMany();
    return entities.map((entity) => this.toTransaction(entity));
  }

  async removeTransaction(username: string, transactionId: string): Promise<void> {
    const user = await this.requireUser(username);
    const transaction = await this.assetTransactions.findOne({
      where: { id: transactionId, userId: user.id },
    });
    if (!transaction) {
      throw new HttpException({ message: 'Transaction not found' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const asset = await this.assets.findOne({ where: { id: transaction.assetId } });
    if (asset) {
      if (transaction.type === 'buy') {
        asset.quantity -= transaction.quantity;
      } else if (transaction.type === 'sell') {
        asset.quantity += transaction.quantity;
      }
      await this.assets.save(asset);
    }

    await this.assetTransactions.softDelete({ id: transaction.id });
  }

  private toAsset(entity: AssetEntity): AssetResponse {
    return {
      id: entity.id,
      name: entity.name,
      symbol: entity.symbol,
      type: entity.type,
      quantity: entity.quantity,
      currentPrice: entity.currentPrice,
    };
  }

  private toTransaction(entity: AssetTransactionEntity): AssetTransactionResponse {
    return {
      id: entity.id,
      assetId: entity.assetId,
      type: entity.type,
      quantity: entity.quantity,
      price: entity.price,
      date: entity.date,
      description: entity.description,
    };
  }

  private async requireUser(username: string): Promise<UserEntity> {
    const user = await this.users.findOne({ where: { username } });
    if (!user) {
      throw new HttpException({ message: 'User not found' }, HttpStatus.BAD_REQUEST);
    }
    return user;
  }
}
