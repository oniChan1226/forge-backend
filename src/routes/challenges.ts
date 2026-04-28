import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  create,
  list,
  getOne,
  update,
  remove,
  getStats,
} from '../controllers/challengeController.js';
import { logProgress, getProgress } from '../controllers/progressController.js';

const router = Router();

router.use(authenticate);

router.post('/', create);
router.get('/', list);
router.get('/:id', getOne);
router.put('/:id', update);
router.delete('/:id', remove);
router.get('/:id/stats', getStats);

// Progress routes nested under challenges
router.post('/:id/progress', logProgress);
router.get('/:id/progress', getProgress);

export default router;
