import { computed, reactive, ref, watch } from 'vue'
import { categories, createId } from '../utils/ims'
import { supabase } from '../lib/supabase'

const PAGE_SIZE = 6
const persisted = { products: [], shipments: [] }
const STATE_ROW_ID = 'main'

const products = ref(persisted.products)
const shipments = ref(persisted.shipments)
const shippingFee = ref('')
const selectedPendingIds = ref([])
const batchFreight = ref('')
const editingId = ref('')
const isStoreReady = ref(false)
let saveTimer = null
const filters = reactive({
  keyword: '',
  category: '',
  status: 'all',
})
const purchaseRows = ref([createPurchaseRow()])

watch(
  [products, shipments],
  () => {
    if (!isStoreReady.value) {
      return
    }

    clearTimeout(saveTimer)
    saveTimer = window.setTimeout(() => {
      persistState()
    }, 250)
  },
  { deep: true },
)

async function loadRemoteState() {
  const { data, error } = await supabase
    .from('app_state')
    .select('products, shipments')
    .eq('id', STATE_ROW_ID)
    .maybeSingle()

  if (error) {
    console.error('Failed to load app_state from Supabase:', error)
    return
  }

  if (!data) {
    const { error: insertError } = await supabase.from('app_state').insert({
      id: STATE_ROW_ID,
      products: [],
      shipments: [],
    })

    if (insertError) {
      console.error('Failed to initialize app_state row:', insertError)
    }

    products.value = []
    shipments.value = []
    isStoreReady.value = true
    return
  }

  products.value = Array.isArray(data.products) ? data.products : []
  shipments.value = Array.isArray(data.shipments) ? data.shipments : []
  isStoreReady.value = true
}

async function persistState() {
  const { error } = await supabase
    .from('app_state')
    .upsert({
      id: STATE_ROW_ID,
      products: products.value,
      shipments: shipments.value,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Failed to persist app_state to Supabase:', error)
  }
}

loadRemoteState()

function createPurchaseRow() {
  return {
    key: createId('row'),
    category: categories[0],
    name: '',
    originalPrice: '',
    discountRate: '',
    quantity: 1,
  }
}

function resetPurchaseRows() {
  purchaseRows.value = [createPurchaseRow()]
  batchFreight.value = ''
}

function validateDiscount(value) {
  const num = Number(value)
  if (Number.isNaN(num) || num < 0 || num > 1) {
    return false
  }

  const decimals = String(value).split('.')[1]
  return !decimals || decimals.length <= 3
}

const stats = computed(() => {
  const pending = products.value.filter((item) => item.remainingQuantity > 0)
  const totalRemaining = pending.reduce((sum, item) => sum + item.remainingQuantity, 0)
  const inventoryCostAmount = pending.reduce((sum, item) => {
    const goodsCost = Number(item.purchasePrice) * Number(item.remainingQuantity)
    const freightShareCost = Number(item.batchFreightShare)
    return sum + goodsCost + freightShareCost
  }, 0)

  return {
    productCount: products.value.length,
    pendingCount: pending.length,
    remainingCount: totalRemaining,
    inventoryCostAmount,
    shipmentCount: shipments.value.length,
  }
})

const filteredProducts = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase()

  return products.value.filter((item) => {
    const matchKeyword = !keyword || item.name.toLowerCase().includes(keyword)
    const matchCategory = !filters.category || item.category === filters.category
    const currentStatus = item.remainingQuantity > 0 ? 'pending' : 'shipped'
    const matchStatus = filters.status === 'all' || filters.status === currentStatus
    return matchKeyword && matchCategory && matchStatus
  })
})

const pendingProducts = computed(() => filteredProducts.value.filter((item) => item.remainingQuantity > 0))
const sortedShipments = computed(() => [...shipments.value].reverse())

function addPurchaseRow() {
  purchaseRows.value.push(createPurchaseRow())
}

function removePurchaseRow(index) {
  if (purchaseRows.value.length === 1) {
    return
  }
  purchaseRows.value.splice(index, 1)
}

function submitPurchase() {
  const freight = Number(batchFreight.value)
  if (Number.isNaN(freight) || freight < 0) {
    alert('请输入有效的货拉拉价格。')
    return false
  }

  const rows = purchaseRows.value.map((row) => ({
    ...row,
    originalPrice: Number(row.originalPrice),
    discountRate: Number(row.discountRate),
    quantity: Number(row.quantity),
  }))

  for (const row of rows) {
    if (!row.name.trim()) {
      alert('请填写商品品名。')
      return false
    }
    if (Number.isNaN(row.originalPrice) || row.originalPrice < 0) {
      alert(`商品 ${row.name} 的原价无效。`)
      return false
    }
    if (!validateDiscount(row.discountRate)) {
      alert(`商品 ${row.name} 的折扣比例必须在 0 到 1 之间，且最多三位小数。`)
      return false
    }
    if (!Number.isInteger(row.quantity) || row.quantity <= 0) {
      alert(`商品 ${row.name} 的库存数量必须为正整数。`)
      return false
    }
  }

  const stockedAt = new Date().toISOString()
  const freightShare = rows.length ? freight / rows.length : 0

  rows.forEach((row) => {
    products.value.push({
      id: createId('product'),
      category: row.category,
      name: row.name.trim(),
      originalPrice: row.originalPrice,
      discountRate: row.discountRate,
      purchasePrice: row.originalPrice * row.discountRate,
      quantity: row.quantity,
      remainingQuantity: row.quantity,
      batchFreight: freight,
      batchFreightShare: freightShare,
      stockedAt,
      shippedHistory: [],
    })
  })

  resetPurchaseRows()
  return true
}

function startEdit(item) {
  editingId.value = item.id
}

function cancelEdit() {
  editingId.value = ''
}

function saveEdit(item) {
  if (!item.name.trim()) {
    alert('品名不能为空。')
    return false
  }
  if (Number(item.originalPrice) < 0) {
    alert('原价不能小于 0。')
    return false
  }
  if (!validateDiscount(item.discountRate)) {
    alert('折扣比例格式不正确。')
    return false
  }
  if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0) {
    alert('库存数量必须为正整数。')
    return false
  }

  const shippedQuantity = item.quantity - item.remainingQuantity
  item.quantity = Number(item.quantity)
  item.remainingQuantity = Math.max(item.quantity - shippedQuantity, 0)
  item.originalPrice = Number(item.originalPrice)
  item.discountRate = Number(item.discountRate)
  item.purchasePrice = item.originalPrice * item.discountRate
  editingId.value = ''
  return true
}

function deleteProduct(id) {
  const target = products.value.find((item) => item.id === id)
  if (!target) {
    return
  }
  if (target.quantity !== target.remainingQuantity) {
    alert('该商品已有发货记录，不能直接删除。')
    return
  }
  products.value = products.value.filter((item) => item.id !== id)
  selectedPendingIds.value = selectedPendingIds.value.filter((itemId) => itemId !== id)
}

function togglePending(id, checked) {
  if (checked) {
    if (!selectedPendingIds.value.includes(id)) {
      selectedPendingIds.value.push(id)
    }
  } else {
    selectedPendingIds.value = selectedPendingIds.value.filter((itemId) => itemId !== id)
  }
}

function shipSelected() {
  if (!selectedPendingIds.value.length) {
    alert('请先勾选待发货商品。')
    return false
  }

  const fee = Number(shippingFee.value)
  if (Number.isNaN(fee) || fee < 0) {
    alert('请输入有效的物流价格。')
    return false
  }

  const shipmentItems = products.value.filter((item) => selectedPendingIds.value.includes(item.id))
  if (!shipmentItems.length) {
    alert('未找到选中的商品。')
    return false
  }

  const shippedAt = new Date().toISOString()
  const shipmentId = createId('shipment')
  const snapshot = shipmentItems.map((item) => ({
    id: item.id,
    category: item.category,
    name: item.name,
    originalPrice: item.originalPrice,
    discountRate: item.discountRate,
    purchasePrice: item.purchasePrice,
    shippedQuantity: item.remainingQuantity,
    batchFreightShare: item.batchFreightShare,
  }))

  shipments.value.push({
    id: shipmentId,
    batchNo: `发货批次 ${shipments.value.length + 1}`,
    shippedAt,
    shippingFee: fee,
    items: snapshot,
  })

  products.value = products.value.map((item) => {
    if (!selectedPendingIds.value.includes(item.id)) {
      return item
    }
    return {
      ...item,
      remainingQuantity: 0,
      shippedHistory: [
        ...item.shippedHistory,
        {
          shipmentId,
          shipmentAt: shippedAt,
          shipmentFee: fee,
          shippedQuantity: item.remainingQuantity,
        },
      ],
    }
  })

  selectedPendingIds.value = []
  shippingFee.value = ''
  return true
}

function usePagination(source) {
  const page = ref(1)
  const pageCount = computed(() => Math.max(1, Math.ceil(source.value.length / PAGE_SIZE)))
  const paginated = computed(() => {
    page.value = Math.min(Math.max(page.value, 1), pageCount.value)
    const start = (page.value - 1) * PAGE_SIZE
    return source.value.slice(start, start + PAGE_SIZE)
  })

  function change(nextPage) {
    page.value = Math.min(Math.max(nextPage, 1), pageCount.value)
  }

  return { page, pageCount, paginated, change }
}

export function useImsStore() {
  return {
    PAGE_SIZE,
    categories,
    products,
    shipments,
    shippingFee,
    isStoreReady,
    selectedPendingIds,
    batchFreight,
    editingId,
    filters,
    purchaseRows,
    stats,
    filteredProducts,
    pendingProducts,
    sortedShipments,
    addPurchaseRow,
    removePurchaseRow,
    submitPurchase,
    startEdit,
    cancelEdit,
    saveEdit,
    deleteProduct,
    togglePending,
    shipSelected,
    usePagination,
  }
}
