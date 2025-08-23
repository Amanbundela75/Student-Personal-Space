import express from 'express';
import cors from 'cors';
import platformsRoute from './routes/platforms.js';

const app = express();
app.use(cors({ origin: '*'}));
app.use(express.json());

app.use((req,res,next)=>{
    console.log('[REQ]', req.method, req.url);
    next();
});

app.get('/api/health', (req,res)=> res.json({ ok:true, time: Date.now() }));

app.use('/api/platform-stats', platformsRoute);

app.use((req,res)=> res.status(404).json({ error:'Not Found', path:req.url }));
export default app;