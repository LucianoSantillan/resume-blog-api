import express from 'express';
import articles from './articles';
import cors from 'cors';

const app = express();
app.use(cors());

const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/articles', (req, res) => {
  res.json(articles);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
