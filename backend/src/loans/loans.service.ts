import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { parseRfc3339 } from '../common/dates';
import { generateInstallmentDueDates } from '../common/persian-calendar';
import { InstallmentEntity, LoanEntity, UserEntity } from '../database/entities';
import { CreateLoanDto, InstallmentResponse, LoanDetailResponse, LoanResponse } from './dto/loan.dto';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(LoanEntity) private readonly loans: Repository<LoanEntity>,
    @InjectRepository(InstallmentEntity) private readonly installments: Repository<InstallmentEntity>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
  ) {}

  async create(username: string, loan: CreateLoanDto): Promise<string> {
    const user = await this.requireUser(username);

    let firstPaymentDate: Date | undefined;
    if (loan.firstPaymentDate) {
      const parsed = parseRfc3339(loan.firstPaymentDate);
      if (!parsed) {
        throw new HttpException({ message: 'invalid first payment date format' }, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      firstPaymentDate = parsed;
    }

    const dueDates = generateInstallmentDueDates(
      loan.numberOfDueDay,
      loan.numberOfInstallments,
      firstPaymentDate,
    );

    const now = new Date();
    const loanId = uuidv7();
    const installmentEntities = dueDates.map((dueDate, index) =>
      this.installments.create({
        id: uuidv7(),
        amount: loan.installmentAmount,
        dueDate,
        installmentNumber: index + 1,
        userId: user.id,
        paidDate: now.getTime() > dueDate.getTime() ? dueDate : null,
      }),
    );

    const entity = this.loans.create({
      id: loanId,
      name: loan.name,
      installmentAmount: loan.installmentAmount,
      numberOfInstallments: loan.numberOfInstallments,
      dueDayNumber: loan.numberOfDueDay,
      installments: installmentEntities,
      userId: user.id,
    });

    const saved = await this.loans.save(entity);
    return saved.id;
  }

  async findAll(username: string): Promise<LoanResponse[]> {
    const user = await this.requireUser(username);
    const entities = await this.loans.find({ where: { userId: user.id } });
    return entities.map((entity) => this.toLoanResponse(entity));
  }

  async findOne(username: string, loanId: string): Promise<LoanDetailResponse> {
    const user = await this.requireUser(username);
    const entity = await this.loans.findOne({
      where: { id: loanId, userId: user.id },
      relations: ['installments'],
    });
    if (!entity) {
      throw new HttpException({ message: 'Unable to get loan info!' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const now = new Date();
    let isLoanPaid = true;
    const installments: InstallmentResponse[] = entity.installments.map((installment) => {
      if (!installment.paidDate) {
        isLoanPaid = false;
      }
      return {
        id: installment.id,
        amount: installment.amount,
        dueDate: installment.dueDate,
        installmentNumber: installment.installmentNumber,
        status: this.statusOf(installment.paidDate, installment.dueDate, now),
      };
    });

    if (entity.isPaid !== isLoanPaid) {
      entity.isPaid = isLoanPaid;
      await this.loans.update({ id: entity.id }, { isPaid: isLoanPaid });
    }

    return {
      id: entity.id,
      name: entity.name,
      numberOfInstallments: entity.numberOfInstallments,
      installmentAmount: entity.installmentAmount,
      numberOfDueDay: entity.dueDayNumber,
      isPaid: isLoanPaid,
      installments,
    };
  }

  async findInstallments(username: string, fromDueDate?: Date, toDueDate?: Date): Promise<InstallmentResponse[]> {
    const user = await this.requireUser(username);
    const query = this.installments
      .createQueryBuilder('installment')
      .leftJoinAndSelect('installment.loan', 'loan')
      .where('installment.userId = :userId', { userId: user.id });

    if (fromDueDate) {
      query.andWhere('datetime(installment.due_date) >= datetime(:fromDueDate)', {
        fromDueDate: fromDueDate.toISOString(),
      });
    }
    if (toDueDate) {
      query.andWhere('datetime(installment.due_date) <= datetime(:toDueDate)', {
        toDueDate: toDueDate.toISOString(),
      });
    }

    const entities = await query.getMany();
    const now = new Date();
    return entities.map((entity) => ({
      id: entity.id,
      amount: entity.amount,
      dueDate: entity.dueDate,
      installmentNumber: entity.installmentNumber,
      status: this.statusOf(entity.paidDate, entity.dueDate, now),
      loan: this.toLoanResponse(entity.loan),
    }));
  }

  async payInstallment(username: string, loanId: string, installmentId: string): Promise<void> {
    const user = await this.requireUser(username);
    const installment = await this.installments.findOne({ where: { id: installmentId, userId: user.id } });
    if (!installment) {
      throw new HttpException({ message: 'installment not found' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (installment.loanId !== loanId) {
      throw new HttpException({ message: 'installment does not belong to the loan' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    installment.paidDate = new Date();
    await this.installments.save(installment);
  }

  private toLoanResponse(entity: LoanEntity): LoanResponse {
    return {
      id: entity.id,
      name: entity.name,
      numberOfInstallments: entity.numberOfInstallments,
      installmentAmount: entity.installmentAmount,
      numberOfDueDay: entity.dueDayNumber,
      isPaid: entity.isPaid,
    };
  }

  private statusOf(paidDate: Date | null, dueDate: Date, now: Date): 'pending' | 'paid' | 'overdue' {
    if (paidDate) {
      return 'paid';
    }
    if (now.getTime() > dueDate.getTime()) {
      return 'overdue';
    }
    return 'pending';
  }

  private async requireUser(username: string): Promise<UserEntity> {
    const user = await this.users.findOne({ where: { username } });
    if (!user) {
      throw new HttpException({ message: 'User not found' }, HttpStatus.BAD_REQUEST);
    }
    return user;
  }
}
