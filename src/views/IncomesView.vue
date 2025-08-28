<template>
  <div>
    <h1>Поступления</h1>





    <div>
      <ILineChart :chartData="chartData" :options="chartOptions" />
    </div>

    <DateRangePicker 
      v-model:dateFrom="dateFrom" 
      v-model:dateTo="dateTo" 
    />

    <button @click="toggleSortId">
      Сортировать по Nm_id : {{ sortId === 'asc' ? '▲' : '▼' }}
    </button>   

    <button @click="toggleSortOrder">
      Количество: {{ sortOrder === 'asc' ? '▲' : '▼' }}
    </button> 

    <button @click="toggleSortStocks">
      по складам: {{ sortStocks === 'asc' ? '▲' : '▼' }}
    </button>

    <p v-if="loading">Загрузка данных...</p>

    <p v-if="error" style="color: red;">Ошибка: {{ error }}</p>

    <table 
      v-if="!loading && !error && sortedItems.length" 
      border="1" cellspacing="0" cellpadding="4" style="margin-top:10px;"
    >
      <thead>
        <tr>
          <th>Дата</th>
          <th>Last change date</th>
          <th>Date close</th>
          <th>Nm id</th>
          <th>Income id</th>
          <th>Штрихкод</th>
          <th>Количество</th>
          <th>Склад </th>
          <th>Артикул товара у поставщика</th>
          <th>Tech size</th>
          <th>Number</th>
          <th>Total price</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="incomes in sortedItems" :key="incomes.g_number">
          <td>{{ incomes.date }}</td>
          <td>{{ incomes.last_change_date }}</td>
          <td>{{ incomes.date_close }}</td>
          <td>{{ incomes.nm_id }}</td>          
          <td>{{ incomes.income_id }}</td>          
          <td>{{ incomes.barcode }}</td>          
          <td>{{ incomes.quantity }}</td>
          <td>{{ incomes.warehouse_name }}</td>
          <td>{{ incomes.supplier_article }}</td>
          <td>{{ incomes.tech_size }}</td>
          <td>{{ incomes.number }}</td>
          <td>{{ incomes.total_price }}</td>
        </tr>
      </tbody>
    </table>

    <p v-if="!loading && !error && !displayedItems.length">Данные не найдены.</p>

 
    <Pagination 
       :page="page" 
       :totalPages="totalPages" 
       @update:page="p => page = p"
    />

  </div>
</template>

<script setup>
import ILineChart from '../components/ILineChart.vue'
import { ref, watch, computed } from 'vue'
import DateRangePicker from '../components/DateRangePicker.vue'
import Pagination from '../components/Pagination.vue'
import { fetchEntities } from '../api/index.js'

const dateFrom = ref(new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10))
const dateTo = ref(new Date().toISOString().slice(0, 10))

const loading = ref(false)
const error = ref(null)
const rawResponse = ref('')
const displayedItems = ref([])
const dat = ref([])

const page = ref(1)       
const pageSize = ref(1) 
const totalItems = ref(1) 
const limit = 500

const sortOrder = ref('asc')  
const sortId = ref(null)      
const sortStocks = ref(null)  



function toggleSortId() {
  sortId.value = sortId.value === 'asc' ? 'desc' : 'asc'
  sortOrder.value = null
  sortStocks.value = null
}

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  sortId.value = null
  sortStocks.value = null
}

function toggleSortStocks() {
  sortStocks.value = sortStocks.value === 'asc' ? 'desc' : 'asc'
  sortId.value = null
  sortOrder.value = null
}

const sortedItems = computed(() => {
  let items = [...displayedItems.value]
  if (sortId.value) {    
    items.sort((a, b) => sortId.value === 'asc' ? a.nm_id - b.nm_id : b.nm_id - a.nm_id)
  } else if (sortOrder.value) {
    items.sort((a, b) => sortOrder.value === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity)
  } else if (sortStocks.value) {
    items.sort((a, b) => 
      sortStocks.value === 'asc' 
        ? a.warehouse_name.localeCompare(b.warehouse_name) 
        : b.warehouse_name.localeCompare(a.warehouse_name))
  }
  return items
})
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))
async function loadIncomes() {
  loading.value = true
  error.value = null
  try {
    const data = await fetchEntities('incomes', dateFrom.value, dateTo.value, page.value, pageSize.value, limit)
    rawResponse.value = JSON.stringify(data, null, 2)









    
     displayedItems.value = Array.isArray(data.data) ? data.data : []
    totalItems.value = data.meta.total|| 0
dat.value=data.meta.total
   
    if (data.meta.per_page) {
      pageSize.value = data.meta.per_page
    }

    
    if (page.value > totalPages.value && totalPages.value > 0) {
      page.value = totalPages.value
    }





  } catch (e) {
    error.value = e.message || 'ошибка'
    displayedItems.value = []
    rawResponse.value = ''
  } finally {
    loading.value = false
  }
}

watch([dateFrom, dateTo, page, pageSize], loadIncomes, { immediate: true })

const chartData = ref(null)
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      title: { display: true, text: 'Quantity ' }
    },
    x: {
      title: { display: true, text: 'Дата' }
    }
  }
}

function prepareChartData() {
  const grouped = sortedItems.value.reduce((acc, incomes) => {
  const quan = incomes.quantity || 0
  acc[incomes.date] = (acc[incomes.date] || 0) + quan
  return acc
}, {})
  const labels = Object.keys(grouped).sort()
  const data = labels.map(date => grouped[date])
  chartData.value = {
    labels,
    datasets: [
      {
        label: 'Количество товаров',
        data,
        borderColor: '#42b983',
        backgroundColor: 'rgba(66, 185, 131, 0.2)',
        fill: true,
        tension: 0.3
      }
    ]
  }
}

watch(sortedItems, prepareChartData, { immediate: true })

defineExpose({
  sortedItems,
  chartData,
  chartOptions,
  prepareChartData
})
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 6px 10px;
}

th {
  background-color: #f0f0f0;
  text-align: left;
}
</style>
