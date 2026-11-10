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
            path.endsWith("/workspaces") -> mockWorkspacesResponse()
            path.endsWith("/documents") -> mockDocumentsResponse()
            path.contains("/download") -> return mockDownloadResponse(chain)
            path.endsWith("/router/chat") -> mockChatResponse()
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

    private fun mockWorkspacesResponse() = """
    {
      "success": true,
      "message": "Daftar workspace berhasil diambil",
      "data": [
        {
          "id": "6727bd89f1a23b0012e84101",
          "name": "Materi Kuliah Semester 5",
          "description": "Slide kuliah, modul praktikum, dan riset",
          "document_count": 8,
          "created_at": "2026-11-04T08:00:00.000Z"
        }
      ]
    }
    """.trimIndent()

    private fun mockDocumentsResponse() = """
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
          "preview_text": "Bab 3: Sistem Terdistribusi. 1. Definisi dan Karakteristik Sistem Terdistribusi. Jaringan komputer mandiri yang tampak sebagai sistem tunggal...",
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
          "preview_text": "# Riset LLM Router\nEvaluasi penghematan token menggunakan failover cerdas...",
          "created_at": "2026-11-04T08:30:00.000Z"
        },
        {
          "id": "6727be20f1a23b0012e84104",
          "workspace_id": "6727bd89f1a23b0012e84101",
          "filename": "Laporan_Praktikum_Jaringan.docx",
          "file_size": 819200,
          "file_size_formatted": "800 KB",
          "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "summary": "Konfigurasi subnetting VLAN dan routing OSPF multi-area.",
          "preview_text": "BAB I PENDAHULUAN\nTopologi jaringan virtual menggunakan GNS3...",
          "created_at": "2026-11-05T09:00:00.000Z"
        }
      ]
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

    private fun mockChatResponse() = """
    {
      "success": true,
      "message": "Inferensi sukses",
      "data": {
        "response_text": "Berdasarkan Slide Bab 3, kesimpulan utamanya adalah bahwa dalam sistem terdistribusi, teorema CAP menyatakan bahwa kita hanya dapat menjamin dua dari tiga sifat: Consistency, Availability, dan Partition Tolerance.",
        "model_used": "gemini-1.5-flash",
        "latency_ms": 482,
        "fallback_triggered": false,
        "citations": [
          {
            "doc_id": "6727be01f1a23b0012e84102",
            "filename": "Slide_Bab3_Distributed_Systems.pdf",
            "page": 14,
            "snippet": "Teorema CAP membuktikan ketidakmungkinan mencapai konsistensi kuat secara bersamaan dengan ketersediaan penuh pada partisi jaringan."
          }
        ]
      }
    }
    """.trimIndent()

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
