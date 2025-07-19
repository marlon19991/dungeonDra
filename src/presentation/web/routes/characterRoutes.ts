import { Router } from 'express';
import { CharacterController } from '../../controllers/CharacterController';

export function createCharacterRoutes(characterController: CharacterController): Router {
  const router = Router();

  router.post('/characters', async (req, res) => {
    try {
      const character = await characterController.createCharacter(req.body);
      res.status(201).json(character);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  router.get('/characters', async (req, res) => {
    try {
      const characters = await characterController.getAllCharacters();
      res.json(characters);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  router.get('/characters/:id', async (req, res) => {
    try {
      const character = await characterController.getCharacter(req.params.id);
      res.json(character);
    } catch (error) {
      res.status(404).json({ 
        error: error instanceof Error ? error.message : 'Character not found' 
      });
    }
  });

  router.post('/characters/:attackerId/attack/:targetId', async (req, res) => {
    try {
      const result = await characterController.performAttack(
        req.params.attackerId, 
        req.params.targetId
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Attack failed' 
      });
    }
  });

  router.post('/characters/:id/heal', async (req, res) => {
    try {
      const { healAmount } = req.body;
      await characterController.healCharacter(req.params.id, healAmount);
      res.json({ message: 'Character healed successfully' });
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Healing failed' 
      });
    }
  });

  router.post('/characters/:id/initiative', async (req, res) => {
    try {
      const initiative = await characterController.rollInitiative(req.params.id);
      res.json({ initiative });
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Initiative roll failed' 
      });
    }
  });

  return router;
}