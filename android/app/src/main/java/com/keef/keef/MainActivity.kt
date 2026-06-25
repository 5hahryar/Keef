package com.keef.keef

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.compose.setContent
import androidx.appcompat.app.AppCompatActivity
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Fingerprint
import androidx.compose.material.icons.rounded.Wallet
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.core.view.WindowCompat
import com.keef.keef.compose.common.components.RegularText
import com.keef.keef.ui.theme.KeefTheme
import org.koin.android.ext.android.inject
import com.keef.keef.common.Const
import com.keef.keef.common.getPrefs
import com.keef.keef.ui.theme.md_theme_light_primary
import io.ktor.client.HttpClient
import io.ktor.client.plugins.auth.Auth
import io.ktor.client.plugins.auth.providers.BearerAuthProvider
import io.ktor.client.plugins.plugin
import androidx.core.content.edit

class MainActivity : AppCompatActivity() {

    val httpClient: HttpClient by inject<HttpClient>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)

        createNotificationChannels()
        startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))

        setContent {
            var isAuthenticated by remember { mutableStateOf(false) }
            var isLoggedIn by remember {
                mutableStateOf(
                    !applicationContext.getPrefs().getString(
                        Const.PREFS_ACCESS_TOKEN_KEY, null
                    ).isNullOrEmpty()
                )
            }

            if (!BuildConfig.DEBUG) {
                LaunchedEffect(Unit) {
                    showBiometricPrompt(this@MainActivity) {
                        isAuthenticated = true
                    }
                }
            } else isAuthenticated = true

            DisposableEffect(Unit) {
                val listener: SharedPreferences.OnSharedPreferenceChangeListener =
                    SharedPreferences.OnSharedPreferenceChangeListener { prefs, key ->
                        if (key == Const.PREFS_ACCESS_TOKEN_KEY) {
                            isLoggedIn = !prefs.getString(key, null).isNullOrEmpty()
                            httpClient.plugin(Auth).providers.filterIsInstance<BearerAuthProvider>()
                                .firstOrNull()?.clearToken()
                        }
                    }
                applicationContext.getPrefs().registerOnSharedPreferenceChangeListener(listener)
                onDispose {
                    applicationContext.getPrefs()
                        .unregisterOnSharedPreferenceChangeListener(listener)
                }
            }

            KeefTheme {
                ConfigScreen()
//                when {
//                    isAuthenticated && isLoggedIn -> KeefApp()
//                    !isAuthenticated -> BiometricContent { isAuthenticated = true }
//                    else -> {
//                        LoginScreen()
//                    }
//                }
            }
        }
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

            val channel = NotificationChannel(
                "bank_alerts",
                "Bank Alerts",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Bank transaction alerts"
            }

            val notificationManager =
                getSystemService(NotificationManager::class.java)

            notificationManager.createNotificationChannel(channel)
        }
    }

    @Composable
    private fun ConfigScreen() {
        var baseUrl by remember { mutableStateOf("") }
        val context = LocalContext.current

        LaunchedEffect(Unit) {
            baseUrl = applicationContext.getSharedPreferences("settings", MODE_PRIVATE).getString("BASE_URL", null) ?: ""
        }

        CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Ltr) { }
        Scaffold {
            Column(
                modifier = Modifier
                    .padding(it)
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .imePadding(),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Image(
                    modifier = Modifier.background(md_theme_light_primary, shape = CircleShape),
                    painter = painterResource(R.drawable.ic_launcher_foreground),
                    contentDescription = null
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text("Keef Notification Service")
                Spacer(modifier = Modifier.height(24.dp))

                OutlinedTextField(
                    baseUrl,
                    onValueChange = { baseUrl = it },
                    label = { Text("Base URL") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                )

                Spacer(modifier = Modifier.height(24.dp))
                Button(modifier = Modifier, onClick = {
                    context.getSharedPreferences("settings", MODE_PRIVATE).edit(commit = true) {
                        putString(
                            "BASE_URL",
                            baseUrl
                        )
                    }
                }) {
                    Text("Update")
                }
            }
        }
    }

    @Composable
    private fun BiometricContent(onAuthenticated: () -> Unit) {
        Box(
            Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
        ) {
            Icon(
                modifier = Modifier
                    .align(Alignment.Center)
                    .size(150.dp),
                imageVector = Icons.Rounded.Wallet,
                tint = MaterialTheme.colorScheme.primary,
                contentDescription = ""
            )

            Column(
                Modifier
                    .align(Alignment.BottomCenter)
                    .clickable {
                        showBiometricPrompt(this@MainActivity) {
                            onAuthenticated()
                        }
                    }
                    .padding(bottom = 20.dp),
                horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    modifier = Modifier
                        .size(50.dp),
                    imageVector = Icons.Rounded.Fingerprint,
                    tint = MaterialTheme.colorScheme.onBackground,
                    contentDescription = ""
                )
                RegularText(
                    modifier = Modifier.padding(top = 5.dp),
                    text = getString(R.string.tap_to_login_with_biometrics),
                    textColor = MaterialTheme.colorScheme.onBackground
                )
            }
        }
    }

    private fun showBiometricPrompt(fragment: AppCompatActivity, onAuthenticated: () -> Unit) {
        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("Biometric login for Keef")
            .setSubtitle("Please authenticate to use Keef")
            .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG or BiometricManager.Authenticators.DEVICE_CREDENTIAL)
            .build()

        val prompt = BiometricPrompt(
            fragment,
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    onAuthenticated()
                }
            }
        )

        prompt.authenticate(promptInfo)
    }
}