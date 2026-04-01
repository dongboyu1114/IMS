<script setup>
import { reactive, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import { useImsStore } from '../composables/useImsStore'

const { categories, productTemplates, deleteProductTemplate, upsertProductTemplate } = useImsStore()

const form = reactive({
  id: '',
  category: categories[0],
  name: '',
  originalPrice: '',
  discountRate: '1.000',
})

const editingTemplateId = ref('')

function resetForm() {
  form.id = ''
  form.category = categories[0]
  form.name = ''
  form.originalPrice = ''
  form.discountRate = '1.000'
  editingTemplateId.value = ''
}

function submitTemplate() {
  const success = upsertProductTemplate({
    id: form.id,
    category: form.category,
    name: form.name,
    originalPrice: form.originalPrice,
    discountRate: form.discountRate,
  })

  if (success) {
    resetForm()
  }
}

function editTemplate(template) {
  form.id = template.id
  form.category = template.category
  form.name = template.name
  form.originalPrice = template.originalPrice
  form.discountRate = Number(template.discountRate).toFixed(3)
  editingTemplateId.value = template.id
}
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Templates"
      title="品名管理"
      description="统一维护常用品名、默认原价和折扣比例，进货时直接选用。"
      :breadcrumb="['首页', '品名管理']"
    />

    <section class="panel panel-wide flat-panel">
      <div class="panel-header panel-header-tight">
        <div class="section-title-group">
          <p class="section-tag">Templates</p>
          <h2>品名模板库</h2>
        </div>
      </div>

      <div class="template-manager-grid">
        <div class="flat-subpanel template-form-panel">
          <h3>{{ editingTemplateId ? '编辑品名模板' : '新增品名模板' }}</h3>
          <div class="template-form-grid">
            <label>
              <span>类目</span>
              <select v-model="form.category">
                <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
              </select>
            </label>
            <label>
              <span>品名</span>
              <input v-model="form.name" type="text" maxlength="50" placeholder="例如 五常大米" />
            </label>
            <label>
              <span>默认原价</span>
              <input v-model="form.originalPrice" type="number" min="0" step="0.01" placeholder="0.00" />
            </label>
            <label>
              <span>默认折扣比例</span>
              <input v-model="form.discountRate" type="number" min="0" max="1" step="0.001" placeholder="1.000" />
            </label>
          </div>

          <div class="action-cell action-cell-icons template-form-actions">
            <button class="primary-btn" type="button" @click="submitTemplate">
              <span class="btn-icon">S</span>
              <span>{{ editingTemplateId ? '保存模板' : '新增模板' }}</span>
            </button>
            <button class="secondary-btn" type="button" @click="resetForm">
              <span class="btn-icon">R</span>
              <span>重置</span>
            </button>
          </div>
        </div>

        <div class="flat-subpanel template-list-panel">
          <div v-if="!productTemplates.length" class="empty-state flat-empty-state no-margin-top">
            <div class="empty-illustration"><span></span><span></span><span></span></div>
            <h3>暂无品名模板</h3>
            <p>先新增几个常用品名，进货时就不用反复输入了。</p>
          </div>

          <div v-else class="template-list no-margin-top">
            <div v-for="template in productTemplates" :key="template.id" class="template-card">
              <div class="template-card-copy">
                <strong>{{ template.name }}</strong>
                <span>{{ template.category }} | 默认原价 {{ template.originalPrice }} | 默认折扣 {{ Number(template.discountRate).toFixed(3) }}</span>
              </div>
              <div class="action-cell action-cell-icons">
                <button class="secondary-btn small-btn" type="button" @click="editTemplate(template)">
                  <span class="btn-icon">E</span>
                  <span>编辑</span>
                </button>
                <button class="danger-btn small-btn" type="button" @click="deleteProductTemplate(template.id)">
                  <span class="btn-icon">X</span>
                  <span>删除</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
