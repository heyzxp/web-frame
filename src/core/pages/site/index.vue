<template>
  <div>
    index path 
    <NuxtLink to="/user/">detail Page</NuxtLink>
  </div>
</template>

<script setup>
definePageMeta({
  title: '11111111111111',
  
  // someData
  alias: [ '/index', '/home','/' ]
})
</script>