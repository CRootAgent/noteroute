package com.noteroute.app.ui.components

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.noteroute.app.databinding.BottomSheetRenameNotebookBinding

class RenameNotebookBottomSheet : BottomSheetDialogFragment() {

    private var _binding: BottomSheetRenameNotebookBinding? = null
    private val binding get() = _binding!!

    private var currentName: String = ""
    var onRenameSuccessListener: ((String) -> Unit)? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = BottomSheetRenameNotebookBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.etRenameNotebookName.setText(currentName)
        binding.etRenameNotebookName.selectAll()

        binding.btnSubmitRenameNotebook.setOnClickListener {
            val newName = binding.etRenameNotebookName.text?.toString()?.trim().orEmpty()

            if (newName.isBlank()) {
                Toast.makeText(requireContext(), "Nama notebook tidak boleh kosong", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            onRenameSuccessListener?.invoke(newName)
            dismiss()
        }

        binding.btnCancelRenameNotebook.setOnClickListener {
            dismiss()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        const val TAG = "RenameNotebookBottomSheet"

        fun newInstance(
            initialName: String,
            onSuccess: (String) -> Unit
        ): RenameNotebookBottomSheet {
            val sheet = RenameNotebookBottomSheet()
            sheet.currentName = initialName
            sheet.onRenameSuccessListener = onSuccess
            return sheet
        }
    }
}
