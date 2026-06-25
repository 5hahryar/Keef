package com.keef.keef.service.parser

import com.keef.keef.service.TransactionTextInfo

object ParserRegistry {
    private val parsers = listOf(
        BluTextParser()
    )

    fun parse(text: String) : TransactionTextInfo? = parsers.firstOrNull { it.canHandle(text) }?.parse(text)
}