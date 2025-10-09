package com.keef.keef.ui.category

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowForward
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.paging.LoadState
import androidx.paging.compose.LazyPagingItems
import androidx.paging.compose.collectAsLazyPagingItems
import com.keef.keef.R
import com.keef.keef.common.separateThousands
import com.keef.keef.compose.common.components.BoldText
import com.keef.keef.compose.common.components.MediumText
import com.keef.keef.compose.common.components.lazyLists.TransactionsLazyList
import com.keef.keef.model.Category
import com.keef.keef.model.Transaction
import com.keef.keef.ui.components.ErrorScreen
import com.keef.keef.ui.home.TransactionsEmptyView
import org.koin.androidx.compose.getViewModel
import org.koin.core.parameter.parametersOf

@Composable
fun CategoryTransactionsScreen(
    category: Category,
    onNavigateBack: () -> Unit,
) {
    val viewModel =
        getViewModel<CategoryTransactionsViewModel>(parameters = { parametersOf(category) })
    val transactions = viewModel.transactions.collectAsLazyPagingItems()
    val uiState by viewModel.uiState.collectAsState(initial = CategoryTransactionsViewModel.UiState.Loading)

    CategoryTransactionsView(
        uiState = uiState,
        transactions,
        onBackClicked = onNavigateBack
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CategoryTransactionsView(
    uiState: CategoryTransactionsViewModel.UiState,
    transactions: LazyPagingItems<Transaction>,
    onBackClicked: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    MediumText(text = stringResource(id = R.string.expenses), textSize = 15.sp)
                },
                navigationIcon = {
                    IconButton(onClick = onBackClicked) {
                        Icon(imageVector = Icons.Rounded.ArrowForward, contentDescription = "")
                    }
                }
            )
        }
    ) { padding ->
        Box(modifier = Modifier
            .fillMaxSize()
            .padding(paddingValues = padding)) {
            when (transactions.loadState.refresh) {
                is LoadState.Error -> ErrorScreen(message = (transactions.loadState.refresh as LoadState.Error).error.message.toString(), {})
                is LoadState.Loading -> {
                    Box(modifier = Modifier.fillMaxSize()) {
                        CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                    }
                }
                is LoadState.NotLoading -> {
                    Column(Modifier.fillMaxSize()) {
                        if (transactions.itemCount == 0) {
                            TransactionsEmptyView()
                        } else {
                            CategoryScreenHeader(spentAmount = if (uiState is CategoryTransactionsViewModel.UiState.Success) uiState.total else -1,)

                            TransactionsLazyList(
                                transactions = transactions,
                                onCategoryClicked = { transaction ->  }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CategoryScreenHeader(spentAmount: Long) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 50.dp, bottom = 30.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(5.dp)
    ) {
        MediumText(
            text = "جمع مخارج",
            textColor = colorResource(id = R.color.grey_600),
            textSize = 12.sp
        )
        Row(verticalAlignment = Alignment.Bottom) {
            BoldText(
                text = spentAmount.separateThousands(),
                textSize = 36.sp,
                textColor = MaterialTheme.colorScheme.onBackground
            )
            MediumText(
                Modifier.padding(bottom = 12.dp, start = 5.dp),
                text = "ریال",
                textColor = colorResource(id = R.color.grey_600),
                textSize = 15.sp
            )
        }
    }
}
