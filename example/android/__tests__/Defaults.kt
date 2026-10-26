package com.facebook.react.defaults

import android.content.Context
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactHost

object DefaultReactHost {
  val hosts = mutableListOf<ReactHost>()

  fun getDefaultReactHost(context: Context, packageList: List<Any>): ReactHost =
    ReactHost(context, packageList).also { hosts += it }
}

object DefaultNewArchitectureEntryPoint {
  var fabricEnabled = false
}

class DefaultReactActivityDelegate(
  val activity: ReactActivity,
  val module: String,
  val fabric: Boolean,
) : ReactActivityDelegate()
