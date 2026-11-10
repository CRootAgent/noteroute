package com.noteroute.app.data.model

import java.util.UUID

data class ChatMessage(
    val id: String = UUID.randomUUID().toString(),
    val text: String,
    val isUser: Boolean,
    val timestamp: String,
    val modelUsed: String? = null,
    val latencyMs: Long? = null,
    val fallbackTriggered: Boolean = false,
    val citations: List<CitationItem> = emptyList(),
    val isError: Boolean = false
)
