import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class LinkedinNetFollowersService {

    private isBrowser: boolean;
    private chartInstance: any;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(series: { name: string; data: number[] }[], categories: string[]): Promise<void> {
        if (this.isBrowser) {
            try {
                const ApexCharts = (await import('apexcharts')).default;
                const options = {
                    series: series,
                    chart: {
                        type: "area",
                        height: 294,
                        zoom: {
                            enabled: false
                        },
                        toolbar: {
                            show: false
                        },
                        dropShadow: {
                            top: 5,
                            left: 5,
                            blur: 3,
                            opacity: 0.6,
                            enabled: true,
                            color: "#605DFF",
                            enabledOnSeries: [0]
                        }
                    },
                    colors: [
                        "#605DFF"
                    ],
                    dataLabels: {
                        enabled: false
                    },
                    stroke: {
                        curve: "smooth",
                        width: [1]
                    },
                    grid: {
                        borderColor: '#ECEEF2',
                        strokeDashArray: 8
                    },
                    fill: {
                        type: 'gradient',
                        gradient: {
                            stops: [0, 90, 100],
                            shadeIntensity: 1,
                            opacityFrom: 0.4,
                            opacityTo: 0.0
                        }
                    },
                    xaxis: {
                        categories,
                        axisTicks: {
                            show: false,
                            color: '#64748B'
                        },
                        axisBorder: {
                            show: true,
                            color: '#D5D9E2'
                        },
                        labels: {
                            show: true,
                            style: {
                                colors: "#64748B",
                                fontSize: "12px"
                            }
                        }
                    },
                    yaxis: {
                        // tickAmount: 5,
                        // max: 100,
                        min: 0,
                        labels: {
                            style: {
                                colors: "#64748B",
                                fontSize: "12px"
                            }
                        },
                        axisBorder: {
                            show: true,
                            color: '#D5D9E2'
                        },
                        axisTicks: {
                            show: false,
                            color: '#D5D9E2'
                        }
                    },
                    legend: {
                        show: true,
                        position: 'top',
                        fontSize: '12px',
                        horizontalAlign: 'center',
                        itemMargin: {
                            horizontal: 8,
                            vertical: 0
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
                    }
                };
                const chartElement = document.querySelector('#linkedin_net_followers_chart');
                if (this.chartInstance) {
                    this.chartInstance.destroy();
                }
                if (chartElement) {
                    this.chartInstance = new ApexCharts(chartElement, options);
                    this.chartInstance.render();
                }
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

    updateChart(series: { name: string; data: number[] }[], categories: string[]): void {
        if (this.chartInstance) {
            this.chartInstance.updateOptions({
                series: series,
                xaxis: { categories: categories }
            });
        }
    }

}