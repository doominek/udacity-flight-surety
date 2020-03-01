import express, { Request, Response } from 'express';
import morgan from 'morgan';
import { connect, registerOracles } from './oracles';

import flightsRouter from './routes/flights';

const { PORT = 3000 } = process.env;

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

const setupOracles = async () => {
  const connection = await connect();
  await registerOracles(connection.contract, connection.accounts);
};

setupOracles()
    .then(() => console.log("Oracles Initialization completed successfully"))
    .catch(console.error);