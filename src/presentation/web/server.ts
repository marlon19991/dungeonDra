import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { CharacterController } from '../controllers/CharacterController';
import { StoryController } from '../controllers/StoryController';
import { createCharacterRoutes } from './routes/characterRoutes';
import { createStoryRoutes } from './routes/storyRoutes';

export class WebServer {
  private app: express.Application;
  private port: number;

  constructor(
    private characterController: CharacterController,
    private storyController: StoryController,
    port: number = 3000
  ) {
    this.app = express();
    this.port = port;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupStaticFiles();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(morgan('combined'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    const characterRoutes = createCharacterRoutes(this.characterController);
    const storyRoutes = createStoryRoutes(this.storyController);
    
    this.app.use('/api', characterRoutes);
    this.app.use('/api', storyRoutes);

    this.app.get('/api/health', (req, res) => {
      res.json({ status: 'OK', message: 'D&D Game API is running' });
    });

    this.app.get('/api/character-classes', (req, res) => {
      const classes = [
        'fighter', 'wizard', 'rogue', 'cleric', 'ranger', 'barbarian',
        'bard', 'druid', 'monk', 'paladin', 'sorcerer', 'warlock'
      ];
      res.json(classes);
    });

  }

  private setupStaticFiles(): void {
    const publicPath = path.join(__dirname, '../../../public');
    this.app.use(express.static(publicPath));

    this.app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(publicPath, 'index.html'));
      }
    });
  }

  start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        console.log(`🌐 D&D Game server running on http://localhost:${this.port}`);
        console.log(`📡 API available at http://localhost:${this.port}/api`);
        resolve();
      });
    });
  }

  getApp(): express.Application {
    return this.app;
  }
}