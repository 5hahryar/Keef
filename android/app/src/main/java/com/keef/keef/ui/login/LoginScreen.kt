package com.keef.keef.ui.login

import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.core.content.edit
import com.keef.keef.R
import com.keef.keef.common.Const
import com.keef.keef.common.Resource
import com.keef.keef.common.getPrefs
import com.keef.keef.data.UserRepository
import com.keef.keef.ui.theme.KeefTheme
import com.keef.keef.ui.theme.md_theme_light_primary
import kotlinx.coroutines.launch
import org.koin.androidx.compose.get

@Composable
fun LoginScreen(
    userRepository: UserRepository = get(),
) {
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    val focusManager = LocalFocusManager.current
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current
    val onLoginClicked = { username: String, password: String ->
        focusManager.clearFocus()
        coroutineScope.launch {
            when (val token = userRepository.getAccessToken(username, password)) {
                is Resource.Error -> Toast.makeText(context, token.message, Toast.LENGTH_SHORT)
                    .show()

                is Resource.Success -> {
                    context.getPrefs().edit {
                        putString(
                            Const.PREFS_ACCESS_TOKEN_KEY,
                            token.data.accessToken
                        )
                    }
                }
            }
        }
        Unit
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
            Text("Welcome to Keef")
            Spacer(modifier = Modifier.height(24.dp))

            OutlinedTextField(
                username,
                onValueChange = { username = it },
                label = { Text("Username") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                keyboardActions = KeyboardActions(
                    onNext = { focusManager.moveFocus(FocusDirection.Down) }
                )
            )
            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(
                password,
                onValueChange = { password = it },
                label = { Text("Password") },
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Password,
                    imeAction = ImeAction.Done
                ),
                keyboardActions = KeyboardActions(
                    onDone = { onLoginClicked(username, password) }
                )
            )
            Spacer(modifier = Modifier.height(24.dp))
            Button(modifier = Modifier, onClick = {
                onLoginClicked(username, password)
            }) {
                Text("Login")
            }
        }
    }
}

@Preview
@Composable
private fun Preview() {
    KeefTheme {
        LoginScreen()
    }
}