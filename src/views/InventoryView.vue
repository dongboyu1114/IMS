<script setup>
import { formatDateTime, formatMoney } from '../utils/ims'
import { useImsStore } from '../composables/useImsStore'
import PageHeader from '../components/PageHeader.vue'
import PaginationBar from '../components/PaginationBar.vue'

const { categories, filters, filteredProducts, editingId, startEdit, cancelEdit, saveEdit, deleteProduct, usePagination } = useImsStore()
const pager = usePagination(filteredProducts)
</script>

<template>
  <div>
  <PageHeader
    eyebrow="Inventory"
    title="库存列表"
    description="查看并编辑当前库存、筛选状态和搜索商品。"
    :breadcrumb="['首页', '库存列表']"
  />

  <section class="panel panel-wide flat-panel">
    <div class="panel-header panel-header-tight">
      <div class="section-title-group">
        <p class="section-tag">Inventory</p>
        <h2>库存列表</h2>
      </div>
    </div>

    <div class="filters-grid filters-grid-flat">
      <label>
        <span>搜索品名</span>
        <input v-model="filters.keyword" type="text" placeholder="输入品名关键字" />
      </label>
      <label>
        <span>筛选类目</span>
        <select v-model="filters.category">
          <option value="">全部类目</option>
          <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
        </select>
      </label>
      <label>
        <span>筛选状态</span>
        <select v-model="filters.status">
          <option value="all">全部状态</option>
          <option value="pending">待发货</option>
          <option value="shipped">已发完</option>
        </select>
      </label>
    </div>

    <div v-if="!filteredProducts.length" class="empty-state flat-empty-state">
      <div class="empty-illustration"><span></span><span></span><span></span></div>
      <h3>暂无匹配商品</h3>
      <p>调整搜索条件或先在进货入仓页面添加商品。</p>
    </div>

    <template v-else>
      <div class="table-wrap flat-table-wrap">
        <table>
          <thead>
            <tr>
              <th>类目</th><th>品名</th><th>原价</th><th>折扣</th><th>进货价</th><th>库存数量</th><th>剩余数量</th><th>货拉拉分摊</th><th>入库时间</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in pager.paginated.value" :key="item.id">
              <template v-if="editingId === item.id">
                <td><select v-model="item.category"><option v-for="category in categories" :key="category" :value="category">{{ category }}</option></select></td>
                <td><input v-model="item.name" type="text" /></td>
                <td><input v-model="item.originalPrice" type="number" min="0" step="0.01" /></td>
                <td><input v-model="item.discountRate" type="number" min="0" max="1" step="0.001" /></td>
                <td>{{ formatMoney(item.originalPrice * item.discountRate) }}</td>
                <td><input v-model="item.quantity" type="number" min="1" step="1" /></td>
                <td>{{ item.remainingQuantity }}</td>
                <td>{{ formatMoney(item.batchFreightShare) }}</td>
                <td>{{ formatDateTime(item.stockedAt) }}</td>
                <td class="action-cell action-cell-icons">
                  <button class="primary-btn small-btn" type="button" @click="saveEdit(item)"><span class="btn-icon">S</span><span>保存</span></button>
                  <button class="secondary-btn small-btn" type="button" @click="cancelEdit"><span class="btn-icon">R</span><span>取消</span></button>
                </td>
              </template>
              <template v-else>
                <td>{{ item.category }}</td>
                <td>{{ item.name }}</td>
                <td>{{ formatMoney(item.originalPrice) }}</td>
                <td>{{ Number(item.discountRate).toFixed(3) }}</td>
                <td>{{ formatMoney(item.purchasePrice) }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.remainingQuantity }}</td>
                <td>{{ formatMoney(item.batchFreightShare) }}</td>
                <td>{{ formatDateTime(item.stockedAt) }}</td>
                <td class="action-cell action-cell-icons">
                  <button class="secondary-btn small-btn" type="button" @click="startEdit(item)"><span class="btn-icon">E</span><span>编辑</span></button>
                  <button class="danger-btn small-btn" type="button" @click="deleteProduct(item.id)"><span class="btn-icon">X</span><span>删除</span></button>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>

      <PaginationBar :page="pager.page.value" :page-count="pager.pageCount.value" @change="pager.change" />
    </template>
  </section>
  </div>
</template>
