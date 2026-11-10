package com.noteroute.app.ui.chat

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.noteroute.app.data.model.AiModel
import com.noteroute.app.data.model.ChatMessage
import com.noteroute.app.data.model.ChatMessageHistory
import com.noteroute.app.data.model.ChatRequest
import com.noteroute.app.data.model.CitationItem
import com.noteroute.app.data.repository.NoteRouteRepository
import com.noteroute.app.utils.Constants
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class ChatUiState(
    val messages: List<ChatMessage> = emptyList(),
    val isThinking: Boolean = false,
    val activeModel: AiModel = AiModel.GEMINI,
    val isAutoFailoverActive: Boolean = true,
    val selectedCitation: CitationItem? = null,
    val errorMessage: String? = null
)

class ChatViewModel(
    private val repository: NoteRouteRepository = NoteRouteRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(ChatUiState())
    val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()

    private val historyList = mutableListOf<ChatMessageHistory>()

    init {
        // Welcome message from AI
        val welcomeMessage = ChatMessage(
            text = "Halo! Saya NoteRoute Agent. Tanyakan apa saja mengenai slide, catatan riset, atau berkas di laptop Anda.",
            isUser = false,
            timestamp = getCurrentTime(),
            modelUsed = AiModel.GEMINI.displayName
        )
        _uiState.update { it.copy(messages = listOf(welcomeMessage)) }
    }

    fun setModel(model: AiModel) {
        _uiState.update { it.copy(activeModel = model) }
    }

    fun sendMessage(prompt: String, workspaceId: String = Constants.DEFAULT_WORKSPACE_ID) {
        if (prompt.isBlank()) return

        val userMessage = ChatMessage(
            text = prompt.trim(),
            isUser = true,
            timestamp = getCurrentTime()
        )

        _uiState.update { state ->
            state.copy(
                messages = state.messages + userMessage,
                isThinking = true,
                errorMessage = null
            )
        }

        val request = ChatRequest(
            workspaceId = workspaceId,
            prompt = prompt.trim(),
            modelTarget = _uiState.value.activeModel.targetKey,
            history = ArrayList(historyList)
        )

        viewModelScope.launch {
            val result = repository.sendChat(request)
            result.fold(
                onSuccess = { responseData ->
                    // Update conversation history for multi-turn reasoning
                    historyList.add(ChatMessageHistory(role = "user", content = prompt.trim()))
                    historyList.add(ChatMessageHistory(role = "assistant", content = responseData.responseText))

                    val assistantMessage = ChatMessage(
                        text = responseData.responseText,
                        isUser = false,
                        timestamp = getCurrentTime(),
                        modelUsed = responseData.modelUsed,
                        latencyMs = responseData.latencyMs,
                        fallbackTriggered = responseData.fallbackTriggered,
                        citations = responseData.citations
                    )

                    _uiState.update { state ->
                        state.copy(
                            messages = state.messages + assistantMessage,
                            isThinking = false
                        )
                    }
                },
                onFailure = { error ->
                    val errorMessage = ChatMessage(
                        text = "Maaf, terjadi kendala inferensi: ${error.message}",
                        isUser = false,
                        timestamp = getCurrentTime(),
                        modelUsed = _uiState.value.activeModel.displayName,
                        isError = true
                    )
                    _uiState.update { state ->
                        state.copy(
                            messages = state.messages + errorMessage,
                            isThinking = false,
                            errorMessage = error.message
                        )
                    }
                }
            )
        }
    }

    fun clearChat() {
        historyList.clear()
        val resetMessage = ChatMessage(
            text = "Percakapan telah direset. Silakan tanyakan hal baru mengenai dokumen Anda.",
            isUser = false,
            timestamp = getCurrentTime(),
            modelUsed = _uiState.value.activeModel.displayName
        )
        _uiState.update { it.copy(messages = listOf(resetMessage)) }
    }

    fun selectCitation(citation: CitationItem?) {
        _uiState.update { it.copy(selectedCitation = citation) }
    }

    private fun getCurrentTime(): String {
        return SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
    }
}
