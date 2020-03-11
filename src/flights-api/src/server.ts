import express, { Request, Response } from 'express';
import morgan from 'morgan';
import { setupOracles } from './oracles/oracles';

import flightsRouter from './routes/flights';

const { PORT = 3001 } = process.env;

const app = express();

app.use(morgan('tiny'));

app.get('/', (req: Request, res: Response) => {
    res.send({
                 message: 'Hello from other worlds!!!'
             });
});

app.use('/api', flightsRouter);

app.listen(PORT, () => {
    console.log('Server started at http://localhost:' + PORT);
});

setupOracles()
    .then(() => console.log('Oracles Initialization completed successfully'))
    .catch(console.error);
