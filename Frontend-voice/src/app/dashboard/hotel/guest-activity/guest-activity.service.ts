import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class GuestActivityService {

    private isBrowser: boolean;
    private chartInstance: any;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(series: any[], categories: string[]): Promise<void> {
        if (this.isBrowser) {
            try {
                // Dynamically import ApexCharts
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    series,
                    chart: {
                        type: "area",
                        height: 284,
                        zoom: {
                            enabled: false
                        },
                        toolbar: {
                            show: false
                        }
                    },
                    colors: [
                        "#ffffff", "#D8FFC8"
                    ],
                    dataLabels: {
                        enabled: false
                    },
                    stroke: {
                        curve: "smooth",
                        width: [2, 2, 0],
                        dashArray: [0, 6, 0]
                    },
                    grid: {
                        show: true,
                        borderColor: "#ffffff1a"
                    },
                    fill: {
                        type: 'gradient',
                        gradient: {
                            stops: [0, 90, 100],
                            shadeIntensity: 1,
                            opacityFrom: 0.5,
                            opacityTo: 0.2
                        }
                    },
                    xaxis: {
                        categories,
                        axisTicks: {
                            show: false,
                            color: '#ffffff1a'
                        },
                        axisBorder: {
                            show: false,
                            color: '#ffffff1a'
                        },
                        labels: {
                            show: true,
                            style: {
                                colors: "#B1BBC8",
                                fontSize: "12px"
                            }
                        }
                    },
                    yaxis: {
                        tickAmount: 5,
                        // max: 100,
                        min: 0,
                        labels: {
                            style: {
                                colors: "#B1BBC8",
                                fontSize: "12px"
                            }
                        },
                        axisBorder: {
                            show: true,
                            color: '#ffffff1a'
                        },
                        axisTicks: {
                            show: false,
                            color: '#ffffff1a'
                        }
                    },
                    legend: {
                        show: false,
                        position: 'top',
                        fontSize: '12px',
                        horizontalAlign: 'left',
                        itemMargin: {
                            horizontal: 8,
                            vertical: 0
                        },
                        labels: {
                            colors: '#64748B'
                        },
                        markers: {
                            size: 6,
                            offsetX: -2,
                            offsetY: -.5,
                            shape: 'circle'
                        }
                    }
                };

                // Initialize and render the chart
                this.chartInstance = new ApexCharts(document.querySelector('#guest_activity_chart'), options);
                this.chartInstance.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

    updateChart(series: any[], categories: string[]): void {
        if (this.chartInstance) {
            this.chartInstance.updateOptions({
                series,
                xaxis: { categories }
            });
        }
    }

}