import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class AverageDeliveryTimeService {

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
                const data = [70, 60, 80, 100, 70, 40, 80];
                const middleIndex = Math.floor(data.length / 2);
                const options = {
                    series: [
                        {
                            name: "Time",
                            data: data
                        }
                    ],
                    chart: {
                        type: "bar",
                        height: 210,
                        toolbar: {
                            show: false
                        }
                    },
                    colors: data.map((_, index) =>
                        index === middleIndex ? '#3584FC' : '#BDDCFF'
                    ),
                    plotOptions: {
                        bar: {
                            columnWidth: "18.35px",
                            borderRadius: 0,
                            distributed: true,
                            horizontal: false
                        }
                    },
                    grid: {
                        show: true,
                        strokeDashArray: 5,
                        borderColor: "#EEF1FF"
                    },
                    dataLabels: {
                        enabled: false
                    },
                    xaxis: {
                        categories: [
                            "Sun",
                            "Mon",
                            "Tue",
                            "Wed",
                            "Thu",
                            "Fri",
                            "Sat"
                        ],
                        axisTicks: {
                            show: false,
                            color: '#ECEEF2'
                        },
                        axisBorder: {
                            show: false,
                            color: '#ECEEF2'
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
                        show: false,
                        tickAmount: 5,
                        labels: {
                            formatter: (val:any) => {
                                return val + ' minutes'
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
                    tooltip: {
                        y: {
                            formatter: function(val:any) {
                                return val + ' minutes'
                            }
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
                            shape: 'square'
                        }
                    }
                };

                // Initialize and render the chart
                const chart = new ApexCharts(document.querySelector('#average_delivery_time_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}