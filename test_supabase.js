const url = 'https://uutbuvbyexjsjtwcnzntn.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1dGJ1dnlieGpzY2p0d2NuenRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMjMzMjIsImV4cCI6MjA5ODU5OTMyMn0.3BZlt1pJ4JLypq8HmAizCUQk6Jz7LINmfGiQRGxJgIo';

console.log('Testando conexão com Supabase...');
fetch(`${url}/rest/v1/usuarios?select=count`, {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
})
.then(async res => {
  console.log('Status HTTP:', res.status);
  const text = await res.text();
  console.log('Resposta:', text);
})
.catch(err => {
  console.error('Erro na conexão:', err);
});
