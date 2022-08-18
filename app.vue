<template>
  <div>
    <commonTitle>你好</commonTitle>
    <commonButton>提交</commonButton>
    <hr>
    <component :is="true ? MyButton : 'h2'" >按钮</component>
    <component :is="false ? MyButton : 'h2'" >按钮</component>
    <NuxtPage></NuxtPage>
  </div>
</template>
<script setup>
  const MyButton = resolveComponent('commonButton')

</script>

<style lang="scss">
div {
  h1 {
    color: red;
  }
}
</style>
