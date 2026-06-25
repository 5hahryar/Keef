package com.keef.keef.service

import android.Manifest
import android.app.Notification
import android.app.PendingIntent
import android.content.Intent
import android.net.Uri
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import androidx.annotation.RequiresPermission
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.keef.keef.service.parser.ParserRegistry
import androidx.core.net.toUri
import com.keef.keef.R
import com.keef.keef.common.separateThousands

class NotificationService : NotificationListenerService() {

    private val recentNotifications = mutableMapOf<String, Long>()

    @RequiresPermission(Manifest.permission.POST_NOTIFICATIONS)
    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        if (sbn == null || sbn.packageName == "com.keef.keef") return

        val now = System.currentTimeMillis()
        val lastSeen = recentNotifications[sbn.key]
        if (lastSeen != null && System.currentTimeMillis() - lastSeen < 3000) {
            return
        }
        recentNotifications[sbn.key] = now

        val extras = sbn.notification.extras
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""

        val info = ParserRegistry.parse(text)
        if (info == null || !info.isWithdrawal) return

        showAlertNotification(info)
    }

    @RequiresPermission(Manifest.permission.POST_NOTIFICATIONS)
    private fun showAlertNotification(info: TransactionTextInfo) {

        val baseUrl = applicationContext.getSharedPreferences("settings", MODE_PRIVATE).getString("BASE_URL", null)
        val url = "${baseUrl}/addTransaction?amount=${info.amountInToman()}" + "&bank=${Uri.encode(info.bank)}"

        val intent = Intent(
            Intent.ACTION_VIEW,
            url.toUri()
        )

        val pendingIntent =
            PendingIntent.getActivity(
                this,
                info.amount.toInt(),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or
                        PendingIntent.FLAG_IMMUTABLE
            )

        val notification =
            NotificationCompat.Builder(
                this,
                "bank_alerts"
            )
                .setSmallIcon(R.drawable.ic_wallet_fill0_wght400_grad0_opsz48)
                .setContentTitle("\u200F" + "ثبت هزینه يادت نره!")
                .setContentText(
                    "\u200F" + "${info.amountInToman().separateThousands()} تومن از ${info.getBankFarsiName()} برداشت شد"
                )
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setSilent(true)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .build()

        NotificationManagerCompat
            .from(this)
            .notify(
                System.currentTimeMillis().toInt(),
                notification
            )
    }
}