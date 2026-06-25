package com.keef.keef.service.parser

import com.keef.keef.service.TransactionTextInfo

interface BankTextParser {
    fun canHandle(text: String): Boolean
    fun parse(text: String): TransactionTextInfo
}