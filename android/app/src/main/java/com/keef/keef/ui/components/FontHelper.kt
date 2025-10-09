package com.keef.keef.compose.common.components

import androidx.compose.ui.text.font.Font
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight

@Composable
fun fontResources(
    font: String,
    weight: FontWeight,
    style: FontStyle
): Font {
    val context = LocalContext.current
    val name = font.substringBefore(".")
    val fontRes = context.resources.getIdentifier(name, "font", context.packageName)
    return Font(resId = fontRes)
}