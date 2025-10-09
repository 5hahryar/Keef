package com.keef.keef

import android.content.SharedPreferences
import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.appcompat.app.AppCompatActivity
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Fingerprint
import androidx.compose.material.icons.rounded.Wallet
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.core.view.WindowCompat
import com.keef.keef.compose.common.components.RegularText
import com.keef.keef.ui.KeefApp
import com.keef.keef.ui.theme.KeefTheme
import org.koin.android.ext.android.inject
import com.keef.keef.common.Const
import com.keef.keef.common.getPrefs
import com.keef.keef.ui.login.LoginScreen
import io.ktor.client.HttpClient
import io.ktor.client.plugins.auth.Auth
import io.ktor.client.plugins.auth.providers.BearerAuthProvider
import io.ktor.client.plugins.plugin

class MainActivity : AppCompatActivity() {

    val httpClient: HttpClient by inject<HttpClient>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)

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
                when {
                    isAuthenticated && isLoggedIn -> KeefApp()
                    !isAuthenticated -> BiometricContent { isAuthenticated = true }
                    else -> {
                        LoginScreen()
                    }
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