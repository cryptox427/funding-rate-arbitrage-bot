const ccxt = require('ccxt');
require('dotenv').config();

// Create exchange instances
const okxExchange = new ccxt.okex({
    apiKey: process.env.OKX_API,
    secret: process.env.OKX_SECRET,
    password: process.env.OKX_PASSWORD, // Add the password configuration
    options: {
        accountMode: 'margin', // Set the account mode to "margin"
    },
});


// Function to get funding rate from OKX
const getOkxFundingRate = async () => {
    const symbol = process.env.OKX_SYMBOL_REQUEST; // Replace with your desired trading pair

    try {
        const response = await okxExchange.fetchFundingRate(symbol);
        const fundingRate = response.fundingRate;
        return fundingRate;
    } catch (error) {
        console.error('Failed to get OKX funding rate:', error);
        throw error;
    }
}



// Function to open a short position on OKX
async function openOkxShortPosition() {
    const symbol = process.env.OKX_SYMBOL_REQUEST; // Replace with your desired trading pair
    const amount = 1; // Replace with your desired position size

    try {
        const response = await okxExchange.createMarketSellOrder(symbol, amount, { type: 'swap' });
        console.log('Short position opened on OKX:', response);
    } catch (error) {
        console.error('Failed to open short position on OKX:', error);
        throw error;
    }
}

// Function to open a long position on OKX
async function openOkxLongPosition() {
    const symbol = process.env.OKX_SYMBOL_REQUEST; // Replace with your desired trading pair
    const amount = 1; // Replace with your desired position size

    try {
        const response = await okxExchange.createMarketBuyOrder(symbol, amount, { type: 'swap' });
        console.log('Long position opened on OKX:', response);
    } catch (error) {
        console.error('Failed to open long position on OKX:', error);
        throw error;
    }
}

// Function to close a perpetual swap position on OKEx
async function closeOkxPosition() {
    const symbol = process.env.OKX_SYMBOL_PLATFORM; // Replace with your desired trading pair
    const position_id = '600211816320892928';
    try {
        const positions = await okxExchange.fetchPositions();
    const positionToClose = positions.find(position => position.symbol === symbol);
    
    if (!positionToClose) {
      console.log('No open position found for the specified symbol.');
      return;
    }
    
    const side = positionToClose.side;
    const amount = positionToClose.contracts;
    console.log('side, amount', side, amount);
    if (side === 'long') {
        openOkxShortPosition();
    } else {
        openOkxLongPosition();
    }
        // Close the position
        // const response = await okxExchange.closePosition(position_id, symbol);
    } catch (error) {
        console.error('Failed to close position on OKEx perpetual swap:', error);
        throw error;
    }
}



// Function to fetch all balances from OKX
async function getOKxBalances() {
    try {
        const balances = await okxExchange.fetchBalance();
        console.log('OKX Balances:', balances);
    } catch (error) {
        console.error('Failed to fetch OKX balances:', error);
        throw error;
    }
}

module.exports = {
    getOkxFundingRate,
    openOkxLongPosition,
    openOkxShortPosition,
    closeOkxPosition,
    getOKxBalances
}