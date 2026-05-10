const express = require('express');
const app = express();
const PORT = 3001;

app.get('/', (req, res) => {
  res.send('StudentHub API is running (separate from starlings-circle)');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`StudentHub server listening on port ${PORT}`);
});
