// Service Worker for Push Notifications

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated.');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Push message received:', event);

  let notificationData = {
    title: 'Meu Jardim',
    body: 'Você tem uma nova notificação',
    icon: '/favicon.png',
    badge: '/favicon.png',
    data: {
      url: '/',
    },
  };

  try {
    if (event.data) {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || data.message || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        data: {
          url: data.url || data.link || '/',
        },
      };
    }
  } catch (e) {
    console.error('Error parsing push data:', e);
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      vibrate: [100, 50, 100],
      requireInteraction: true,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
