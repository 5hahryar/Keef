package com.keef.keef.common

import android.util.Log
import com.keef.keef.model.Category
import com.keef.keef.model.getUiProperties

fun Long.separateThousands(): String =
    toString()
        .reversed()
        .chunked(3)
        .joinToString(",")
        .reversed()

fun String.separateThousands(): String =
    this.reversed()
        .chunked(3)
        .joinToString(",")
        .reversed()

fun String.extractCategory(): Category {
    try {
        val hashtag = this.substringAfter("#").replace("_", " ")
        for (i in Category.values().indices) {
            if (Category.values()[i].getUiProperties().title == hashtag) {
                Log.d("HASHTAG", "found")
                return Category.values()[i]
            }
        }
        return Category.Other
    } catch (e: Exception) {
        return Category.Other
    }
}

