let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome from showing the default install prompt
  e.preventDefault();
  deferredPrompt = e;

  // Show a custom install button or alert
  const installAlert = confirm("Do you want to install MangaNest as an app?");
  if (installAlert) {
    deferredPrompt.prompt(); // Show the install prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install');
      } else {
        console.log('User dismissed the PWA install');
      }
      deferredPrompt = null;
    });
  }
});
