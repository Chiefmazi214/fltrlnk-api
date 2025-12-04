import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './models/transactions.model';
import { GetAllTransactionsDto } from './dto/transaction.dto';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  async getAllTransactions(query: GetAllTransactionsDto): Promise<any> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.type) {
      filter.type = query.type;
    }
    if (query.store) {
      filter.store = query.store;
    }

    const [data, total] = await Promise.all([
      this.transactionModel
        .find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.transactionModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTransactionStats(): Promise<any> {
    const transactions = await this.transactionModel.find().exec();

    const totalRevenue = transactions.reduce(
      (sum, t) => sum + (t.amount || 0),
      0,
    );
    const totalTransactions = transactions.length;
    const avgOrderValue =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return {
      totalRevenue,
      totalTransactions,
      avgOrderValue,
    };
  }

  async getUserTransactions(userId: string): Promise<any> {
    const transactions = await this.transactionModel
      .find({ user: userId })
      .exec();
    return transactions;
  }
}
