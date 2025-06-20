<template>
  <section class="saved-zones">
    <h2 class="title">Mis Zonas Favoritas</h2>

    <div v-if="loading" class="loading">Cargando zonas favoritas...</div>

    <div v-else-if="favorites.length === 0" class="empty">
      <p>No has guardado ninguna zona aún.</p>
    </div>

    <div v-else class="favorites-grid">
      <div
        v-for="zone in favorites"
        :key="zone._id"
        class="zone-card"
        @click="goToDetail(zone._id)"
        tabindex="0"
        role="button"
        @keyup.enter="goToDetail(zone._id)"
      >
        <img :src="zone.imageUrl" :alt="zone.name" class="zone-image" />
        <div class="zone-info">
          <h3>{{ zone.name }}</h3>
          <p class="municipality">📍 {{ zone.municipality }}</p>
          <p class="rating">
            <span v-html="getStars(zone.averageRating)"></span>
            <span class="reviews">({{ zone.numReviews }} reseñas)</span>
          </p>
          <button
            class="btn-remove"
            @click.stop="removeFromFavorites(zone._id)"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { useRouter } from 'vue-router';
  import api from '../services/api';

  const favorites = ref([]);
  const loading = ref(true);
  const router = useRouter();

  const getStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  };

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    if (!token || role !== 'user' || !userId) {
      router.push('/');
      return false;
    }
    return true;
  };

  const fetchFavorites = async () => {
    if (!checkAuth()) return;

    try {
      const userId = localStorage.getItem('userId');
      const { data } = await api.get(`/users/${userId}/favorites`);
      favorites.value = data.data || [];
    } catch (err) {
      console.error('Error al obtener favoritos:', err);
    } finally {
      loading.value = false;
    }
  };

  const removeFromFavorites = async (zoneId) => {
    const userId = localStorage.getItem('userId');
    try {
      await api.delete(`/users/${userId}/favorites/${zoneId}`);
      favorites.value = favorites.value.filter((z) => z._id !== zoneId);
    } catch (err) {
      console.error('Error al eliminar favorito:', err);
    }
  };

  const goToDetail = (id) => {
    router.push({ name: 'DetailEvents', params: { id } });
  };

  onMounted(() => {
    fetchFavorites();

    window.addEventListener('login-update', checkAuth);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('login-update', checkAuth);
  });
</script>

<style scoped lang="css">
  .saved-zones {
    max-width: 1200px;
    margin: 3rem auto;
    padding: 0 1.2rem;
    font-family: 'Poppins', sans-serif;
    color: #1a1a1a;
  }

  .title {
    text-align: center;
    font-size: 2rem;
    color: #007b5f;
    margin-bottom: 2rem;
    font-weight: 700;
  }

  .loading,
  .empty {
    text-align: center;
    font-size: 1.2rem;
    color: #666;
    margin-top: 3rem;
  }

  .favorites-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.75rem;
  }

  .zone-card {
    background: white;
    border-radius: 0.85rem;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    position: relative;
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease;
  }

  .zone-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 10px 25px rgba(0, 123, 95, 0.15);
  }

  .zone-image {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-bottom: 3px solid #007b5f;
  }

  .zone-info {
    padding: 1rem 1.25rem;
  }

  .zone-info h3 {
    font-size: 1.25rem;
    margin-bottom: 0.3rem;
    font-weight: 700;
    color: #222;
  }

  .municipality {
    font-size: 0.95rem;
    color: #666;
    margin-bottom: 0.5rem;
  }

  .rating {
    font-size: 1rem;
    color: #444;
  }

  .reviews {
    font-size: 0.9rem;
    margin-left: 0.5rem;
    color: #777;
  }

  .btn-remove {
    margin-top: 1rem;
    background-color: #e63946;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .btn-remove:hover {
    background-color: #c9182b;
  }
</style>
