<template>
  <section class="zones-section">
    <div class="zones-header">
      <h2 class="section-title">Explora Yucatán</h2>
      <p class="subtitle">Descubre las mejores zonas turísticas del estado</p>
    </div>

    <div class="filters">
      <div class="search-wrapper">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Buscar zona turística..."
          class="search-input"
          aria-label="Buscar zona turística"
        />
        <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M21.71 20.29l-3.388-3.388a8 8 0 10-1.414 1.414L20.29 21.71a1 1 0 001.42-1.42zM10 16a6 6 0 110-12 6 6 0 010 12z"
          />
        </svg>
      </div>

      <select
        v-model="selectedMunicipality"
        class="select-filter"
        aria-label="Filtrar por municipio"
      >
        <option value="">Todos los municipios</option>
        <option
          v-for="municipio in municipios"
          :key="municipio"
          :value="municipio"
        >
          {{ municipio }}
        </option>
      </select>
    </div>

    <div class="zones-grid">
      <div
        v-for="(zone, index) in paginatedZones"
        :key="zone._id"
        class="zone-card"
        :class="getGridClass(index)"
        tabindex="0"
        aria-label="Zona turística"
        role="button"
      >
        <img
          :src="zone.imageUrl"
          :alt="`Imagen de ${zone.name}`"
          class="zone-image"
          @click="goToDetail(zone._id)"
          @keyup.enter="goToDetail(zone._id)"
        />
        <div
          class="zone-info"
          @click="goToDetail(zone._id)"
          @keyup.enter="goToDetail(zone._id)"
          role="button"
          tabindex="0"
        >
          <h3>{{ zone.name }}</h3>
          <p class="municipality">
            <img :src="placeIcon" alt="Ubicación" class="place-icon" />
            {{ zone.municipality }}
          </p>
          <p class="rating">
            <span v-html="getStars(zone.averageRating)"></span>
            <span class="reviews">({{ zone.numReviews }} reseñas)</span>
          </p>
        </div>

        <div
          v-if="isAuthenticated && userRole === 'admin'"
          class="admin-buttons"
        >
          <button class="btn-edit" @click.stop="openEdit(zone)">Editar</button>
          <button class="btn-delete" @click.stop="confirmDelete(zone)">
            Eliminar
          </button>
        </div>

        <button
          v-if="isAuthenticated && userRole === 'user'"
          class="favorite-btn"
          @click.stop="toggleFavorite(zone._id)"
          :aria-label="
            isFavorite(zone._id) ? 'Quitar de favoritos' : 'Agregar a favoritos'
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            :class="{ filled: isFavorite(zone._id) }"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                  2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81
                  14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4
                  6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </button>
      </div>
    </div>

    <nav class="pagination" role="navigation" aria-label="Paginación">
      <button
        :disabled="currentPage === 1"
        @click="currentPage--"
        aria-label="Página anterior"
      >
        ‹
      </button>
      <button
        v-for="page in totalPages"
        :key="page"
        :class="{ active: page === currentPage }"
        @click="currentPage = page"
        :aria-current="page === currentPage ? 'page' : null"
      >
        {{ page }}
      </button>
      <button
        :disabled="currentPage === totalPages"
        @click="currentPage++"
        aria-label="Página siguiente"
      >
        ›
      </button>
    </nav>

    <div v-if="editModalOpen" class="modal-overlay" @click.self="closeEdit">
      <div
        class="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editZoneTitle"
      >
        <h3 id="editZoneTitle">Editar Zona Turística</h3>
        <form @submit.prevent="submitEdit">
          <label for="name">Nombre</label>
          <input id="name" v-model="editZone.name" type="text" required />

          <label for="municipality">Municipio</label>
          <input
            id="municipality"
            v-model="editZone.municipality"
            type="text"
            required
          />

          <label for="description">Descripción</label>
          <textarea
            id="description"
            v-model="editZone.description"
            rows="4"
            required
          ></textarea>

          <div class="image-section">
            <label>Imagen actual:</label>
            <img
              :src="editZone.imageUrl"
              alt="Imagen actual"
              class="edit-image"
            />
          </div>

          <label for="image">Cambiar imagen</label>
          <input
            id="image"
            type="file"
            @change="onImageChange"
            accept="image/*"
          />

          <div class="modal-buttons">
            <button type="submit" class="btn-save">Guardar</button>
            <button type="button" class="btn-cancel" @click="closeEdit">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    <div
      v-if="deleteConfirmOpen"
      class="modal-overlay"
      @click.self="cancelDelete"
    >
      <div class="modal-content" role="alertdialog" aria-modal="true">
        <h3>Confirmar Eliminación</h3>
        <p>
          ¿Estás seguro de que deseas eliminar esta zona turística? Esta acción
          no se puede deshacer.
        </p>
        <div class="modal-buttons">
          <button class="btn-delete-confirm" @click="deleteZone">
            Eliminar
          </button>
          <button class="btn-cancel" @click="cancelDelete">Cancelar</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import placeIcon from '../components/img/place.png';
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import api from '../services/api';

  const router = useRouter();

  const zonas = ref([]);
  const searchTerm = ref('');
  const selectedMunicipality = ref('');
  const currentPage = ref(1);
  const itemsPerPage = 6;

  const isAuthenticated = ref(!!localStorage.getItem('token'));
  const userRole = ref(localStorage.getItem('role'));
  const userId = ref(localStorage.getItem('userId'));

  const favorites = ref([]);

  const municipios = computed(() => {
    return [...new Set(zonas.value.map((z) => z.municipality))].sort();
  });

  const totalPages = ref(1);

  const paginatedZones = computed(() => zonas.value);

  const loadZones = async () => {
    try {
      const params = {
        page: currentPage.value,
        limit: itemsPerPage,
      };

      if (selectedMunicipality.value) {
        params.municipality = selectedMunicipality.value;
      }

      if (searchTerm.value.trim() !== '') {
        params.search = searchTerm.value.trim();
      }

      const response = await api.get('/zones', { params });

      zonas.value = response.data.data;
      totalPages.value = response.data.pages || 1;

      if (isAuthenticated.value && userRole.value === 'user') {
        await loadFavorites();
      }
    } catch (err) {
      console.error('Error al cargar zonas:', err);
    }
  };

  watch([currentPage, selectedMunicipality, searchTerm], () => {
    loadZones();
  });

  watch([searchTerm, selectedMunicipality], () => {
    currentPage.value = 1;
  });

  const goToDetail = (id) => {
    router.push({ name: 'DetailEvents', params: { id } });
  };

  const isFavorite = (zoneId) => favorites.value.includes(zoneId);

  const toggleFavorite = async (zoneId) => {
    try {
      if (isFavorite(zoneId)) {
        await api.delete(`/users/${userId.value}/favorites/${zoneId}`);
        favorites.value = favorites.value.filter((id) => id !== zoneId);
      } else {
        await api.post(`/users/${userId.value}/favorites`, { zonaId: zoneId });
        favorites.value.push(zoneId);
      }
    } catch (err) {
      console.error('Error al cambiar favorito:', err);
    }
  };

  const updateAuthState = () => {
    isAuthenticated.value = !!localStorage.getItem('token');
    userRole.value = localStorage.getItem('role');
    userId.value = localStorage.getItem('userId');
    if (isAuthenticated.value && userRole.value === 'user') {
      loadFavorites();
    } else {
      favorites.value = [];
    }
  };

  const loadFavorites = async () => {
    try {
      const { data } = await api.get(`/users/${userId.value}/favorites`);
      favorites.value = data.data.map((z) => z._id);
    } catch (err) {
      console.error('Error al cargar favoritos:', err);
    }
  };

  const getStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);

    const starFull = '<span style="color:#f5b50a;">&#9733;</span>';
    const starHalf = '<span style="color:#f5b50a;">&#189;</span>';
    const starEmpty = '<span style="color:#f5b50a;">&#9734;</span>';

    return `
    ${starFull.repeat(full)}
    ${half ? starHalf : ''}
    ${starEmpty.repeat(empty)}
  `;
  };
  const getGridClass = (index) => {
    const page = currentPage.value;

    const pattern = page % 3;

    if (pattern === 0) {
      return index % 5 === 0 ? 'span-2' : 'span-1';
    } else if (pattern === 1) {
      return index % 4 === 1 ? 'span-2' : 'span-1';
    } else {
      return index % 3 === 2 ? 'span-2' : 'span-1';
    }
  };

  // --------- EDITAR ZONA ----------
  const editModalOpen = ref(false);
  const editZone = ref({
    _id: '',
    name: '',
    municipality: '',
    description: '',
    imageUrl: '',
  });
  const newImageFile = ref(null);

  const openEdit = (zone) => {
    editZone.value = { ...zone };
    newImageFile.value = null;
    editModalOpen.value = true;
  };

  const closeEdit = () => {
    editModalOpen.value = false;
    newImageFile.value = null;
  };

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (file) newImageFile.value = file;
  };

  const submitEdit = async () => {
    try {
      const formData = new FormData();
      formData.append('name', editZone.value.name);
      formData.append('municipality', editZone.value.municipality);
      formData.append('description', editZone.value.description);
      if (newImageFile.value) {
        formData.append('image', newImageFile.value);
      }

      await api.put(`/zones/${editZone.value._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      await loadZones();
      closeEdit();
    } catch (err) {
      console.error('Error al editar zona:', err);
    }
  };

  const deleteConfirmOpen = ref(false);
  const zoneToDelete = ref(null);

  const confirmDelete = (zone) => {
    zoneToDelete.value = zone;
    deleteConfirmOpen.value = true;
  };

  const cancelDelete = () => {
    deleteConfirmOpen.value = false;
    zoneToDelete.value = null;
  };

  const deleteZone = async () => {
    try {
      await api.delete(`/zones/${zoneToDelete.value._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      await loadZones();
      cancelDelete();
    } catch (err) {
      console.error('Error al eliminar zona:', err);
    }
  };

  onMounted(() => {
    loadZones();
    window.addEventListener('login-update', updateAuthState);
  });

  onUnmounted(() => {
    window.removeEventListener('login-update', updateAuthState);
  });
</script>

<style scoped>
  .zones-section {
    max-width: 1200px;
    margin: 3rem auto;
    padding: 0 1rem;
    font-family: 'Poppins', sans-serif;
    color: #1a1a1a;
  }

  .zones-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 2.4rem;
    font-weight: 700;
    color: #007b5f;
    letter-spacing: 0.03em;
  }

  .subtitle {
    font-size: 1.15rem;
    color: #555;
    margin-top: 0.5rem;
    font-weight: 400;
  }

  .filters {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 2.5rem;
  }

  .search-wrapper {
    position: relative;
    flex: 1 1 280px;
    max-width: 400px;
  }

  .search-input {
    width: 100%;
    padding: 0.65rem 2.8rem 0.65rem 1rem;
    font-size: 1rem;
    border-radius: 8px;
    border: 1.8px solid #ccc;
    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease;
    font-family: inherit;
  }

  .search-input:focus {
    outline: none;
    border-color: #007b5f;
    box-shadow: 0 0 8px rgba(0, 123, 95, 0.35);
  }

  .search-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    color: #007b5f;
    pointer-events: none;
    opacity: 0.7;
  }

  .select-filter {
    padding: 0.6rem 1rem;
    border-radius: 8px;
    border: 1.8px solid #ccc;
    background: white;
    font-family: inherit;
    font-size: 1rem;
    max-width: 280px;
  }

  .select-filter:focus {
    outline: none;
    border-color: #007b5f;
    box-shadow: 0 0 8px rgba(0, 123, 95, 0.35);
  }

  .zones-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.2rem;
    padding: 0.5rem;
  }

  .zone-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .zone-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }

  .zone-card.span-1 {
    grid-column: span 1;
  }

  .zone-card.span-2 {
    grid-column: span 2;
  }

  /* Responsive (opcional, pero recomendado) */
  @media (max-width: 768px) {
    .zones-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .zone-card.span-2 {
      grid-column: span 2;
    }
  }

  @media (max-width: 480px) {
    .zones-grid {
      grid-template-columns: 1fr;
    }
  }

  .zone-card {
    background: white;
    border-radius: 0.85rem;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease;
  }

  .zone-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 10px 25px rgba(0, 123, 95, 0.15);
    cursor: pointer;
  }

  .zone-image {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-bottom: 3px solid #007b5f;
  }

  .zone-info {
    padding: 1rem 1.25rem;
    flex-grow: 1;
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

  .favorite-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none !important;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    line-height: 0;
    outline: none;
    box-shadow: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .favorite-btn svg {
    width: 24px;
    height: 24px;
    fill: #998a8b;
    background: none !important;
    border: none;
    box-shadow: none;
    border-radius: 0;
    display: block;
    pointer-events: none;
  }

  .favorite-btn svg.filled {
    fill: #e63946;
  }

  .favorite-btn:hover svg {
    filter: brightness(0.85);
  }

  .place-icon {
    width: 20px;
    height: 20px;
    vertical-align: middle;
    margin-right: 6px;
  }

  .admin-buttons {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-top: 1px solid #ddd;
  }

  .btn-edit,
  .btn-delete {
    flex: 1;
    padding: 0.5rem 0;
    font-weight: 600;
    font-size: 0.9rem;
    border-radius: 8px;
    cursor: pointer;
    border: none;
    transition: background-color 0.3s ease;
  }

  .btn-edit {
    background-color: #007b5f;
    color: white;
  }

  .btn-edit:hover {
    background-color: #00503f;
  }

  .btn-delete {
    background-color: #e63946;
    color: white;
  }

  .btn-delete:hover {
    background-color: #a32a39;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    width: 100%;
    max-width: 480px;
    box-sizing: border-box;
    max-height: 90vh;
    overflow-y: auto;
    font-family: 'Poppins', sans-serif;
  }

  .modal-content h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #007b5f;
    font-weight: 700;
    font-size: 1.5rem;
  }

  .modal-content label {
    display: block;
    margin-top: 1rem;
    font-weight: 600;
  }

  .modal-content input[type='text'],
  .modal-content textarea {
    width: 100%;
    padding: 0.6rem 0.8rem;
    margin-top: 0.3rem;
    font-size: 1rem;
    border-radius: 6px;
    border: 1.8px solid #ccc;
    font-family: inherit;
    resize: vertical;
  }

  .edit-image {
    max-width: 100%;
    max-height: 180px;
    margin-top: 0.5rem;
    border-radius: 8px;
    object-fit: cover;
    border: 1.8px solid #ccc;
  }

  .modal-buttons {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }

  .btn-save {
    background-color: #007b5f;
    color: white;
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    border: none;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .btn-save:hover {
    background-color: #00503f;
  }

  .btn-cancel {
    background-color: #aaa;
    color: white;
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    border: none;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .btn-cancel:hover {
    background-color: #666;
  }

  .btn-delete-confirm {
    background-color: #e63946;
    color: white;
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    border: none;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .btn-delete-confirm:hover {
    background-color: #a32a39;
  }
  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 2.5rem;
    gap: 0.6rem;

    button {
      padding: 0.55rem 1rem;
      border-radius: 6px;
      border: none;
      background-color: var(--primary, #007b5f);
      color: white;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.25s ease;

      &.active {
        background-color: #007b5f;
        box-shadow: 0 0 8px rgba(0, 123, 95, 0.6);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background-color: #a5a5a5;
      }

      &:hover:not(:disabled) {
        background-color: #007b5f;
      }
    }
  }

  @media (max-width: 480px) {
    .zones-header .section-title {
      font-size: 1.8rem;
    }

    .zones-header .subtitle {
      font-size: 1rem;
    }

    .zone-info h3 {
      font-size: 1.1rem;
    }

    .filters {
      flex-direction: column;
      align-items: stretch;

      .search-wrapper,
      .select-filter {
        max-width: 100%;
      }
    }

    .pagination button {
      font-size: 0.9rem;
      padding: 0.5rem 0.8rem;
    }
  }
</style>
