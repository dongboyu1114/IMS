import * as XLSX from 'xlsx'

export const STORAGE_KEY = 'ims-vue-dashboard-data'
export const categories = ['粮油食品', '酒水饮料', '洗护日化']

export function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

export function formatMoney(value) {
  return Number(value || 0).toFixed(2)
}

export function formatDateTime(value) {
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { products: [], shipments: [] }
    }

    const parsed = JSON.parse(raw)
    return {
      products: Array.isArray(parsed.products) ? parsed.products : [],
      shipments: Array.isArray(parsed.shipments) ? parsed.shipments : [],
    }
  } catch {
    return { products: [], shipments: [] }
  }
}

export function saveState(products, shipments) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ products, shipments }))
}

export function exportShipmentExcel(shipment) {
  const rows = shipment.items.map((item) => ({
    发货批次: shipment.batchNo,
    发货时间: formatDateTime(shipment.shippedAt),
    物流价格: formatMoney(shipment.shippingFee),
    类目: item.category,
    品名: item.name,
    原价: formatMoney(item.originalPrice),
    折扣比例: Number(item.discountRate).toFixed(3),
    进货价: formatMoney(item.purchasePrice),
    发货数量: item.shippedQuantity,
    货拉拉分摊: formatMoney(item.batchFreightShare),
  }))

  const sheet = XLSX.utils.json_to_sheet(rows)
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, '发货单')
  XLSX.writeFile(book, `${shipment.batchNo}.xlsx`)
}
