import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class NetProfitService {

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
                            name: "Net Profit",
                            data: [130, 200, 160, 80, 70, 120, 140]
                        }
                    ],
                    chart: {
                        type: "bar",
                        height: 204,
                        toolbar: {
                            show: false
                        }
                    },
                    colors: [
                        "#37D80A"
                    ],
                    plotOptions: {
                        bar: {
                            columnWidth: "15px",
                            colors: {
                                backgroundBarColors: ["#37D80A"],
                                backgroundBarOpacity: 0.2
                            }
                        }
                    },
                    grid: {
                        show: true,
                        borderColor: "#F6F7F9"
                    },
                    dataLabels: {
                        enabled: false
                    },
                    xaxis: {
                        categories: [
                            "Mon",
                            "Tue",
                            "Wed",
                            "Thu",
                            "Fri",
                            "Sat",
                            "Sun"
                        ],
                        axisTicks: {
                            show: true,
                            color: '#F6F7F9'
                        },
                        axisBorder: {
                            show: true,
                            color: '#F6F7F9'
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
                        max: 200,
                        min: 0,
                        labels: {
                            formatter: (val:any) => {
                                return '$' + val;
                            },
                            style: {
                                colors: "#64748B",
                                fontSize: "12px"
                            }
                        },
                        axisBorder: {
                            show: false,
                            color: '#F6F7F9'
                        },
                        axisTicks: {
                            show: false,
                            color: '#F6F7F9'
                        }
                    },
                    tooltip: {
                        y: {
                            formatter: function(val:any) {
                                return "$" + val + "k";
                            }
                        }
                    },
                    legend: {
                        show: true,
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
                const chart = new ApexCharts(document.querySelector('#net_profit_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}