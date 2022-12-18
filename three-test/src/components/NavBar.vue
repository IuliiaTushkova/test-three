<script lang="ts" setup>
/* eslint-disable */
import { computed } from "@vue/reactivity"

const props = defineProps({
  choice:""
})

const btnClicked = computed({
  get() {
    return props.choice
  },
  set(value) {
    emit('subscribe:choice', value)
  }
})

const emit = defineEmits(['choice:choice', 'setChoice'])

function setChoiceFunc() {
  emit('setChoice')
}

function setLocalProp(event) {
  props.choice = event.target.innerText;
	console.log('event : ', event.target.innerText);
  this.setChoiceFunc();
}
</script>

<template>
  <div class="q-pa-md">
    <div class="q-gutter-md row">
      <q-btn color="primary" label="Menu">
        <q-menu class="bg-purple text-white" auto-close>
          <q-list style="min-width: 100px">
            <q-item clickable>
              <q-item-section @click="setLocalProp($event)">Text</q-item-section>
            </q-item>
            <q-item clickable>
              <q-item-section @click="setLocalProp($event)">Bonhomme</q-item-section>
            </q-item>
            <q-separator dark />
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>
</template>


<style>
</style>