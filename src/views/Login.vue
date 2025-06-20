<template>
  <div class="auth-container">
    <h2 class="title">{{ showForgot ? 'Recuperar ' : 'Iniciar sesión' }}</h2>

    <form @submit.prevent="login" class="form" v-if="!showForgot">
      <div class="input-group">
        <label for="username">Nombre de usuario</label>
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="Ingresa el usuario"
          required
          autocomplete="username"
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
          autocomplete="current-password"
        />
      </div>

      <button type="submit" :disabled="loading" class="btn-primary">
        {{ loading ? 'Iniciando...' : 'Entrar' }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
      <p class="forgot-link" @click="showForgot = true">Olvidé mi contraseña</p>
    </form>

    <form @submit.prevent="submitForgot" class="form" v-else>
      <div class="input-group">
        <label for="email">Correo electrónico</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="Ingresa tu correo"
          required
          autocomplete="email"
        />
      </div>

      <button type="submit" :disabled="loading" class="btn-primary">
        {{ loading ? 'Enviando...' : 'Enviar' }}
      </button>

      <p v-if="forgotMessage" class="success">{{ forgotMessage }}</p>
      <p v-if="error" class="error">{{ error }}</p>
      <p class="forgot-link" @click="showForgot = false">
        Volver a iniciar sesión
      </p>
    </form>

    <p class="register-text">
      ¿No tienes cuenta?
      <router-link to="/register" class="link">Regístrate aquí</router-link>
    </p>
  </div>
</template>

<script setup>
  import { ref, onBeforeMount } from 'vue';
  import api from '../services/api';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const username = ref('');
  const password = ref('');
  const email = ref('');
  const loading = ref(false);
  const error = ref('');
  const forgotMessage = ref('');
  const showForgot = ref(false);

  const login = async () => {
    error.value = '';
    loading.value = true;
    try {
      const response = await api.post('/auth/login', {
        username: username.value,
        password: password.value,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.user.role);
      localStorage.setItem('username', response.data.user.username);

      if (response.data.user.id) {
        localStorage.setItem('userId', response.data.user.id);
      }

      window.dispatchEvent(new Event('login-update'));
      alert('Inicio de sesión exitoso');

      const previousRoute = localStorage.getItem('preLoginRoute') || '/';
      localStorage.removeItem('preLoginRoute');
      router.push(previousRoute);
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      error.value = err.response?.data?.message || 'Error al iniciar sesión';
    } finally {
      loading.value = false;
    }
  };

  const submitForgot = async () => {
    error.value = '';
    forgotMessage.value = '';
    loading.value = true;
    try {
      const response = await api.post('/auth/forgot-password', {
        email: email.value,
      });
      forgotMessage.value = 'Espera la confirmación por correo';
    } catch (err) {
      console.error('Error en recuperar contraseña:', err);
      error.value =
        err.response?.data?.message || 'No se pudo enviar el correo';
    } finally {
      loading.value = false;
    }
  };

  onBeforeMount(() => {
    const from =
      router.currentRoute.value?.query?.redirect ||
      router.options.history.state.back;
    if (from && from !== '/login') {
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

  .success {
    color: #2a9d8f;
    font-weight: 600;
    margin-top: 1rem;
    text-align: center;
  }

  .forgot-link {
    margin-top: 1rem;
    color: var(--primary-color, #007b5f);
    text-align: center;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    text-decoration: underline;

    &:hover {
      filter: brightness(0.9);
    }
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
