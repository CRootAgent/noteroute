package com.noteroute.app.ui.chat

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.recyclerview.widget.LinearLayoutManager
import com.noteroute.app.R
import com.noteroute.app.databinding.FragmentChatBinding
import com.noteroute.app.ui.components.CitationInspectorBottomSheet
import com.noteroute.app.ui.components.SourcePickerBottomSheet
import kotlinx.coroutines.launch

class ChatFragment : Fragment() {

    private var _binding: FragmentChatBinding? = null
    private val binding get() = _binding!!

    private val viewModel: ChatViewModel by viewModels()
    private lateinit var chatAdapter: ChatAdapter

    private var isNotebookMode: Boolean = true

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentChatBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupRecyclerView()
        setupListeners()
        observeViewModel()
    }

    fun clearChatHistory() {
        viewModel.clearChat()
        binding.scrollWelcomeBanner.visibility = View.VISIBLE
    }

    private fun setupRecyclerView() {
        chatAdapter = ChatAdapter(
            onCitationClick = { citation, index ->
                val inspector = CitationInspectorBottomSheet.newInstance(citation, index)
                inspector.show(parentFragmentManager, CitationInspectorBottomSheet.TAG)
            }
        )

        binding.rvMessages.apply {
            layoutManager = LinearLayoutManager(requireContext()).apply {
                stackFromEnd = true
            }
            adapter = chatAdapter
        }
    }

    private fun setupListeners() {
        // Starter Prompt Buttons
        binding.btnStarterTopic.setOnClickListener {
            sendMessage("Pelajari materi baru")
        }
        binding.btnStarterCreate.setOnClickListener {
            sendMessage("Buat sesuatu yang baru")
        }
        binding.btnStarterProject.setOnClickListener {
            sendMessage("Progres proyek riset")
        }

        // Mode Switcher: Mode Notebook vs AI Umum
        binding.btnModeNotebook.setOnClickListener {
            setAppMode(true)
        }
        binding.btnModeGeneral.setOnClickListener {
            setAppMode(false)
        }

        // Source Picker Dialog
        binding.btnSourcePicker.setOnClickListener {
            val sheet = SourcePickerBottomSheet.newInstance { count ->
                binding.tvSourcePickerLabel.text = "$count Sumber Dipilih"
            }
            sheet.show(parentFragmentManager, SourcePickerBottomSheet.TAG)
        }

        // Send Button Click
        binding.btnSend.setOnClickListener {
            sendMessageFromInput()
        }

        // IME Editor Action (Enter key on keyboard)
        binding.etMessage.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_SEND) {
                sendMessageFromInput()
                true
            } else {
                false
            }
        }
    }

    private fun setAppMode(notebookMode: Boolean) {
        isNotebookMode = notebookMode
        val context = requireContext()
        if (notebookMode) {
            binding.btnModeNotebook.setBackgroundResource(R.drawable.bg_chat_user)
            binding.btnModeNotebook.setTextColor(ContextCompat.getColor(context, R.color.white))
            binding.btnModeGeneral.setBackgroundColor(0)
            binding.btnModeGeneral.setTextColor(ContextCompat.getColor(context, R.color.slate_400))
            binding.btnSourcePicker.visibility = View.VISIBLE
        } else {
            binding.btnModeGeneral.setBackgroundResource(R.drawable.bg_chat_user)
            binding.btnModeGeneral.setTextColor(ContextCompat.getColor(context, R.color.white))
            binding.btnModeNotebook.setBackgroundColor(0)
            binding.btnModeNotebook.setTextColor(ContextCompat.getColor(context, R.color.slate_400))
            binding.btnSourcePicker.visibility = View.GONE
        }
    }

    private fun sendMessageFromInput() {
        val text = binding.etMessage.text?.toString().orEmpty()
        if (text.isNotBlank()) {
            sendMessage(text)
            binding.etMessage.text?.clear()
        }
    }

    private fun sendMessage(text: String) {
        binding.scrollWelcomeBanner.visibility = View.GONE
        viewModel.sendMessage(text)
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    binding.layoutThinking.visibility = if (state.isThinking) View.VISIBLE else View.GONE
                    binding.btnSend.isEnabled = !state.isThinking

                    if (state.messages.size > 1) {
                        binding.scrollWelcomeBanner.visibility = View.GONE
                    }

                    chatAdapter.submitList(state.messages) {
                        if (state.messages.isNotEmpty()) {
                            binding.rvMessages.smoothScrollToPosition(state.messages.size - 1)
                        }
                    }

                    state.errorMessage?.let {
                        Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        fun newInstance() = ChatFragment()
    }
}
