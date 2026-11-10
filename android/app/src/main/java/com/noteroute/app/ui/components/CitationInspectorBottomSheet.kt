package com.noteroute.app.ui.components

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.noteroute.app.data.model.CitationItem
import com.noteroute.app.databinding.BottomSheetCitationBinding

class CitationInspectorBottomSheet : BottomSheetDialogFragment() {

    private var _binding: BottomSheetCitationBinding? = null
    private val binding get() = _binding!!

    private var citationItem: CitationItem? = null
    private var citationIndex: Int = 1

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = BottomSheetCitationBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.tvModalCitationNumber.text = citationIndex.toString()

        citationItem?.let { citation ->
            binding.tvPageBadge.text = "Halaman ${citation.page}"
            binding.tvCitationFilename.text = citation.filename
            binding.tvCitationSnippet.text = "\"${citation.snippet}\""
        }

        binding.btnCloseCitation.setOnClickListener {
            dismiss()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        const val TAG = "CitationInspectorBottomSheet"

        fun newInstance(citation: CitationItem, index: Int = 1): CitationInspectorBottomSheet {
            val fragment = CitationInspectorBottomSheet()
            fragment.citationItem = citation
            fragment.citationIndex = index
            return fragment
        }
    }
}
