package com.keef.keef.ui.stats

import android.widget.Toast
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material.icons.rounded.ArrowForward
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.keef.keef.R
import com.keef.keef.common.Resource
import com.keef.keef.common.getFirstDayOfMonth
import com.keef.keef.common.getLastDayOfMonth
import com.keef.keef.common.separateThousands
import com.keef.keef.compose.common.components.BoldText
import com.keef.keef.compose.common.components.MediumText
import com.keef.keef.compose.common.components.RegularText
import com.keef.keef.data.TransactionRepository
import com.keef.keef.model.Category
import com.keef.keef.model.getUiProperties
import com.keef.keef.ui.theme.KeefTheme
import ir.ehsannarmani.compose_charts.PieChart
import ir.ehsannarmani.compose_charts.models.Pie
import kotlinx.coroutines.launch
import org.koin.androidx.compose.get
import saman.zamani.persiandate.PersianDate

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StatsScreen(
    transactionRepository: TransactionRepository = get(),
    onBackClicked: () -> Unit,
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var selectedMonth by remember { mutableIntStateOf(PersianDate().shMonth) }
    val categoryTotals = remember { mutableStateMapOf<Category, Long>() }

    LaunchedEffect(selectedMonth) {
        coroutineScope.launch {
            when(val result = transactionRepository.getStatsTotalSpendingByCategory(
                PersianDate().getFirstDayOfMonth(selectedMonth),
                PersianDate().getLastDayOfMonth(selectedMonth)
            )) {
                is Resource.Error -> Toast.makeText(context, result.message, Toast.LENGTH_LONG).show()
                is Resource.Success -> {
                    categoryTotals.clear()
                    categoryTotals.putAll(result.data)
                }
            }
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = {
                    MediumText(text = stringResource(id = R.string.dashboard), textSize = 15.sp)
                },
                navigationIcon = {
                    IconButton(onBackClicked) {
                        Icon(imageVector = Icons.Rounded.ArrowForward, contentDescription = null)
                    }
                },
                actions = {

                }
            )
        },
        bottomBar = {
            Box(Modifier.fillMaxWidth()) {
                Card(
                    modifier = Modifier
                        .align(Alignment.Center)
                        .padding(bottom = 60.dp)
                        .height(60.dp)
                        .width(260.dp),
                    colors = CardDefaults.cardColors()
                        .copy(containerColor = MaterialTheme.colorScheme.primaryContainer),
                    shape = RoundedCornerShape(50),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Row(
                        Modifier.padding(8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        IconButton(onClick = {
                            // Go to previous month
                            if (selectedMonth > 1) selectedMonth--
                        }) {
                            Icon(imageVector = Icons.Rounded.ArrowForward, contentDescription = null)
                        }

                        Card(
                            modifier = Modifier
                                .height(48.dp)
                                .padding(horizontal = 12.dp)
                                .weight(1f),
                            colors = CardDefaults.cardColors()
                                .copy(containerColor = MaterialTheme.colorScheme.onPrimaryContainer),
                            shape = RoundedCornerShape(50),
                            elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                        ) {
                            Box(Modifier.fillMaxSize()) {
                                RegularText(modifier = Modifier.align(Alignment.Center), text = PersianDate().monthName(selectedMonth,
                                    PersianDate.Dialect.IRANIAN), textColor = MaterialTheme.colorScheme.surface)
                            }
                        }
                        IconButton({
                            // Go to next month
                            if (selectedMonth < 12) selectedMonth++
                        }) {
                            Icon(imageVector = Icons.Rounded.ArrowBack, contentDescription = null)
                        }
                    }
                }
            }
//            Box(Modifier
//                .fillMaxWidth()
//                .height(80.dp)
//                .background(color = Color.Red, shape = RoundedCornerShape(50)))
//            Button(onClick = {}) {
//                Text("HEllo")
//            }
        }
    ) { paddingValues ->
        Column(Modifier.padding(paddingValues)) {
            StatsScreenContent(categoryTotals = categoryTotals)

        }
    }
}

@Composable
fun StatsScreenContent(modifier: Modifier = Modifier, categoryTotals: Map<Category, Long>) {
    val allTotal = categoryTotals.values.sum()

    Column(
        modifier
            .fillMaxSize()
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Column(
                Modifier.padding(top = 24.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                BoldText(text = "مجموع هزینه‌ها", textSize = 20.sp)
                Row(verticalAlignment = Alignment.Bottom) {
                    BoldText(
                        text = categoryTotals.values.sum().separateThousands(),
                        textSize = 16.sp,
                        textColor = MaterialTheme.colorScheme.onBackground
                    )
                    RegularText(
                        Modifier.padding(start = 2.dp),
                        text = "تومن",
                        textColor = MaterialTheme.colorScheme.onBackground.copy(0.8f),
                        textSize = 12.sp
                    )
                }
            }
            Chart(categoryTotals = categoryTotals)
        }

        BoldText(text = "دسته‌بندی", textSize = 16.sp)
        LazyColumn {
            items(categoryTotals.toList().sortedByDescending { it.second }, key = { it.first.name }) {
                CategoryTotalItem(allTotal = allTotal, total = it)
            }
        }
    }
}

@Composable
private fun CategoryTotalItem(modifier: Modifier = Modifier, allTotal: Long, total: Pair<Category, Long>) {
    val share = (total.second.toDouble() / allTotal)
    val sharePercent = share * 100

    Column(
        modifier
            .fillMaxSize()
//            .padding(start = 12.dp, end = 12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(50.dp)
                        .background(
                            color = MaterialTheme.colorScheme.surface,
                            shape = RoundedCornerShape(10.dp)
                        )
                ) {
                    Icon(
                        modifier = Modifier.align(Alignment.Center),
                        imageVector = total.first.getUiProperties().icon,
                        contentDescription = "",
                        tint = total.first.getUiProperties().color
                    )
                }
                Column(Modifier.padding(0.dp)) {
                    MediumText(text = total.first.getUiProperties().title)
                }
            }
            Row(verticalAlignment = Alignment.Bottom) {
                BoldText(text = total.second.separateThousands())
                RegularText(
                    Modifier.padding(start = 2.dp),
                    text = "تومن",
                    textColor = MaterialTheme.colorScheme.onBackground.copy(0.8f),
                    textSize = 8.sp
                )
            }
        }

        Row(
            modifier = Modifier.padding(start = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            LinearProgressIndicator(modifier = Modifier.weight(1f), progress = share.toFloat())
            RegularText(modifier = Modifier.padding(start = 12.dp), text = "${sharePercent.toInt()}%", textSize = 12.sp)
        }
    }
}

@Composable
private fun Chart(modifier: Modifier = Modifier, categoryTotals: Map<Category, Long>) {
    val data = categoryTotals.toList().map {
        val uiProps = it.first.getUiProperties()
        Pie(label = it.first.name, data = it.second.toDouble(), color = uiProps.color, selectedColor = uiProps.color.copy(alpha = 0.2f))
    }

    PieChart(
        modifier = modifier.size(200.dp),
        data = data,
        onPieClick = {
            println("${it.label} Clicked")
            val pieIndex = data.indexOf(it)
//            data = data.mapIndexed { mapIndex, pie -> pie.copy(selected = pieIndex == mapIndex) }
        },
        selectedScale = 1.2f,
        scaleAnimEnterSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ),
        spaceDegree = 0f,
        selectedPaddingDegree = 4f,
//        style = Pie.Style.Stroke(width = 40.dp),
        colorAnimEnterSpec = tween(300),
        colorAnimExitSpec = tween(300),
        scaleAnimExitSpec = tween(300),
        spaceDegreeAnimExitSpec = tween(300),
    )
}

@Preview
@Composable
private fun Preview() {
    KeefTheme {
        StatsScreen(
            onBackClicked = {}
        )
    }
}