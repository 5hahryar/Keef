import { Injectable, OnModuleInit } from '@nestjs/common';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import { DataSource } from 'typeorm';
import { SeedService } from './seed.service';

@Injectable()
export class DatabaseBootstrapService implements OnModuleInit {
  constructor(
    private readonly dataSource: DataSource,
    private readonly seed: SeedService,
  ) {}

  async onModuleInit(): Promise<void> {
    const tables = await this.dataSource.query(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='user_entities'`,
    );
    if (tables.length === 0) {
      await this.dataSource.synchronize();
    }
    await this.dataSource.query('PRAGMA foreign_keys = ON;');
    await this.seed.run();
  }
}

export function ensureDatabaseDirectory(dbPath: string): void {
  mkdirSync(dirname(dbPath), { recursive: true });
}
