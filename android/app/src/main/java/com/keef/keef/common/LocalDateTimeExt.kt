package com.keef.keef.common

import kotlinx.datetime.Instant
import saman.zamani.persiandate.PersianDate
import saman.zamani.persiandate.PersianDateFormat

fun Instant.toPersianDate(): String =
    PersianDateFormat.format(PersianDate(this.toEpochMilliseconds()), "d F")

fun PersianDate.getFirstDayOfMonth(month: Int = this.shMonth): Instant {
    val firstDayOfMonth = this.initJalaliDate(this.shYear, month, 1, 0, 0, 0)
    val b = firstDayOfMonth.jalali_to_gregorian(firstDayOfMonth.shYear, firstDayOfMonth.shMonth, firstDayOfMonth.shDay)

    val yy = b[0]
    val mm = if (b[1] < 10) "0${b[1]}" else "${b[1]}"
    val dd = if (b[2] < 10) "0${b[2]}" else "${b[2]}"

    return Instant.parse("$yy-$mm-${dd}T00:00:00Z")
}

fun PersianDate.getLastDayOfMonth(month: Int = this.shMonth): Instant {
    val lastDayOfMonth = this.initJalaliDate(this.shYear, month, PersianDate().initJalaliDate(this.shYear, month, 1, 0, 0, 0).monthDays)
    val b = lastDayOfMonth.jalali_to_gregorian(lastDayOfMonth.shYear, lastDayOfMonth.shMonth, lastDayOfMonth.shDay)

    val yy = b[0]
    val mm = if (b[1] < 10) "0${b[1]}" else "${b[1]}"
    val dd = if (b[2] < 10) "0${b[2]}" else "${b[2]}"

    return Instant.parse("$yy-$mm-${dd}T23:59:59Z")
}
