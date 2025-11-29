package com.myfirstapp

import android.app.Application
import android.content.Context
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class LiveKitSetupModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "LiveKitSetupModule"
    }

    @ReactMethod
    fun initializeLiveKit(promise: Promise) {
        try {
            Log.d("LiveKitSetup", "Attempting to initialize LiveKit...")
            
            // Try to initialize LiveKit using reflection
            val application = reactApplicationContext.applicationContext as Application
            val context: Context = reactApplicationContext.applicationContext

            fun logAvailableMethods(clazz: Class<*>) {
                try {
                    val methods = clazz.methods.joinToString("; ") { m ->
                        val params = m.parameterTypes.joinToString(",") { it.name }
                        "${m.name}(${params})"
                    }
                    Log.d("LiveKitSetup", "Available methods on ${clazz.name}: ${methods}")
                } catch (t: Throwable) {
                    Log.w("LiveKitSetup", "Failed to enumerate methods: ${t.message}")
                }
            }

            fun tryInvoke(clazz: Class<*>, target: Any?, paramType: Class<*>, arg: Any): Boolean {
                return try {
                    val method = clazz.getMethod("setup", paramType)
                    method.invoke(target, arg)
                    true
                } catch (e: NoSuchMethodException) {
                    false
                }
            }

            try {
                val livekitClass = Class.forName("com.livekit.reactnative.LiveKitReactNative")
                logAvailableMethods(livekitClass)

                // 1) Try as static with Application
                if (tryInvoke(livekitClass, null, Application::class.java, application)) {
                    Log.d("LiveKitSetup", "✅ LiveKit setup (static, Application) completed")
                    promise.resolve("success")
                    return
                }

                // 2) Try as static with Context
                if (tryInvoke(livekitClass, null, Context::class.java, context)) {
                    Log.d("LiveKitSetup", "✅ LiveKit setup (static, Context) completed")
                    promise.resolve("success")
                    return
                }

                // 3) Try Kotlin object INSTANCE with Application
                try {
                    val instanceField = livekitClass.getField("INSTANCE")
                    val instance = instanceField.get(null)
                    if (tryInvoke(livekitClass, instance, Application::class.java, application)) {
                        Log.d("LiveKitSetup", "✅ LiveKit setup (INSTANCE, Application) completed")
                        promise.resolve("success")
                        return
                    }
                    if (tryInvoke(livekitClass, instance, Context::class.java, context)) {
                        Log.d("LiveKitSetup", "✅ LiveKit setup (INSTANCE, Context) completed")
                        promise.resolve("success")
                        return
                    }
                } catch (e: Exception) {
                    Log.w("LiveKitSetup", "INSTANCE lookup failed: ${e.message}")
                }

                // 4) No setup method forms found
                Log.w("LiveKitSetup", "⚠️ Reflection-based setup failed: no matching setup() found")

                // Check if LiveKit classes are available in the classpath
                try {
                    Class.forName("com.livekit.reactnative.LivekitReactNativePackage")
                    Log.d("LiveKitSetup", "LiveKit package found, but setup method unavailable")
                    promise.resolve("package_found_no_setup")
                } catch (packageError: Exception) {
                    Log.w("LiveKitSetup", "LiveKit package not found: ${packageError.message}")
                    promise.resolve("no_native_support")
                }
            } catch (reflectionError: Exception) {
                Log.w("LiveKitSetup", "⚠️ Reflection error: ${reflectionError.message}")
                promise.resolve("no_native_support")
            }
            
        } catch (error: Exception) {
            Log.e("LiveKitSetup", "❌ Failed to initialize LiveKit: ${error.message}")
            promise.reject("LIVEKIT_INIT_ERROR", error.message, error)
        }
    }

    @ReactMethod
    fun checkLiveKitAvailability(promise: Promise) {
        try {
            val livekitClass = Class.forName("com.livekit.reactnative.LiveKitReactNative")
            promise.resolve(mapOf(
                "available" to true,
                "className" to livekitClass.name
            ))
        } catch (primary: Exception) {
            try {
                val altLivekitClass = Class.forName("io.livekit.reactnative.LiveKitReactNative")
                promise.resolve(mapOf(
                    "available" to true,
                    "className" to altLivekitClass.name
                ))
            } catch (altError: Exception) {
                promise.resolve(mapOf(
                    "available" to false,
                    "error" to primary.message,
                    "altError" to altError.message
                ))
            }
        }
    }
}