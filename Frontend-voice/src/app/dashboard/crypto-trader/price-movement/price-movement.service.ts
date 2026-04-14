import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class PriceMovementService {

    private isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadCharts(): Promise<void> {
        if (this.isBrowser) {
            try {
                // Dynamically import ApexCharts
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart candlestickOptions
                const candlestickOptions = {
                    series: [{
                        name: "Price",
                        data: [
                            {
                                x: new Date(2016, 1, 1),
                                y: [51.98, 56.29, 51.59, 53.85]
                            },
                            {
                                x: new Date(2016, 2, 1),
                                y: [53.66, 54.99, 51.35, 52.95]
                            },
                            {
                                x: new Date(2016, 3, 1),
                                y: [52.96, 53.78, 51.54, 52.48]
                            },
                            {
                                x: new Date(2016, 4, 1),
                                y: [52.54, 52.79, 47.88, 49.24]
                            },
                            {
                                x: new Date(2016, 5, 1),
                                y: [49.1, 52.86, 47.7, 52.78]
                            },
                            {
                                x: new Date(2016, 6, 1),
                                y: [52.83, 53.48, 50.32, 52.29]
                            },
                            {
                                x: new Date(2016, 7, 1),
                                y: [52.2, 54.48, 51.64, 52.58]
                            },
                            {
                                x: new Date(2016, 8, 1),
                                y: [52.76, 57.35, 52.15, 57.03]
                            },
                            {
                                x: new Date(2016, 9, 1),
                                y: [57.04, 58.15, 48.88, 56.19]
                            },
                            {
                                x: new Date(2016, 10, 1),
                                y: [56.09, 58.85, 55.48, 58.79]
                            },
                            {
                                x: new Date(2016, 11, 1),
                                y: [58.78, 59.65, 58.23, 59.05]
                            },
                            {
                                x: new Date(2017, 0, 1),
                                y: [59.37, 61.11, 59.35, 60.34]
                            },
                            {
                                x: new Date(2017, 1, 1),
                                y: [60.4, 60.52, 56.71, 56.93]
                            },
                            {
                                x: new Date(2017, 2, 1),
                                y: [57.02, 59.71, 56.04, 56.82]
                            },
                            {
                                x: new Date(2017, 3, 1),
                                y: [66.97, 69.62, 54.77, 59.3]
                            },
                            {
                                x: new Date(2017, 4, 1),
                                y: [59.11, 62.29, 59.1, 59.85]
                            },
                            {
                                x: new Date(2017, 5, 1),
                                y: [59.97, 60.11, 55.66, 58.42]
                            },
                            {
                                x: new Date(2017, 6, 1),
                                y: [58.34, 60.93, 56.75, 57.42]
                            },
                            {
                                x: new Date(2017, 7, 1),
                                y: [57.76, 58.08, 51.18, 54.71]
                            },
                            {
                                x: new Date(2017, 8, 1),
                                y: [64.8, 71.42, 53.18, 57.35]
                            },
                            {
                                x: new Date(2017, 9, 1),
                                y: [57.56, 63.09, 57.0, 62.99]
                            },
                            {
                                x: new Date(2017, 10, 1),
                                y: [62.89, 63.42, 59.72, 61.76]
                            },
                            {
                                x: new Date(2017, 11, 1),
                                y: [61.71, 64.15, 61.29, 63.04]
                            }
                        ]
                    }],
                    chart: {
                        id: 'candlestickChart',
                        type: "candlestick",
                        height: 350,
                        toolbar: {
                            show: false
                        },
                        zoom: {
                            enabled: false
                        }
                    },
                    plotOptions: {
                        candlestick: {
                            colors: {
                                upward: '#37D80A',
                                downward: '#FF4023'
                            },
                            wick: {
                                useFillColor: true
                            }
                        }
                    },
                    fill: {
                        opacity: 1
                    },
                    xaxis: {
                        type: "datetime",
                        axisTicks: {
                            show: true,
                            color: '#64748B'
                        },
                        axisBorder: {
                            show: true,
                            color: '#64748B'
                        },
                        labels: {
                            show: true,
                            style: {
                                colors: "#3A4252",
                                fontSize: "12px"
                            }
                        }
                    },
                    yaxis: {
                        tooltip: {
                            enabled: true
                        },
                        labels: {
                            show: true,
                            style: {
                                colors: "#3A4252",
                                fontSize: "12px"
                            }
                        },
                        axisBorder: {
                            show: false,
                            color: '#64748B'
                        },
                        axisTicks: {
                            show: false,
                            color: '#64748B'
                        }
                    },
                    grid: {
                        show: true,
                        borderColor: "#F6F7F9"
                    }
                };

                // Define chart brushOptions
                const brushOptions = {
                    series: [{
                        name: "Volume",
                        data: [
                            {
                                x: new Date(2016, 1, 1),
                                y: 3.85
                            },
                            {
                                x: new Date(2016, 2, 1),
                                y: 2.95
                            },
                            {
                                x: new Date(2016, 3, 1),
                                y: -12.48
                            },
                            {
                                x: new Date(2016, 4, 1),
                                y: 19.24
                            },
                            {
                                x: new Date(2016, 5, 1),
                                y: 12.78
                            },
                            {
                                x: new Date(2016, 6, 1),
                                y: 22.29
                            },
                            {
                                x: new Date(2016, 7, 1),
                                y: -12.58
                            },
                            {
                                x: new Date(2016, 8, 1),
                                y: -17.03
                            },
                            {
                                x: new Date(2016, 9, 1),
                                y: -19.19
                            },
                            {
                                x: new Date(2016, 10, 1),
                                y: -28.79
                            },
                            {
                                x: new Date(2016, 11, 1),
                                y: -39.05
                            },
                            {
                                x: new Date(2017, 0, 1),
                                y: 20.34
                            },
                            {
                                x: new Date(2017, 1, 1),
                                y: 36.93
                            },
                            {
                                x: new Date(2017, 2, 1),
                                y: 36.82
                            },
                            {
                                x: new Date(2017, 3, 1),
                                y: 29.3
                            },
                            {
                                x: new Date(2017, 4, 1),
                                y: 39.85
                            },
                            {
                                x: new Date(2017, 5, 1),
                                y: 28.42
                            },
                            {
                                x: new Date(2017, 6, 1),
                                y: 37.42
                            },
                            {
                                x: new Date(2017, 7, 1),
                                y: 24.71
                            },
                            {
                                x: new Date(2017, 8, 1),
                                y: 37.35
                            },
                            {
                                x: new Date(2017, 9, 1),
                                y: 32.99
                            },
                            {
                                x: new Date(2017, 10, 1),
                                y: 31.76
                            },
                            {
                                x: new Date(2017, 11, 1),
                                y: 43.04
                            }
                        ]
                    }],
                    chart: {
                        type: "bar",
                        height: 160,
                        toolbar: {
                            show: false
                        },
                        brush: {
                            enabled: true,
                            target: "candlestickChart"
                        },
                        selection: {
                            enabled: true,
                            xaxis: {
                                min: new Date("16 June 2016").getTime(),
                                max: new Date("10 October 2017").getTime()
                            },
                            fill: {
                                color: "#ccc",
                                opacity: 0.4
                            },
                            stroke: {
                                color: "#0D47A1"
                            }
                        }
                    },
                    fill: {
                        opacity: 1
                    },
                    colors: [
                        "#605DFF"
                    ],
                    xaxis: {
                        type: "datetime",
                        axisTicks: {
                            show: true,
                            color: '#64748B'
                        },
                        axisBorder: {
                            show: true,
                            color: '#64748B'
                        },
                        labels: {
                            show: true,
                            style: {
                                colors: "#3A4252",
                                fontSize: "12px"
                            }
                        }
                    },
                    yaxis: {
                        tooltip: {
                            enabled: true
                        },
                        labels: {
                            show: true,
                            style: {
                                colors: "#3A4252",
                                fontSize: "12px"
                            }
                        },
                        axisBorder: {
                            show: false,
                            color: '#64748B'
                        },
                        axisTicks: {
                            show: false,
                            color: '#64748B'
                        }
                    },
                    grid: {
                        show: true,
                        borderColor: "#F6F7F9"
                    }
                };

                // Initialize and render the chart
                const chart1 = new ApexCharts(document.querySelector('#price_movement_chart'), candlestickOptions);
                const chart2 = new ApexCharts(document.querySelector('#price_movement_chart2'), brushOptions);
                chart1.render();
                chart2.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}