package com.myfirstapp

import android.app.Activity
import android.content.Intent
import android.database.Cursor
import android.net.Uri
import android.provider.OpenableColumns
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ActivityEventListener

@ReactModule(name = AudioFilePickerModule.NAME)
class AudioFilePickerModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {

  companion object {
    const val NAME = "AudioFilePicker"
    private const val REQUEST_CODE_PICK_AUDIO = 53211
  }

  private var pendingPromise: Promise? = null

  init {
    reactContext.addActivityEventListener(this)
  }

  override fun getName(): String = NAME

  @ReactMethod
  fun pickAudioFile(promise: Promise) {
    val activity: Activity? = reactContext.currentActivity
    if (activity == null) {
      promise.reject("E_NO_ACTIVITY", "Activity is null")
      return
    }

    if (pendingPromise != null) {
      promise.reject("E_IN_PROGRESS", "Another picker request is in progress")
      return
    }

    pendingPromise = promise

    try {
      val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
        addCategory(Intent.CATEGORY_OPENABLE)
        type = "audio/*"
        // Optionally restrict to common audio types
        putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("audio/mpeg", "audio/mp3", "audio/x-m4a", "audio/wav", "audio/aac"))
      }
      activity.startActivityForResult(intent, REQUEST_CODE_PICK_AUDIO)
    } catch (e: Exception) {
      pendingPromise?.reject("E_FAILED_TO_OPEN", e.message)
      pendingPromise = null
    }
  }

  override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
    if (requestCode != REQUEST_CODE_PICK_AUDIO) return

    val promise = pendingPromise ?: return
    pendingPromise = null

    if (resultCode != Activity.RESULT_OK) {
      promise.reject("E_CANCELLED", "User cancelled picker")
      return
    }

    val uri: Uri? = data?.data
    if (uri == null) {
      promise.reject("E_NO_URI", "No URI returned")
      return
    }

    try {
      var fileName: String? = null
      var size: Long? = null
      val projection = arrayOf(OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE)
      val cursor: Cursor? = reactContext.contentResolver.query(uri, projection, null, null, null)
      cursor?.use {
        if (it.moveToFirst()) {
          val nameIndex = it.getColumnIndex(OpenableColumns.DISPLAY_NAME)
          val sizeIndex = it.getColumnIndex(OpenableColumns.SIZE)
          if (nameIndex != -1) fileName = it.getString(nameIndex)
          if (sizeIndex != -1) size = it.getLong(sizeIndex)
        }
      }

      if (fileName == null) {
        fileName = uri.lastPathSegment ?: "audio_file"
      }

      val lowerName = fileName!!.lowercase()
      val mimeType = when {
        lowerName.endsWith(".mp3") -> "audio/mpeg"
        lowerName.endsWith(".m4a") -> "audio/mp4"
        lowerName.endsWith(".wav") -> "audio/wav"
        lowerName.endsWith(".aac") -> "audio/aac"
        else -> "audio/*"
      }

      val map: WritableMap = Arguments.createMap().apply {
        putString("uri", uri.toString())
        putString("fileName", fileName)
        putString("type", mimeType)
        size?.let { putDouble("size", it.toDouble()) }
      }
      promise.resolve(map)
    } catch (e: Exception) {
      promise.reject("E_PROCESSING", e.message)
    }
  }

  override fun onNewIntent(intent: Intent) { /* no-op */ }
}
