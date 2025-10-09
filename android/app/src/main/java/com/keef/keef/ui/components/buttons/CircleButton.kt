package com.keef.keef.compose.common.components.buttons

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CircleButton(
    icon: Painter,
    borderColor: Color = Color.LightGray,
    backgroundColor: Color = Color.White,
    iconTint: Color = Color.Gray,
    onClick: () -> Unit
) {
//    CompositionLocalProvider(LocalMinimumTouchTargetEnforcement provides false) {
        IconButton(
            onClick = onClick,
            modifier = Modifier
                .then(Modifier.size(30.dp))
                .border(1.dp, borderColor, shape = CircleShape)
                .background(color = backgroundColor, shape = CircleShape)
        ) {
            Icon(
                modifier = Modifier.padding(6.dp),
                painter = icon,
                contentDescription = "",
                tint = iconTint
            )
        }
//    }
}