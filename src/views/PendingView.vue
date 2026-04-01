<script setup>
import { formatDateTime, formatMoney } from '../utils/ims'
import { useImsStore } from '../composables/useImsStore'
import PageHeader from '../components/PageHeader.vue'
import PaginationBar from '../components/PaginationBar.vue'

const { shippingFee, pendingProducts, isStoreReady, selectedPendingIds, togglePending, shipSelected, usePagination } = useImsStore()
const pager = usePagination(pendingProducts)
</script>

<template>
  <div>
  <PageHeader
    eyebrow="Pending"
    title="待发货"
    description="勾选待发货商品并填写本次物流价格完成发货。"
    :breadcrumb="['首页', '待发货']"
  />

  <section class="panel panel-wide flat-panel">
    <div class="panel-header panel-header-tight">
      <div class="section-title-group">
        <p class="section-tag">Pending</p>
        <h2>待发货</h2>
      </div>
    </div>

    <div class="shipment-toolbar shipment-toolbar-flat compact-spacing">
      <label>
        <span>本次物流价格</span>
        <input v-model="shippingFee" type="number" min="0" step="0.01" placeholder="例如 12.00" />
      </label>
      <button class="primary-btn toolbar-btn" type="button" @click="shipSelected">
        <span class="btn-icon">></span>
        <span>勾选发货</span>
      </button>
    </div>

    <div v-if="!isStoreReady" class="empty-state flat-empty-state">
      <h3>数据加载中</h3>
      <p>正在从云端读取待发货数据，请稍候。</p>
    </div>

    <div v-else-if="!pendingProducts.length" class="empty-state flat-empty-state">
      <div class="empty-illustration empty-illustration-compact"><span></span><span></span><span></span></div>
      <h3>暂无待发货商品</h3>
      <p>完成进货入仓后，待发货商品会显示在这里。</p>
    </div>

    <template v-else>
      <div class="table-wrap flat-table-wrap">
        <table>
          <thead><tr><th>选择</th><th>类目</th><th>品名</th><th>剩余数量</th><th>进货价</th><th>入库时间</th></tr></thead>
          <tbody>
            <tr v-for="item in pager.paginated.value" :key="item.id">
              <td><input :checked="selectedPendingIds.includes(item.id)" class="table-check" type="checkbox" @change="togglePending(item.id, $event.target.checked)" /></td>
              <td>{{ item.category }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.remainingQuantity }}</td>
              <td>{{ formatMoney(item.purchasePrice) }}</td>
              <td>{{ formatDateTime(item.stockedAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar :page="pager.page.value" :page-count="pager.pageCount.value" @change="pager.change" />
    </template>
  </section>
  </div>
</template>
