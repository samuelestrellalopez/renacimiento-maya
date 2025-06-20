<template>
  <section class="zona-detalle" v-if="zona">
    <div class="zona-card">
      <div class="zona-card-content">
        <div class="zona-image-container">
          <img :src="zona.imageUrl" :alt="zona.name" class="zona-image" />
        </div>
        <div class="zona-info">
          <h1 class="zona-title">{{ zona.name }}</h1>
          <p class="zona-municipio">
            <img :src="placeIcon" alt="Ubicación" class="place-icon" />
            {{ zona.municipality }}
          </p>

          <div class="zona-rating">
            <span class="stars" v-html="getStars(zona.averageRating)"></span>
            <span class="rating-text"
              >{{ zona.averageRating.toFixed(1) }} ·
              {{ zona.numReviews }} reseñas</span
            >
          </div>
          <p class="zona-description">{{ zona.description }}</p>
        </div>
      </div>
    </div>

    <!-- Reseñas -->
    <div class="zona-reseñas">
      <h2 class="reseñas-title">Reseñas de los visitantes</h2>

      <div v-if="reviews.length > 0" class="reseña-list">
        <div v-for="review in reviews" :key="review._id" class="reseña-item">
          <div class="reseña-header">
            <strong>{{ review.user?.username || 'Anónimo' }}</strong>
            <span class="reseña-stars" v-html="getStars(review.rating)"></span>

            <button
              v-if="userRole === 'admin'"
              class="btn-eliminar-reseña"
              @click="confirmarEliminarReseña(review._id)"
              aria-label="Eliminar reseña"
              title="Eliminar reseña"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="icon-trash"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </button>
          </div>
          <p class="reseña-comentario">“{{ review.comment }}”</p>
          <p class="reseña-fecha">{{ formatDate(review.createdAt) }}</p>
        </div>
      </div>

      <p v-else class="no-reseñas">Aún no hay reseñas para esta zona.</p>
    </div>

    <div v-if="isAuthenticated && userRole === 'user'" class="reseña-form">
      <h3>
        {{
          !userAlreadyReviewed
            ? 'Deja tu reseña'
            : isEditing
              ? 'Editar tu reseña'
              : 'Gracias por dejarnos tu reseña'
        }}
      </h3>
      <form @submit.prevent="submitReview">
        <label for="rating">Calificación:</label>
        <div class="star-rating">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            class="star"
            :class="{ filled: star <= (hoverRating || form.rating) }"
            @click="!isReadOnly && (form.rating = star)"
            @mouseover="!isReadOnly && (hoverRating = star)"
            @mouseleave="hoverRating = 0"
            :disabled="isReadOnly"
            aria-label="Calificación"
          >
            ★
          </button>
        </div>

        <textarea
          v-model="form.comment"
          :readonly="isReadOnly"
          placeholder="Escribe tu opinión..."
          required
          rows="4"
        ></textarea>

        <div class="botones">
          <button
            v-if="!userAlreadyReviewed"
            type="submit"
            class="btn-primary"
            :disabled="form.rating === 0 || !form.comment.trim()"
          >
            Enviar Reseña
          </button>

          <template v-else>
            <button
              v-if="!isEditing"
              type="button"
              class="btn-primary"
              @click="startEdit"
            >
              Editar
            </button>

            <button
              v-if="isEditing"
              type="submit"
              class="btn-primary"
              :disabled="form.rating === 0 || !form.comment.trim()"
            >
              Guardar
            </button>
            <button
              v-if="isEditing"
              type="button"
              class="btn-secondary"
              @click="cancelEdit"
            >
              Cancelar
            </button>
          </template>
        </div>
      </form>
    </div>

    <div v-if="!isAuthenticated" class="zona-cta">
      <p>¿Quieres dejar tu opinión o guardar esta zona?</p>
      <router-link to="/login" class="btn-accion">Inicia sesión</router-link>
      <router-link to="/register" class="btn-accion outline"
        >Regístrate</router-link
      >
    </div>

    <div
      v-if="showConfirmDialog"
      class="modal-overlay"
      @click.self="cancelarEliminarReseña"
    >
      <div class="modal-content confirm-delete" role="dialog" aria-modal="true">
        <h3>¿Eliminar reseña?</h3>
        <p>
          ¿Estás seguro de que deseas eliminar esta reseña? Esta acción no se
          puede deshacer.
        </p>
        <div class="modal-buttons">
          <button class="btn-delete-confirm" @click="eliminarReseña">
            Sí, eliminar
          </button>
          <button class="btn-cancel" @click="cancelarEliminarReseña">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import placeIcon from '../components/img/place.png';
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import { useRoute } from 'vue-router';
  import api from '../services/api';

  const route = useRoute();
  const zona = ref(null);
  const reviews = ref([]);
  const form = ref({ rating: 0, comment: '' });
  const editingReview = ref(null);
  const hoverRating = ref(0);
  const isAuthenticated = ref(false);
  const userRole = ref(localStorage.getItem('role') || '');
  const userId = ref(localStorage.getItem('userId') || '');
  const reseñaAEliminar = ref(null);
  const showConfirmDialog = ref(false);

  const isEditing = ref(false);
  const userAlreadyReviewed = ref(false);

  const isReadOnly = computed(
    () => userAlreadyReviewed.value && !isEditing.value
  );

  const getStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-MX', options);
  };

  const loadZone = async () => {
    try {
      const token = localStorage.getItem('token');
      isAuthenticated.value = !!token;

      const { data } = await api.get(`/zones/${route.params.id}`);
      zona.value = data.data;
      reviews.value = data.data.reviews || [];

      if (isAuthenticated.value && userRole.value === 'user') {
        const userReview = reviews.value.find(
          (r) => String(r.user?._id) === String(userId.value)
        );
        if (userReview) {
          editingReview.value = userReview;
          form.value = {
            rating: userReview.rating,
            comment: userReview.comment,
          };
          userAlreadyReviewed.value = true;
          isEditing.value = false;
        } else {
          form.value = { rating: 0, comment: '' };
          editingReview.value = null;
          userAlreadyReviewed.value = false;
          isEditing.value = false;
        }
      } else {
        form.value = { rating: 0, comment: '' };
        editingReview.value = null;
        userAlreadyReviewed.value = false;
        isEditing.value = false;
      }
    } catch (err) {
      console.error('Error al cargar la zona y reseñas:', err);
    }
  };

  const submitReview = async () => {
    try {
      if (form.value.rating === 0 || !form.value.comment.trim()) {
        alert('Debes proporcionar calificación y comentario.');
        return;
      }

      const zoneId = route.params.id;
      if (userAlreadyReviewed.value && editingReview.value) {
        const { data } = await api.put(
          `/reviews/${editingReview.value._id}`,
          form.value
        );
        const index = reviews.value.findIndex(
          (r) => r._id === editingReview.value._id
        );
        if (index !== -1) {
          reviews.value[index] = {
            ...reviews.value[index],
            rating: data.data.rating,
            comment: data.data.comment,
            updatedAt: data.data.updatedAt,
          };
          editingReview.value = reviews.value[index];
        }
        isEditing.value = false;
      } else {
        await api.post(`/zones/${zoneId}/reviews`, form.value);
        const res = await api.get(`/zones/${zoneId}/reviews`);
        reviews.value = res.data.data;
        editingReview.value = reviews.value.find(
          (r) => String(r.user?._id) === String(userId.value)
        );
        userAlreadyReviewed.value = true;
        isEditing.value = false;
      }
    } catch (err) {
      console.error('Error al enviar reseña:', err);
      alert('Error al enviar la reseña.');
    }
  };

  const startEdit = () => {
    if (!userAlreadyReviewed.value) return;
    isEditing.value = true;
  };

  const cancelEdit = () => {
    if (!userAlreadyReviewed.value) return;
    form.value.rating = editingReview.value.rating;
    form.value.comment = editingReview.value.comment;
    isEditing.value = false;
  };

  const confirmarEliminarReseña = (reviewId) => {
    reseñaAEliminar.value = reviewId;
    showConfirmDialog.value = true;
  };

  const cancelarEliminarReseña = () => {
    reseñaAEliminar.value = null;
    showConfirmDialog.value = false;
  };

  const eliminarReseña = async () => {
    if (!reseñaAEliminar.value) return;

    const token = localStorage.getItem('token');
    const reviewId = reseñaAEliminar.value;

    try {
      await api.delete(`/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      reviews.value = reviews.value.filter((r) => r._id !== reviewId);
      reseñaAEliminar.value = null;
      showConfirmDialog.value = false;
      alert('Reseña eliminada correctamente.');
    } catch (err) {
      if (err.response) {
        alert(`Error del servidor: ${err.response.data.message}`);
      } else {
        alert(
          'Error al eliminar la reseña. Revisa la consola para más detalles.'
        );
      }
    }
  };

  const updateUserSession = () => {
    const token = localStorage.getItem('token');
    isAuthenticated.value = !!token;
    userRole.value = localStorage.getItem('role') || '';
    userId.value = localStorage.getItem('userId') || '';
    loadZone();
  };

  onMounted(() => {
    updateUserSession();
    window.addEventListener('login-update', updateUserSession);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('login-update', updateUserSession);
  });
</script>

<style scoped lang="scss">
  .btn-eliminar-reseña {
    background: none;
    border: none;
    padding: 0;
    margin-left: auto;
    cursor: pointer;
    display: flex;
    align-items: center;
    color: #e63946;
    transition: color 0.3s ease;
  }
  .btn-eliminar-reseña:hover {
    color: #a32a39;
  }
  .icon-trash {
    width: 20px;
    height: 20px;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
  }
  .modal-content.confirm-delete {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  }
  .modal-buttons {
    margin-top: 1rem;
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
  .btn-delete-confirm {
    background-color: #e63946;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  .btn-delete-confirm:hover {
    background-color: #c5283f;
  }
  .btn-cancel {
    background-color: #ccc;
    color: #333;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  .btn-cancel:hover {
    background-color: #bbb;
  }

  .zona-detalle {
    max-width: 1000px;
    margin: 3rem auto;
    padding: 0 1rem;
    font-family: var(--font-family, 'Poppins', sans-serif);
  }

  .zona-card {
    background-color: #fff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
    margin-bottom: 3rem;
    transition:
      transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.35s ease;

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 38px rgba(0, 0, 0, 0.18);
    }

    .zona-card-content {
      display: flex;
      flex-direction: column;

      @media (min-width: 768px) {
        flex-direction: row;
        gap: 2rem;
      }

      .zona-image-container {
        flex: 1;
        min-height: 320px;
        max-height: 420px;
        overflow: hidden;
        border-radius: 16px 16px 0 0;

        @media (min-width: 768px) {
          max-width: 50%;
          border-radius: 16px 0 0 16px;
        }

        .zona-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: saturate(1.1) brightness(0.95);
          transition: filter 0.3s ease;

          &:hover {
            filter: saturate(1.2) brightness(1);
          }
        }
      }

      .zona-info {
        flex: 1;
        background-color: #f9faf9;
        padding: 2.4rem 2.4rem 2.4rem 2rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        border-radius: 0 0 16px 16px;

        @media (min-width: 768px) {
          border-radius: 0 16px 16px 0;
        }

        .zona-title {
          font-size: 2.4rem;
          font-weight: 800;
          color: #007b5f;
          margin-bottom: 0.4rem;
          letter-spacing: 0.02em;
          line-height: 1.1;
        }

        .zona-municipio {
          font-size: 1.15rem;
          color: #556b57;
          font-weight: 600;
          margin-bottom: 1.2rem;
        }

        .zona-rating {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 1.4rem;

          .stars {
            display: flex;
            color: #f4a261;

            svg {
              width: 22px;
              height: 22px;
              margin-right: 4px;
              filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.1));
            }
          }

          .rating-text {
            font-size: 1rem;
            font-weight: 600;
            color: #475047;
            letter-spacing: 0.01em;
          }
        }

        .zona-description {
          font-size: 1.05rem;
          line-height: 1.8;
          color: #444b41;
          font-weight: 400;
          max-width: 600px;
        }
      }
    }
  }

  .place-icon {
    width: 20px;
    height: 20px;
    vertical-align: middle;
    margin-right: 6px;
  }

  .star {
    cursor: pointer;
    font-size: 1.5rem;
    color: #ccc;
    background-color: transparent !important;
    border: none;
    padding: 0;
    margin: 0;
    line-height: 1;
    appearance: none;
    box-shadow: none !important;
    user-select: none;
    outline: none;
  }

  .star.filled {
    color: #f4a261;
  }

  .star:focus {
    outline: none;
    box-shadow: none !important;
    background-color: transparent !important;
  }

  .zona-reseñas {
    margin-top: 3rem;

    .reseñas-title {
      font-size: 1.5rem;
      color: var(--primary, #007b5f);
      margin-bottom: 1.2rem;
      font-weight: 600;
    }

    .reseña-list {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }

    .reseña-item {
      background: #fff;
      padding: 1.2rem;
      border-radius: 0.6rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

      .reseña-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: #333;
      }

      .reseña-stars {
        color: #f4a261;
      }

      .reseña-comentario {
        font-style: italic;
        color: #555;
        margin-bottom: 0.4rem;
      }

      .reseña-fecha {
        font-size: 0.9rem;
        color: #888;
      }

      .reseña-acciones {
        margin-top: 0.6rem;

        button {
          font-size: 0.9rem;
          font-weight: 600;
          padding: 0.3rem 0.8rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s ease;
          margin-right: 0.5rem;
          color: white;
        }

        .edit {
          background-color: #f0ad4e;

          &:hover {
            background-color: #ec9e2f;
          }
        }

        .delete {
          background-color: #dc3545;

          &:hover {
            background-color: #bb2d3b;
          }
        }
      }
    }

    .no-reseñas {
      font-size: 1rem;
      color: #666;
      text-align: center;
    }
  }

  .reseña-form {
    margin-top: 2.5rem;
    background: #fff;
    padding: 1.8rem 2rem;
    border-radius: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid #ddd;

    h3 {
      color: var(--primary, #007b5f);
      font-size: 1.4rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    form {
      display: flex;
      flex-direction: column;
    }

    label {
      font-weight: 600;
      margin-bottom: 0.4rem;
      color: #444;
    }

    select,
    textarea {
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 0.7rem 1rem;
      font-size: 1rem;
      font-family: inherit;
      margin-bottom: 1.2rem;
      transition: border-color 0.2s ease;
    }

    select:focus,
    textarea:focus {
      outline: none;
      border-color: var(--primary, #007b5f);
      box-shadow: 0 0 6px #cceee5;
    }

    textarea {
      min-height: 100px;
      resize: vertical;
    }

    .btn-primary {
      background-color: var(--primary, #007b5f);
      color: white;
      padding: 0.8rem 1.4rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s ease;
      width: fit-content;

      &:hover {
        background-color: #005c46;
      }
    }
  }
  .botones {
    display: flex;
    gap: 0.8rem;
    margin-top: 1rem;

    button {
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s ease;
      min-width: 100px;
      text-align: center;
    }

    .btn-primary {
      background-color: var(--primary, #007b5f);
      color: white;

      &:hover:not(:disabled) {
        background-color: #005c46;
      }

      &:disabled {
        background-color: #a5c9b5;
        cursor: not-allowed;
      }
    }

    .btn-danger {
      background-color: #dc3545;
      color: white;

      &:hover {
        background-color: #bb2d3b;
      }
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;

      &:hover {
        background-color: #565e64;
      }
    }
  }

  .zona-cta {
    margin-top: 3rem;
    text-align: center;
    background: #f8f9fa;
    padding: 2rem;
    border-radius: 0.6rem;

    p {
      font-size: 1.1rem;
      margin-bottom: 1rem;
      color: #333;
    }

    .btn-accion {
      display: inline-block;
      margin: 0.5rem;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      text-decoration: none;
      transition: background-color 0.3s ease;

      &.outline {
        border: 2px solid var(--primary, #007b5f);
        color: var(--primary, #007b5f);
        background: transparent;

        &:hover {
          background: #e6f4f1;
        }
      }

      &:not(.outline) {
        background-color: var(--primary, #007b5f);
        color: white;

        &:hover {
          background-color: #005c46;
        }
      }
    }
  }

  @media (max-width: 480px) {
    .zona-title {
      font-size: 1.5rem;
    }

    .zona-info {
      padding: 1.2rem !important;
    }

    .zona-description {
      font-size: 0.95rem;
    }

    .reseñas-title {
      font-size: 1.3rem;
    }

    .reseña-header {
      flex-direction: column;
      align-items: flex-start !important;
    }

    .btn-accion {
      width: 100%;
      max-width: 300px;
    }

    .reseña-form {
      padding: 1rem 1.2rem;
    }

    .reseña-form .btn-primary {
      width: 100%;
    }
  }
</style>
