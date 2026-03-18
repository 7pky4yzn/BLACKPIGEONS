import http from 'http';

http.get('http://localhost:3000/src/pages/Home.tsx', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data.substring(1000, 2000));
  });
});
