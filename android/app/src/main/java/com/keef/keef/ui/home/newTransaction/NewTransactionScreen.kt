package com.keef.keef.ui.home.newTransaction

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.layout
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.OffsetMapping
import androidx.compose.ui.text.input.TransformedText
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.keef.keef.R
import com.keef.keef.compose.common.components.MediumText
import com.keef.keef.compose.common.components.RegularText
import com.keef.keef.compose.common.components.buttons.CircleButton
import com.keef.keef.compose.common.components.chips.ChipGroup
import com.keef.keef.model.Bank
import com.keef.keef.model.Category
import com.keef.keef.model.getUiProperties
import org.koin.androidx.compose.getViewModel
import java.text.NumberFormat
import java.util.*

@Composable
fun NewTransactionScreen(
    onNavigateBack: () -> Unit
) {
    val viewModel = getViewModel<NewTransactionViewModel>()
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        viewModel.insertEvent.collect { event ->
            event.getContentIfNotHandled()?.let { message ->
                if (message.isSuccess) onNavigateBack()
                else Toast.makeText(context, message.errorMessage, Toast.LENGTH_LONG).show()
            }
        }
    }

    NewTransactionBottomSheetView(
        isPasteAvailable = viewModel.isPasteAvailable.value,
        clipTransaction = viewModel.transaction,
        onApplyClipboard = {
            viewModel.applyClipboard()
        },
        onAddTransaction = {
            viewModel.addTransaction()
        }
    )
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun NewTransactionBottomSheetView(
    isPasteAvailable: Boolean,
    clipTransaction: NewTransactionViewModel.ClipTransaction,
    onApplyClipboard: () -> Unit,
    onAddTransaction: () -> Unit,
) {
    val focusManager = LocalFocusManager.current

    Column(
        Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.background)
            .padding(12.dp)
            .imePadding()
            .imeNestedScroll(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(
            Modifier
                .fillMaxWidth()
                .padding(end = 5.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            MediumText(text = stringResource(id = R.string.new_transaction))
            if (isPasteAvailable) {
                CircleButton(
                    painterResource(id = R.drawable.ic_content_paste_fill),
                    borderColor = colorResource(
                        id = R.color.blue_700
                    ),
                    backgroundColor = colorResource(
                        id = R.color.blue_700
                    ),
                    iconTint = Color.White,
                    onClick = onApplyClipboard
                )
            } else Spacer(modifier = Modifier.width(1.dp))
        }

        OutlinedTextField(
            modifier = Modifier.fillMaxWidth(),
            value = clipTransaction.title.value,
            onValueChange = { clipTransaction.title.value = it },
            label = {
                RegularText(text = stringResource(R.string.title))
            },
            singleLine = true,
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
            keyboardActions = KeyboardActions(
                onNext = { focusManager.moveFocus(FocusDirection.Down) }
            )
        )

        OutlinedTextField(
            modifier = Modifier.fillMaxWidth(),
            value = clipTransaction.amount.value,
            onValueChange = {
                clipTransaction.amount.value = it
            },
            label = {
                RegularText(text = stringResource(R.string.payment_amount))
            },
            visualTransformation = NumberCommaTransformation(),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Number
            )
        )

        MediumText(text = stringResource(R.string.category), textSize = 13.sp)
        ChipGroup(
            modifier = Modifier.layout { measurable, constraints ->
                val placeable = measurable.measure(
                    constraints.copy(
                        maxWidth = constraints.maxWidth + 24.dp.roundToPx(), //add the end padding 16.dp
                    ))
                layout(placeable.width, placeable.height) {
                    placeable.place(0, 0)
                }
            },
            contentPadding = PaddingValues(start = 12.dp, end = 12.dp),
            chips = Category.values().associate { it.ordinal to it.getUiProperties().title },
            selectedChip = clipTransaction.category.value
        ) {
            clipTransaction.category.value = Category.values()[it].ordinal
        }

        MediumText(text = stringResource(R.string.bank), textSize = 13.sp)
        ChipGroup(
            modifier = Modifier.layout { measurable, constraints ->
                val placeable = measurable.measure(
                    constraints.copy(
                        maxWidth = constraints.maxWidth + 24.dp.roundToPx(), //add the end padding 16.dp
                    ))
                layout(placeable.width, placeable.height) {
                    placeable.place(0, 0)
                }
            },
            contentPadding = PaddingValues(start = 12.dp, end = 12.dp),
            chips = Bank.values().associate { it.ordinal to it.getUiProperties().title },
            selectedChip = clipTransaction.bank.value
        ) {
            clipTransaction.bank.value = Bank.values()[it].ordinal
        }

        Button(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 10.dp),
            onClick = onAddTransaction,
        ) {
            MediumText(
                text = stringResource(R.string.add),
                textColor = MaterialTheme.colorScheme.onPrimary
            )
        }
    }
}

class NumberCommaTransformation : VisualTransformation {
    override fun filter(text: AnnotatedString): TransformedText {
        return TransformedText(
            text = AnnotatedString(text.text.toLongOrNull().formatWithComma()),
            offsetMapping = object : OffsetMapping {
                override fun originalToTransformed(offset: Int): Int {
                    return text.text.toLongOrNull().formatWithComma().length
                }

                override fun transformedToOriginal(offset: Int): Int {
                    return text.length
                }
            }
        )
    }
}

fun Long?.formatWithComma(): String =
    NumberFormat.getNumberInstance(Locale.US).format(this ?: 0)