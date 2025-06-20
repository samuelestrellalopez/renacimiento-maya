<template>
  <div class="auth-container">
    <h2 class="title">Nueva contraseña</h2>

    <form @submit.prevent="submitReset" class="form">
      <div class="input-group">
        <label for="password">Nueva contraseña</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Nueva contraseña"
          required
        />
      </div>

      <div class="input-group">
        <label for="confirm">Confirmar contraseña</label>
        <input
          id="confirm"
          v-model="confirm"
          type="password"
          placeholder="Confirma la contraseña"
          required
        />
      </div>

      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Restableciendo...' : 'Guardar nueva contraseña' }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">
        Contraseña actualizada. Redirigiendo...
      </p>
    </form>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import api from '../services/api';

  const route = useRoute();
  const router = useRouter();
  const token = route.params.token;

  const password = ref('');
  const confirm = ref('');
  const error = ref('');
  const loading = ref(false);
  const success = ref(false);

  const submitReset = async () => {
    error.value = '';
    if (password.value !== confirm.value) {
      error.value = 'Las contraseñas no coinciden';
      return;
    }

    loading.value = true;
    try {
      console.log('Enviando solicitud para restablecer la contraseña...');
      const response = await api.post(`/auth/reset-password/${token}`, {
        password: password.value,
      });
      console.log('Respuesta del servidor:', response);

      if (response.status === 200) {
        success.value = true;
        error.value = '';
        console.log('Contraseña restablecida. Redirigiendo...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        console.error('Error al restablecer la contraseña:', response.data);
        error.value =
          'No se pudo restablecer la contraseña. Intenta nuevamente.';
      }
    } catch (err) {
      console.error('Error en la solicitud:', err);
      if (err.response) {
        console.error('Detalles del error:', err.response.data);
        error.value =
          err.response.data.message || 'Error al restablecer contraseña';
      } else {
        error.value = 'Error al conectar con el servidor. Intenta nuevamente.';
      }
    } finally {
      loading.value = false;
    }
  };
</script>

<style scoped>
  .auth-container {
    max-width: 400px;
    margin: 4rem auto;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 2.5rem 2rem;
    display: flex;
    flex-direction: column;
    font-family: 'Poppins', sans-serif;
  }

  .title {
    font-size: 2rem;
    font-weight: 700;
    color: #007b5f;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .form {
    width: 100%;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 1.25rem;
  }

  label {
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;
  }

  input {
    padding: 0.6rem 1rem;
    font-size: 1rem;
    border: 1.5px solid #ccc;
    border-radius: 0.5rem;
    transition: border-color 0.3s ease;
  }

  input:focus {
    border-color: #007b5f;
    outline: none;
    box-shadow: 0 0 6px rgba(0, 123, 95, 0.4);
  }

  .btn-primary {
    width: 100%;
    padding: 0.75rem;
    font-size: 1.1rem;
    background-color: #007b5f;
    border: none;
    border-radius: 0.5rem;
    color: white;
    font-weight: 700;
    cursor: pointer;
    transition: filter 0.3s ease;
  }

  .btn-primary:hover:not(:disabled) {
    filter: brightness(0.9);
  }

  .error {
    color: #e76f51;
    font-weight: 600;
    margin-top: 1rem;
    text-align: center;
  }

  .success {
    color: #2a9d8f;
    font-weight: 600;
    margin-top: 1rem;
    text-align: center;
  }
</style>
