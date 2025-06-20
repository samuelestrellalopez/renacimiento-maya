<template>
  <div
    class="drawer-overlay"
    :class="{ visible: open }"
    @click.self="emitClose"
  >
    <transition name="slide-fade">
      <aside v-if="open" class="drawer">
        <button class="close-btn" @click="emitClose">✕</button>

        <div class="welcome">
          <p class="greeting">¡Bienvenido de vuelta!</p>
          <h2 class="username">
            {{ userName || 'Invitado' }}
          </h2>
          <p class="role" v-if="userRole">
            Cuenta de {{ userRole === 'admin' ? 'Administrador' : 'Usuario' }}
          </p>
          <p class="role" v-else>No has iniciado sesión</p>
        </div>

        <div class="menu-item" @click="goTo('')">
          <img src="./img/home.png" alt="Inicio" class="icon-img" />
          <span class="label">Inicio</span>
          <span class="arrow">›</span>
        </div>
        <hr />

        <div
          v-if="isLoggedIn && userRole === 'user'"
          class="menu-item"
          @click="goTo('saved-zone')"
        >
          <img src="./img/zona.png" alt="Zonas guardadas" class="icon-img" />
          <span class="label">Zonas guardadas</span>
          <span class="arrow">›</span>
        </div>
        <hr v-if="isLoggedIn && userRole === 'user'" />

        <div
          v-if="isLoggedIn && userRole === 'admin'"
          class="menu-item"
          @click="goTo('create-zone')"
        >
          <img src="./img/zona.png" alt="Crear zona" class="icon-img" />
          <span class="label">Crear Zona</span>
          <span class="arrow">›</span>
        </div>
        <hr v-if="isLoggedIn && userRole === 'admin'" />

        <div v-if="isLoggedIn" class="menu-item" @click="logout">
          <img src="./img/cerrar.png" alt="Cerrar sesión" class="icon-img" />
          <span class="label">Cerrar sesión</span>
        </div>
        <hr />
      </aside>
    </transition>
  </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { useRouter } from 'vue-router';

  const props = defineProps({ open: Boolean });
  const emit = defineEmits(['update:open']);

  const emitClose = () => emit('update:open', false);

  const userName = ref('');
  const userRole = ref('');
  const isLoggedIn = ref(false);

  const router = useRouter();

  const updateUserData = () => {
    const token = localStorage.getItem('token');
    if (token) {
      isLoggedIn.value = true;
      userName.value = localStorage.getItem('username') || '';
      userRole.value = localStorage.getItem('role') || '';
    } else {
      isLoggedIn.value = false;
      userName.value = '';
      userRole.value = '';
    }
  };

  const logout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event('login-update'));
    updateUserData();
    emitClose();
  };

  const goTo = (route) => {
    emitClose();
    router.push(`/${route}`);
  };

  onMounted(() => {
    updateUserData();
    window.addEventListener('login-update', updateUserData);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('login-update', updateUserData);
  });
</script>

<style scoped>
  .drawer-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 999;
    display: flex;
    justify-content: flex-end;

    /* Oculto por defecto */
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .drawer-overlay.visible {
    opacity: 1;
    pointer-events: auto;
  }

  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.3s ease;
  }
  .slide-fade-enter-from,
  .slide-fade-leave-to {
    opacity: 0;
    transform: translateX(100%);
  }

  .drawer {
    width: 340px;
    background: white;
    height: 100%;
    padding: 1rem 1.5rem;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.05);
    overflow-y: auto;
    font-family: 'Poppins', sans-serif;
    position: relative;
  }

  .close-btn {
    all: unset;
    font-size: 1.8rem;
    color: #007b5f;
    cursor: pointer;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .welcome {
    margin: 1.5rem 0 2rem;
  }

  .greeting {
    font-size: 0.95rem;
    color: #666;
    margin-bottom: 0.2rem;
  }

  .username {
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0;
  }

  .role {
    font-size: 0.85rem;
    color: #888;
    margin-top: 0.2rem;
  }

  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .menu-item:hover {
    background: #f5f5f5;
    border-radius: 8px;
  }

  .icon-img {
    width: 24px;
    height: 24px;
    margin-right: 10px;
    object-fit: contain;
  }

  .label {
    flex-grow: 1;
    font-weight: 500;
    color: #222;
  }

  .arrow {
    color: #3366cc;
    font-size: 1.1rem;
  }

  hr {
    border: none;
    border-top: 1px solid #e0e0e0;
    margin: 0;
  }
</style>
