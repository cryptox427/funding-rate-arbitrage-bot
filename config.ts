import axios, { AxiosRequestConfig } from 'axios';
import dotenv from 'dotenv'; 
dotenv.config();

class Config {
    OKX_SYMBOL_REQUEST: string | undefined;
    OKX_SYMBOL_PLATFORM: string | undefined;
    OKX_SYMBOL_TO_CLOSE: string | undefined;
    BYBIT_SYMBOL_REQUEST: string | undefined;
    BYBIT_SYMBOL_PLATFORM: string | undefined;
    BYBIT_SYMBOL_TO_CLOSE: string | undefined;
    SYMBOM: string | undefined;
    INITIALIZED: boolean | false = false;

    constructor() {
        this.monitorData();
        this.startMonitoring();
    }

    private async monitorData() {
        const coinglassSecret : any = process.env.COINGLASS_SECRET;
        const headers: Record<string, string> = {
            coinglassSecret: coinglassSecret
            // Add other headers here if needed
        };
    
        const config: AxiosRequestConfig = {
            headers,
            // Other Axios request configuration options can be added here
        };
    
        try {
            const response = await axios.get('https://open-api.coinglass.com/public/v2/funding', config);
            const data = response.data;
            const dataLength = data.data.length;
            let symbol: string = '';
            let rate: number = 0;
    
            for (let i = 1; i <= dataLength; i++) {
                if (data.data[i]?.uMarginList !== undefined) {
                    const exchangeList = data.data[i].uMarginList;
                    const bybit = exchangeList.find((ex: { exchangeName: string; }) => ex.exchangeName === 'Bybit').rate;
                    const okx = exchangeList.find((ex: { exchangeName: string; }) => ex.exchangeName === 'OKX').rate;
                    
                    if (bybit !== undefined && okx !== undefined) {
                        if (Math.abs(bybit - okx) > rate) {
                            symbol = data.data[i].symbol;
                            rate = Math.abs(bybit - okx);
                        }
    
                    }
                }
            }
            if (this.SYMBOM !== symbol) {
                this.SYMBOM = symbol;
                this.OKX_SYMBOL_TO_CLOSE = this.OKX_SYMBOL_PLATFORM;
                this.BYBIT_SYMBOL_TO_CLOSE = this.BYBIT_SYMBOL_PLATFORM;
                this.OKX_SYMBOL_REQUEST = `${symbol}-USDT-SWAP`;
                this.OKX_SYMBOL_PLATFORM = `${symbol}/USDT:USDT`;
                this.BYBIT_SYMBOL_REQUEST = `${symbol}USDT`;
                this.BYBIT_SYMBOL_PLATFORM = `${symbol}/USDT:USDT`
                this.INITIALIZED = false;
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    private startMonitoring() {
        setInterval(this.monitorData, 1 * 10 * 1000)
    }

    updateInitialized(_initialized: boolean) {
        this.INITIALIZED = _initialized;
    }

}

export { Config }