package com.keef.keef.ui.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.keef.keef.R
import com.keef.keef.compose.common.components.MediumText
import com.keef.keef.model.Category
import com.keef.keef.model.CategoryOverview
import com.keef.keef.ui.components.lazyLists.CategoriesLazyList

@Composable
fun CategoriesView(
    categories: List<CategoryOverview>,
    onCategoryClicked: (Category) -> Unit
) {
    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        MediumText(modifier = Modifier.padding(start = 20.dp), text = stringResource(R.string.categories))
        CategoriesLazyList(categories = categories, onCategoryClicked = onCategoryClicked)
    }
}