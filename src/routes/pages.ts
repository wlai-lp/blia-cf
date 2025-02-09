import { Context } from 'hono';
import { DashboardStep1Template } from '../templates/payment-step1';
import { DashboardStep2Template } from '../templates/payment-step2';

export function getDashboard(c: Context) {
  return c.html(DashboardStep1Template(new Date().toISOString().split("T")[0], new Date().getFullYear()));
}

// export function getDashboard2(c: Context) {
//   return c.html(DashboardStep2Template(new Date().toISOString().split("T")[0]));
// }

export function getProfile(c: Context) {
  return c.text('This is your profile page.');
}
