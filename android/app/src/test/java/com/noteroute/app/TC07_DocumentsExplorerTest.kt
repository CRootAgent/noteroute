package com.noteroute.app

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.noteroute.app.data.model.ApiResponse
import com.noteroute.app.data.model.DocumentItem
import com.noteroute.app.utils.FileUtils
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * TC-07: Documents Explorer ("Ambil File dari Laptop" - Modul Izat)
 * Validates document parsing, file formatting, badge detection, and filtering.
 */
class TC07_DocumentsExplorerTest {

    private val gson = Gson()

    private val sampleJson = """
    {
      "success": true,
      "message": "Daftar dokumen berhasil dimuat",
      "data": [
        {
          "id": "6727be01f1a23b0012e84102",
          "workspace_id": "6727bd89f1a23b0012e84101",
          "filename": "Slide_Bab3_Distributed_Systems.pdf",
          "file_size": 2457600,
          "file_size_formatted": "2.34 MB",
          "mime_type": "application/pdf",
          "summary": "Membahas arsitektur microservices, RPC, dan konsistensi data terdistribusi.",
          "preview_text": "Bab 3: Sistem Terdistribusi. 1. Definisi dan Karakteristik...",
          "created_at": "2026-11-04T08:15:00.000Z"
        },
        {
          "id": "6727be15f1a23b0012e84103",
          "workspace_id": "6727bd89f1a23b0012e84101",
          "filename": "Catatan_Riset_LLM_Router.md",
          "file_size": 15420,
          "file_size_formatted": "15.06 KB",
          "mime_type": "text/markdown",
          "summary": "Analisis perbandingan latensi antara Gemini 1.5 Flash dan Groq Llama 3.3.",
          "preview_text": "# Riset LLM Router\nEvaluasi penghematan token menggunakan 9Router...",
          "created_at": "2026-11-04T08:30:00.000Z"
        }
      ]
    }
    """.trimIndent()

    @Test
    fun `TC-07-01 - Parse documents API response correctly`() {
        val type = object : TypeToken<ApiResponse<List<DocumentItem>>>() {}.type
        val response: ApiResponse<List<DocumentItem>> = gson.fromJson(sampleJson, type)

        assertTrue(response.success)
        assertEquals("Daftar dokumen berhasil dimuat", response.message)
        assertNotNull(response.data)
        assertEquals(2, response.data!!.size)

        val firstDoc = response.data!![0]
        assertEquals("6727be01f1a23b0012e84102", firstDoc.id)
        assertEquals("Slide_Bab3_Distributed_Systems.pdf", firstDoc.filename)
        assertEquals(2457600L, firstDoc.fileSize)
        assertEquals("2.34 MB", firstDoc.fileSizeFormatted)
        assertEquals("application/pdf", firstDoc.mimeType)
    }

    @Test
    fun `TC-07-02 - Validate badge type detection for different files`() {
        assertEquals("PDF", FileUtils.getBadgeText("application/pdf", "slide.pdf"))
        assertEquals("MD", FileUtils.getBadgeText("text/markdown", "notes.md"))
        assertEquals("DOCX", FileUtils.getBadgeText("application/vnd.openxmlformats", "report.docx"))
        assertEquals("TXT", FileUtils.getBadgeText("text/plain", "readme.txt"))
    }

    @Test
    fun `TC-07-03 - Filter documents by search keyword`() {
        val docs = TestDataFactory.createSampleDocuments()
        val query = "Riset"

        val filtered = docs.filter {
            it.filename.contains(query, ignoreCase = true) ||
                    (it.summary?.contains(query, ignoreCase = true) == true)
        }

        assertEquals(1, filtered.size)
        assertEquals("Catatan_Riset_LLM_Router.md", filtered[0].filename)
    }
}
