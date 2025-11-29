package com.myfirstapp

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Add our custom LiveKit setup package
              add(LiveKitSetupPackage())
              // Add audio file picker package
              add(AudioFilePickerPackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    // Initialize LiveKit before React loads to ensure ADM is ready
    android.util.Log.d("MainApplication", "🔧 Initializing LiveKit (pre-React)...")

    fun tryInvoke(clazz: Class<*>, target: Any?, paramType: Class<*>, arg: Any): Boolean {
      return try {
        val method = clazz.getMethod("setup", paramType)
        method.invoke(target, arg)
        true
      } catch (_: NoSuchMethodException) {
        false
      }
    }

    try {
      val livekitClass = Class.forName("com.livekit.reactnative.LiveKitReactNative")
      // 1) Static with Application
      if (tryInvoke(livekitClass, null, Application::class.java, this)) {
        android.util.Log.d("MainApplication", "✅ LiveKit setup (static, Application)")
      } else if (tryInvoke(livekitClass, null, android.content.Context::class.java, this)) {
        // 2) Static with Context
        android.util.Log.d("MainApplication", "✅ LiveKit setup (static, Context)")
      } else {
        // 3) Kotlin object INSTANCE
        try {
          val instanceField = livekitClass.getField("INSTANCE")
          val instance = instanceField.get(null)
          if (tryInvoke(livekitClass, instance, Application::class.java, this)) {
            android.util.Log.d("MainApplication", "✅ LiveKit setup (INSTANCE, Application)")
          } else if (tryInvoke(livekitClass, instance, android.content.Context::class.java, this)) {
            android.util.Log.d("MainApplication", "✅ LiveKit setup (INSTANCE, Context)")
          } else {
            android.util.Log.w("MainApplication", "⚠️ No matching setup(Application|Context) on LiveKitReactNative")
          }
        } catch (ie: Exception) {
          android.util.Log.w("MainApplication", "⚠️ INSTANCE lookup failed: ${ie.message}")
        }
      }
    } catch (e: Exception) {
      android.util.Log.w("MainApplication", "⚠️ LiveKit class not found or setup failed: ${e.message}")
    }

    // Now load React Native
    loadReactNative(this)
  }
}
