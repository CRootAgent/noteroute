package com.noteroute.app.data.download

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import androidx.work.workDataOf
import com.noteroute.app.data.repository.NoteRouteRepository
import java.io.File

class FileDownloadWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    private val repository = NoteRouteRepository()

    override suspend fun doWork(): Result {
        val documentId = inputData.getString(KEY_DOCUMENT_ID) ?: return Result.failure()
        val filename = inputData.getString(KEY_FILENAME) ?: return Result.failure()

        val downloadResult = repository.downloadDocument(
            context = applicationContext,
            documentId = documentId,
            filename = filename,
            onProgress = { bytesRead, totalBytes ->
                val progress = if (totalBytes > 0) ((bytesRead * 100) / totalBytes).toInt() else 0
                setProgressAsync(workDataOf(KEY_PROGRESS to progress))
            }
        )

        return downloadResult.fold(
            onSuccess = { file: File ->
                val output = workDataOf(
                    KEY_OUTPUT_FILE_PATH to file.absolutePath,
                    KEY_PROGRESS to 100
                )
                Result.success(output)
            },
            onFailure = {
                Result.failure(workDataOf(KEY_ERROR_MESSAGE to (it.message ?: "Download failed")))
            }
        )
    }

    companion object {
        const val KEY_DOCUMENT_ID = "key_document_id"
        const val KEY_FILENAME = "key_filename"
        const val KEY_OUTPUT_FILE_PATH = "key_output_file_path"
        const val KEY_PROGRESS = "key_progress"
        const val KEY_ERROR_MESSAGE = "key_error_message"
    }
}
