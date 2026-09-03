import express from 'express';
import { Request, Response } from 'express';
const path = require('path');
const router = express.Router();

function pathToFile(fileName: string): string {
    return path.resolve(__dirname, '..', '..', 'public', fileName);
}

router.get('/', (req: Request, res: Response) => {
    res.sendFile(pathToFile('index.html'));
});

router.get('/products', (req: Request, res: Response) => {
    res.sendFile(pathToFile('productPage.html'));
});

router.get('/cart', (req: Request, res: Response) => {
    res.render(pathToFile('cart.ejs'), { paypalClientID: process.env.PAYPAL_CLIENT_ID || ''});
});

router.get('/product/:id', (req: Request, res: Response) => {
    res.sendFile(pathToFile('product.html'));
});

router.get('/userAuth', (req: Request, res: Response) => {
    res.sendFile(pathToFile('userAuth.html'));
});

router.get('/dashboard/:id', (req: Request, res: Response) => {
    res.sendFile(pathToFile('dashboard.html'));
});

router.get('/places', (req: Request, res: Response) => {
    res.sendFile(pathToFile('places.html'));
});

router.get('/adminauth', (req: Request, res: Response) => {
    res.sendFile(pathToFile('adminAuth.html'));
});

router.get('/adminDashboard', (req: Request, res: Response) => {
    res.sendFile(pathToFile('uploadPanel.html'));
});

module.exports = router;