import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import { DataSource, createConnection } from "typeorm";
import { Article } from './entity/article';
import dotenv from 'dotenv';

dotenv.config();

//TEST ENVIRONMENT VARIABLES BEFORE USING THEM

const AppDataSource = new DataSource({
  "type": "mysql",
  "host": process.env.DB_HOST,
  "port": parseInt(process.env.DB_PORT || "0"),
  "username": "root",
  "password": process.env.DB_PASSWORD,
  "database": "blog",
  "synchronize": true,
  "logging": false,
  "entities": [
    "src/entity/**/*.ts"
  ]
})

AppDataSource.initialize()
  .then((dataSource) => {
    const app = express();
    app.use(cors());

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

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch((error) => console.log(error))