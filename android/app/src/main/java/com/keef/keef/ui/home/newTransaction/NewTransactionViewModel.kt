package com.keef.keef.ui.home.newTransaction

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.keef.keef.common.Event
import com.keef.keef.common.Resource
import com.keef.keef.model.Bank
import com.keef.keef.model.Category
import com.keef.keef.model.Transaction
import com.keef.keef.model.TransactionType
import com.keef.keef.data.TransactionRepository
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock

class NewTransactionViewModel(private val transactionDao: TransactionRepository): ViewModel() {

    var isPasteAvailable = MutableStateFlow(false)
        private set

    var transaction = ClipTransaction()
    private var clipTransaction: Transaction? = null

    private val _insertEvent = MutableSharedFlow<Event<InsertTransactionEvent>>()
    val insertEvent = _insertEvent.asSharedFlow()

    fun addTransaction() {
        viewModelScope.launch {
            val response = transactionDao.insertTransaction(
                Transaction(
                    title = transaction.title.value,
                    amount = transaction.amount.value.toLong(),
                    transactionType = if (transaction.isDeposit.value) TransactionType.Deposit else TransactionType.Withdraw,
                    datetime = Clock.System.now().toString(),
                    bank = Bank.values()[transaction.bank.value],
                    category = Category.values()[transaction.category.value]
                )
            )
            when(response) {
                is Resource.Error<*> -> _insertEvent.emit(Event(InsertTransactionEvent(response.message, false)))
                is Resource.Success<*> -> _insertEvent.emit(Event(InsertTransactionEvent(null, true)))
            }
        }
    }

    fun applyClipboard() {
        transaction.amount.value = clipTransaction?.amount.toString()
        transaction.category.value = clipTransaction?.category?.ordinal ?: 0
        transaction.bank.value = clipTransaction?.bank?.ordinal ?: 0
        transaction.isDeposit.value = clipTransaction?.transactionType == TransactionType.Deposit
    }

    class ClipTransaction {
        var title = mutableStateOf("")
        var amount = mutableStateOf("")
        var category = mutableStateOf(Category.Food.ordinal)
        var bank = mutableStateOf(Bank.Pasargad.ordinal)
        var isDeposit = mutableStateOf(false)
    }

    data class InsertTransactionEvent(val errorMessage: String?, val isSuccess: Boolean)
}
