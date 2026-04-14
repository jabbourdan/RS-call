import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class CriticalPatientsService {

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
                            name: "Orthopedics",
                            data: [10, 15, 21, 25, 19, 15, 25, 20, 20, 15, 21, 25, 17, 18, 15, 20, 15, 20, 18, 13]
                        },
                        {
                            name: "Cardiology",
                            data: [3, 7, 7, 10, 9, 7, 15, 3, 7, 7, 10, 9, 7, 13, 3, 7, 7, 10, 9, 7]
                        }
                    ],
                    chart: {
                        type: "area",
                        height: 120,
                        zoom: {
                            enabled: false
                        },
                        toolbar: {
                            show: false
                        }
                    },
                    colors: [
                        "#FD5812", "#796DF6"
                    ],
                    dataLabels: {
                        enabled: false
                    },
                    grid: {
                        show: false,
                        borderColor: "#ECEEF2"
                    },
                    stroke: {
                        curve: "straight",
                        width: 2
                    },
                    xaxis: {
                        categories: [
                            "01 Jan",
                            "02 Jan",
                            "03 Jan",
                            "04 Jan",
                            "05 Jan",
                            "06 Jan",
                            "07 Jan",
                            "08 Jan",
                            "09 Jan",
                            "10 Jan",
                            "11 Jan",
                            "12 Jan",
                            "13 Jan",
                            "14 Jan",
                            "15 Jan",
                            "16 Jan",
                            "17 Jan",
                            "18 Jan",
                            "19 Jan",
                            "20 Jan"
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
                            show: false,
                            style: {
                                colors: "#8695AA",
                                fontSize: "12px"
                            }
                        }
                    },
                    yaxis: {
                        // tickAmount: 6,
                        show: false,
                        max: 25,
                        min: 0,
                        labels: {
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

                // Initialize and render the chart
                const chart = new ApexCharts(document.querySelector('#critical_patients_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}