// service-worker.js

// Called when the service worker is installed
self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
  self.skipWaiting(); // Activate immediately
});

// Called when the service worker is activated
self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  self.clients.claim(); // Take control of pages immediately
});

// Fetch handler (just pass all requests to network)
self.addEventListener("fetch", (event) => {
  // No caching, online-only PWA
});