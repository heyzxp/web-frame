<template>
  <div id="defaultLayout">
    <div class="header">
      头部
    </div>
    <div class="cont">
      <slot></slot>
    </div>
    <div class="footer">
      底部
    </div>
  </div>
</template>

<script>
</script>

<style lang="scss">
#defaultLayout {
  background: white;
  text-align: center;
  >.header {
    height: 100px;
  }
  >.cont {
    min-height: calc(100vh - 200px);
  }
  >.footer {
    height: 100px;
  }


}
</style>