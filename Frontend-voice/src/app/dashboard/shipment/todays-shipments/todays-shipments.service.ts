import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class TodaysShipmentsService {

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
                    series: [{
                        name: "Shipment",
                        data: [10, 31, 25, 40, 50, 50, 100]
                    }],
                    chart: {
                        height: 188,
                        type: 'line',
                        zoom: {
                            enabled: false
                        },
                        toolbar: {
                            show: false
                        }
                    },
                    colors: [
                        '#5C61F2'
                    ],
                    dataLabels: {
                        enabled: false
                    },
                    stroke: {
                        curve: 'straight',
                        width: 2,
                    },
                    grid: {
                        show: true,
                        strokeDashArray: 5,
                        borderColor: "#EEF1FF"
                    },
                    xaxis: {
                        categories: [
                            "3am",
                            "6am",
                            "9am",
                            "12pm",
                            "3pm",
                            "6pm",
                            "9pm",
                            "12am",
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
                        tickAmount: 3,
                        max: 150,
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
                    tooltip: {
                        y: {
                            formatter: (val:any) => {
                                return val + ' Ton'
                            },
                        }
                    }
                };

                // Initialize and render the chart
                const chart = new ApexCharts(document.querySelector('#todays_shipments_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}