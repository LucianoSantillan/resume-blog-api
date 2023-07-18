import express, { Request, Response } from 'express';
import cors from 'cors';
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Article } from './entity/article';
import dotenv from 'dotenv';
import * as yup from 'yup';
import { User } from './entity/user';
import jwt from 'jsonwebtoken';
import { authenticate } from './middlewares/authenticate';


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
      res.json(article);
    });

    app.get('/articles', async (req: Request, res: Response) => {
      let { page, pageSize } = req.query;
      let _page = Number(page) || 1;
      let _pageSize = Number(pageSize) || 100; // default pageSize to 100 if not provided

      const articleRepository = dataSource.getRepository(Article);

      const articles = await articleRepository.find({
        skip: (_page - 1) * _pageSize,
        take: _pageSize
      });

      res.json(articles);
    });

    const articleSchema = yup.object().shape({
      title: yup.string().required(),
      description: yup.string().required(),
    });

    app.post('/articles', authenticate, async (req, res) => {
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

    app.post('/login', async (req, res) => {
      const userRepository = dataSource.getRepository(User);
      const { username, password } = req.body;
      const user = await userRepository.findOne({ where: { username } });
      if ((!user) || (password !== user.password)) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }
      const token = jwt.sign({ userId: user.id }, 'secret');
      res.json({ token });
    });

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch((error) => console.log(error))