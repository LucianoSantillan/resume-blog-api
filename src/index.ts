import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Article } from './entity/article';
import dotenv from 'dotenv';
import * as yup from 'yup';

const app = express();

app.use(express.json());
app.use(cors());

dotenv.config();

const envSchema = yup.object().shape({
  DB_HOST: yup.string().required(),
  DB_PORT: yup.number().integer().required(),
  DB_USERNAME: yup.string().required(),
  DB_PASSWORD: yup.string().required(),
  DB_DATABASE: yup.string().required(),
});

const { DB_PORT, DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = envSchema.validateSync(process.env);

const AppDataSource = new DataSource({
  "type": "mysql",
  "host": DB_HOST,
  "port": DB_PORT,
  "username": DB_USERNAME,
  "password": DB_PASSWORD,
  "database": DB_DATABASE,
  "synchronize": true,
  "logging": false,
  "entities": [
    "src/entity/**/*.ts"
  ]
})

AppDataSource.initialize()
  .then((dataSource) => {

    const port = 3001;

    app.get('/', (req, res) => {
      res.send('Hello World!');
    });

    app.get('/articles/:id', async (req, res) => {
      const articleRepository = dataSource.getRepository(Article);
      const article = await articleRepository.findOne({ where: { id: parseInt(req.params.id) } });
      console.log(article)
      res.json(article);
    });

    app.get('/articles', async (req, res) => {
      const articleRepository = dataSource.getRepository(Article);
      const articles = await articleRepository.find();
      res.json(articles);
    });

    const articleSchema = yup.object().shape({
      title: yup.string().required(),
      description: yup.string().required(),
    });

    app.post('/articles', async (req, res) => {
      const articleRepository = dataSource.getRepository(Article);
      try {
        articleSchema.validateSync(req.body);
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          res.status(400).json({ errors: error.errors });
        } else {
          console.error(error);
          res.status(500)
        }
        return;
      }
      const { title, description } = req.body;
      const article = articleRepository.create({ title, description });
      await articleRepository.save(article);
      res.json(article);
    });

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch((error) => console.log(error))