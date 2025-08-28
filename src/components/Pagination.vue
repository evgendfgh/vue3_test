<template>
  <div>
    <button :disabled="page <= 1" @click="$emit('update:page', page - 1)">Назад</button>
   //  <span>Страница {{ page }} из {{ totalPages }}</span>
    <button :disabled="page >= totalPages" @click="$emit('update:page', page + 1)">Вперёд</button>
  </div>
</template>

<script setup>
defineProps({
  page: Number,
  totalPages: Number
})
</script>
