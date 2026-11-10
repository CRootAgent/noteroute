package com.noteroute.app.ui.status

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.noteroute.app.R
import com.noteroute.app.databinding.FragmentStatusBinding
import com.noteroute.app.utils.Constants
import kotlinx.coroutines.launch

class StatusFragment : Fragment() {

    private var _binding: FragmentStatusBinding? = null
    private val binding get() = _binding!!

    private val viewModel: StatusViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentStatusBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupListeners()
        observeViewModel()
    }

    private fun setupListeners() {
        binding.btnCheckHealth.setOnClickListener {
            viewModel.checkHealth()
            viewModel.loadMetrics()
        }

        binding.rgBaseUrl.setOnCheckedChangeListener { _, checkedId ->
            binding.etCustomUrl.visibility = if (checkedId == R.id.rb_env_lan) View.VISIBLE else View.GONE
        }

        binding.btnApplyUrl.setOnClickListener {
            val env = when (binding.rgBaseUrl.checkedRadioButtonId) {
                R.id.rb_env_emulator -> StatusViewModel.EnvType.EMULATOR
                R.id.rb_env_lan -> StatusViewModel.EnvType.LAN
                else -> StatusViewModel.EnvType.CLOUD
            }
            val customUrl = binding.etCustomUrl.text?.toString()
            viewModel.setEnvironment(env, customUrl)
            Toast.makeText(requireContext(), "Base URL diterapkan!", Toast.LENGTH_SHORT).show()
        }
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    val isOnline = state.isHealthy
                    val context = requireContext()

                    binding.indicatorHealthDot.backgroundTintList = ContextCompat.getColorStateList(
                        context,
                        if (isOnline) R.color.status_online else R.color.status_offline
                    )
                    binding.tvHealthStatus.text = if (isOnline) {
                        getString(R.string.server_online)
                    } else {
                        getString(R.string.server_offline)
                    }

                    binding.tvDbStatus.text = if (isOnline && state.healthData?.database == "connected") {
                        getString(R.string.db_connected)
                    } else {
                        getString(R.string.db_disconnected)
                    }

                    state.healthData?.let {
                        binding.tvTimestampStatus.text = "Pemeriksaan terakhir: ${it.timestamp}"
                    }

                    state.metricsData?.let { metrics ->
                        binding.tvTotalQueries.text = "${metrics.totalQueries}"
                        binding.tvCostSaved.text = "Rp ${metrics.costSavedIdr}"
                    }

                    binding.btnCheckHealth.isEnabled = !state.isChecking
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        fun newInstance() = StatusFragment()
    }
}
