package com.keef.keef.compose.common.components.chips

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.keef.keef.compose.common.components.MediumText

@Composable
fun ChipGroup(
    modifier: Modifier = Modifier,
    chips: Map<Int, String>,
    selectedChip: Int?,
    contentPadding: PaddingValues = PaddingValues(),
    onSelectedChanged: (Int) -> Unit = {},
) {
    Column(modifier = modifier.padding(0.dp)) {
        LazyRow(contentPadding = contentPadding) {
            items(chips.toList()) { item ->
                Chip(
                    name = item.second,
                    isSelected = selectedChip == item.first,
                    onSelectionChanged = {
                        onSelectedChanged(item.first)
                    },
                )
            }
        }
    }
}

@Composable
fun Chip(
    name: String = "Chip",
    isSelected: Boolean = false,
    onSelectionChanged: () -> Unit,
) {
    Surface(
        modifier = Modifier.padding(4.dp)
            .toggleable(
                value = isSelected,
                onValueChange = {
                    onSelectionChanged()
                }
            ),
        shape = RoundedCornerShape(50),
        border = BorderStroke(if (isSelected) 0.dp else 1.dp, MaterialTheme.colorScheme.primary),
        color = if (isSelected) MaterialTheme.colorScheme.primary else Color.Transparent
    ) {
        Row(modifier = Modifier
            .padding(top = 5.dp, bottom = 5.dp, start = 12.dp, end = 12.dp)

        ) {
            MediumText(
                text = name,
                textSize = 12.sp,
                textColor = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onBackground
            )
        }
    }
}