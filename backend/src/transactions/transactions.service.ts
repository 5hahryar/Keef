import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { parseRfc3339, toRfc3339Utc } from '../common/dates';
import { BankEntity, CategoryEntity, TransactionEntity, TransactionTypeEntity, UserEntity } from '../database/entities';
import { TransactionDto, TransactionResponse } from './dto/transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionEntity) private readonly transactions: Repository<TransactionEntity>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    @InjectRepository(CategoryEntity) private readonly categories: Repository<CategoryEntity>,
    @InjectRepository(BankEntity) private readonly banks: Repository<BankEntity>,
    @InjectRepository(TransactionTypeEntity) private readonly types: Repository<TransactionTypeEntity>,
  ) {}

  async create(username: string, transaction: TransactionDto): Promise<number> {
    const user = await this.requireUser(username);
    const category = await this.categories.findOne({ where: { name: transaction.category } });
    const bank = await this.banks.findOne({ where: { name: transaction.bank } });
    const type = await this.types.findOne({ where: { name: transaction.type } });
    const date = parseRfc3339(transaction.date) ?? new Date();

    const entity = this.transactions.create({
      title: transaction.title,
      amount: transaction.amount,
      description: transaction.description,
      bankId: bank?.id,
      categoryId: category?.id,
      typeId: type?.id,
      userId: user.id,
      date,
    });

    const saved = await this.transactions.save(entity);
    return saved.id;
  }

  async findAll(username: string, page: number, category?: string): Promise<TransactionResponse[]> {
    const user = await this.requireUser(username);
    const limit = 20;
    const offset = (page - 1) * limit;

    const query = this.transactions
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .leftJoinAndSelect('transaction.type', 'type')
      .leftJoinAndSelect('transaction.bank', 'bank')
      .where('transaction.userId = :userId', { userId: user.id })
      .orderBy('transaction.createdAt', 'DESC')
      .take(limit)
      .skip(offset);

    if (category) {
      const categoryEntity = await this.categories.findOne({ where: { name: category } });
      if (!categoryEntity) {
        return [];
      }
      query.andWhere('transaction.categoryId = :categoryId', { categoryId: categoryEntity.id });
    }

    const entities = await query.getMany();
    return entities.map((entity) => this.toResponse(entity));
  }

  async update(username: string, id: number, transaction: TransactionDto): Promise<void> {
    const user = await this.requireUser(username);
    const entity = await this.transactions.findOne({ where: { id, userId: user.id } });
    if (!entity) {
      throw new HttpException({ message: 'Transaction not found' }, HttpStatus.NOT_FOUND);
    }

    const category = await this.categories.findOne({ where: { name: transaction.category } });
    const bank = await this.banks.findOne({ where: { name: transaction.bank } });
    const type = await this.types.findOne({ where: { name: transaction.type } });
    const date = parseRfc3339(transaction.date) ?? entity.date;

    entity.title = transaction.title;
    entity.description = transaction.description;
    entity.amount = transaction.amount;
    entity.bankId = bank?.id ?? entity.bankId;
    entity.categoryId = category?.id ?? entity.categoryId;
    entity.typeId = type?.id ?? entity.typeId;
    entity.date = date;

    await this.transactions.save(entity);
  }

  async remove(username: string, id: number): Promise<void> {
    const user = await this.requireUser(username);
    await this.transactions.softDelete({ id, userId: user.id });
  }

  private toResponse(entity: TransactionEntity): TransactionResponse {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      amount: entity.amount,
      bank: entity.bank?.name,
      category: entity.category?.name,
      type: entity.type?.name,
      date: entity.date ? toRfc3339Utc(entity.date) : '',
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
