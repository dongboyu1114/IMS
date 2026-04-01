<script setup>
const props = defineProps({
  page: {
    type: Number,
    required: true,
  },
  pageCount: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['change'])

function buildPages() {
  const total = props.pageCount
  const current = props.page

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
}
</script>

<template>
  <div class="pagination-bar">
    <span class="pagination-meta">第 {{ page }} / {{ pageCount }} 页</span>
    <div class="pagination-actions pagination-actions-numbered">
      <button class="secondary-btn small-btn" type="button" :disabled="page === 1" @click="emit('change', page - 1)">
        上一页
      </button>

      <button
        v-for="item in buildPages()"
        :key="String(item)"
        class="pagination-number"
        :class="{ 'pagination-number-active': item === page, 'pagination-number-dots': item === '...' }"
        :disabled="item === '...'"
        type="button"
        @click="item !== '...' && emit('change', item)"
      >
        {{ item }}
      </button>

      <button class="secondary-btn small-btn" type="button" :disabled="page === pageCount" @click="emit('change', page + 1)">
        下一页
      </button>
    </div>
  </div>
</template>
