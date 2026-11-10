package com.noteroute.app.utils

import android.content.Context
import android.os.Environment
import java.io.File
import java.io.InputStream
import java.io.OutputStream
import java.text.DecimalFormat

object FileUtils {

    fun formatFileSize(bytes: Long): String {
        if (bytes <= 0) return "0 B"
        val units = arrayOf("B", "KB", "MB", "GB", "TB")
        val digitGroups = (Math.log10(bytes.toDouble()) / Math.log10(1024.0)).toInt()
        val format = DecimalFormat("#,##0.##")
        return "${format.format(bytes / Math.pow(1024.0, digitGroups.toDouble()))} ${units[digitGroups]}"
    }

    fun getBadgeText(mimeType: String, filename: String): String {
        return when {
            mimeType.contains("pdf", ignoreCase = true) || filename.endsWith(".pdf", ignoreCase = true) -> "PDF"
            mimeType.contains("markdown", ignoreCase = true) || filename.endsWith(".md", ignoreCase = true) -> "MD"
            mimeType.contains("word", ignoreCase = true) || filename.endsWith(".docx", ignoreCase = true) -> "DOCX"
            mimeType.contains("text", ignoreCase = true) || filename.endsWith(".txt", ignoreCase = true) -> "TXT"
            else -> "FILE"
        }
    }

    /**
     * Saves input stream to the public Downloads directory or app-specific external files dir.
     */
    fun saveStreamToFile(
        context: Context,
        filename: String,
        inputStream: InputStream,
        onProgress: ((bytesRead: Long, totalBytes: Long) -> Unit)? = null,
        totalBytes: Long = -1L
    ): File {
        val downloadDir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
            ?: File(context.filesDir, "downloads").apply { mkdirs() }

        val destinationFile = File(downloadDir, filename)
        inputStream.use { input ->
            destinationFile.outputStream().use { output ->
                val buffer = ByteArray(8 * 1024)
                var bytesRead: Int
                var totalRead: Long = 0

                while (input.read(buffer).also { bytesRead = it } != -1) {
                    output.write(buffer, 0, bytesRead)
                    totalRead += bytesRead
                    onProgress?.invoke(totalRead, totalBytes)
                }
                output.flush()
            }
        }
        return destinationFile
    }
}
