package com.keef.keef.ui.account

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Download
import androidx.compose.material.icons.rounded.Upload
import androidx.compose.material3.Divider
import androidx.compose.material3.DividerDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.keef.keef.compose.common.components.MediumText
import com.keef.keef.compose.common.components.RegularText
import org.koin.androidx.compose.koinViewModel

@Composable
fun AccountBottomSheetScreen(viewModel: AccountViewModel = koinViewModel()) {
    Column(verticalArrangement = Arrangement.spacedBy(15.dp)) {
        Row(modifier = Modifier.padding(start = 15.dp, end = 15.dp, top = 15.dp), verticalAlignment = Alignment.CenterVertically) {
            AsyncImage(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape),
                model = "viewModel.user?.photoUrl",
                contentDescription = ""
            )
            Column(Modifier.padding(start = 15.dp)) {
                MediumText(text = "viewModel.user?.displayName".toString())
                RegularText(text = "viewModel.user?.email".toString())
            }
        }

        Divider(Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 0.dp), thickness = 1.dp, color = DividerDefaults.color.copy(0.5f))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
                .clickable { }
                .padding(vertical = 6.dp, horizontal = 25.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Icon(
                imageVector = Icons.Rounded.Download,
                tint = MaterialTheme.colorScheme.secondary,
                contentDescription = null
            )
            RegularText(text = "دریافت تراکنش ها")
        }

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
                .clickable { viewModel.pushData() }
                .padding(top = 6.dp, start = 25.dp, end = 25.dp, bottom = 15.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Icon(
                imageVector = Icons.Rounded.Upload,
                tint = MaterialTheme.colorScheme.secondary,
                contentDescription = null
            )
            RegularText(text = "ارسال تراکنش ها")
        }
    }
}