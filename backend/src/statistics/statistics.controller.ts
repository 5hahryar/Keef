import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUsername } from '../common/current-user.decorator';
import { parseRfc3339 } from '../common/dates';
import { StatisticsService } from './statistics.service';

@ApiTags('statistics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statistics: StatisticsService) {}

  @Get('total-spent')
  getTotalSpending(
    @CurrentUsername() username: string,
    @Query('category') category?: string,
    @Query('startDate') startDateQuery?: string,
    @Query('endDate') endDateQuery?: string,
  ) {
    const { startDate, endDate } = this.parseDateRange(startDateQuery, endDateQuery);
    return this.statistics.getTotalSpending(username, category, startDate, endDate);
  }

  @Get('total-spent-category')
  getTotalSpendingByCategory(
    @CurrentUsername() username: string,
    @Query('startDate') startDateQuery?: string,
    @Query('endDate') endDateQuery?: string,
  ) {
    const { startDate, endDate } = this.parseDateRange(startDateQuery, endDateQuery);
    return this.statistics.getSpendingForAllCategories(username, startDate, endDate);
  }

  @Get('transaction-count')
  getTransactionCount(
    @CurrentUsername() username: string,
    @Query('startDate') startDateQuery?: string,
    @Query('endDate') endDateQuery?: string,
  ) {
    const { startDate, endDate } = this.parseDateRange(startDateQuery, endDateQuery);
    return this.statistics.getTransactionCount(username, startDate, endDate);
  }

  private parseDateRange(startDateQuery?: string, endDateQuery?: string): {
    startDate?: Date;
    endDate?: Date;
  } {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateQuery) {
      const parsed = parseRfc3339(startDateQuery);
      if (!parsed) {
        throw new HttpException({ message: 'invalid date' }, HttpStatus.BAD_REQUEST);
      }
      startDate = parsed;
    }
    if (endDateQuery) {
      const parsed = parseRfc3339(endDateQuery);
      if (!parsed) {
        throw new HttpException({ message: 'Invalid end date' }, HttpStatus.BAD_REQUEST);
      }
      endDate = parsed;
    }

    return { startDate, endDate };
  }
}
