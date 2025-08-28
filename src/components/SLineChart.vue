<template>
  <Line :data="chartData" :options="options" />
</template>

<script setup>
import { Line } from 'vue-chartjs'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale)

defineProps({
  chartData: Object,
  options: {
    type: Object,
    default: () => ({ responsive: true, maintainAspectRatio: false })
  }
})
</script>
