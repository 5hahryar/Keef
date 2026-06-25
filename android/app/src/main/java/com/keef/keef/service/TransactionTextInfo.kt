package com.keef.keef.service

data class TransactionTextInfo(
    val bank: String,
    val amount: Long,
    val isWithdrawal: Boolean
) {
    fun getBankFarsiName() = when(bank) {
        "Blu" -> "بلو"
        else -> bank
    }

    fun amountInToman() = amount / 10
}
