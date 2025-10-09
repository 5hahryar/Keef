package com.keef.keef.ui.home

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AccountCircle
import androidx.compose.material.icons.rounded.Logout
import androidx.compose.material.icons.rounded.QueryStats
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.keef.keef.R
import com.keef.keef.compose.common.components.MediumText

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeTopBar(
    userUiState: TransactionsViewModel.UserUiState,
    onProfileClicked: () -> Unit,
    onLogoutClicked: () -> Unit,
    onStatsClicked: () -> Unit,
) {
    TopAppBar(
        title = {
            MediumText(text = stringResource(id = R.string.dashboard), textSize = 15.sp)
        },
        actions = {
            IconButton(onClick = onProfileClicked) {
                when (userUiState) {
                    TransactionsViewModel.UserUiState.Loading -> {
//                        CircularProgressIndicator()
                    }
                    is TransactionsViewModel.UserUiState.LoggedIn -> {
                        Box {
                            AsyncImage(
                                modifier = Modifier
                                    .align(Alignment.Center)
                                    .clip(CircleShape),
                                model = userUiState.photoUrl.toString(),
                                contentDescription = ""
                            )
                            if (userUiState.isLoading) {
                                CircularProgressIndicator(
                                    modifier = Modifier.align(Alignment.Center),
                                    strokeWidth = 2.dp
                                )
                            }
                        }
                    }
                    TransactionsViewModel.UserUiState.LoggedOut -> {
                        Icon(imageVector = Icons.Rounded.AccountCircle, contentDescription = "")
                    }
                }
            }
            IconButton(onClick = onStatsClicked) {
                Icon(imageVector = Icons.Rounded.QueryStats, contentDescription = "")
            }
            IconButton(onClick = onLogoutClicked) {
                Icon(imageVector = Icons.Rounded.Logout, contentDescription = "")
            }
        }
    )
}