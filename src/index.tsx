import { Hono } from 'hono';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'

type Bindings = {
  MY_BUCKET: R2Bucket;
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>();

// Clerk authentication middleware
app.use('*', clerkMiddleware());

// Redirect middleware
app.use('*', async (c, next) => {
  const auth = getAuth(c)
  if (!auth?.userId) {
    return c.redirect('/index.html', 302);
  }
  await next();
});

// Import route handlers
import { recordFeeReceipt, getOpenMembershipFees, searchMembers, selectMember, depositFee } from './routes/fee-receipt';
import { getFeed } from './routes/feed';
import { getImage } from './routes/images';
import { getDashboard, getProfile } from './routes/pages';
import { recordStageNote } from './routes/fee-receipt';
import { getUnrecordedMembershipFees } from './routes/fee-receipt';

// Register routes
app.post('/record-fee-receipt', recordFeeReceipt);
app.post('/record-deposit', recordStageNote);
app.post('/record-master-sheet', recordStageNote);
app.get('/open-membership-fees', getOpenMembershipFees);
app.get('/search-members', searchMembers);
app.get('/select-member/:id', selectMember);
app.get('/deposit-fee/:id', depositFee);
app.get('/feed', getFeed);
app.get('/images/:key', getImage);
app.get('/dashboard', getDashboard);
app.get('/profile', getProfile);
app.get('/unrecorded-membership-fees', getUnrecordedMembershipFees);
app.post('/record-to-master/:id', async (c) => {
  return c.json({ success: true });
});
export default app;
