import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity, TransactionEntity, UserEntity } from '../database/entities';

export class CategorySpending {
  name: string;
  total: number;
  transaction_count: number;
}

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(TransactionEntity) private readonly transactions: Repository<TransactionEntity>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    @InjectRepository(CategoryEntity) private readonly categories: Repository<CategoryEntity>,
  ) {}

  async getTotalSpending(
    username: string,
    category?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<number> {
    const user = await this.users.findOne({ where: { username } });
    if (!user) {
      return 0;
    }

    const query = this.transactions
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.user_id = :userId', { userId: user.id });

    this.applyDateFilters(query, startDate, endDate);

    if (category) {
      const categoryEntity = await this.categories.findOne({ where: { name: category } });
      if (!categoryEntity) {
        return 0;
      }
      query.andWhere('t.category_id = :categoryId', { categoryId: categoryEntity.id });
    }

    const result = await query.getRawOne<{ total: string | number }>();
    return Number(result?.total ?? 0);
  }

  async getSpendingForAllCategories(
    username: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<CategorySpending[]> {
    const user = await this.users.findOne({ where: { username } });
    if (!user) {
      return [];
    }

    const query = this.transactions
      .createQueryBuilder('t')
      .innerJoin('t.category', 'c')
      .select('c.name', 'name')
      .addSelect('SUM(t.amount)', 'total')
      .addSelect('COUNT(t.id)', 'transaction_count')
      .where('t.user_id = :userId', { userId: user.id })
      .groupBy('c.name');

    this.applyDateFilters(query, startDate, endDate);

    const rows = await query.getRawMany<{ name: string; total: string; transaction_count: string }>();
    return rows.map((row) => ({
      name: row.name,
      total: Number(row.total),
      transaction_count: Number(row.transaction_count),
    }));
  }

  async getTransactionCount(username: string, startDate?: Date, endDate?: Date): Promise<number> {
    const user = await this.users.findOne({ where: { username } });
    if (!user) {
      return 0;
    }

    const query = this.transactions
      .createQueryBuilder('t')
      .where('t.user_id = :userId', { userId: user.id });

    this.applyDateFilters(query, startDate, endDate);
    return query.getCount();
  }

  private applyDateFilters(
    query: ReturnType<Repository<TransactionEntity>['createQueryBuilder']>,
    startDate?: Date,
    endDate?: Date,
  ): void {
    if (startDate) {
      query.andWhere('datetime(t.date) >= datetime(:startDate)', { startDate: startDate.toISOString() });
    }
    if (endDate) {
      query.andWhere('datetime(t.date) <= datetime(:endDate)', { endDate: endDate.toISOString() });
    }
  }
}
