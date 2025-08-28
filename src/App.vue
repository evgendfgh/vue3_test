<template>
  <div id="app">
    <nav>
      <router-link to="/sales">Продажи</router-link>
      |
      <router-link to="/orders">Заказы</router-link> 
      |
      <router-link to="/stocks">Склады</router-link> 
      |
      <router-link to="/incomes">Поступления</router-link>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  margin: 20px;
}

nav {
  margin-bottom: 15px;
}

nav a {
  color: #42b983;
  text-decoration: none;
  padding: 0 8px;
}

nav a.router-link-exact-active {
  font-weight: bold;
  text-decoration: underline;
}

main {
  border-top: 1px solid #ddd;
  padding-top: 10px;
}
</style>
