import express, { Request, Response } from 'express';
import cors from 'cors';
import { Config } from './config';

import {
    getBybitFundingRate,
    openBybitLongPosition,
    openBybitShortPosition,
    closeBybitPosition,
    getBybitBalances,
    getBybitWithdrawalHistory,
    closeBybitAllPosition,
    getBybitAllPositions
} from './bybit';
import {
    getOkxFundingRate,
    openOkxLongPosition,
    openOkxShortPosition,
    closeOkxPosition,
    getOKxBalances,
    closeOkxAllPosition,
    getOkxAllPositions
} from './okx';

const app = express();
app.use(cors());
const port = 4000;

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, Express with TypeScript!');
  });

const config = new Config();


app.get('/arbitrage', (req: Request, res: Response) => {
    if (config.SYMBOL_LIST !== undefined) {
        res.send({
            success: true,
            data: config.SYMBOL_LIST
        })
    } else {
        res.send({
            success: false,
            message: 'Server is starting'
        })
    }
})

app.get('/positions', async (req: Request, res: Response) => {
    if (config.SYMBOM !== undefined) {
        const bybit = await getBybitAllPositions();
        const okx = await getOkxAllPositions();
        res.send({
            success: true,
            data: {
                bybit, okx
            }
        })
    } else {
        res.send({
            success: false,
            message: 'Server is starting'
        })
    }
})


// Main function to perform the arbitrage calculation
async function performArbitrage() {
    try {
        if(config.SYMBOM === undefined) {
            setTimeout(performArbitrage, 1000);
            return;

        }
        // Get funding rates
        const okxFundingRate = await getOkxFundingRate(config);
        const bybitFundingRate = await getBybitFundingRate(config);
        console.log('bybit--', bybitFundingRate);
        console.log('okx--', okxFundingRate);
        // return;

        // Compare funding rates and determine the profitable exchange
        if (okxFundingRate > bybitFundingRate) {
            console.log('OKX funding rate is higher. Perform arbitrage on OKX.');
            // Place your OKX arbitrage logic here
            if (config.STATUS === config.states.INITIALIZED) {
                await initialize();
                await openOkxShortPosition();
                await openBybitLongPosition();
                config.updateStatus(config.states.OKX_GREATER_OPENED);
                // status = states.OKX_GREATER_OPENED;
            } else if (config.STATUS === config.states.BYBIT_GREATER_OPENED) {
                await initialize();
                config.updateStatus(config.states.INITIALIZED);
                // status = states.INITIALIZED;
                setTimeout(performArbitrage, 5 * 60 * 1000);
            }
        } else if (okxFundingRate < bybitFundingRate) {
            console.log('Bybit funding rate is higher. Perform arbitrage on Bybit.');
            // Place your Bybit arbitrage logic here
            if (config.STATUS === config.states.INITIALIZED) {
                await initialize();
                await openOkxLongPosition();
                await openBybitShortPosition();
                config.updateStatus(config.states.BYBIT_GREATER_OPENED);
                // status = states.BYBIT_GREATER_OPENED;
            } else if (status === config.states.OKX_GREATER_OPENED) {
                await initialize();
                config.updateStatus(config.states.INITIALIZED);
                // status = states.INITIALIZED;
                setTimeout(performArbitrage, 5 * 60 * 1000);
            }
        } else {
            console.log('Funding rates are equal. No arbitrage opportunity.');
        }
    } catch (error) {
        console.error('Arbitrage failed:', error);
    }
}


// Call the main function to start the bot
// setTimeout(performArbitrage, 2000);

// setInterval(performArbitrage, 60 * 60 * 1000);
const main = async () => {
    await initialize();
    performArbitrage();
}

const initialize = async () => {
    if(config.SYMBOM === undefined) {
        setTimeout(initialize, 1000);
        return;

    }
    await closeBybitAllPosition();
    await closeOkxAllPosition();
    console.log('-------------INITIALIZED---------------')
}

// initialize();
main();

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

//   getBybitAllPositions();
//   getOkxAllPositions();