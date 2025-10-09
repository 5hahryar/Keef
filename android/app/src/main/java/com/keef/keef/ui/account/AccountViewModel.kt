package com.keef.keef.ui.account

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.keef.keef.data.TransactionRemoteDataSource
import com.keef.keef.data.TransactionRepository
import kotlinx.coroutines.launch

class AccountViewModel(
    private val transactionRepository: TransactionRepository,
    private val transactionRemoteDataSource: TransactionRemoteDataSource
): ViewModel() {

//    val user = FirebaseAuth.getInstance().currentUser

    fun pullData() {
        viewModelScope.launch {
            transactionRemoteDataSource.pullTransactions()
        }
    }

    fun pushData() {
        viewModelScope.launch {
            try {
//                transactionRemoteDataSource.addTransactions(
//                    transactionRepository.getTransactions().first(),
//                    FirebaseAuth.getInstance().currentUser
//                )
            } catch (e: Exception) {

            }
        }
    }
}