package com.keef.keef.common

import android.content.Context
import android.content.Context.MODE_PRIVATE
import android.content.SharedPreferences

fun Context.getPrefs(): SharedPreferences = this.getSharedPreferences("Keef", MODE_PRIVATE)