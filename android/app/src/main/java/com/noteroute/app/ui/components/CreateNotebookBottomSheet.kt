package com.noteroute.app.ui.components

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.noteroute.app.databinding.BottomSheetCreateNotebookBinding

class CreateNotebookBottomSheet : BottomSheetDialogFragment() {

    private var _binding: BottomSheetCreateNotebookBinding? = null
    private val binding get() = _binding!!

    var onCreateSuccessListener: ((String, String) -> Unit)? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = BottomSheetCreateNotebookBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnSubmitCreateNotebook.setOnClickListener {
            val rawName = binding.etNotebookName.text?.toString()?.trim().orEmpty()
            val rawDesc = binding.etNotebookDesc.text?.toString()?.trim().orEmpty()

            val name = if (rawName.isBlank()) "Riset Skripsi AI" else rawName
            val desc = if (rawDesc.isBlank()) "Notebook AI NoteRoute" else rawDesc

            onCreateSuccessListener?.invoke(name, desc)
            dismiss()
        }

        binding.btnCancelCreateNotebook.setOnClickListener {
            dismiss()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        const val TAG = "CreateNotebookBottomSheet"

        fun newInstance(onSuccess: (String, String) -> Unit): CreateNotebookBottomSheet {
            val sheet = CreateNotebookBottomSheet()
            sheet.onCreateSuccessListener = onSuccess
            return sheet
        }
    }
}
