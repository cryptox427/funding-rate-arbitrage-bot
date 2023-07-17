import ccxt from 'ccxt';
import dotenv from 'dotenv'; 
dotenv.config();

const bybitExchange = new ccxt.bybit({
    apiKey: process.env.BYBIT_API,
    secret: process.env.BYBIT_SECRET,
    defaultType: 'future', // Set the default trading type to 'future'
});
bybitExchange.options['createMarketBuyOrderRequiresPrice'] = false;

// Function to get funding rate from Bybit
const getBybitFundingRate = async () => {
    const symbol: any = process.env.BYBIT_SYMBOL_REQUEST; // Replace with your desired trading pair

    try {
        const response = await bybitExchange.fetchFundingRate(symbol);
        // console.log('bybir data----', response);
        const fundingRate = response.fundingRate;
        return fundingRate;
    } catch (error) {
        console.error('Failed to get Bybit funding rate:', error);
        throw error;
    }
}

// Function to open a long position on Bybit
async function openBybitLongPosition() {
    const symbol: any = process.env.BYBIT_SYMBOL_REQUEST; // Replace with your desired trading pair
    const amount = process.env.BYBIT_CONTRACT_SIZE; // Replace with your desired position size
    const leverage = 10; // Replace with your desired leverage

    try {
        const response = await bybitExchange.createMarketBuyOrder(symbol, amount, { leverage });
        console.log('Long position opened on Bybit:', response);
    } catch (error) {
        console.error('Failed to open long position on Bybit:', error);
        throw error;
    }
}


// Function to open a short position on Bybit
async function openBybitShortPosition() {
    const symbol : any = process.env.BYBIT_SYMBOL_REQUEST; // Replace with your desired trading pair
    const amount = process.env.BYBIT_CONTRACT_SIZE; // Replace with your desired position size
    const leverage = 10; // Replace with your desired leverage

    try {
        const response = await bybitExchange.createMarketSellOrder(symbol, amount, { leverage });
        console.log('Short position opened on Bybit:', response);
    } catch (error) {
        console.error('Failed to open short position on Bybit:', error);
        throw error;
    }
}

// Function to close a bybit positions
async function closeBybitPosition() {
    const symbol : any = process.env.BYBIT_SYMBOL_PLATFORM; // Replace with your desired trading pair
    try {
        const positions = await bybitExchange.fetchPositions(symbol);
        const positionToClose = positions.find((position: { symbol: any; }) => position.symbol === symbol);
        
        if (!positionToClose) {
          console.log('No open position found for the specified symbol.');
          return;
        }
        
        const side = positionToClose.side;
        const amount =positionToClose.contracts;
        if (side === 'long') {
            openBybitShortPosition();
        } else {
            openBybitLongPosition();
        }
        console.log(positions, positionToClose, side, amount)
    } catch (error) {
        console.error('Failed to close position on Bybit position:', error);
    throw error;
    }
}

// Function to fetch all balances from Bybit
async function getBybitBalances() {
    try {
        const balances = await bybitExchange.fetchBalance();
        console.log('Bybit Balances:', balances);
    } catch (error) {
        console.error('Failed to fetch Bybit balances:', error);
        throw error;
    }
}

// Function to fetch withdrawal history from Bybit
async function getBybitWithdrawalHistory() {
    try {
        const withdrawals = await bybitExchange.fetchWithdrawals();
        console.log('Bybit Withdrawal History:', withdrawals);
    } catch (error) {
        console.error('Failed to fetch Bybit withdrawal history:', error);
        throw error;
    }
}

export {
    getBybitFundingRate,
    openBybitLongPosition,
    openBybitShortPosition,
    closeBybitPosition,
    getBybitBalances,
    getBybitWithdrawalHistory
}