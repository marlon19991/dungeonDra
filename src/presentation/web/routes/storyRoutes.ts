import { Router } from 'express';
import { StoryController } from '../../controllers/StoryController';
import { geminiMiddleware, RequestWithAI } from '../middleware/geminiMiddleware';

export function createStoryRoutes(storyController: StoryController): Router {
  const router = Router();

  router.post('/stories', geminiMiddleware, async (req: RequestWithAI, res) => {
    try {
      // Pass the dynamic AI service to the controller
      const story = await storyController.createStory(req.body);
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
      const continueDto = {
        storyId: req.params.id,
        selectedOption: req.body.selectedOption,
        customAction: req.body.customAction
      };
      
      const story = await storyController.continueStory(continueDto);
      res.json(story);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  return router;
}