/* جعبه ویدیو — service worker: پوسته‌ی برنامه رو کش می‌کنه تا بدون اینترنت باز بشه */
var CACHE = 'videobox-v1';
var SHELL = ['./', './index.html'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

/* اول از کش جواب بده (سریع و آفلاین)، همزمان نسخه‌ی تازه رو بگیر تا دفعه‌ی بعد جایگزین بشه */
self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET'){ return; }
  var url = new URL(req.url);
  if(url.origin !== self.location.origin){ return; }
  var key = req.mode === 'navigate' ? './index.html' : req;
  e.respondWith(
    caches.open(CACHE).then(function(cache){
      return cache.match(key, {ignoreSearch: true}).then(function(hit){
        var net = fetch(req).then(function(res){
          if(res && res.ok){ cache.put(key, res.clone()); }
          return res;
        }).catch(function(){ return hit; });
        return hit || net;
      });
    })
  );
});
