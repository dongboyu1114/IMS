<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  breadcrumb: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <header class="page-header panel flat-panel">
    <div class="page-header-top">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <span v-for="(item, index) in breadcrumb" :key="`${item}-${index}`" class="breadcrumb-item">
          <span>{{ item }}</span>
          <span v-if="index < breadcrumb.length - 1" class="breadcrumb-separator">/</span>
        </span>
      </nav>
    </div>

    <div class="page-header-body">
      <div>
        <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
        <h1 class="page-title">{{ title }}</h1>
        <p v-if="description" class="page-description">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="page-header-actions">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>
