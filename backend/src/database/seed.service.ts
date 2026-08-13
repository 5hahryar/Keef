import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashPassword } from '../common/hash';
import { BankEntity, CategoryEntity, TransactionTypeEntity, UserEntity } from './entities';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(CategoryEntity) private readonly categories: Repository<CategoryEntity>,
    @InjectRepository(BankEntity) private readonly banks: Repository<BankEntity>,
    @InjectRepository(TransactionTypeEntity) private readonly types: Repository<TransactionTypeEntity>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
  ) {}

  async run(): Promise<void> {
    await this.seedCategories();
    await this.seedBanks();
    await this.seedExpenseTypes();
    await this.seedUsers();
  }

  private async seedCategories(): Promise<void> {
    const categories = [
      { id: 1, name: 'Food' },
      { id: 2, name: 'Transportation' },
      { id: 3, name: 'Medical' },
      { id: 4, name: 'Entertainment' },
      { id: 5, name: 'Home' },
      { id: 6, name: 'Investment' },
      { id: 7, name: 'Debt' },
      { id: 8, name: 'Clothes' },
      { id: 9, name: 'Other' },
    ];

    for (const category of categories) {
      const exists = await this.categories.findOne({ where: { name: category.name } });
      if (!exists) {
        await this.categories.save(this.categories.create(category));
      }
    }
  }

  private async seedBanks(): Promise<void> {
    const banks = [
      { id: 1, name: 'Pasargad' },
      { id: 2, name: 'Mellat' },
      { id: 3, name: 'Blu' },
      { id: 4, name: 'Wepod' },
      { id: 5, name: 'MehrIran' },
    ];

    for (const bank of banks) {
      const exists = await this.banks.findOne({ where: { name: bank.name } });
      if (!exists) {
        await this.banks.save(this.banks.create(bank));
      }
    }
  }

  private async seedExpenseTypes(): Promise<void> {
    const types = [
      { id: 1, name: 'Withdraw' },
      { id: 2, name: 'Deposit' },
    ];

    for (const type of types) {
      const exists = await this.types.findOne({ where: { name: type.name } });
      if (!exists) {
        await this.types.save(this.types.create(type));
      }
    }
  }

  private async seedUsers(): Promise<void> {
    const passwordHash = await hashPassword('1234');
    const users = [
      { username: 'a', passwordHash },
      { username: 'b', passwordHash },
    ];

    for (const user of users) {
      const exists = await this.users.findOne({ where: { username: user.username } });
      if (!exists) {
        await this.users.save(this.users.create(user));
      }
    }
  }
}
