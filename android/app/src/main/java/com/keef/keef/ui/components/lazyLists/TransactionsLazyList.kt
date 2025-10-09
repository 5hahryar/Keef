package com.keef.keef.compose.common.components.lazyLists

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.paging.compose.LazyPagingItems
import androidx.paging.compose.itemKey
import com.keef.keef.compose.common.components.MediumText
import com.keef.keef.compose.common.components.RegularText
import com.keef.keef.model.Transaction
import com.keef.keef.ui.components.cards.TransactionCard

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun TransactionsLazyList(
    transactions: Map<String, List<Transaction>>,
    onCategoryClicked: (Transaction) -> Unit
) {
    LazyColumn {
        stickyHeader {
            MediumText(modifier = Modifier.padding(start = 20.dp, top = 15.dp), text = "تراکنش ها")
        }
        transactions.forEach { (date, trans) ->
            stickyHeader {
                Column(
                    Modifier
                        .padding(start = 12.dp)
                        .fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(MaterialTheme.colorScheme.secondaryContainer)
                            .padding(start = 12.dp, end = 12.dp, top = 3.dp, bottom = 3.dp)
                    ) {
                        RegularText(
                            text = date,
                            textSize = 12.sp,
                            textColor = MaterialTheme.colorScheme.onSecondaryContainer
                        )
                    }
                }
            }
            items(trans) { transaction ->
                TransactionCard(transaction = transaction, onCategoryClicked)
            }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun TransactionsLazyList(
    transactions: LazyPagingItems<Transaction>,
    onCategoryClicked: (Transaction) -> Unit
) {
    LazyColumn {
        items(count = transactions.itemCount, key = transactions.itemKey { it.id }) { index ->
            transactions[index]?.let { TransactionCard(transaction = it, onCategoryClicked) }
        }
    }
}