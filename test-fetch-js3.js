import http from 'http';

http.get('http://localhost:3000/src/assets/database.xlsx?import&url', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data);
  });
});
