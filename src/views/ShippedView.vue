<script setup>
import { useRouter } from 'vue-router'
import { exportShipmentExcel, formatDateTime, formatMoney } from '../utils/ims'
import { useImsStore } from '../composables/useImsStore'
import PageHeader from '../components/PageHeader.vue'
import PaginationBar from '../components/PaginationBar.vue'

const router = useRouter()
const { sortedShipments, isStoreReady, usePagination } = useImsStore()
const pager = usePagination(sortedShipments)

function goToShipmentDetail(id) {
  router.push({ name: 'shipment-detail', params: { id } })
}
</script>

<template>
  <div>
  <PageHeader
    eyebrow="Shipped"
    title="已发货"
    description="查看发货记录、进入详情页并导出 Excel 发货单。"
    :breadcrumb="['首页', '已发货']"
  />

  <section class="panel panel-wide flat-panel">
    <div class="panel-header panel-header-tight">
      <div class="section-title-group">
        <p class="section-tag">Shipped</p>
        <h2>已发货</h2>
      </div>
    </div>

    <div v-if="!isStoreReady" class="empty-state flat-empty-state">
      <h3>数据加载中</h3>
      <p>正在从云端读取发货记录，请稍候。</p>
    </div>

    <div v-else-if="!sortedShipments.length" class="empty-state flat-empty-state">
      <div class="empty-illustration"><span></span><span></span><span></span></div>
      <h3>暂无发货记录</h3>
      <p>勾选待发货商品并发货后，这里会展示每一条发货记录。</p>
    </div>

    <template v-else>
      <div class="table-wrap flat-table-wrap">
        <table>
          <thead><tr><th>发货时间</th><th>物流价格</th><th>商品数量</th><th>发货清单</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="shipment in pager.paginated.value" :key="shipment.id" class="shipment-row" @click="goToShipmentDetail(shipment.id)">
              <td>{{ formatDateTime(shipment.shippedAt) }}</td>
              <td>{{ formatMoney(shipment.shippingFee) }}</td>
              <td>{{ shipment.items.length }}</td>
              <td class="shipment-summary-cell">
                <div class="shipment-summary-list">
                  <span v-for="item in shipment.items" :key="`${shipment.id}-${item.id}`" class="shipment-summary-tag">
                    {{ item.name }} / {{ item.category }} / 数量 {{ item.shippedQuantity }}
                  </span>
                </div>
              </td>
              <td>
                <button class="secondary-btn small-btn" type="button" @click.stop="exportShipmentExcel(shipment)">
                  <span class="btn-icon">D</span>
                  <span>导出</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar :page="pager.page.value" :page-count="pager.pageCount.value" @change="pager.change" />
    </template>
  </section>
  </div>
</template>
