import { Request, Response, NextFunction } from 'express';
import { GeminiAIService } from '../../../infrastructure/services/GeminiAIService';
import { StoryGenerationService } from '../../../domain/services/StoryGenerationService';

export interface RequestWithAI extends Request {
  storyGenerationService?: StoryGenerationService;
}

export function geminiMiddleware(req: RequestWithAI, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-gemini-api-key'] as string;
  
  if (!apiKey) {
    res.status(400).json({ 
      error: 'Gemini API key is required. Please configure your API key in the AI Settings.' 
    });
    return;
  }

  try {
    const geminiAIService = new GeminiAIService({ apiKey });
    req.storyGenerationService = new StoryGenerationService(geminiAIService);
    next();
  } catch (error) {
    console.error('Gemini middleware error:', error);
    res.status(400).json({ 
      error: `Invalid Gemini API key configuration: ${error instanceof Error ? error.message : 'Unknown error'}` 
    });
    return;
  }
}