package com.noteroute.app.ui.components

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.noteroute.app.databinding.BottomSheetSourcePickerBinding

class SourcePickerBottomSheet : BottomSheetDialogFragment() {

    private var _binding: BottomSheetSourcePickerBinding? = null
    private val binding get() = _binding!!

    var onSourcesApplied: ((Int) -> Unit)? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = BottomSheetSourcePickerBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnApplySourcePicker.setOnClickListener {
            var selectedCount = 0
            if (binding.cbSource1.isChecked) selectedCount++
            if (binding.cbSource2.isChecked) selectedCount++
            if (binding.cbSource3.isChecked) selectedCount++
            if (binding.cbSource4.isChecked) selectedCount++

            onSourcesApplied?.invoke(selectedCount)
            Toast.makeText(requireContext(), "$selectedCount sumber rujukan diterapkan.", Toast.LENGTH_SHORT).show()
            dismiss()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        const val TAG = "SourcePickerBottomSheet"
        fun newInstance(onApplied: (Int) -> Unit): SourcePickerBottomSheet {
            val sheet = SourcePickerBottomSheet()
            sheet.onSourcesApplied = onApplied
            return sheet
        }
    }
}
