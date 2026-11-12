package com.noteroute.app.data.api

import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.Protocol
import okhttp3.Response
import okhttp3.ResponseBody.Companion.toResponseBody

/**
 * MockInterceptor provides mock responses matching docs/API_CONTRACT.md
 * enabling independent Android development without waiting for the backend.
 */
class MockInterceptor : Interceptor {

    var isMockEnabled: Boolean = false

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val path = request.url.encodedPath

        if (!isMockEnabled) {
            try {
                val response = chain.proceed(request)
                if (response.isSuccessful) return response
            } catch (e: Exception) {
                // Network failed; fallback to mock data
            }
        }

        val jsonResponse = when {
            path.endsWith("/health") -> mockHealthResponse()
            path.endsWith("/workspaces") && request.method == "POST" -> mockCreateWorkspaceResponse()
            path.endsWith("/workspaces") -> mockWorkspacesResponse()
            path.endsWith("/documents/upload") -> mockUploadDocumentResponse()
            path.endsWith("/documents") -> mockDocumentsResponse()
            path.contains("/download") -> return mockDownloadResponse(chain)
            path.endsWith("/router/chat") -> mockChatResponse(chain)
            path.endsWith("/router/metrics") -> mockMetricsResponse()
            else -> """{"success":false,"message":"Endpoint mock not found","error_code":"NOT_FOUND"}"""
        }

        return Response.Builder()
            .request(request)
            .protocol(Protocol.HTTP_1_1)
            .code(200)
            .message("OK (Mocked)")
            .body(jsonResponse.toResponseBody("application/json".toMediaTypeOrNull()))
            .addHeader("content-type", "application/json")
            .build()
    }

    private fun mockHealthResponse() = """
    {
      "success": true,
      "message": "NoteRoute Backend Engine is running (Mocked)",
      "data": {
        "status": "healthy",
        "database": "connected",
        "timestamp": "2026-11-10T10:00:00.000Z"
      }
    }
    """.trimIndent()

    private fun mockCreateWorkspaceResponse() = """
    {
      "success": true,
      "message": "Notebook berhasil dibuat",
      "data": {
        "id": "${System.currentTimeMillis()}",
        "name": "Notebook Baru NoteRoute",
        "description": "Notebook AI terhubung dokumen laptop & web",
        "document_count": 0,
        "created_at": "2026-11-10T10:00:00.000Z"
      }
    }
    """.trimIndent()

    private fun mockUploadDocumentResponse() = """
    {
      "success": true,
      "message": "Berkas dari HP berhasil diunggah & tersinkronisasi",
      "data": {
        "id": "doc_${System.currentTimeMillis()}",
        "workspace_id": "6727bd89f1a23b0012e84101",
        "filename": "Dokumen_HP_Uploaded.pdf",
        "file_size": 1024000,
        "file_size_formatted": "1.00 MB",
        "mime_type": "application/pdf",
        "summary": "Dokumen berhasil diunggah dari perangkat Android.",
        "preview_text": "Isi dokumen tersinkronisasi otomatis dengan NoteRoute web.",
        "created_at": "2026-11-10T10:00:00.000Z"
      }
    }
    """.trimIndent()

    private fun mockWorkspacesResponse() = """
    {
      "success": true,
      "message": "Daftar workspace berhasil diambil",
      "data": []
    }
    """.trimIndent()

    private fun mockDocumentsResponse() = """
    {
      "success": true,
      "message": "Daftar dokumen berhasil dimuat",
      "data": []
    }
    """.trimIndent()

    private fun mockDownloadResponse(chain: Interceptor.Chain): Response {
        val fakePdfBytes = "%PDF-1.4 Mock NoteRoute Document Binary Stream...".toByteArray()
        return Response.Builder()
            .request(chain.request())
            .protocol(Protocol.HTTP_1_1)
            .code(200)
            .message("OK")
            .addHeader("Content-Disposition", "attachment; filename=\"Slide_Bab3_Distributed_Systems.pdf\"")
            .addHeader("Content-Type", "application/pdf")
            .addHeader("Content-Length", fakePdfBytes.size.toString())
            .body(fakePdfBytes.toResponseBody("application/pdf".toMediaTypeOrNull()))
            .build()
    }

    private fun mockChatResponse(chain: Interceptor.Chain): String {
        val request = chain.request()
        var prompt = ""
        try {
            val buffer = okio.Buffer()
            request.body?.writeTo(buffer)
            val bodyString = buffer.readUtf8()
            val gson = com.google.gson.Gson()
            val jsonObj = gson.fromJson(bodyString, com.google.gson.JsonObject::class.java)
            prompt = jsonObj?.get("prompt")?.asString?.lowercase() ?: ""
        } catch (e: Exception) {
            // ignore
        }

        val responseText = when {
            prompt.contains("halo") || prompt.contains("hi") || prompt.contains("pagi") || prompt.contains("siapa") -> {
                "Halo! Saya NoteRoute AI Agent. Ada yang bisa saya bantu terkait materi kuliah atau dokumen notebook Anda?"
            }
            prompt.contains("ringkas") || prompt.contains("rangkum") || prompt.contains("singkat") -> {
                "Berikut adalah ringkasan utama dari dokumen notebook Anda:\n\n1. Konsep Utama: Arsitektur Multi-LLM Router dan Grounded Knowledge Agent.\n2. Keunggulan: Penghematan token gratis dengan failover otomatis ke Groq/DeepSeek.\n3. Akses Lintas Perangkat: Mengambil & mengunduh berkas dari laptop langsung ke HP."
            }
            prompt.contains("kuis") || prompt.contains("soal") -> {
                "Latihan Kuis dari Dokumen Notebook Anda:\n\n1. Soal: Apa fungsi utama Multi-LLM Gateway Router?\n   Kunci: Melakukan perutean cerdas dan failover otomatis saat rate limit.\n2. Soal: Berapa konteks gratis Google Gemini 1.5 Flash?\n   Kunci: 1 Juta Token."
            }
            prompt.isNotBlank() -> {
                "Mengenai pertanyaan Anda, berdasarkan analisis dokumen notebook, NoteRoute mengintegrasikan sistem grounding terverifikasi dengan rujukan nomor halaman."
            }
            else -> {
                "Halo! Silakan tanyakan materi atau ringkasan dari dokumen notebook Anda."
            }
        }

        val hasCitations = prompt.contains("ringkas") || prompt.contains("soal") || prompt.contains("materi")
        val citationsJson = if (hasCitations) """
        [
          {
            "doc_id": "doc_101",
            "filename": "Materi_Notebook_NoteRoute.pdf",
            "page": 1,
            "snippet": "NoteRoute Knowledge Agent terhubung dengan dokumen tersinkronisasi."
          }
        ]
        """.trimIndent() else "[]"

        return """
        {
          "success": true,
          "message": "Inferensi sukses",
          "data": {
            "response_text": "$responseText",
            "model_used": "gemini-1.5-flash",
            "latency_ms": 320,
            "fallback_triggered": false,
            "citations": $citationsJson
          }
        }
        """.trimIndent()
    }

    private fun mockMetricsResponse() = """
    {
      "success": true,
      "message": "Metrik token dan penghematan biaya berhasil dimuat",
      "data": {
        "total_queries": 142,
        "prompt_tokens_total": 524000,
        "completion_tokens_total": 48200,
        "cost_saved_usd": 12.85,
        "cost_saved_idr": 208500,
        "active_providers": [
          { "name": "gemini", "status": "active", "priority": 1 },
          { "name": "groq", "status": "active", "priority": 2 },
          { "name": "9router_local", "status": "standby", "priority": 3 }
        ]
      }
    }
    """.trimIndent()
}
