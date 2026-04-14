import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class ReRevenueService {

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
                            name: 'Income',
                            data: [
                                {
                                    x: '2019',
                                    y: 1292,
                                    goals: [
                                        {
                                            name: 'Expenses',
                                            value: 1400,
                                            strokeHeight: 5,
                                            strokeColor: '#FFCEA9'
                                        }
                                    ]
                                },
                                {
                                    x: '2020',
                                    y: 4432,
                                    goals: [
                                        {
                                            name: 'Expenses',
                                            value: 5400,
                                            strokeHeight: 5,
                                            strokeColor: '#FFCEA9'
                                        }
                                    ]
                                },
                                {
                                    x: '2021',
                                    y: 5423,
                                    goals: [
                                        {
                                            name: 'Expenses',
                                            value: 5200,
                                            strokeHeight: 5,
                                            strokeColor: '#FFCEA9'
                                        }
                                    ]
                                },
                                {
                                    x: '2022',
                                    y: 6653,
                                    goals: [
                                        {
                                            name: 'Expenses',
                                            value: 6500,
                                            strokeHeight: 5,
                                            strokeColor: '#FFCEA9'
                                        }
                                    ]
                                },
                                {
                                    x: '2023',
                                    y: 8133,
                                    goals: [
                                        {
                                            name: 'Expenses',
                                            value: 6600,
                                            strokeHeight: 13,
                                            strokeWidth: 0,
                                            strokeLineCap: 'round',
                                            strokeColor: '#FFCEA9'
                                        }
                                    ]
                                },
                                {
                                    x: '2024',
                                    y: 7132,
                                    goals: [
                                        {
                                            name: 'Expenses',
                                            value: 7500,
                                            strokeHeight: 5,
                                            strokeColor: '#FFCEA9'
                                        }
                                    ]
                                },
                                {
                                    x: '2025',
                                    y: 7332,
                                    goals: [
                                        {
                                            name: 'Expenses',
                                            value: 8700,
                                            strokeHeight: 5,
                                            strokeColor: '#FFCEA9'
                                        }
                                    ]
                                },
                            ]
                        }
                    ],
                    chart: {
                        height: 143,
                        type: 'bar',
                        toolbar: {
                            show: false
                        }
                    },
                    plotOptions: {
                        bar: {
                            columnWidth: '15.41px'
                        }
                    },
                    colors: [
                        '#FD5812'
                    ],
                    dataLabels: {
                        enabled: false
                    },
                    legend: {
                        show: true,
                        showForSingleSeries: true,
                        customLegendItems: ['Income', 'Expenses'],
                        horizontalAlign: 'bottom',
                        position: 'right',
                        fontSize: '12px',
                        offsetX: -17,
                        offsetY: 59,
                        itemMargin: {
                            horizontal: 0,
                            vertical: 4
                        },
                        labels: {
                            colors: '#64748B'
                        },
                        markers: {
                            size: 6,
                            offsetX: -3,
                            offsetY: -.5,
                            shape: 'square',
                            fillColors: ['#FD5812', '#FFCEA9']
                        }
                    },
                    xaxis: {
                        axisTicks: {
                            show: false,
                            color: '#DDE4FF'
                        },
                        axisBorder: {
                            show: false,
                            color: '#DDE4FF'
                        },
                        labels: {
                            show: false,
                            style: {
                                colors: "#64748B",
                                fontSize: "12px"
                            }
                        }
                    },
                    yaxis: {
                        labels: {
                            show: false,
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
                    grid: {
                        show: false,
                        borderColor: "#ECEEF2"
                    },
                    tooltip: {
                        y: {
                            formatter: function(val:any) {
                                return "$" + val + "k";
                            }
                        }
                    }
                };

                // Initialize and render the chart
                const chart = new ApexCharts(document.querySelector('#re_revenue_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}