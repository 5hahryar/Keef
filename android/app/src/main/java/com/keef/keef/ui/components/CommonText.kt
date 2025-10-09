package com.keef.keef.compose.common.components

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.sp

@Composable
fun RegularText(
    modifier: Modifier = Modifier,
    text: String,
    textSize: TextUnit = 14.sp,
    textColor: Color = MaterialTheme.colorScheme.onBackground,
    textAlign: TextAlign = TextAlign.Start
) {
    Text(
        modifier = modifier,
        text = text,
        fontSize = textSize,
        color = textColor,
        textAlign = textAlign,
        fontFamily = FontFamily(
            fontResources("iran_sans_regular.ttf", weight = FontWeight.Normal, style = FontStyle.Normal),
        ),
        fontWeight = FontWeight.Normal
    )
}

@Composable
fun MediumText(
    modifier: Modifier = Modifier,
    text: String,
    textSize: TextUnit = 14.sp,
    textColor: Color = MaterialTheme.colorScheme.onBackground,
    textAlign: TextAlign = TextAlign.Start
) {
    Text(
        modifier = modifier,
        text = text,
        fontSize = textSize,
        color = textColor,
        textAlign = textAlign,
        fontFamily = FontFamily(
            fontResources("iran_sans_medium.ttf", weight = FontWeight.Medium, style = FontStyle.Normal),
        ),
        fontWeight = FontWeight.Medium
    )
}

@Composable
fun BoldText(
    modifier: Modifier = Modifier,
    text: String,
    textSize: TextUnit = 14.sp,
    textColor: Color = MaterialTheme.colorScheme.onBackground,
    textAlign: TextAlign = TextAlign.Start
) {
    Text(
        modifier = modifier,
        text = text,
        fontSize = textSize,
        color = textColor,
        textAlign = textAlign,
        fontFamily = FontFamily(
            fontResources("iran_sans_bold.ttf", weight = FontWeight.Bold, style = FontStyle.Normal),
        ),
        fontWeight = FontWeight.Bold
    )
}

@Composable
fun fontFamily() = FontFamily(
    fontResources("iran_sans_bold.ttf", weight = FontWeight.Bold, style = FontStyle.Normal),
    fontResources("iran_sans_medium.ttf", weight = FontWeight.Medium, style = FontStyle.Normal),
    fontResources("iran_sans_regular.ttf", weight = FontWeight.Normal, style = FontStyle.Normal),
)