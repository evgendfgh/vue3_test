<template>
  <div>
    <label>
      От
      <input type="date" :value="dateFrom" @input="$emit('update:dateFrom', $event.target.value)" />
    </label>
    <label>
      До
      <input type="date" :value="dateTo" @input="$emit('update:dateTo', $event.target.value)" />
    </label>
  </div>
</template>

<script setup>
defineProps(['dateFrom', 'dateTo'])
</script>
