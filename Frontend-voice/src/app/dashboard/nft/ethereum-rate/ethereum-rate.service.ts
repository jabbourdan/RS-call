import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class EthereumRateService {

    private isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(seriesData: number[], categories: string[]): Promise<void> {
        if (this.isBrowser) {
            try {
                const ApexCharts = (await import('apexcharts')).default;
                const options = {
                    series: [
                        {
                            name: "Rate",
                            data: seriesData
                        }
                    ],
                    chart: {
                        type: "area",
                        height: 246,
                        zoom: {
                            enabled: false
                        },
                        toolbar: {
                            show: false
                        }
                    },
                    colors: [
                        "#3584FC"
                    ],
                    dataLabels: {
                        enabled: false
                    },
                    stroke: {
                        curve: "stepline", //curve: ['straight', 'smooth', 'monotoneCubic', 'stepline']
                        width: 3,
                        lineCap: "10"
                    },
                    grid: {
                        borderColor: '#ECF0FF', 
                        strokeDashArray: 10,
                        xaxis: {
                            lines: {
                                show: false
                            }
                        }
                    },
                    fill: {
                        type: 'gradient',
                        gradient: {
                            stops: [0, 90, 100],
                            shadeIntensity: 1,
                            opacityFrom: 0,
                            opacityTo: 0.8
                        }
                    },
                    xaxis: {
                        categories: categories,
                        axisTicks: {
                            show: false,
                            color: '#ECEEF2'
                        },
                        axisBorder: {
                            show: false,
                            color: '#ECEEF2'
                        },
                        labels: {
                            show: false,
                            style: {
                                colors: "#8695AA",
                                fontSize: "12px"
                            }
                        }
                    },
                    yaxis: {
                        tickAmount: 4,
                        show: false,
                        // max: 80,
                        min: 0,
                        labels: {
                            formatter: (val:any) => {
                                return '$' + val + 'K'
                            },
                            style: {
                                colors: "#64748B",
                                fontSize: "12px"
                            }
                        },
                        axisBorder: {
                            show: false,
                            color: '#ECEEF2'
                        },
                        axisTicks: {
                            show: false,
                            color: '#ECEEF2'
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
                            size: 7,
                            offsetX: -2,
                            offsetY: -.5,
                            shape: 'diamond'
                        }
                    }
                };
                // Render or update the chart
                const chartElement = document.querySelector('#ethereum_rate_chart');
                if (chartElement) {
                    chartElement.innerHTML = ''; // Clear previous chart
                }
                const chart = new ApexCharts(chartElement, options);
                chart.render();
            } catch (error) {
                console.error('Error loading chart:', error);
            }
        }
    }

}