package com.noteroute.app.ui.status

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.noteroute.app.data.api.ApiClient
import com.noteroute.app.data.model.HealthCheckData
import com.noteroute.app.data.model.MetricsData
import com.noteroute.app.data.repository.NoteRouteRepository
import com.noteroute.app.utils.Constants
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class StatusUiState(
    val isChecking: Boolean = false,
    val isHealthy: Boolean = false,
    val healthData: HealthCheckData? = null,
    val metricsData: MetricsData? = null,
    val currentBaseUrl: String = ApiClient.getBaseUrl(),
    val errorMessage: String? = null
)

class StatusViewModel(
    private val repository: NoteRouteRepository = NoteRouteRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(StatusUiState())
    val uiState: StateFlow<StatusUiState> = _uiState.asStateFlow()

    init {
        checkHealth()
        loadMetrics()
    }

    fun checkHealth() {
        viewModelScope.launch {
            _uiState.update { it.copy(isChecking = true, errorMessage = null) }
            val result = repository.getHealth()
            result.fold(
                onSuccess = { health ->
                    _uiState.update {
                        it.copy(
                            isChecking = false,
                            isHealthy = (health.status == "healthy"),
                            healthData = health
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            isChecking = false,
                            isHealthy = false,
                            errorMessage = error.message
                        )
                    }
                }
            )
        }
    }

    fun loadMetrics() {
        viewModelScope.launch {
            val result = repository.getMetrics()
            result.fold(
                onSuccess = { metrics ->
                    _uiState.update { it.copy(metricsData = metrics) }
                },
                onFailure = {
                    // Non-critical, ignore
                }
            )
        }
    }

    fun setEnvironment(envType: EnvType, customLanUrl: String? = null) {
        val newUrl = when (envType) {
            EnvType.CLOUD -> Constants.BASE_URL_PRODUCTION
            EnvType.EMULATOR -> Constants.BASE_URL_EMULATOR
            EnvType.LAN -> customLanUrl?.takeIf { it.isNotBlank() } ?: Constants.BASE_URL_LAN_DEFAULT
        }
        ApiClient.setBaseUrl(newUrl)
        _uiState.update { it.copy(currentBaseUrl = newUrl) }
        checkHealth()
    }

    enum class EnvType {
        CLOUD, EMULATOR, LAN
    }
}
