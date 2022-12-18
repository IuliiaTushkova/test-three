

<script lang="ts" setup>
/* eslint-disable */
import FirstTest from './components/FirstTest.vue';

let displayedComponent = FirstTest;

//recuperer le btn cliqué du menu pour afficher le bon composant
</script>

<template>
  <component :is="displayedComponent" />
</template>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
