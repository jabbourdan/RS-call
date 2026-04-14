import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class RiskStabilityIndicatorsService {

    private isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(): Promise<void> {
        if (this.isBrowser) {
            try {
                // Dynamically import ApexCharts
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    series: [
                        {
                            name: "Liquidity",
                            data: [60, 80, 100, 120, 140, 150]
                        },
                        {
                            name: "Volatility",
                            data: [180, 160, 80, 140, 100, 80]
                        },
                        {
                            name: "Operational",
                            data: [100, 130, 140, 60, 40, 20]
                        }
                    ],
                    chart: {
                        height: 355,
                        type: "radar",
                        toolbar: {
                            show: false
                        }
                    },
                    xaxis: {
                        labels: {
                            show: false
                        }
                    },
                    fill: {
                        type: 'gradient',
                        gradient: {
                            stops: [0, 90, 100],
                            shadeIntensity: 1,
                            opacityFrom: 0,
                            opacityTo: 0.4
                        }
                    },
                    colors: [
                        "#AD63F6", "#605DFF", "#37D80A"
                    ],
                    yaxis: {
                        show: true,
                        tickAmount: 4
                    },
                    legend: {
                        show: true,
                        fontSize: '12px',
                        position: 'bottom',
                        horizontalAlign: 'center',
                        itemMargin: {
                            horizontal: 8,
                            vertical: 6
                        },
                        labels: {
                            colors: '#64748B'
                        },
                        markers: {
                            size: 7,
                            offsetX: -2,
                            offsetY: -.5,
                            shape: 'diamond'
                        },
                        customLegendItems: ['Liquidity 50%', 'Volatility 20%', 'Operational 30%']
                    }
                };

                // Initialize and render the chart
                const chart = new ApexCharts(document.querySelector('#risk_stability_indicators_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}