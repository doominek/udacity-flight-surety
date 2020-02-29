import { Router } from 'express';

const router = Router();

router.get('/flights', function (req, res, next) {
    res.send([
                 { airline: 'WhizzAir', flight: 'NY-2413' },
                 { airline: 'WhizzAir', flight: 'CR-9421' }
             ]);
});

export default router;
