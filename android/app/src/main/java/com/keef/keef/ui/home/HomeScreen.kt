package com.keef.keef.ui.home

import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.core.content.edit
import androidx.paging.LoadState
import androidx.paging.compose.LazyPagingItems
import androidx.paging.compose.collectAsLazyPagingItems
import com.keef.keef.R
import com.keef.keef.common.Const
import com.keef.keef.common.getPrefs
import com.keef.keef.compose.common.components.MediumText
import com.keef.keef.compose.common.components.TotalHeader
import com.keef.keef.compose.common.components.lazyLists.TransactionsLazyList
import com.keef.keef.model.Category
import com.keef.keef.model.Transaction
import com.keef.keef.ui.components.ErrorScreen
import kotlinx.coroutines.launch
import org.koin.androidx.compose.getViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onNavigateToAddTransaction: () -> Unit,
    onNavigateToChangeCategory: (Transaction) -> Unit,
    onNavigateToCategory: (Category) -> Unit,
    onNavigateToStats: () -> Unit,
) {
    val context = LocalContext.current
    val viewModel = getViewModel<TransactionsViewModel>()
    val transactions = viewModel.transactions.collectAsLazyPagingItems()
    val uiState by viewModel.uiState.collectAsState(initial = TransactionsViewModel.UiState.Loading)
    val userUiState by viewModel.userUiState.collectAsState(initial = TransactionsViewModel.UserUiState.Loading)
    var isRefreshing by remember { mutableStateOf(false) }
    val pullToRefreshState = rememberPullToRefreshState()
    val coroutineScope = rememberCoroutineScope()

    val refreshData: () -> Unit = {
        coroutineScope.launch {
            isRefreshing = true
            viewModel.refresh()
            transactions.refresh()
            isRefreshing = false
        }
    }

    LaunchedEffect(key1 = Unit) { // Or use a key that changes if you need to re-subscribe under certain conditions
        viewModel.errorMessage.collect { message ->
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        }
    }

    LaunchedEffect(isRefreshing) {
        if (isRefreshing) {
            refreshData()
        }
    }

    Scaffold(
        topBar = {
            HomeTopBar(
                userUiState = userUiState,
                onLogoutClicked = {
                    context.getPrefs().edit {
                        putString(Const.PREFS_ACCESS_TOKEN_KEY, null)
                    }
                },
                onProfileClicked = {},
                onStatsClicked = onNavigateToStats
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onNavigateToAddTransaction,
                text = { MediumText(text = stringResource(R.string.new_transaction)) },
                icon = {
                    Icon(imageVector = Icons.Rounded.Add, contentDescription = "")
                }
            )
        },
        floatingActionButtonPosition = FabPosition.Start
    ) { padding ->
        PullToRefreshBox(
            modifier = Modifier.padding(paddingValues = padding),
            isRefreshing = isRefreshing,
            onRefresh = refreshData,
            state = pullToRefreshState
        ) {
            // Your existing HomeScreenContent
            HomeScreenContent(
                uiState = uiState,
                transactions = transactions,
                onChangeCategory = onNavigateToChangeCategory,
                onCategoryClicked = onNavigateToCategory,
                onRefreshClicked = refreshData
            )
        }
    }
}

@Composable
private fun HomeScreenContent(
    uiState: TransactionsViewModel.UiState,
    transactions: LazyPagingItems<Transaction>,
    onChangeCategory: (Transaction) -> Unit,
    onCategoryClicked: (Category) -> Unit,
    onRefreshClicked: () -> Unit,
) {
    when (transactions.loadState.refresh) {
        is LoadState.Error -> ErrorScreen(
            message = (transactions.loadState.refresh as LoadState.Error).error.message.toString(),
            onRefreshClicked
        )

        is LoadState.Loading -> {
            Box(modifier = Modifier.fillMaxSize()) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
            }
        }

        is LoadState.NotLoading -> {
            if (transactions.itemCount == 0) {
                TransactionsEmptyView()
            } else {
                Column(
                    Modifier
                        .fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    TotalHeader(
                        title = stringResource(R.string.total_expenses),
                        spentAmount = if (uiState is TransactionsViewModel.UiState.Success) uiState.total else -1,
                    )

                    CategoriesView(
                        categories = if (uiState is TransactionsViewModel.UiState.Success) uiState.categories else emptyList(),
                        onCategoryClicked = onCategoryClicked
                    )

                    TransactionsLazyList(transactions = transactions, onChangeCategory)
                }
            }
        }
    }
}