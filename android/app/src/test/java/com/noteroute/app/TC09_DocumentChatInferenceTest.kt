package com.noteroute.app

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.noteroute.app.data.model.ApiResponse
import com.noteroute.app.data.model.ChatMessageHistory
import com.noteroute.app.data.model.ChatRequest
import com.noteroute.app.data.model.ChatResponseData
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * TC-09: Document Chat & Multi-Model Inference (Modul Izat)
 * Validates request payload serialization, history accumulation, and inference response parsing.
 */
class TC09_DocumentChatInferenceTest {

    private val gson = Gson()

    private val sampleChatResponseJson = """
    {
      "success": true,
      "message": "Inferensi sukses",
      "data": {
        "response_text": "Berdasarkan Slide Bab 3, kesimpulan utamanya adalah teorema CAP.",
        "model_used": "gemini-1.5-flash",
        "latency_ms": 482,
        "fallback_triggered": false,
        "citations": [
          {
            "doc_id": "6727be01f1a23b0012e84102",
            "filename": "Slide_Bab3_Distributed_Systems.pdf",
            "page": 14,
            "snippet": "Teorema CAP membuktikan ketidakmungkinan..."
          }
        ]
      }
    }
    """.trimIndent()

    @Test
    fun `TC-09-01 - Construct and serialize ChatRequest payload`() {
        val request = ChatRequest(
            workspaceId = "6727bd89f1a23b0012e84101",
            prompt = "Apa kesimpulan bab 3?",
            modelTarget = "gemini",
            history = listOf(
                ChatMessageHistory(role = "user", content = "Halo NoteRoute"),
                ChatMessageHistory(role = "assistant", content = "Halo! Ada yang bisa dibantu?")
            )
        )

        val json = gson.toJson(request)
        assertTrue(json.contains("\"workspace_id\":\"6727bd89f1a23b0012e84101\""))
        assertTrue(json.contains("\"model_target\":\"gemini\""))
        assertTrue(json.contains("\"prompt\":\"Apa kesimpulan bab 3?\""))
        assertTrue(json.contains("\"role\":\"user\""))
    }

    @Test
    fun `TC-09-02 - Deserialize ChatResponse envelope correctly`() {
        val type = object : TypeToken<ApiResponse<ChatResponseData>>() {}.type
        val response: ApiResponse<ChatResponseData> = gson.fromJson(sampleChatResponseJson, type)

        assertTrue(response.success)
        assertNotNull(response.data)

        val chatData = response.data!!
        assertEquals("gemini-1.5-flash", chatData.modelUsed)
        assertEquals(482L, chatData.latencyMs)
        assertFalse(chatData.fallbackTriggered)
        assertEquals(1, chatData.citations.size)
        assertEquals("Slide_Bab3_Distributed_Systems.pdf", chatData.citations[0].filename)
        assertEquals(14, chatData.citations[0].page)
    }
}
