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


// Main function to perform the arbitrage calculation
async function performArbitrage() {
    try {
        // Get funding rates
        const okxFundingRate = await getOkxFundingRate();
        const bybitFundingRate = await getBybitFundingRate();
        console.log('bybit--', bybitFundingRate);
        console.log('okx--', okxFundingRate);

        // Compare funding rates and determine the profitable exchange
        if (okxFundingRate > bybitFundingRate) {
            console.log('OKX funding rate is higher. Perform arbitrage on OKX.');
            // Place your OKX arbitrage logic here
            if (status === states.INITIALIZED) {
                openOkxShortPosition();
                openBybitLongPosition();
                status = states.OKX_GREATER_OPENED;
            } else if (status === states.BYBIT_GREATER_OPENED) {
                closeOkxPosition();
                closeBybitPosition();
                status = states.INITIALIZED;
                setTimeout(performArbitrage, 5 * 60 * 1000);
            }
        } else if (okxFundingRate < bybitFundingRate) {
            console.log('Bybit funding rate is higher. Perform arbitrage on Bybit.');
            // Place your Bybit arbitrage logic here
            if (status === states.INITIALIZED) {
                openOkxLongPosition();
                openBybitShortPosition();
                status = states.BYBIT_GREATER_OPENED;
            } else if (status === states.OKX_GREATER_OPENED) {
                closeOkxPosition();
                closeBybitPosition();
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
performArbitrage();
setInterval(performArbitrage, 60 * 60 * 1000);

const initialize = () => {
    closeBybitPosition();
    closeOkxPosition();
}

// initialize();