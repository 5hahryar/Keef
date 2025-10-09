package com.keef.keef.ui.category

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.paging.cachedIn
import com.keef.keef.common.Resource
import com.keef.keef.model.Category
import com.keef.keef.model.Transaction
import com.keef.keef.model.TransactionType
import com.keef.keef.data.TransactionRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class CategoryTransactionsViewModel(
    private val transactionRepository: TransactionRepository,
    private val category: Category
) : ViewModel() {

    val transactions = transactionRepository.getTransactions(category).cachedIn(viewModelScope)
    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: Flow<UiState> = _uiState
//    val uiState: Flow<UiState> =
//        transactionRepository.getTransactionsByCategory(category)
//        .shareIn(viewModelScope, SharingStarted.WhileSubscribed())
//        .map { it.groupBy { it.datetime.toInstant().toPersianDate() } }
//        .map {
//            UiState.Success(
//                total = calculateSum(it.values),
//                transactions = it,
//            )
//        }
//        .onEach {
//            it.period = "از ${
//                it.transactions.values.first().first().datetime.toInstant().toPersianDate()
//            } تا ${it.transactions.values.first().last().datetime.toInstant().toPersianDate()}"
//        }

    private val _errorMessage = MutableSharedFlow<String>()
    val errorMessage: SharedFlow<String> = _errorMessage.asSharedFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            transactionRepository.getTotalSpending(category).let { spending ->
                when(spending) {
                    is Resource.Error -> _errorMessage.emit(spending.message)
                    is Resource.Success -> _uiState.update { UiState.Success(spending.data) }
                }
            }
        }

    }

    private suspend fun calculateSum(values: Collection<List<Transaction>>): Long {
        return withContext(Dispatchers.Default) {
            var sum: Long = 0
            values.forEach {
                it.forEach {
                    if (it.transactionType == TransactionType.Withdraw) {
                        sum += it.amount
                    }
                }
            }
            sum
        }
    }

    sealed interface UiState {
        object Loading : UiState
        class Success(
            val total: Long
        ) : UiState
    }
}