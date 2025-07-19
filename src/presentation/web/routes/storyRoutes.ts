import { Router } from 'express';
import { StoryController } from '../../controllers/StoryController';
import { geminiMiddleware, RequestWithAI } from '../middleware/geminiMiddleware';
import { StoryGenerationService } from '../../../domain/services/StoryGenerationService';
import { CreateStoryUseCase } from '../../../application/use-cases/CreateStoryUseCase';
import { ContinueStoryUseCase } from '../../../application/use-cases/ContinueStoryUseCase';
import { GetStoryUseCase } from '../../../application/use-cases/GetStoryUseCase';

// Import repositories (will be passed from main)
let globalStoryRepository: any;
let globalCharacterRepository: any;

export function setGlobalRepositories(storyRepo: any, charRepo: any) {
  globalStoryRepository = storyRepo;
  globalCharacterRepository = charRepo;
}

function createDynamicStoryController(storyGenerationService: StoryGenerationService): StoryController {
  const createStoryUseCase = new CreateStoryUseCase(
    globalStoryRepository,
    globalCharacterRepository,
    storyGenerationService
  );
  const continueStoryUseCase = new ContinueStoryUseCase(
    globalStoryRepository,
    globalCharacterRepository,
    storyGenerationService
  );
  const getStoryUseCase = new GetStoryUseCase(globalStoryRepository);

  return new StoryController(
    createStoryUseCase,
    continueStoryUseCase,
    getStoryUseCase
  );
}

export function createStoryRoutes(storyController: StoryController): Router {
  const router = Router();

  router.post('/stories', geminiMiddleware, async (req: RequestWithAI, res) => {
    try {
      // Create a temporary controller with the dynamic AI service
      if (!req.storyGenerationService) {
        return res.status(500).json({ error: 'AI service not initialized' });
      }
      
      const dynamicStoryController = createDynamicStoryController(req.storyGenerationService);
      const story = await dynamicStoryController.createStory(req.body);
      res.status(201).json(story);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  router.get('/stories', async (req, res) => {
    try {
      const stories = await storyController.getAllStories();
      res.json(stories);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  router.get('/stories/active', async (req, res) => {
    try {
      const stories = await storyController.getActiveStories();
      res.json(stories);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  router.get('/stories/:id', async (req, res) => {
    try {
      const story = await storyController.getStory(req.params.id);
      res.json(story);
    } catch (error) {
      res.status(404).json({ 
        error: error instanceof Error ? error.message : 'Story not found' 
      });
    }
  });

  router.get('/stories/character/:characterId', async (req, res) => {
    try {
      const stories = await storyController.getStoriesByCharacter(req.params.characterId);
      res.json(stories);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  router.post('/stories/:id/continue', geminiMiddleware, async (req: RequestWithAI, res) => {
    try {
      if (!req.storyGenerationService) {
        return res.status(500).json({ error: 'AI service not initialized' });
      }
      
      const dynamicStoryController = createDynamicStoryController(req.storyGenerationService);
      
      const continueDto = {
        storyId: req.params.id,
        selectedOption: req.body.selectedOption,
        customAction: req.body.customAction
      };
      
      const story = await dynamicStoryController.continueStory(continueDto);
      res.json(story);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  return router;
}