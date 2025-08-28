<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const props = defineProps({
  data: Object,
})

const chartRef = ref(null)
let chartInstance = null

onMounted(() => {
  if(chartRef.value) {
    const ctx = chartRef.value.getContext('2d')
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: props.data,
      options: {}
    })
  }
})

watch(() => props.data, (newData) => {
  if(chartInstance) {
    chartInstance.data = newData
    chartInstance.update()
  }
}, { deep: true })

</script>

<template>
  <canvas ref="chartRef"></canvas>
</template>
