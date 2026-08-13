import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUsername } from '../common/current-user.decorator';
import { TransactionDto } from './dto/transaction.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactions: TransactionsService) {}

  @Get()
  async getTransactions(
    @CurrentUsername() username: string,
    @Query('page') pageQuery: string,
    @Query('category') category?: string,
  ) {
    const page = Number.parseInt(pageQuery, 10);
    if (Number.isNaN(page)) {
      throw new HttpException({ message: 'Invalid page number!' }, HttpStatus.BAD_REQUEST);
    }
    return this.transactions.findAll(username, page, category);
  }

  @Post('create')
  async createTransaction(@CurrentUsername() username: string, @Body() transaction: TransactionDto) {
    if (!transaction) {
      throw new HttpException({ message: 'Request format is wrong!' }, HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.transactions.create(username, transaction);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unable to create transaction';
      throw new HttpException({ message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updateTransaction(
    @CurrentUsername() username: string,
    @Param('id') idParam: string,
    @Body() transaction: TransactionDto,
  ) {
    const id = Number.parseInt(idParam, 10);
    if (Number.isNaN(id)) {
      throw new HttpException({ message: 'Invalid id!' }, HttpStatus.BAD_REQUEST);
    }
    if (!transaction) {
      throw new HttpException({ message: 'Request format is wrong!' }, HttpStatus.BAD_REQUEST);
    }
    await this.transactions.update(username, id, transaction);
    return { message: 'Transaction updated successfully' };
  }

  @Delete(':id/delete')
  @HttpCode(HttpStatus.OK)
  async deleteTransaction(@CurrentUsername() username: string, @Param('id') idParam: string) {
    const id = Number.parseInt(idParam, 10);
    if (Number.isNaN(id)) {
      throw new HttpException({ message: 'Invalid id!' }, HttpStatus.BAD_REQUEST);
    }
    await this.transactions.remove(username, id);
    return null;
  }
}
