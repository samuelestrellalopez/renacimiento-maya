<template>
  <div class="auth-container">
    <h2 class="title">Registro de usuario</h2>
    <form @submit.prevent="register" class="form">
      <div class="input-group">
        <label for="username">Usuario</label>
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="Nombre de usuario"
          required
          autocomplete="username"
        />
      </div>

      <div class="input-group">
        <label for="email">Correo electrónico</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="ejemplo@correo.com"
          required
          autocomplete="email"
        />
      </div>

      <div class="input-group">
        <label for="password">Contraseña</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="********"
          required
          autocomplete="new-password"
        />
      </div>

      <button type="submit" :disabled="loading" class="btn-primary">
        {{ loading ? 'Registrando...' : 'Registrar' }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
    </form>

    <p class="register-text">
      ¿Ya tienes cuenta?
      <router-link to="/login" class="link">Inicia sesión</router-link>
    </p>
  </div>
</template>

<script setup>
  import { ref, onBeforeMount } from 'vue';
  import api from '../services/api';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const username = ref('');
  const email = ref('');
  const password = ref('');
  const loading = ref(false);
  const error = ref('');

  const register = async () => {
    error.value = '';
    loading.value = true;
    try {
      const response = await api.post('/auth/register', {
        username: username.value,
        email: email.value,
        password: password.value,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.user.role);
      localStorage.setItem('username', response.data.user.username);

      if (response.data.user.id) {
        localStorage.setItem('userId', response.data.user.id);
      }

      window.dispatchEvent(new Event('login-update'));

      alert('Registro exitoso');

      const previousRoute = localStorage.getItem('preLoginRoute') || '/';
      localStorage.removeItem('preLoginRoute');
      router.push(previousRoute);
    } catch (err) {
      console.error('Error al registrar:', err);
      error.value = err.response?.data?.message || 'Error al registrar';
    } finally {
      loading.value = false;
    }
  };

  onBeforeMount(() => {
    const from =
      router.currentRoute.value?.query?.redirect ||
      router.options.history.state.back;
    if (from && from !== '/register') {
      localStorage.setItem('preLoginRoute', from);
    }
  });
</script>

<style scoped lang="scss">
  .auth-container {
    max-width: 400px;
    margin: 4rem auto;
    background-color: white;
    border-radius: var(--radius, 0.5rem);
    box-shadow: var(--shadow, 0 4px 12px rgba(0, 0, 0, 0.1));
    padding: 2.5rem 2rem;
    display: flex;
    flex-direction: column;
    font-family: var(--font-family, 'Poppins', sans-serif);
  }

  .title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-color, #007b5f);
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

    label {
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--text-color, #333);
    }

    input {
      padding: 0.6rem 1rem;
      font-size: 1rem;
      border: 1.5px solid #ccc;
      border-radius: var(--radius, 0.5rem);
      transition: border-color 0.3s ease;

      &:focus {
        border-color: var(--primary-color, #007b5f);
        outline: none;
        box-shadow: 0 0 6px rgba(0, 123, 95, 0.4);
      }
    }
  }

  .btn-primary {
    width: 100%;
    padding: 0.75rem;
    font-size: 1.1rem;
    background-color: var(--primary-color, #007b5f);
    border: none;
    border-radius: var(--radius, 0.5rem);
    color: white;
    font-weight: 700;
    cursor: pointer;
    box-shadow: var(--shadow, 0 4px 10px rgba(0, 0, 0, 0.15));
    transition: filter 0.3s ease;

    &:hover:not(:disabled) {
      filter: brightness(0.9);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  .error {
    color: #e76f51;
    font-weight: 600;
    margin-top: 1rem;
    text-align: center;
  }

  .register-text {
    margin-top: 1.8rem;
    font-size: 0.95rem;
    color: var(--text-color, #555);
    text-align: center;

    .link {
      color: var(--primary-color, #007b5f);
      font-weight: 600;
      text-decoration: underline;
      cursor: pointer;

      &:hover {
        filter: brightness(0.9);
      }
    }
  }
</style>
