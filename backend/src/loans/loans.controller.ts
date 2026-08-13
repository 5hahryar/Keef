import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUsername } from '../common/current-user.decorator';
import { parseRfc3339 } from '../common/dates';
import { CreateLoanDto } from './dto/loan.dto';
import { LoansService } from './loans.service';

@ApiTags('loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loans: LoansService) {}

  @Get()
  getLoans(@CurrentUsername() username: string) {
    return this.loans.findAll(username);
  }

  @Post()
  async createLoan(@CurrentUsername() username: string, @Body() loan: CreateLoanDto) {
    if (!loan) {
      throw new HttpException({ message: 'Request format is wrong!' }, HttpStatus.BAD_REQUEST);
    }
    return this.loans.create(username, loan);
  }

  @Get('installments')
  getInstallments(
    @CurrentUsername() username: string,
    @Query('fromDueDate') fromDueDateQuery?: string,
    @Query('toDueDate') toDueDateQuery?: string,
  ) {
    let fromDueDate: Date | undefined;
    let toDueDate: Date | undefined;

    if (fromDueDateQuery) {
      const parsed = parseRfc3339(fromDueDateQuery);
      if (!parsed) {
        throw new HttpException({ message: 'invalid date' }, HttpStatus.BAD_REQUEST);
      }
      fromDueDate = parsed;
    }
    if (toDueDateQuery) {
      const parsed = parseRfc3339(toDueDateQuery);
      if (!parsed) {
        throw new HttpException({ message: 'Invalid end date' }, HttpStatus.BAD_REQUEST);
      }
      toDueDate = parsed;
    }

    return this.loans.findInstallments(username, fromDueDate, toDueDate);
  }

  @Get(':loanId')
  getLoan(@CurrentUsername() username: string, @Param('loanId') loanId: string) {
    if (!loanId) {
      throw new HttpException({ message: 'Invalid id!' }, HttpStatus.BAD_REQUEST);
    }
    return this.loans.findOne(username, loanId);
  }

  @Post(':loanId/installments/:installmentId/pay')
  @HttpCode(HttpStatus.OK)
  async payInstallment(
    @CurrentUsername() username: string,
    @Param('loanId') loanId: string,
    @Param('installmentId') installmentId: string,
  ) {
    await this.loans.payInstallment(username, loanId, installmentId);
    return null;
  }
}
