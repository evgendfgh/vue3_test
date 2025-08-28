const SECRET_KEY = 'E6kUTYrYwZq2tN4QEtyzsbEBk3ie' 

// Универсальная функция запроса с авторизацией
export async function fetchEntities(entity, dateFrom, dateTo, page = 1, pageSize = 10) {
  // Формат даты "Y-m-d"
  const url = new URL(`/api/${entity}`, "https://109.73.206.144:6969")
  url.searchParams.set('dateFrom', dateFrom)
  url.searchParams.set('dateTo', dateTo)
  url.searchParams.set('page', page)
  url.searchParams.set('pageSize', pageSize)
  url.searchParams.set('key', SECRET_KEY)
  
  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error('Ошибка при получении данных')
  }
  return response.json()
}
