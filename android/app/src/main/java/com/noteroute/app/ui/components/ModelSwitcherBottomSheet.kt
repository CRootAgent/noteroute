package com.noteroute.app.ui.components

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.noteroute.app.data.model.AiModel
import com.noteroute.app.databinding.DialogModelSwitcherBinding

class ModelSwitcherBottomSheet : BottomSheetDialogFragment() {

    private var _binding: DialogModelSwitcherBinding? = null
    private val binding get() = _binding!!

    private var currentModel: AiModel = AiModel.GEMINI
    var onModelSelectedListener: ((AiModel) -> Unit)? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = DialogModelSwitcherBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        updateRadioSelection(currentModel)

        binding.optionGemini.setOnClickListener {
            selectModel(AiModel.GEMINI)
        }
        binding.optionGroq.setOnClickListener {
            selectModel(AiModel.GROQ)
        }
        binding.optionDeepseek.setOnClickListener {
            selectModel(AiModel.DEEPSEEK)
        }
        binding.option9router.setOnClickListener {
            selectModel(AiModel.NINE_ROUTER)
        }
    }

    private fun selectModel(model: AiModel) {
        currentModel = model
        updateRadioSelection(model)
        onModelSelectedListener?.invoke(model)
        dismiss()
    }

    private fun updateRadioSelection(model: AiModel) {
        binding.rbGemini.isChecked = (model == AiModel.GEMINI)
        binding.rbGroq.isChecked = (model == AiModel.GROQ)
        binding.rbDeepseek.isChecked = (model == AiModel.DEEPSEEK)
        binding.rb9router.isChecked = (model == AiModel.NINE_ROUTER)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        const val TAG = "ModelSwitcherBottomSheet"

        fun newInstance(
            activeModel: AiModel,
            onSelected: (AiModel) -> Unit
        ): ModelSwitcherBottomSheet {
            val fragment = ModelSwitcherBottomSheet()
            fragment.currentModel = activeModel
            fragment.onModelSelectedListener = onSelected
            return fragment
        }
    }
}
