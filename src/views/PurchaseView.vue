<script setup>
import { useImsStore } from '../composables/useImsStore'
import PageHeader from '../components/PageHeader.vue'

const {
  categories,
  batchFreight,
  batchStockedAt,
  purchaseRows,
  productTemplates,
  addPurchaseRow,
  removePurchaseRow,
  applyProductTemplateToRow,
  submitPurchase,
} = useImsStore()
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Purchase"
      title="进货入仓"
      description="录入本次进货商品、套用品名模板并填写货拉拉价格。"
      :breadcrumb="['首页', '进货入仓']"
    >
    <template #actions>
      <button class="secondary-btn" type="button" @click="addPurchaseRow">
        <span class="btn-icon">+</span>
        <span>新增商品</span>
      </button>
    </template>
  </PageHeader>

  <section class="panel panel-wide flat-panel">
    <div class="panel-header panel-header-tight">
      <div class="section-title-group">
        <p class="section-tag">Purchase</p>
        <h2>进货入仓</h2>
      </div>
    </div>

    <div class="shared-fields purchase-batch-grid purchase-batch-field">
      <label>
        <span>本次货拉拉价格</span>
        <input v-model="batchFreight" type="number" min="0" step="0.01" placeholder="例如 58.00" />
      </label>
      <label>
        <span>进货时间</span>
        <input v-model="batchStockedAt" type="datetime-local" step="60" />
      </label>
    </div>

    <div class="item-list">
      <div v-for="(row, index) in purchaseRows" :key="row.key" class="purchase-row flat-subpanel">
        <label>
          <span>类目</span>
          <select v-model="row.category">
            <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
          </select>
        </label>
        <label>
          <span>品名</span>
          <input v-model="row.name" type="text" maxlength="50" placeholder="请输入品名" />
        </label>
        <div class="row-tools">
          <span class="row-tools-label">品名模板</span>
          <div class="row-tools-actions">
            <select v-if="productTemplates.length" @change="applyProductTemplateToRow(row, productTemplates.find((item) => item.id === $event.target.value)); $event.target.value = ''">
              <option value="">套用品名模板</option>
              <option v-for="template in productTemplates" :key="template.id" :value="template.id">
                {{ template.name }} / {{ template.category }}
              </option>
            </select>
            <span v-else class="row-tools-empty">请先到左侧“品名管理”新增模板</span>
          </div>
        </div>
        <label>
          <span>原价</span>
          <input v-model="row.originalPrice" type="number" min="0" step="0.01" placeholder="0.00" />
        </label>
        <label>
          <span>折扣比例</span>
          <input v-model="row.discountRate" type="number" min="0" max="1" step="0.001" placeholder="0.885" />
        </label>
        <label>
          <span>库存数量</span>
          <input v-model="row.quantity" type="number" min="1" step="1" placeholder="1" />
        </label>
        <button class="danger-btn" type="button" @click="removePurchaseRow(index)">
          <span class="btn-icon">-</span>
          <span>删除</span>
        </button>
      </div>
    </div>

    <div class="form-actions form-actions-separated">
      <button class="primary-btn" type="button" @click="submitPurchase">
        <span class="btn-icon">></span>
        <span>确认进货入仓</span>
      </button>
    </div>
  </section>
  </div>
</template>
