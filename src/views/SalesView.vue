<template>
  <div>
    <h1>Продажи</h1>


    
    <div>
      <SLineChart :chartData="chartData" :options="chartOptions" />
    </div>

    <DateRangePicker 
      v-model:dateFrom="dateFrom" 
      v-model:dateTo="dateTo" 
    />

    <button @click="toggleSortId">
      Сортировать по Nm_id: 
      {{ 
        sortId === 'asc' ? '▲' : 
        sortId === 'desc' ? '▼' : 
        ' ' 
      }}
    </button>   
    
    <button @click="toggleSortOrder">
      Finished price: 
      {{ 
        sortOrder === 'asc' ? '▲' : 
        sortOrder === 'desc' ? '▼' : 
        ' ' 
      }}
    </button> 
    
    <button @click="toggleSortStocks">
      По складам: 
      {{ 
        sortStocks === 'asc' ? '▲' : 
        sortStocks === 'desc' ? '▼' : 
        ' ' 
      }}
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
          <th>Total price</th>
          <th>Finished_price</th>
          <th>Price with disc</th>
          <th>Spp</th>
          <th>Discount percent</th>
          <th>Сумма к оплате For pay</th>
          <th>Nm id</th>
          <th>Income id</th>
          <th>Склад</th>
          <th>Область</th>
          <th>Федеральный округ</th>
          <th>Страна</th>
          <th>Артикул товара у поставщика</th>
          <th>Tech size</th>
          <th>Subject</th>
          <th>Category</th>
          <th>Brand</th>
          <th>G number</th>
          <th>Sale id</th>
          <th>Is supply</th>
          <th>Is realization</th>
          <th>Штрихкод</th>
          <th>Promo code discount</th>
          <th>Is storno</th>
          <th>Odid</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sales in sortedItems" :key="sales.sale_id || sales.g_number">
          <td>{{ sales.date }}</td>
          <td>{{ sales.last_change_date }}</td>
          <td>{{ sales.total_price }}</td>
          <td>{{ sales.finished_price }}</td>
          <td>{{ sales.price_with_disc}}</td>
          <td>{{ sales.spp}}</td>
          <td>{{ sales.discount_percent}}</td>
          <td>{{ sales.for_pay}}</td>
          <td>{{ sales.nm_id }}</td>          
          <td>{{ sales.income_id }}</td>          
          <td>{{ sales.warehouse_name}}</td>
          <td>{{ sales.region_name }}</td>
          <td>{{ sales.oblast_okrug_name}}</td>
          <td>{{ sales.country_name }}</td>
          <td>{{ sales.supplier_article}}</td>
          <td>{{ sales.tech_size}}</td>
          <td>{{ sales.subject}}</td>
          <td>{{ sales.category}}</td>
          <td>{{ sales.brand}}</td>
          <td>{{ sales.g_number}}</td>
          <td>{{ sales.sale_id}}</td>
          <td>{{ sales.is_supply}}</td>
          <td>{{ sales.is_realization}}</td>
          <td>{{ sales.barcode }}</td>          
          <td>{{ sales.promo_code_discount}}</td>
          <td>{{ sales.is_storno}}</td>
          <td>{{ sales.odid}}</td>
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
import SLineChart from '../components/SLineChart.vue'
import { ref, watch, computed } from 'vue'
import DateRangePicker from '../components/DateRangePicker.vue'
import Pagination from '../components/Pagination.vue'
import { fetchEntities } from '../api/index.js'

const dateFrom = ref(new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10))
const dateTo = ref(new Date().toISOString().slice(0, 10))

const loading = ref(false)
const error = ref(null)
const rawResponse = ref('')
const displayedItems = ref([])

const page = ref(1)       
const pageSize = ref(1) 
const totalItems = ref(1) 
const limit = 500

const sortOrder = ref(null)  
const sortId = ref('asc')    
const sortStocks = ref(null)





function safeNumber(value) {
  return typeof value === 'number' ? value : Number.NEGATIVE_INFINITY
}

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
  if (sortId.value === 'asc' || sortId.value === 'desc') {
    items.sort((a, b) => {
      const valA = safeNumber(a.nm_id)
      const valB = safeNumber(b.nm_id)
      return sortId.value === 'asc' ? valA - valB : valB - valA
    })
  } else if (sortOrder.value === 'asc' || sortOrder.value === 'desc') {
    items.sort((a, b) => {
      const valA = safeNumber(a.finished_price)
      const valB = safeNumber(b.finished_price)
      return sortOrder.value === 'asc' ? valA - valB : valB - valA
    })
  } else if (sortStocks.value === 'asc' || sortStocks.value === 'desc') {
    items.sort((a, b) => {
      const aName = a.warehouse_name || ''
      const bName = b.warehouse_name || ''
      return sortStocks.value === 'asc'
        ? aName.localeCompare(bName)
        : bName.localeCompare(aName)
    })
  }
  return items
})
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))
async function loadSales() {
  loading.value = true
  error.value = null
  try {
    const data = await fetchEntities('sales', dateFrom.value, dateTo.value, page.value, pageSize.value, limit)
    rawResponse.value = JSON.stringify(data, null, 2)

     displayedItems.value = Array.isArray(data.data) ? data.data : []
    totalItems.value = data.meta.total|| 0

   
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

watch([dateFrom, dateTo, page, pageSize], loadSales, { immediate: true })

const chartData = ref(null)
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      title: { display: true, text: 'For pay' }
    },
    x: {
      title: { display: true, text: 'Last change date' }
    }
  }
}

function prepareChartData() {
  const grouped = sortedItems.value.reduce((acc,sales) => {
  const price = Number(sales.for_pay) || 0
  acc[sales.last_change_date] = (acc[sales.last_change_date] || 0) + price
  return acc
}, {})
  const labels = Object.keys(grouped).sort()
  const data = labels.map(last_change_date => grouped[last_change_date])
  chartData.value = {
    labels,
    datasets: [
      {
        label: 'For pay',
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
button {
  margin-top: 10px;
  padding: 6px 12px;
  cursor: pointer;
}
</style>
