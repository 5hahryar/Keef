package com.keef.keef.ui.components.cards

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.keef.keef.common.separateThousands
import com.keef.keef.common.toPersianDate
import com.keef.keef.compose.common.components.BoldText
import com.keef.keef.compose.common.components.MediumText
import com.keef.keef.compose.common.components.RegularText
import com.keef.keef.model.Transaction
import com.keef.keef.model.TransactionType
import com.keef.keef.model.getUiProperties
import kotlinx.datetime.toInstant

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun TransactionCard(transaction: Transaction, onCategoryClicked: (Transaction) -> Unit) {
    Row(
        Modifier
            .fillMaxSize()
            .padding(start = 12.dp, end = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(50.dp)
                    .background(
                        color = MaterialTheme.colorScheme.surface,
                        shape = RoundedCornerShape(10.dp)
                    )
                    .combinedClickable(onClick = {}, onLongClick = {
                        onCategoryClicked(transaction)
                    })
            ) {
                Icon(
                    modifier = Modifier.align(Alignment.Center),
                    imageVector = transaction.category.getUiProperties().icon,
                    contentDescription = "",
                    tint = transaction.category.getUiProperties().color
                )
            }
            Column(Modifier.padding(12.dp)) {
                MediumText(text = transaction.title)
                RegularText(
                    text = "${transaction.datetime.toInstant().toPersianDate()} | ${transaction.bank}",
                    textColor = Color.Gray,
                    textSize = 12.sp
                )
            }
        }
        BoldText(text = "${transaction.amount.separateThousands()} ${if (transaction.transactionType == TransactionType.Withdraw) "-" else "+"} ")
    }
}
