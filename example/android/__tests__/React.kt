package com.facebook.react

import android.app.Application
import android.content.Context

interface ReactApplication {
  val reactHost: ReactHost
}

class ReactHost(val context: Context, val packages: List<Any>)

class PackageList(val application: Application) {
  val packages = listOf<Any>("autolinked-package")

  init {
    createdFor += application
  }

  companion object {
    val createdFor = mutableListOf<Application>()
  }
}

object ReactNativeApplicationEntryPoint {
  val loaded = mutableListOf<Application>()

  fun loadReactNative(application: Application) {
    loaded += application
  }
}
