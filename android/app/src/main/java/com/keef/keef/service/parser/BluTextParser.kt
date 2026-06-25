package com.keef.keef.service.parser

import com.keef.keef.service.TransactionTextInfo

class BluTextParser : BankTextParser {
    override fun canHandle(text: String): Boolean {
        return text.contains("بلو")
    }

    override fun parse(text: String): TransactionTextInfo {
        val amountRegex =
            Regex("""([\d,]+)\s*ریال\s*از\s*حساب""")

        val amount = amountRegex
            .find(text)
            ?.groupValues?.get(1)
            ?.replace(",", "")
            ?.toLongOrNull()

        val isWithdrawal = text.contains("برداشت") || text.contains("پرید")

        if (amount != null) {
            return TransactionTextInfo(
                bank = "Blu",
                amount = amount,
                isWithdrawal = isWithdrawal
            )
        }

        throw Exception("Cannot parse Blu text!")
    }
}