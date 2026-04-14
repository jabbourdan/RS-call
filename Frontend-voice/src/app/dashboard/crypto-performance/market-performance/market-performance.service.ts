import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class MarketPerformanceService {

    private isBrowser: boolean;
    private chartInstance: any;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(series: number[], labels: string[]): Promise<void> {
        if (this.isBrowser) {
            try {
                // Dynamically import ApexCharts
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    series: series,
                    chart: {
                        height: 340,
                        type: "pie"
                    },
                    labels: labels,
                    colors: [
                        "#37D80A", "#3584FC", "#FE7A36", "#AD63F6", "#FF4023", "#605DFF"
                    ],
                    stroke: {
                        width: 0,
                        show: true,
                        colors: ["#ffffff"]
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
                        }
                    },
                    dataLabels: {
                        enabled: false
                    },
                    tooltip: {
                        y: {
                            formatter: (val:any) => {
                                return val + "%";
                            }
                        }
                    }
                };
                
                // Initialize and render the chart
                this.chartInstance = new ApexCharts(document.querySelector('#market_performance_chart'), options);
                this.chartInstance.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

    updateChart(series: number[], labels: string[]): void {
        if (this.chartInstance) {
            this.chartInstance.updateOptions({
                series: series,
                labels: labels
            });
        }
    }

}