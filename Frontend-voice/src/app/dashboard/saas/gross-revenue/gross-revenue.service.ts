import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class GrossRevenueService {

    private isBrowser: boolean;
    private chartInstance: any;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(seriesData: { name: string, data: number[] }[], categories: string[]): Promise<void> {
        if (this.isBrowser) {
            try {
                // Dynamically import ApexCharts
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    series: seriesData,
                    chart: {
                        type: "line",
                        height: 350,
                        toolbar: {
                            show: false
                        }
                    },
                    colors: [
                        "#757DFF", "#E9D5FF"
                    ],
                    stroke: {
                        width: 4,
                        curve: "straight",
                        dashArray: [0, 8]
                    },
                    grid: {
                        show: true,
                        borderColor: "#ECF0FF"
                    },
                    dataLabels: {
                        enabled: false
                    },
                    xaxis: {
                        categories: categories,
                        axisTicks: {
                            show: false,
                            color: '#DDE4FF'
                        },
                        axisBorder: {
                            show: false,
                            color: '#DDE4FF'
                        },
                        labels: {
                            show: true,
                            style: {
                                colors: "#8695AA",
                                fontSize: "12px"
                            }
                        }
                    },
                    yaxis: {
                        // tickAmount: 5,
                        // max: 150,
                        // min: 100,
                        labels: {
                            formatter: (val:any) => {
                                return '$' + val + 'K'
                            },
                            style: {
                                colors: "#8695AA",
                                fontSize: "12px"
                            }
                        },
                        axisBorder: {
                            show: false,
                            color: '#DDE4FF'
                        },
                        axisTicks: {
                            show: false,
                            color: '#DDE4FF'
                        }
                    },
                    tooltip: {
                        y: {
                            formatter: function(val:any) {
                                return val + "k";
                            }
                        }
                    },
                    legend: {
                        show: true,
                        fontSize: '12px',
                        position: 'bottom',
                        horizontalAlign: 'left',
                        itemMargin: {
                            horizontal: 8,
                            vertical: 8
                        },
                        labels: {
                            colors: '#64748B'
                        },
                        markers: {
                            size: 6,
                            offsetX: -2,
                            offsetY: -.5,
                            shape: 'square'
                        }
                    }
                };

                // Initialize and render the chart
                this.chartInstance = new ApexCharts(document.querySelector('#gross_revenue_chart'), options);
                this.chartInstance.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

    updateChart(seriesData: { name: string, data: number[] }[], categories: string[]): void {
        if (this.chartInstance) {
            this.chartInstance.updateOptions({
                series: seriesData,
                xaxis: {
                    categories: categories
                }
            });
        }
    }

}