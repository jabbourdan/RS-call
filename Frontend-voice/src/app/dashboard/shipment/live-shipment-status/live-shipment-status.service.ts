import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class LiveShipmentStatusService {

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
                            name: "In Transit",
                            data: [70, 60, 40, 40, 35, 30, 40]
                        },
                        {
                            name: "Delivered",
                            data: [30, 45, 50, 55, 60, 70, 65]
                        },
                        {
                            name: "Delayed",
                            data: [15, 20, 25, 30, 25, 20, 15]
                        },
                        {
                            name: "Cancelled",
                            data: [5, 10, 15, 20, 15, 10, 5]
                        }
                    ],
                    chart: {
                        height: 204,
                        type: "line",
                        zoom: {
                            enabled: false
                        },
                        toolbar: {
                            show: false
                        }
                    },
                    dataLabels: {
                        enabled: false
                    },
                    colors: [
                        "#3584FC", "#37D80A", "#FD5812", "#EE3E08"
                    ],
                    stroke: {
                        curve: "straight",
                        width: 2
                    },
                    grid: {
                        show: true,
                        strokeDashArray: 5,
                        borderColor: "#EEF1FF"
                    },
                    markers: {
                        size: 3,
                        shape: ["circle", "circle"],
                        strokeDashArray: 0,
                        strokeWidth: 2,
                        hover: {
                            size: 4
                        }
                    },
                    xaxis: {
                        categories: [
                            "D1",
                            "D2",
                            "D3",
                            "D4",
                            "D5",
                            "D6",
                            "D7"
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
                                colors: "#64748B",
                                fontSize: "12px"
                            }
                        }
                    },
                    yaxis: {
                        tickAmount: 4,
                        max: 80,
                        min: 0,
                        labels: {
                            style: {
                                colors: "#64748B",
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
                    legend: {
                        show: true,
                        position: 'left',
                        fontSize: '12px',
                        horizontalAlign: 'bottom',
                        offsetX: -26,
                        offsetY: 0,
                        itemMargin: {
                            horizontal: 0,
                            vertical: 5
                        },
                        labels: {
                            colors: '#64748B'
                        },
                        markers: {
                            size: 6,
                            offsetX: -2,
                            offsetY: .5,
                            shape: 'square'
                        }
                    }
                };

                // Initialize and render the chart
                const chart = new ApexCharts(document.querySelector('#live_shipment_status_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}