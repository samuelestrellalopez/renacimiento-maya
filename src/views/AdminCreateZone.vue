<template>
  <section class="admin-section">
    <div class="admin-header">
      <h2 class="title">Agregar Nueva Zona Turística</h2>
      <p class="subtitle">
        Completa el formulario para registrar una nueva zona en el sistema
      </p>
    </div>

    <form class="zone-form" @submit.prevent="submitForm">
      <div class="form-group">
        <label for="name">Nombre de la zona</label>
        <input
          v-model="zone.name"
          type="text"
          id="name"
          required
          placeholder="Ej. Chichén Itzá"
        />
      </div>

      <div class="form-group">
        <label for="municipality">Municipio</label>
        <input
          v-model="zone.municipality"
          type="text"
          id="municipality"
          required
          placeholder="Ej. Tinum"
        />
      </div>

      <div class="form-group">
        <label for="description">Descripción</label>
        <textarea
          v-model="zone.description"
          id="description"
          rows="4"
          required
          placeholder="Describe la zona turística..."
        ></textarea>
      </div>

      <div class="form-group">
        <label for="image">Imagen de la zona</label>
        <input
          type="file"
          @change="handleImageUpload"
          id="image"
          accept="image/*"
        />
        <p v-if="zone.imageName" class="image-preview">
          Imagen seleccionada: {{ zone.imageName }}
        </p>
      </div>

      <button type="submit" class="submit-btn">Guardar Zona</button>
    </form>
  </section>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { useRouter } from 'vue-router';
  import api from '../services/api';

  const router = useRouter();

  const zone = ref({
    name: '',
    municipality: '',
    description: '',
    imageFile: null,
    imageName: '',
  });

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'admin') {
      router.push('/');
      return false;
    }
    return true;
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      zone.value.imageFile = file;
      zone.value.imageName = file.name;
    }
  };

  const submitForm = async () => {
    if (!zone.value.imageFile) {
      alert('Selecciona una imagen');
      return;
    }

    const formData = new FormData();
    formData.append('name', zone.value.name);
    formData.append('municipality', zone.value.municipality);
    formData.append('description', zone.value.description);
    formData.append('image', zone.value.imageFile);

    try {
      const response = await api.post('/zones', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Zona registrada exitosamente');
      router.push('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Error al registrar la zona');
    }
  };

  onMounted(() => {
    checkAuth();
    window.addEventListener('login-update', checkAuth);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('login-update', checkAuth);
  });
</script>

<style scoped lang="scss">
  .admin-section {
    max-width: 720px;
    margin: 3rem auto;
    padding: 2rem 1.5rem;
    font-family: var(--font-family, 'Poppins', sans-serif);
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  }

  .admin-header {
    text-align: center;
    margin-bottom: 2rem;

    .title {
      font-size: 1.9rem;
      color: var(--primary, #007b5f);
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #666;
      font-size: 1.05rem;
    }
  }

  .zone-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    .form-group {
      display: flex;
      flex-direction: column;

      label {
        font-weight: 600;
        color: #333;
        margin-bottom: 0.5rem;
      }

      input[type='text'],
      input[type='file'],
      textarea {
        padding: 0.75rem 1rem;
        font-size: 1rem;
        border: 1.8px solid #ccc;
        border-radius: 8px;
        transition: border-color 0.3s ease;
        font-family: inherit;

        &:focus {
          border-color: var(--primary, #007b5f);
          outline: none;
          box-shadow: 0 0 6px rgba(0, 123, 95, 0.2);
        }
      }

      textarea {
        resize: vertical;
        min-height: 120px;
        line-height: 1.5;
      }

      .image-preview {
        margin-top: 0.4rem;
        font-size: 0.95rem;
        color: #555;
      }
    }

    .submit-btn {
      background-color: var(--primary, #007b5f);
      color: white;
      font-size: 1.05rem;
      font-weight: 600;
      padding: 0.85rem 1.5rem;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: background-color 0.25s ease;

      &:hover {
        background-color: #005c46;
      }
    }
  }

  @media (max-width: 600px) {
    .admin-section {
      padding: 1rem;
    }

    .admin-header .title {
      font-size: 1.6rem;
    }

    .zone-form .submit-btn {
      width: 100%;
    }
  }
</style>
