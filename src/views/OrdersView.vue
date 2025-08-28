<template>
  <div>
    <h1>Заказы</h1>



    

 <div>
      <OLineChart :chartData="chartData" :options="chartOptions" />
    </div>


    <DateRangePicker 
      v-model:dateFrom="dateFrom" 
      v-model:dateTo="dateTo" 
    />
    
   <button @click="toggleSortId">
      Сортировать по Nm_id : {{ sortId === 'asc' ? '▲' : '▼' }}
    </button>   

    <button @click="toggleSortOrder">
     Total price: {{ sortOrder === 'asc' ? '▲' : '▼' }}
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
          <th>Отмена заказа Is cancel</th>
          <th>Total price</th>
          <th>Discount percent</th>
          <th>Nm id</th>
          <th>Income id</th>
          <th>Штрихкод</th>
          <th>Склад </th>
          <th>Область</th>
          <th>Артикул товара у поставщика</th>
          <th>Tech size</th>
          <th>Subject</th>
          <th>Category</th>
          <th>Brand</th>
          <th>G number</th>
          <th> Позиций в заказах odid</th>
          <th> Cancel dt</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in sortedItems" :key="order.date">
          <td>{{ order.date }}</td>
          <td>{{ order.last_change_date }}</td>
          <td>{{ order.is_cancel}}</td>
          <td>{{ order.total_price }}</td>
          <td>{{ order.discount_percent}}</td>
          <td>{{ order.nm_id }}</td>          
          <td>{{ order.income_id }}</td>          
          <td>{{ order.barcode }}</td>
          <td>{{ order.warehouse_name}}</td>
          <td>{{ order.oblast}}</td>
          <td>{{ order.supplier_article}}</td>
          <td>{{ order.tech_size}}</td>
          <td>{{ order.subject}}</td>
          <td>{{ order.category}}</td>
          <td>{{ order.brand}}</td>
          <td>{{ order.g_number}}</td>
          <td>{{ order.odid}}</td>
          <td>{{ order.cancel_dt}}</td>
        </tr>
      </tbody>
    </table>
    <p v-if="!loading && !error && !sortedItems.length">Данные не найдены.</p>
 
    
    <Pagination 
       :page="page" 
       :totalPages="totalPages" 
       @update:page="p => page = p"
    />

  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import DateRangePicker from '../components/DateRangePicker.vue' 
import Pagination from '../components/Pagination.vue'
import { fetchEntities } from '../api/index.js'
import OLineChart from '../components/OLineChart.vue' 

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
   items.sort((a, b) => {
      return sortId.value === 'asc' ? a.nm_id - b.nm_id : b.nm_id - a.nm_id
    })
  }  if(sortOrder.value) {   
    items.sort((a, b) => {
      return sortOrder.value === 'asc' ? a.total_price - b.total_price : b.total_price - a.total_price
    })
  } if (sortStocks.value) { 
    items.sort((a, b) => {
      return sortStocks.value === 'asc'
        ? a.warehouse_name.localeCompare(b.warehouse_name)
        : b.warehouse_name.localeCompare(a.warehouse_name)
    })
  }
  return items
})
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))
async function loadOrders() {
  loading.value = true
  error.value = null
  try {
    const data = await fetchEntities('orders', dateFrom.value, dateTo.value, page.value, pageSize.value, limit)
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

watch([dateFrom, dateTo, page, pageSize], loadOrders, { immediate: true })

const chartData = ref(null)
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      title: { display: true, text: 'Total price' }
    },
    x: {
      title: { display: true, text: 'Last change date' }
    }
  }
}

function prepareChartData() {
  const grouped = sortedItems.value.reduce((acc,order) => {
  const price = Number(order.total_price) || 0
  acc[order.last_change_date] = (acc[order.last_change_date] || 0) + price
  return acc
}, {})
  const labels = Object.keys(grouped).sort()
  const data = labels.map(last_change_date => grouped[last_change_date])
  chartData.value = {
    labels,
    datasets: [
      {
        label: 'Total price',
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
