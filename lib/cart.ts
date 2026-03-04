import { Template } from './supabase';

export type CartItem = {
  product: Template;
  quantity: number;
};

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}

export function addToCart(template: Template, quantity: number = 1): void {
  const cart = getCart();
  const existingItem = cart.find(item => item.product.id === template.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ product: template, quantity });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
}

export function updateCartItemQuantity(templateId: string, quantity: number): void {
  const cart = getCart();
  const item = cart.find(item => item.product.id === templateId);

  if (item) {
    item.quantity = quantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  }
}

export function removeFromCart(templateId: string): void {
  const cart = getCart().filter(item => item.product.id !== templateId);
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
}

export function clearCart(): void {
  localStorage.removeItem('cart');
  window.dispatchEvent(new Event('cartUpdated'));
}

export function getCartTotal(): number {
  return getCart().reduce((total, item) => total + item.product.price * item.quantity, 0);
}

export function getCartItemCount(): number {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}
