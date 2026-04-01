<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useImsStore } from '../composables/useImsStore'

const { stats } = useImsStore()

const navItems = [
  { name: 'dashboard', label: '总览' },
  { name: 'purchase', label: '进货入仓' },
  { name: 'inventory', label: '库存列表' },
  { name: 'pending', label: '待发货' },
  { name: 'shipped', label: '已发货' },
]
</script>

<template>
  <div class="dashboard-shell">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-badge">IMS</div>
        <div>
          <strong>进销存后台</strong>
          <p>Inventory Admin</p>
        </div>
      </div>

      <nav class="sidebar-nav">
        <RouterLink v-for="item in navItems" :key="item.name" :to="{ name: item.name }" custom v-slot="{ href, navigate, isActive, isExactActive }">
          <a
            :href="href"
            class="nav-link"
            :class="{ 'nav-link-active': item.name === 'dashboard' ? isExactActive : isActive }"
            @click="navigate"
          >
            {{ item.label }}
          </a>
        </RouterLink>
      </nav>

      <div class="sidebar-note">
        <span class="sidebar-note-label">今日状态</span>
        <strong>{{ stats.remainingCount }}</strong>
        <p>当前剩余库存总数</p>
      </div>
    </aside>

    <div class="content-shell">
      <div class="app-shell app-shell-admin">
        <RouterView />
      </div>
    </div>
  </div>
</template>
