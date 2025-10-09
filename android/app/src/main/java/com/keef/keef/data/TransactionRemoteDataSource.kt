package com.keef.keef.data

//import com.google.firebase.auth.FirebaseUser
import com.keef.keef.model.Transaction

interface TransactionRemoteDataSource {
    suspend fun addTransactions(transactions: List<Transaction>)
    suspend fun pullTransactions()
}