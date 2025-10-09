package com.keef.keef.ui.components.cards

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.keef.keef.compose.common.components.RegularText
import com.keef.keef.model.Category
import com.keef.keef.model.getUiProperties

@Composable
fun CategoryCard(
    modifier: Modifier = Modifier,
    category: Category,
    total: Long,
    onClick: () -> Unit
) {
    Box(
        modifier = modifier
            .size(100.dp, 40.dp)
            .background(color = category.getUiProperties().color, shape = RoundedCornerShape(50))
            .clickable(onClick = onClick),
    ) {
        Row(
            Modifier
                .fillMaxSize()
                .padding(start = 12.dp, end = 12.dp, top = 8.dp, bottom = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = category.getUiProperties().icon,
                contentDescription = "",
                tint = Color.White
            )
            RegularText(
                Modifier,
                text = category.getUiProperties().title,
                textAlign = TextAlign.End,
                textSize = 12.sp,
                textColor = Color.White
            )
        }
    }
}

@Preview
@Composable
private fun Preview() {
    CategoryCard(category = Category.Entertainment, total = 0, onClick = {})
}

data class CategoryUiProperties(val icon: ImageVector, val title: String, val color: Color)

//fun Category.getUiProperties(): CategoryUiProperties =
//    when (this) {
//        Category.Food -> CategoryUiProperties(Icons.Rounded.LunchDining, "غذا", Color(0xFF3772E3))
//        Category.Transportation -> CategoryUiProperties(
//            Icons.Rounded.TwoWheeler,
//            "برو بیا",
//            Color(0xFFED7F41)
//        )
//
//        Category.Medical -> CategoryUiProperties(
//            Icons.Rounded.Medication,
//            "پزشکی",
//            Color(0xFF2DCE5A)
//        )
//
//        Category.Entertainment -> CategoryUiProperties(
//            Icons.Rounded.Attractions,
//            "تفریحات",
//            Color(0xFFBAA919)
//        )
//
//        Category.Home -> CategoryUiProperties(Icons.Rounded.Home, "خانه", Color(0xFFB37BCE))
//        Category.Investment -> CategoryUiProperties(
//            Icons.Rounded.Savings,
//            "ذخیره",
//            Color(0xFFEC4C4C)
//        )
//
//        Category.Debt -> CategoryUiProperties(Icons.Rounded.LocalAtm, "بدهی", Color(0xFF3278B9))
//        Category.Clothes -> CategoryUiProperties(Icons.Rounded.Checkroom, "لباس", Color(0xFFB932AB))
//        Category.Other -> CategoryUiProperties(
//            Icons.Rounded.QuestionMark,
//            "متفرقه",
//            Color(0xFF7E7E7E)
//        )
//    }