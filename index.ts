import express from 'express';
import { quest, quest1Bad, quest1Good, quest1Submission } from './game';
import { actionCorsMiddleware } from '@solana/actions';

const app = express();
app.use(express.json());
app.use(actionCorsMiddleware({}));

app.get('/api/actions/quest', [], quest);

app.post('/api/actions/quest1Submission', [], quest1Submission);

app.post('/api/actions/quest1Good/:score/:message', [], quest1Good);

app.post('/api/actions/quest1Bad/:score/:message', [], quest1Bad);

const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
