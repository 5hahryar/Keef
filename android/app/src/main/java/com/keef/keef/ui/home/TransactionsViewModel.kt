package com.keef.keef.ui.home

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.paging.cachedIn
import com.keef.keef.common.Resource
import com.keef.keef.common.getFirstDayOfMonth
import com.keef.keef.model.Category
import com.keef.keef.model.CategoryOverview
import com.keef.keef.model.Transaction
import com.keef.keef.model.TransactionType
import com.keef.keef.data.TransactionRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import saman.zamani.persiandate.PersianDate

class TransactionsViewModel(
    private val transactionRepository: TransactionRepository,
//    private val remoteDataSource: TransactionRemoteDataSource
) : ViewModel() {

    val transactions = transactionRepository.getTransactions().cachedIn(viewModelScope)

    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: Flow<UiState> = _uiState
//    val uiState: Flow<UiState> = transactionRepository.getTransactions()
//        .shareIn(viewModelScope, SharingStarted.WhileSubscribed())
//        .map { it.groupBy { transaction -> transaction.datetime.toInstant().toPersianDate() } }
//        .map {
//            UiState.Success(
//                total = calculateSum(it.values),
//                categories = Category.values().map { category ->
//                    CategoryOverview(
//                        category = category,
//                        total = calculateCategorySum(category, it.values)
//                    )
//                }.sortedBy { categoryOverview ->  categoryOverview.total }.reversed(),
//                transactions = it
//            )
//        }

    private val _userUiState = MutableStateFlow<UserUiState>(UserUiState.Loading)
    val userUiState: Flow<UserUiState> = _userUiState

    private val _errorMessage = MutableSharedFlow<String>()
    val errorMessage: SharedFlow<String> = _errorMessage.asSharedFlow()

    init {
        refresh()
//        viewModelScope.launch {
//            transactionRepository.getTotalSpending().let { spending ->
//                _uiState.update { UiState.Success(spending, emptyMap(), emptyList()) }
//            }
//            val user = FirebaseAuth.getInstance().currentUser
//            if (user != null) {
//                _userUiState.update { UserUiState.LoggedIn(user.photoUrl) }
//            } else _userUiState.update { UserUiState.LoggedOut }
//        }
    }

//    fun syncDataWithCloud() {
//        viewModelScope.launch {
//            _userUiState.update { (_userUiState.value as UserUiState.LoggedIn).copy(isLoading = true) }
//            remoteDataSource.addTransactions(transactionRepository.getTransactions().first())
//            _userUiState.update { (_userUiState.value as UserUiState.LoggedIn).copy(isLoading = false) }
//        }
//    }

    fun refresh() {
        viewModelScope.launch {
            transactionRepository.getTotalSpending(startTime = PersianDate().getFirstDayOfMonth()).let { spending ->
                when(spending) {
                    is Resource.Error -> _errorMessage.emit(spending.message)
                    is Resource.Success -> _uiState.update { UiState.Success(spending.data, Category.values().map { category ->
                    CategoryOverview(
                        category = category,
                        total = 0
                    )
                }.sortedBy { categoryOverview ->  categoryOverview.total }.reversed()) }
                }
            }
        }

    }

    private suspend fun calculateCategorySum(
        category: Category,
        transactions: Collection<List<Transaction>>
    ): Long {
        return withContext(Dispatchers.Default) {
            var sum: Long = 0
            transactions.forEach {
                it.forEach { transaction ->
                    if (transaction.transactionType == TransactionType.Withdraw && transaction.category == category) {
                        sum += transaction.amount
                    }
                }
            }
            sum
        }
    }

    private suspend fun calculateSum(values: Collection<List<Transaction>>): Long {
        return withContext(Dispatchers.Default) {
            var sum: Long = 0
            values.forEach {
                it.forEach { transaction ->
                    if (transaction.transactionType == TransactionType.Withdraw) {
                        sum += transaction.amount
                    }
                }
            }
            sum
        }
    }

    fun changeTransactionCategory(transactionId: Int, category: Category) {
        viewModelScope.launch {
            transactionRepository.updateTransactionCategory(transactionId, category)
        }
    }

//    fun addTransactionFromClipBoard(clipboard: ClipboardManager) {
//        try {
//            if (clipboard.hasPrimaryClip() && clipboard.primaryClipDescription?.hasMimeType(
//                    MIMETYPE_TEXT_PLAIN
//                ) == true
//            ) {
//                readMessage(clipboard.primaryClip?.getItemAt(0)?.text.toString()).let {
//                    viewModelScope.launch {
//                        transactionRepository.insertTransaction(it)
//                    }
//                }
//            }
//        } catch (e: Exception) {
//            e.printStackTrace()
//        }
//    }

    fun removeTransaction(id: Int) {
        viewModelScope.launch {
            transactionRepository.deleteTransaction(id)
        }
    }

    sealed interface UiState {
        object Loading : UiState
        class Success(
            val total: Long,
            val categories: List<CategoryOverview>
        ) : UiState
    }

    sealed interface UserUiState {
        object Loading : UserUiState
        object LoggedOut : UserUiState
        data class LoggedIn(val photoUrl: Uri?, val isLoading: Boolean = false) : UserUiState
    }
}