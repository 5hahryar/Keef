package com.keef.keef.data

import androidx.paging.Pager
import androidx.paging.PagingConfig
import androidx.paging.PagingData
import com.keef.keef.common.Resource
import com.keef.keef.model.Category
import com.keef.keef.model.Transaction
import com.keef.keef.remote.ApiService
import com.keef.keef.ui.home.TransactionPagingSource
import kotlinx.coroutines.flow.Flow
import kotlinx.datetime.Instant

class TransactionRepositoryImpl(
    private val apiService: ApiService
) :
    TransactionRepository {
    override fun getTransactions(category: Category?): Flow<PagingData<Transaction>> {
        return Pager(PagingConfig(pageSize = 20)) {
            TransactionPagingSource(apiService, category)
        }.flow
    }

    override suspend fun updateTransactionCategory(
        transactionId: Int,
        category: Category
    ) {
        TODO("Not yet implemented")
    }

    override suspend fun deleteTransaction(transactionId: Int) {
        apiService.deleteTransaction(transactionId)
    }

    override suspend fun insertTransaction(transaction: Transaction): Resource<Int> =
        apiService.createTransaction(transaction)

    override suspend fun getTotalSpending(category: Category?, startTime: Instant?, endTime: Instant?): Resource<Long> {
        return apiService.getTotalSpending(category?.name, startTime, endTime)
    }

    override suspend fun getStatsTotalSpendingByCategory(
        startTime: Instant,
        endTime: Instant
    ): Resource<Map<Category, Long>> {
        return apiService.getStatsTotalSpendingByCategory(startTime, endTime)
    }

    override suspend fun sync(): Boolean {
        TODO("Not yet implemented")
    }

}