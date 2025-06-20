<template>
  <div>
    <h2>Zonas disponibles</h2>
    <ul>
      <li v-for="zone in zones" :key="zone._id">
        <strong>{{ zone.name }}</strong> - {{ zone.municipality }}
      </li>
    </ul>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import api from '../services/api';

  const zones = ref([]);

  const fetchZones = async () => {
    try {
      const res = await api.get('/zones');
      zones.value = res.data.zones || [];
    } catch (err) {
      console.error('Error al cargar zonas', err);
    }
  };

  onMounted(fetchZones);
</script>
