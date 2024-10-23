const coinSelect = document.getElementById('coinSelect');
const intervalSelect = document.getElementById('intervalSelect');
const chartContainer = document.getElementById('chartContainer');

let socket;
let chart;
let series;
const historicalData = {};

function initializeChart() {
    chart = LightweightCharts.createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: chartContainer.clientHeight,
    });

    series = chart.addCandlestickSeries({
        upColor: '#4fff62',
        downColor: '#ff4976',
        borderUpColor: '#4fff62',
        borderDownColor: '#ff4976',
        wickUpColor: '#4fff62',
        wickDownColor: '#ff4976',
    });
}

function connectWebSocket(symbol, interval) {
    if (socket) {
        socket.close();
    }

    const url = `wss://stream.binance.com:9443/ws/${symbol}@kline_${interval}`;
    socket = new WebSocket(url);

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const candle = message.k;

        if (candle.x) {
            const newData = {
                time: candle.t / 1000, // Convert to seconds
                open: parseFloat(candle.o),
                high: parseFloat(candle.h),
                low: parseFloat(candle.l),
                close: parseFloat(candle.c),
            };

            if (!historicalData[symbol]) {
                historicalData[symbol] = [];
            }
            historicalData[symbol].push(newData);
            updateChart(historicalData[symbol]);
        }
    };
}

function updateChart(data) {
    series.setData(data);
}

coinSelect.addEventListener('change', (event) => {
    const symbol = event.target.value;
    const interval = intervalSelect.value;

    if (historicalData[symbol]) {
        updateChart(historicalData[symbol]);
    } else {
        series.setData([]); // Clear chart for new data
    }
    connectWebSocket(symbol, interval);
});

intervalSelect.addEventListener('change', (event) => {
    const symbol = coinSelect.value;
    const interval = event.target.value;

    connectWebSocket(symbol, interval);
});

// Initial connection
window.onload = () => {
    initializeChart();
    const initialSymbol = coinSelect.value;
    const initialInterval = intervalSelect.value;
    connectWebSocket(initialSymbol, initialInterval);
};
