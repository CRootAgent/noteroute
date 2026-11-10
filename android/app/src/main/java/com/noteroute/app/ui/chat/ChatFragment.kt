package com.noteroute.app.ui.chat

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.recyclerview.widget.LinearLayoutManager
import com.noteroute.app.databinding.FragmentChatBinding
import com.noteroute.app.ui.components.CitationInspectorBottomSheet
import com.noteroute.app.ui.components.ModelSwitcherBottomSheet
import kotlinx.coroutines.launch

class ChatFragment : Fragment() {

    private var _binding: FragmentChatBinding? = null
    private val binding get() = _binding!!

    private val viewModel: ChatViewModel by viewModels()
    private lateinit var chatAdapter: ChatAdapter

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

    private fun setupRecyclerView() {
        chatAdapter = ChatAdapter(
            onCitationClick = { citation ->
                val inspector = CitationInspectorBottomSheet.newInstance(citation)
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
        // Model Switcher Click
        binding.btnModelSwitcher.setOnClickListener {
            val switcher = ModelSwitcherBottomSheet.newInstance(
                activeModel = viewModel.uiState.value.activeModel,
                onSelected = { selectedModel ->
                    viewModel.setModel(selectedModel)
                }
            )
            switcher.show(parentFragmentManager, ModelSwitcherBottomSheet.TAG)
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

        // Clear Chat
        binding.btnClearChat.setOnClickListener {
            viewModel.clearChat()
        }

        // Suggested Prompt Chips
        binding.chipPrompt1.setOnClickListener {
            binding.etMessage.setText(binding.chipPrompt1.text)
            sendMessageFromInput()
        }
        binding.chipPrompt2.setOnClickListener {
            binding.etMessage.setText(binding.chipPrompt2.text)
            sendMessageFromInput()
        }
        binding.chipPrompt3.setOnClickListener {
            binding.etMessage.setText(binding.chipPrompt3.text)
            sendMessageFromInput()
        }
    }

    private fun sendMessageFromInput() {
        val text = binding.etMessage.text?.toString().orEmpty()
        if (text.isNotBlank()) {
            viewModel.sendMessage(text)
            binding.etMessage.text?.clear()
        }
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    binding.tvActiveModelName.text = state.activeModel.displayName
                    binding.layoutThinking.visibility = if (state.isThinking) View.VISIBLE else View.GONE
                    binding.btnSend.isEnabled = !state.isThinking

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
