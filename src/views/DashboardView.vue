<script setup>
import { useImsStore } from '../composables/useImsStore'
import PageHeader from '../components/PageHeader.vue'
import { formatMoney } from '../utils/ims'

const { stats } = useImsStore()
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Warehouse Dashboard"
      title="进销存管理系统"
      description="通过左侧导航切换进货、库存、待发货和已发货页面。"
      :breadcrumb="['首页', '总览']"
    />

    <section class="topbar panel flat-panel">
      <div class="stats-strip stats-strip-no-margin">
        <article class="stat-card flat-card">
          <span>商品条目数</span>
          <strong>{{ stats.productCount }}</strong>
        </article>
        <article class="stat-card flat-card">
          <span>待发货商品数</span>
          <strong>{{ stats.pendingCount }}</strong>
        </article>
        <article class="stat-card flat-card">
          <span>库存总成本金额</span>
          <strong>{{ formatMoney(stats.inventoryCostAmount) }}</strong>
        </article>
        <article class="stat-card flat-card">
          <span>已发货记录</span>
          <strong>{{ stats.shipmentCount }}</strong>
        </article>
      </div>
    </section>
  </div>
</template>
