<script lang="ts" setup>
    /* eslint-disable */
    import SymText from '../components/SymText.vue';
    import BonHomme from '../components/BonHomme.vue';
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
    const router = useRouter();
    const menuList = [
    {
        icon: 'help',
        label: 'SymText',
        separator: true
    },
    {
        icon: 'help',
        label: 'BonHomme',
        separator: false
    },
    ]
    let displayedComponent = SymText;

    let drawer = ref(false);

    function switchCentralComponent(event) { 
        console.log('coucoucocuouco');
        router.push('/sym-text');

    const lbl = event.target.innerText;
    lbl == "SymText" ? router.push('/sym-text') : router.push('/bon-homme');

    }
</script>

<template>
    <q-layout view="hHh Lpr lff" container style="height: 100vh" class="shadow-2 rounded-borders">
      <q-header elevated class="bg-prim">
        <q-toolbar>
          <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
          <q-toolbar-title>Menu</q-toolbar-title>
        </q-toolbar>
      </q-header>

      <q-drawer
        v-model="drawer"
        show-if-above
        :width="200"
        :breakpoint="500"
        bordered
        class="bg-grey-3"
      >
        <q-scroll-area class="fit">
          <q-list>
            <template v-for="(menuItem, index) in menuList" :key="index">
              <q-item clickable :active="menuItem.label === 'Outbox'" v-ripple @click="switchCentralComponent($event)">
                <q-item-section avatar>
                  <q-icon :name="menuItem.icon" />
                </q-item-section>
                <q-item-section>
                  {{ menuItem.label }}
                </q-item-section>
              </q-item>
              <q-separator :key="'sep' + index"  v-if="menuItem.separator" />
            </template>
          </q-list>
        </q-scroll-area>
      </q-drawer>
      <q-page-container>
        <router-view></router-view>
      </q-page-container>
    </q-layout>
</template>

<style>
  #app {
    font-family: Poppins, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 0;
  }

  .bg-prim {
    background-color: #2A4154;
  }
</style>
