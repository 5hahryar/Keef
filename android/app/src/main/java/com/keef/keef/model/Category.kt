package com.keef.keef.model

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import kotlinx.serialization.Serializable

data class CategoryUiProperties(val icon: ImageVector, val title: String, val color: Color)

@Serializable
enum class Category {
    Food,
    Transportation,
    Medical,
    Entertainment,
    Home,
    Investment,
    Debt,
    Clothes,
    Other,
}

data class CategoryOverview(
    val category: Category,
    val total: Long,
)


fun Category.getUiProperties(): CategoryUiProperties =
    when(this) {
        Category.Food -> CategoryUiProperties(Icons.Rounded.LunchDining, "غذا", Color(0xFF48B6E8))
        Category.Transportation -> CategoryUiProperties(Icons.Rounded.TwoWheeler, "برو بیا", Color(0xFFEA6254))
        Category.Medical -> CategoryUiProperties(Icons.Rounded.Medication, "پزشکی", Color(0xFFA1C970))
        Category.Entertainment -> CategoryUiProperties(Icons.Rounded.Attractions, "تفریحات", Color(0xFF7E57C2))
        Category.Home -> CategoryUiProperties(Icons.Rounded.Home, "خانه", Color(0xFFE8B822))
        Category.Investment -> CategoryUiProperties(Icons.Rounded.Savings, "ذخیره", Color(0xFF546E7A))
        Category.Debt -> CategoryUiProperties(Icons.Rounded.LocalAtm, "بدهی", Color(0xFFD9779A))
        Category.Clothes -> CategoryUiProperties(Icons.Rounded.Checkroom, "لباس", Color(0xFF26A69A))
        Category.Other -> CategoryUiProperties(Icons.Rounded.QuestionMark, "متفرقه", Color(0xFF3F51B5))
    }

fun Bank.getUiProperties(): CategoryUiProperties =
    when(this) {
        Bank.Pasargad -> CategoryUiProperties(Icons.Rounded.LunchDining, Bank.Pasargad.title, Color(0xFF98E120))
        Bank.Mellat -> CategoryUiProperties(Icons.Rounded.TwoWheeler, Bank.Mellat.title, Color(0xFFEC4C4C))
        Bank.MehrIran -> CategoryUiProperties(Icons.Rounded.Medication, Bank.MehrIran.title, Color(0xFF2DCE5A))
        Bank.Wepod -> CategoryUiProperties(Icons.Rounded.Attractions, Bank.Wepod.title, Color(0xFF0D7C27))
        Bank.Blu -> CategoryUiProperties(Icons.Rounded.Attractions, Bank.Blu.title, Color(0xFF3772E3))
    }
