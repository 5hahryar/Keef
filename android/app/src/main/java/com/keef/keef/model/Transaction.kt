package com.keef.keef.model

data class Transaction(
    val id: Int = 0,
    val title: String,
    val description: String? = null,
    val amount: Long,
    val transactionType: TransactionType,
    val datetime: String,
    val bank: Bank,
    val category: Category,
)

enum class Bank(val title: String) {
    Pasargad("پاسارگاد"), Mellat("ملت"), Blu("بلو"), Wepod("ویپاد"), MehrIran("مهرایران");

    override fun toString(): String = this.title
}

enum class TransactionType(val prefix: String) {
    Deposit("به"), Withdraw("از");

    override fun toString(): String {
        return if (this == Deposit) "واریز" else "برداشت"
    }
}
