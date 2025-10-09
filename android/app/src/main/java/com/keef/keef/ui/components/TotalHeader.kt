package com.keef.keef.compose.common.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.keef.keef.common.separateThousands

@Composable
fun TotalHeader(
    title: String,
    spentAmount: Long,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 20.dp, bottom = 10.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(5.dp)
    ) {
        MediumText(text = title, textColor = Color.Gray, textSize = 12.sp)
        Row(verticalAlignment = Alignment.Bottom) {
            BoldText(
                text = spentAmount.separateThousands(),
                textSize = 36.sp,
                textColor = MaterialTheme.colorScheme.onBackground
            )
            MediumText(
                Modifier.padding(bottom = 12.dp, start = 5.dp),
                text = "تومن",
                textColor = Color.Gray,
                textSize = 15.sp
            )
        }
    }
}