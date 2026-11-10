package com.noteroute.app.ui.main

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import com.noteroute.app.R
import com.noteroute.app.databinding.ActivityMainBinding
import com.noteroute.app.ui.chat.ChatFragment
import com.noteroute.app.ui.explorer.ExplorerFragment
import com.noteroute.app.ui.status.StatusFragment

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    private val explorerFragment by lazy { ExplorerFragment.newInstance() }
    private val chatFragment by lazy { ChatFragment.newInstance() }
    private val statusFragment by lazy { StatusFragment.newInstance() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupBottomNavigation()

        if (savedInstanceState == null) {
            // Default to Chat (or Explorer)
            replaceFragment(chatFragment)
            binding.bottomNavigation.selectedItemId = R.id.menu_chat
        }
    }

    private fun setupBottomNavigation() {
        binding.bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.menu_explorer -> {
                    replaceFragment(explorerFragment)
                    true
                }
                R.id.menu_chat -> {
                    replaceFragment(chatFragment)
                    true
                }
                R.id.menu_status -> {
                    replaceFragment(statusFragment)
                    true
                }
                else -> false
            }
        }
    }

    private fun replaceFragment(fragment: Fragment) {
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .commit()
    }
}
