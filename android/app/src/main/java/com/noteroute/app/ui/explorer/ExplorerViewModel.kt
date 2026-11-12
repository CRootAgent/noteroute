package com.noteroute.app.ui.explorer

import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.noteroute.app.data.model.DocumentItem
import com.noteroute.app.data.repository.NoteRouteRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class ExplorerUiState(
    val isLoading: Boolean = false,
    val documents: List<DocumentItem> = emptyList(),
    val filteredDocuments: List<DocumentItem> = emptyList(),
    val searchQuery: String = "",
    val downloadingDocId: String? = null,
    val downloadedMessage: String? = null,
    val errorMessage: String? = null
)

class ExplorerViewModel(
    private val repository: NoteRouteRepository = NoteRouteRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(ExplorerUiState())
    val uiState: StateFlow<ExplorerUiState> = _uiState.asStateFlow()

    init {
        loadDocuments()
    }

    fun loadDocuments(workspaceId: String? = null) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            val result = repository.getDocuments(workspaceId)
            result.fold(
                onSuccess = { docs ->
                    _uiState.update { state ->
                        state.copy(
                            isLoading = false,
                            documents = docs,
                            filteredDocuments = filterList(docs, state.searchQuery)
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = error.message ?: "Gagal memuat dokumen"
                        )
                    }
                }
            )
        }
    }

    fun filterDocuments(query: String) {
        _uiState.update { state ->
            state.copy(
                searchQuery = query,
                filteredDocuments = filterList(state.documents, query)
            )
        }
    }

    private fun filterList(list: List<DocumentItem>, query: String): List<DocumentItem> {
        if (query.isBlank()) return list
        return list.filter {
            it.filename.contains(query, ignoreCase = true) ||
                    (it.summary?.contains(query, ignoreCase = true) == true)
        }
    }

    fun uploadDocument(context: Context, uri: Uri, workspaceId: String? = null) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            val result = repository.uploadDocument(context, uri, workspaceId)
            result.fold(
                onSuccess = { newDoc ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            downloadedMessage = "Berkas '${newDoc.filename}' berhasil diunggah & tersinkronisasi!"
                        )
                    }
                    loadDocuments(workspaceId)
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = error.message ?: "Gagal mengunggah berkas"
                        )
                    }
                }
            )
        }
    }

    fun downloadDocument(context: Context, doc: DocumentItem) {
        viewModelScope.launch {
            _uiState.update { it.copy(downloadingDocId = doc.id) }
            val result = repository.downloadDocument(
                context = context,
                documentId = doc.id,
                filename = doc.filename
            )
            result.fold(
                onSuccess = { savedFile ->
                    _uiState.update {
                        it.copy(
                            downloadingDocId = null,
                            downloadedMessage = "Berhasil disimpan ke: ${savedFile.name}"
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            downloadingDocId = null,
                            errorMessage = error.message ?: "Gagal mengunduh file"
                        )
                    }
                }
            )
        }
    }

    fun clearMessages() {
        _uiState.update { it.copy(downloadedMessage = null, errorMessage = null) }
    }
}
