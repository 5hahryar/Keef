package com.keef.keef.ui.components.lazyLists

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import com.keef.keef.ui.components.cards.CategoryCard
import com.keef.keef.model.Category
import com.keef.keef.model.CategoryOverview

@Composable
fun CategoriesLazyList(
    categories: List<CategoryOverview>,
    onCategoryClicked: (Category) -> Unit,
) {
    LazyRow(
        contentPadding = PaddingValues(start = 20.dp, end = 20.dp),
        horizontalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        items(categories) {
            CategoryCard(category = it.category, total = it.total) {
                onCategoryClicked(it.category)
            }
        }
    }
}