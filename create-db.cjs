const XLSX = require('xlsx');
const fs = require('fs');

const data = [
  { Title: 'Physics Chapter 1 Notes', Date: '2023-10-25', Size: 2.5, Type: 'PDF', Link: 'https://example.com/physics.pdf' },
  { Title: 'Math Mock Test 1', Date: '2023-10-26', Size: 1.2, Type: 'ZIP', Link: 'https://example.com/math.zip' },
  { Title: 'Chemistry DPP 5', Date: '2023-10-27', Size: 0.8, Type: 'DOCX', Link: 'https://example.com/chem.docx' }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

XLSX.writeFile(wb, 'public/database.xlsx');
console.log('Created public/database.xlsx');
