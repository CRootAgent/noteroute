package com.noteroute.app

import com.noteroute.app.data.model.ApiResponse
import com.noteroute.app.data.model.ChatResponseData
import com.noteroute.app.data.model.CitationItem
import com.noteroute.app.data.model.DocumentItem
import com.noteroute.app.data.model.HealthCheckData
import com.noteroute.app.data.model.WorkspaceItem

object TestDataFactory {

    fun createSampleWorkspaces(): List<WorkspaceItem> = listOf(
        WorkspaceItem(
            id = "6727bd89f1a23b0012e84101",
            name = "Materi Kuliah Semester 5",
            description = "Slide kuliah, modul praktikum, dan riset",
            documentCount = 8,
            createdAt = "2026-11-04T08:00:00.000Z"
        )
    )

    fun createSampleDocuments(): List<DocumentItem> = listOf(
        DocumentItem(
            id = "6727be01f1a23b0012e84102",
            workspaceId = "6727bd89f1a23b0012e84101",
            filename = "Slide_Bab3_Distributed_Systems.pdf",
            fileSize = 2457600L,
            fileSizeFormatted = "2.34 MB",
            mimeType = "application/pdf",
            summary = "Membahas arsitektur microservices, RPC, dan konsistensi data terdistribusi.",
            previewText = "Bab 3: Sistem Terdistribusi. 1. Definisi dan Karakteristik...",
            createdAt = "2026-11-04T08:15:00.000Z"
        ),
        DocumentItem(
            id = "6727be15f1a23b0012e84103",
            workspaceId = "6727bd89f1a23b0012e84101",
            filename = "Catatan_Riset_LLM_Router.md",
            fileSize = 15420L,
            fileSizeFormatted = "15.06 KB",
            mimeType = "text/markdown",
            summary = "Analisis perbandingan latensi antara Gemini 1.5 Flash dan Groq Llama 3.3.",
            previewText = "# Riset LLM Router\nEvaluasi penghematan token menggunakan 9Router...",
            createdAt = "2026-11-04T08:30:00.000Z"
        )
    )

    fun createSampleChatResponse(): ChatResponseData = ChatResponseData(
        responseText = "Berdasarkan Slide Bab 3, teorema CAP menyatakan bahwa kita hanya dapat menjamin dua dari tiga sifat.",
        modelUsed = "gemini-1.5-flash",
        latencyMs = 482L,
        fallbackTriggered = false,
        citations = listOf(
            CitationItem(
                docId = "6727be01f1a23b0012e84102",
                filename = "Slide_Bab3_Distributed_Systems.pdf",
                page = 14,
                snippet = "Teorema CAP membuktikan ketidakmungkinan mencapai konsistensi kuat secara bersamaan."
            )
        )
    )

    fun createSampleHealth(): HealthCheckData = HealthCheckData(
        status = "healthy",
        database = "connected",
        timestamp = "2026-11-10T10:00:00.000Z"
    )
}
