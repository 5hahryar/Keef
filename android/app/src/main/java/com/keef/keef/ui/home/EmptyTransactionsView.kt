package com.keef.keef.ui.home

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.keef.keef.R
import com.keef.keef.compose.common.components.MediumText

@Composable
fun TransactionsEmptyView() {
    Column(
        Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Image(
            modifier = Modifier.size(120.dp),
            painter = painterResource(id = R.drawable.ic_no_data),
            contentDescription = ""
        )
        MediumText(
            modifier = Modifier
                .padding(top = 24.dp)
                .alpha(0.5f), text = stringResource(R.string.no_transaction_found)
        )
    }
}