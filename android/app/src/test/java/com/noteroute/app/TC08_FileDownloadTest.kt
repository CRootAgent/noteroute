package com.noteroute.app

import com.google.gson.Gson
import com.noteroute.app.data.model.ApiResponse
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream

/**
 * TC-08: File Download Stream ("Unduh ke Memori HP" - Modul Izat)
 * Validates streaming byte transfer, progress calculation, and 404 error handling.
 */
class TC08_FileDownloadTest {

    private val gson = Gson()

    @Test
    fun `TC-08-01 - Parse 404 FILE_NOT_FOUND error envelope`() {
        val errorJson = """
        {
          "success": false,
          "message": "Dokumen tidak ditemukan atau berkas fisik terhapus",
          "error_code": "FILE_NOT_FOUND"
        }
        """.trimIndent()

        val response = gson.fromJson(errorJson, ApiResponse::class.java)

        assertFalse(response.success)
        assertEquals("FILE_NOT_FOUND", response.errorCode)
        assertEquals("Dokumen tidak ditemukan atau berkas fisik terhapus", response.message)
    }

    @Test
    fun `TC-08-02 - Stream download progress tracking calculation`() {
        val simulatedData = "Simulated binary payload for NoteRoute stream transfer...".toByteArray()
        val inputStream = ByteArrayInputStream(simulatedData)
        val outputStream = ByteArrayOutputStream()

        var reportedProgress = 0
        val totalBytes = simulatedData.size.toLong()

        val buffer = ByteArray(8)
        var bytesRead: Int
        var totalRead: Long = 0

        while (inputStream.read(buffer).also { bytesRead = it } != -1) {
            outputStream.write(buffer, 0, bytesRead)
            totalRead += bytesRead
            reportedProgress = ((totalRead * 100) / totalBytes).toInt()
        }

        assertEquals(100, reportedProgress)
        assertEquals(simulatedData.size, outputStream.toByteArray().size)
    }
}
