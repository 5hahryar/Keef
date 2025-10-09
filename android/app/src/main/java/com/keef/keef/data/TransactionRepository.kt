package com.keef.keef.data

import androidx.paging.PagingData
import com.keef.keef.common.Resource
import com.keef.keef.model.Category
import com.keef.keef.model.Transaction
import kotlinx.coroutines.flow.Flow
import kotlinx.datetime.Instant

interface TransactionRepository {
    fun getTransactions(category: Category? = null): Flow<PagingData<Transaction>>
    suspend fun updateTransactionCategory(transactionId: Int, category: Category)
    suspend fun deleteTransaction(transactionId: Int)
    suspend fun insertTransaction(transaction: Transaction): Resource<Int>
    suspend fun getTotalSpending(category: Category? = null, startTime: Instant? = null, endTime: Instant? = null): Resource<Long>
    suspend fun getStatsTotalSpendingByCategory(startTime: Instant, endTime: Instant): Resource<Map<Category, Long>>
    suspend fun sync(): Boolean
}