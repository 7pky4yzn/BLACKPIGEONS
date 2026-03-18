import http from 'http';

http.get('http://localhost:3000/src/assets/database.xlsx', (res) => {
  console.log('Status:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
  
  let data = [];
  res.on('data', chunk => data.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(data);
    console.log('Size:', buffer.length);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
