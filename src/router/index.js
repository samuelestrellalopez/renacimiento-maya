import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Events from '../views/Events.vue';
import DetailEvents from '../views/DetailEvents.vue';
import AdminCreateZone from '../views/AdminCreateZone.vue';
import SavedAreas from '../views/SavedAreas.vue';
import ResetPassword from '../views/ResetPassword.vue';

const routes = [
  { path: '/', name: 'Events', component: Events },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/details/:id', name: 'DetailEvents', component: DetailEvents },
  { path: '/create-zone', name: 'AdminCreateZone', component: AdminCreateZone },
  { path: '/saved-zone', name: 'SavedAreas', component: SavedAreas },
  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: ResetPassword,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const isAuth = !!token;

  if (
    isAuth &&
    (to.name === 'Login' ||
      to.name === 'Register' ||
      to.name === 'ResetPassword')
  ) {
    return next('/');
  }

  const adminOnlyPaths = ['/create-zone'];
  const userOnlyPaths = ['/saved-zone'];

  if (adminOnlyPaths.includes(to.path) && (!isAuth || role !== 'admin')) {
    return next('/');
  }

  if (userOnlyPaths.includes(to.path) && (!isAuth || role !== 'user')) {
    return next('/');
  }

  next();
});

export function checkAuthAndRedirect() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const currentPath = router.currentRoute.value.path;

  const adminOnlyPaths = ['/create-zone'];
  const userOnlyPaths = ['/saved-zone'];

  if (
    (adminOnlyPaths.includes(currentPath) && (!token || role !== 'admin')) ||
    (userOnlyPaths.includes(currentPath) && (!token || role !== 'user'))
  ) {
    router.push('/');
  }
}

export default router;
