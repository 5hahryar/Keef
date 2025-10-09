package com.keef.keef.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.keef.keef.R
import com.keef.keef.compose.common.components.MediumText
import com.keef.keef.compose.common.components.RegularText
import com.keef.keef.model.Category
import com.keef.keef.model.getUiProperties
import org.koin.androidx.compose.getViewModel

@Composable
fun SelectCategoryBottomSheet(
    transactionId: Int,
    onNavigateBack: () -> Unit,
) {
    val viewModel = getViewModel<TransactionsViewModel>()

    Column(
        Modifier
            .fillMaxWidth()
            .imePadding()
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
            MediumText(text = stringResource(R.string.select_category))
            IconButton(onClick = {
                viewModel.removeTransaction(transactionId)
                onNavigateBack()
            }) {
                Icon(imageVector = Icons.Rounded.Delete, contentDescription = "", tint = Color.Red)
            }
        }
        CategorySelection {
            viewModel.changeTransactionCategory(transactionId, it)
            onNavigateBack()
        }
    }
}

@Composable
private fun CategorySelection(onCategoryClicked: (Category) -> Unit) {
    LazyRow(
        contentPadding = PaddingValues(start = 20.dp, end = 20.dp),
        horizontalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        items(Category.values()) {
            CategorySummarize(it) {
                onCategoryClicked(it)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CategorySummarize(category: Category, onCategoryClicked: () -> Unit) {
    Card(
        modifier = Modifier.width(50.dp),
        onClick = onCategoryClicked,
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
            Box(
                modifier = Modifier
                    .size(50.dp)
                    .background(
                        color = MaterialTheme.colorScheme.secondaryContainer,
                        shape = RoundedCornerShape(10.dp)
                    )
            ) {
                Icon(modifier = Modifier.align(Alignment.Center), imageVector = category.getUiProperties().icon, contentDescription = "", tint = category.getUiProperties().color)
            }
            Spacer(modifier = Modifier.height(5.dp))
            RegularText(text = category.getUiProperties().title, textSize = 13.sp)
        }
    }
}