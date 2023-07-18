import { Config } from './config';

import {
    getBybitFundingRate,
    openBybitLongPosition,
    openBybitShortPosition,
    closeBybitPosition,
    getBybitBalances,
    getBybitWithdrawalHistory
} from './bybit';
import {
    getOkxFundingRate,
    openOkxLongPosition,
    openOkxShortPosition,
    closeOkxPosition,
    getOKxBalances
} from './okx';

const states = {
    INITIALIZED: 'INITIALIZED',
    BYBIT_GREATER_OPENED: 'BYBIT_BIG_OPENED',
    OKX_GREATER_OPENED: 'OKX_GREATER_OPENED'
}
let status = states.INITIALIZED;
const config = new Config();


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
        return;

        // Compare funding rates and determine the profitable exchange
        if (okxFundingRate > bybitFundingRate) {
            console.log('OKX funding rate is higher. Perform arbitrage on OKX.');
            // Place your OKX arbitrage logic here
            if (status === states.INITIALIZED) {
                await openOkxShortPosition();
                await openBybitLongPosition();
                status = states.OKX_GREATER_OPENED;
            } else if (status === states.BYBIT_GREATER_OPENED) {
                await closeOkxPosition();
                await closeBybitPosition();
                status = states.INITIALIZED;
                setTimeout(performArbitrage, 5 * 60 * 1000);
            }
        } else if (okxFundingRate < bybitFundingRate) {
            console.log('Bybit funding rate is higher. Perform arbitrage on Bybit.');
            // Place your Bybit arbitrage logic here
            if (status === states.INITIALIZED) {
                await openOkxLongPosition();
                await openBybitShortPosition();
                status = states.BYBIT_GREATER_OPENED;
            } else if (status === states.OKX_GREATER_OPENED) {
                await closeOkxPosition();
                await closeBybitPosition();
                status = states.INITIALIZED;
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
performArbitrage();
// setInterval(performArbitrage, 60 * 60 * 1000);

const initialize = async () => {
    await closeBybitPosition();
    await closeOkxPosition();
}

// initialize();