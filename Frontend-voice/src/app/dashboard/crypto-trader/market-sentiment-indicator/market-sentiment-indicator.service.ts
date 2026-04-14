import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class MarketSentimentIndicatorService {

    private isBrowser: boolean;
    private chartInstance: any;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(): Promise<void> {
        if (this.isBrowser) {
            try {
                const ApexCharts = (await import('apexcharts')).default;

                const options = {
                    series: [
                        100
                    ],
                    chart: {
                        type: "radialBar",
                        height: 327
                    },
                    plotOptions: {
                        radialBar: {
                            startAngle: -90,
                            endAngle: 90,
                            track: {
                                background: "#ffffff",
                                strokeWidth: '100%',
                            },
                            dataLabels: {
                                show: false
                            }
                        }
                    },
                    fill: {
                        type: "gradient",
                        gradient: {
                            shade: "dark",
                            type: "horizontal",
                            gradientToColors: ["#FF3D00"],
                            stops: [0, 50, 100],
                            colorStops: [
                                { offset: 0, color: "#00C851", opacity: 1 },  // Extreme Greed (Green)
                                { offset: 25, color: "#8BC34A", opacity: 1 }, // Greed (Light Green)
                                { offset: 50, color: "#FFC107", opacity: 1 }, // Neutral (Yellow)
                                { offset: 75, color: "#FF9800", opacity: 1 }, // Fear (Orange)
                                { offset: 100, color: "#FF3D00", opacity: 1 } // Extreme Fear (Red)
                            ]
                        }
                    },
                    stroke: {
                        lineCap: "round"
                    },
                    labels: [
                        "Market Sentiment"
                    ]
                };

                this.chartInstance = new ApexCharts(document.querySelector("#market_sentiment_indicator_chart"), options);
                this.chartInstance.render();
            } catch (error) {
                console.error("Error loading ApexCharts:", error);
            }
        }
    }

}