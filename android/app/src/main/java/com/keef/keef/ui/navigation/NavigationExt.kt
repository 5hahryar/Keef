package com.keef.keef.ui.navigation

import androidx.compose.animation.core.AnimationSpec
import androidx.compose.animation.core.SpringSpec
import androidx.compose.material.ModalBottomSheetValue
import androidx.compose.material.navigation.BottomSheetNavigator
import androidx.compose.material.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember

@Composable
public fun rememberBottomSheetNavigator(
    animationSpec: AnimationSpec<Float> = SpringSpec(),
    skipHalfExpanded: Boolean = false
): BottomSheetNavigator {
    val sheetState =
        rememberModalBottomSheetState(ModalBottomSheetValue.Hidden, animationSpec = animationSpec, skipHalfExpanded = skipHalfExpanded)
    return remember(sheetState) { BottomSheetNavigator(sheetState) }
}