package com.noteroute.app.ui.components

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.noteroute.app.databinding.BottomSheetAiConfigBinding
import com.noteroute.app.utils.AiPreferences

class AiConfigBottomSheet : BottomSheetDialogFragment() {

    private var _binding: BottomSheetAiConfigBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = BottomSheetAiConfigBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val aiPrefs = AiPreferences.getInstance(requireContext())

        binding.etGeminiKey.setText(aiPrefs.geminiApiKey)
        binding.etGroqKey.setText(aiPrefs.groqApiKey)
        binding.etDeepseekKey.setText(aiPrefs.deepseekApiKey)
        binding.et9routerUrl.setText(aiPrefs.nineRouterUrl)

        binding.btnSaveAiConfig.setOnClickListener {
            aiPrefs.geminiApiKey = binding.etGeminiKey.text?.toString()?.trim().orEmpty()
            aiPrefs.groqApiKey = binding.etGroqKey.text?.toString()?.trim().orEmpty()
            aiPrefs.deepseekApiKey = binding.etDeepseekKey.text?.toString()?.trim().orEmpty()
            aiPrefs.nineRouterUrl = binding.et9routerUrl.text?.toString()?.trim().orEmpty().ifEmpty { "http://localhost:20128/v1" }

            Toast.makeText(requireContext(), "Pengaturan API Key & Router berhasil disimpan!", Toast.LENGTH_SHORT).show()
            dismiss()
        }

        binding.btnCancelAiConfig.setOnClickListener {
            dismiss()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        const val TAG = "AiConfigBottomSheet"

        fun newInstance(): AiConfigBottomSheet {
            return AiConfigBottomSheet()
        }
    }
}
