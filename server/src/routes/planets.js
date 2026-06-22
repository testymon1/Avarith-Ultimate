// src/routes/planets.js
import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    planets: [
      { id: 'learn', name: 'Avarith Learn', status: 'coming_soon' },
      { id: 'agent', name: 'Avarith Agent', status: 'coming_soon' },
      { id: 'memory', name: 'Avarith Memory', status: 'coming_soon' },
      { id: 'api', name: 'Avarith API', status: 'coming_soon' }
    ]
  });
});

export default router;