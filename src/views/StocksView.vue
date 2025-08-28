<template>
  <div>
    <h1>Склады</h1>




    
  <div style="max-width: 100%; margin: 20px 0;">
  <LineChart :data="chartData" />
</div>
  
    <DateRangePicker 
      v-model:dateFrom="dateFrom" 
      v-model:dateTo="dateTo" 
    />
    <button @click="toggleSortId">
      Сортировать по Nm_id : {{ sortId === 'asc' ? '▲' : '▼' }}
    </button>   

    <button @click="toggleSortOrder">
     Sc code: {{ sortOrder === 'asc' ? '▲' : '▼' }}
    </button> 

     <button @click="toggleSortStocks">
      по складам: {{ sortStocks === 'asc' ? '▲' : '▼' }}
    </button>
   
      <button @click="toggleSortD">
     Last change date: {{ sortD === 'asc' ? '▲' : '▼' }}
    </button>


       <button @click="toggleSortP">
      Цена: {{ sortP === 'asc' ? '▲' : '▼' }}
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
          <th>Цена</th>
          <th>Nm id</th>
          <th>Штрихкод</th>
          <th>Quantity</th>
          <th>Quantity full</th>
          <th>In way to client</th>
          <th>In way from client</th>
          <th>Склад </th>
          <th>Артикул товара у поставщика</th>
          <th>Tech size</th>
          <th>Is supply</th>
          <th>Is realization</th>
          <th>Sc code</th>
          <th>Subject</th>
          <th>Category</th>
          <th>Brand</th>
          <th>Discount</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="stocks in sortedItems" :key="stocks.g_number">
          <td>{{ stocks.date }}</td>
          <td>{{ stocks.last_change_date }}</td>
          <td>{{ stocks.price }}</td>
          <td>{{ stocks.nm_id }}</td>          
          <td>{{ stocks.barcode }}</td>          
          <td>{{ stocks.quantity }}</td>          
          <td>{{ stocks.quantity_full}}</td>
          <td>{{ stocks.in_way_to_client}}</td>
          <td>{{ stocks.in_way_from_client}}</td>
          <td>{{ stocks.warehouse_name}}</td>
          <td>{{ stocks.supplier_article}}</td>
          <td>{{ stocks.tech_size}}</td>
          <td>{{ stocks.is_supply}}</td>
          <td>{{ stocks.is_realization }}</td>          
          <td>{{ stocks.sc_code }}</td>          
          <td>{{ stocks.subject }}</td>          
          <td>{{ stocks.category }}</td>          
          <td>{{ stocks.brand }}</td>          
          <td>{{ stocks.discount }}</td>          
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
import LineChart from '../components/LineChart.vue'
import { ref, watch, computed } from 'vue'
import DateRangePicker from '../components/DateRangePicker.vue'
import Pagination from '../components/Pagination.vue'
import { fetchEntities } from '../api/index.js'
import { reactive } from 'vue'

const dateFrom = ref(new Date().toISOString().slice(0, 10))
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
const sortD = ref(null)      
const sortP = ref(null)      

const chartData = reactive({
  labels: [],
  datasets: [
    {
      label: 'In way to client',
      data: [],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: false,
    },
    {
      label: 'In way from client',
      data: [],
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      fill: false,
    }
  ]
}) 



function toggleSortId() {
  sortId.value = sortId.value === 'asc' ? 'desc' : 'asc'
  sortOrder.value = null
  sortStocks.value = null
  sortD.value = null
  sortP.value = null
}

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  sortId.value = null
  sortStocks.value = null
  sortD.value = null
  sortP.value = null
}

function toggleSortStocks() {
  sortStocks.value = sortStocks.value === 'asc' ? 'desc' : 'asc'
  sortId.value = null
  sortOrder.value = null
  sortD.value = null
  sortP.value = null
}

function toggleSortD() {
  sortOrder.value = sortD.value === 'asc' ? 'desc' : 'asc'
  sortId.value = null
  sortStocks.value = null
  sortD.value = null
  sortP.value = null
}

function toggleSortP() {
  sortOrder.value = sortP.value === 'asc' ? 'desc' : 'asc'
  sortId.value = null
  sortStocks.value = null
  sortD.value = null
  sortP.value = null
}










const sortedItems = computed(() => {
  let items = [...displayedItems.value]
  if (sortId.value) {    
   items.sort((a, b) => {
      return sortId.value === 'asc' ? a.nm_id - b.nm_id : b.nm_id - a.nm_id
    })
  } if(sortOrder.value) {
    
    items.sort((a, b) => {
      return sortOrder.value === 'asc' ? a.sc_code - b.sc_code : b.sc_code - a.sc_code
    })
  }  if(sortStocks.value) {
  
    items.sort((a, b) => {
      return sortStocks.value === 'asc'
        ? a.warehouse_name.localeCompare(b.warehouse_name)
        : b.warehouse_name.localeCompare(a.warehouse_name)
    })
  } if(sortOrder.value) {
    
    items.sort((a, b) => {
      return sortD.value === 'asc' ? a.last_change_date - b.last_change_date : b.last_change_date - a.last_change_date
    })
  }  if(sortOrder.value) {
    
    items.sort((a, b) => {
      return sortP.value === 'asc' ? a.price - b.price : b.price - a.price
    })
  }
  return items
})











const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))
  async function loadStocks() {
  loading.value = true
  error.value = null
  try {
    const data = await fetchEntities('stocks', dateFrom.value, dateTo.value, page.value, pageSize.value, limit)
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



watch([dateFrom, dateTo, page, pageSize], loadStocks, { immediate: true })
watch(displayedItems, () => {
  
  const grouped = {}
  displayedItems.value.forEach(item => {
    
    const last_change_date = item.last_change_date
    if(!grouped[last_change_date]) {
      grouped[last_change_date] = { to: 0, from: 0 }
    }
    grouped[last_change_date].to += Number(item.in_way_to_client || 0)
    grouped[last_change_date].from += Number(item.in_way_from_client || 0)
  })


  const sortedDates = Object.keys(grouped).sort()

  chartData.labels = sortedDates
  chartData.datasets[0].data = sortedDates.map(last_change_date => grouped[last_change_date].to)
  chartData.datasets[1].data = sortedDates.map(last_change_date => grouped[last_change_date].from)
}, { immediate: true })
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
