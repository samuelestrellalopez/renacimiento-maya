<template>
  <header class="header">
    <nav>
      <router-link to="/" class="logo">
        <span class="renacimiento">Renacimiento</span>
        <span class="maya"> Maya</span>
      </router-link>

      <ul class="nav-links">
        <li v-if="!isLoggedIn">
          <router-link to="/login" class="login-link">
            <svg class="icon-persona" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 12c2.67 0 8 1.34 8 4v2h-16v-2c0-2.66 5.33-4 8-4zm0-2a4 4 0 100-8 4 4 0 000 8z"
              />
            </svg>
            Ingresa
          </router-link>
        </li>
        <li v-else>
          <button class="login-link" @click="drawerOpen = true">
            <svg class="icon-persona" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 12c2.67 0 8 1.34 8 4v2h-16v-2c0-2.66 5.33-4 8-4zm0-2a4 4 0 100-8 4 4 0 000 8z"
              />
            </svg>
            Mi cuenta
          </button>
        </li>
      </ul>
    </nav>
    <AccountDrawer v-model:open="drawerOpen" />
  </header>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import AccountDrawer from '../components/Drawer.vue';

  const drawerOpen = ref(false);
  const isLoggedIn = ref(!!localStorage.getItem('token'));

  const updateLoginStatus = () => {
    isLoggedIn.value = !!localStorage.getItem('token');
  };

  onMounted(() => {
    window.addEventListener('login-update', updateLoginStatus);
    window.addEventListener('storage', updateLoginStatus); 
  });

  onBeforeUnmount(() => {
    window.removeEventListener('login-update', updateLoginStatus);
    window.removeEventListener('storage', updateLoginStatus);
  });
</script>

<style scoped lang="scss">
  @use 'sass:color';

  .header {
    background-color: var(--primary-color, #007b5f);
    padding: 1rem 2rem;
    color: white;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

    nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1rem;

      @media (max-width: 600px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }

    .logo {
      text-decoration: none;
      font-weight: bold;
      font-size: 1.6rem;
      font-family: 'Poppins', sans-serif;
      cursor: pointer;
      user-select: none;

      .renacimiento {
        color: #ffffff; /* Verde */
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.25);
      }

      .maya {
        color: #cfffab; /* Rojo anaranjado */
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.25);
      }
    }

    .nav-links {
      list-style: none;
      display: flex;
      align-items: center;
      gap: 1.2rem;
      margin-right: -0.5rem;

      @media (max-width: 600px) {
        width: 100%;
        justify-content: flex-end;
        margin-right: 0;
      }

      li {
        .login-link {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: white;
          text-decoration: none;
          font-weight: 500;
          font-size: 1rem;
          transition: color 0.3s;
          background: none;
          border: none;
          cursor: pointer;

          svg.icon-persona {
            width: 20px;
            height: 20px;
            fill: white;
            transition: fill 0.3s;
          }

          &:hover {
            color: color.adjust(#ffffff, $lightness: -20%);
            svg.icon-persona {
              fill: color.adjust(#ffffff, $lightness: -20%);
            }
          }

          &.login-link:is(button) {
            all: unset;
            display: flex;
            align-items: center;
            gap: 0.4rem;
            color: white;
            font-weight: 500;
            font-size: 1rem;
            cursor: pointer;
          }
        }
      }
    }
  }
</style>
