<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { exportShipmentExcel, formatDateTime, formatMoney, loadState } from '../utils/ims'
import PageHeader from '../components/PageHeader.vue'

const route = useRoute()
const router = useRouter()
const state = loadState()

const shipment = computed(() => state.shipments.find((item) => item.id === route.params.id))
const totalCost = computed(() => {
  if (!shipment.value) {
    return 0
  }

  const goodsCost = shipment.value.items.reduce((sum, item) => {
    return sum + Number(item.purchasePrice) * Number(item.shippedQuantity)
  }, 0)

  const freightCost = shipment.value.items.reduce((sum, item) => {
    return sum + Number(item.batchFreightShare)
  }, 0)

  return goodsCost + freightCost + Number(shipment.value.shippingFee)
})

function goBack() {
  router.push({ name: 'shipped' })
}
</script>

<template>
  <div class="app-shell app-shell-admin">
    <PageHeader
      eyebrow="Shipment Detail"
      title="发货详情"
      description="查看本次发货记录的成本、物流和商品明细。"
      :breadcrumb="['首页', '已发货', '发货详情']"
    >
      <template #actions>
        <button class="secondary-btn" type="button" @click="goBack">
          <span class="btn-icon">&lt;</span>
          <span>返回已发货</span>
        </button>
        <button v-if="shipment" class="primary-btn" type="button" @click="exportShipmentExcel(shipment)">
          <span class="btn-icon">D</span>
          <span>导出 Excel</span>
        </button>
      </template>
    </PageHeader>

    <section class="panel panel-wide detail-page flat-panel">
      <div class="panel-header detail-header">
        <div class="section-title-group">
          <p class="section-tag">Shipment Detail</p>
          <h2>发货详情</h2>
        </div>
      </div>

      <div v-if="!shipment" class="empty-state">
        <p>未找到该发货批次记录。</p>
      </div>

      <template v-else>
        <div class="detail-summary-grid">
          <div class="stat-card">
            <span>发货时间</span>
            <strong class="detail-strong">{{ formatDateTime(shipment.shippedAt) }}</strong>
          </div>
          <div class="stat-card">
            <span>物流价格</span>
            <strong class="detail-strong">{{ formatMoney(shipment.shippingFee) }}</strong>
          </div>
          <div class="stat-card">
            <span>商品数量</span>
            <strong class="detail-strong">{{ shipment.items.length }}</strong>
          </div>
          <div class="stat-card">
            <span>总成本价格</span>
            <strong class="detail-strong">{{ formatMoney(totalCost) }}</strong>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>类目</th>
                <th>品名</th>
                <th>原价</th>
                <th>折扣比例</th>
                <th>进货价</th>
                <th>发货数量</th>
                <th>货拉拉分摊</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in shipment.items" :key="`${shipment.id}-${item.id}`">
                <td>{{ item.category }}</td>
                <td>{{ item.name }}</td>
                <td>{{ formatMoney(item.originalPrice) }}</td>
                <td>{{ Number(item.discountRate).toFixed(3) }}</td>
                <td>{{ formatMoney(item.purchasePrice) }}</td>
                <td>{{ item.shippedQuantity }}</td>
                <td>{{ formatMoney(item.batchFreightShare) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </section>
  </div>
</template>
