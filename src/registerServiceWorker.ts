// সার্ভিস ওয়ার্কার সফলভাবে রেজিস্টার করার ইউটিলিটি
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('PWA ServiceWorker registered with scope:', registration.scope);

          // নতুন আপডেট আসলে স্বয়ংক্রিয়ভাবে চেক
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('নতুন আপডেট পাওয়া গেছে, অ্যাপটি রিলোড করতে পারেন।');
                  } else {
                    console.log('অ্যাপটি অফলাইনে ব্যবহারের জন্য সফলভাবে ক্যাশ হয়েছে।');
                  }
                }
              };
            }
          };
        })
        .catch((error) => {
          console.error('ServiceWorker registration failed:', error);
        });
    });
  }
}
