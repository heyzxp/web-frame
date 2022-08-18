<template>
  <h2>
    user/addUserwa
  </h2>
</template>
<script setup>
const config = useRuntimeConfig()
console.log('Runtime config:', config.public)
if (process.server) {
  console.log('API secret:', config.apiSecret)
}
</script>