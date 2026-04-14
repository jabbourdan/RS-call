import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class CardsWithAmountService {

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
                            name: 'Projects',
                            data: [1870, 2000, 1490, 1410, 1680]
                        }
                    ],
                    chart: {
                        type: "bar",
                        height: 212,
                        toolbar: {
                            show: false
                        }
                    },
                    colors: [
                        "#605DFF"
                    ],
                    plotOptions: {
                        bar: {
                            horizontal: true
                        }
                    },
                    grid: {
                        show: true,
                        borderColor: "#ECEEF2"
                    },
                    dataLabels: {
                        enabled: true,
                        style: {
                            fontSize: '11px',
                            fontWeight: 'normal'
                        }
                    },
                    fill: {
                        opacity: 1
                    },
                    xaxis: {
                        categories: [
                            'Rewards Card', 'Cashback Card', 'Travel Card', 'Student Card', 'Business Card'
                        ],
                        axisTicks: {
                            show: true,
                            color: '#ECEEF2'
                        },
                        axisBorder: {
                            show: true,
                            color: '#ECEEF2'
                        },
                        labels: {
                            show: true,
                            style: {
                                colors: "#64748B",
                                fontSize: "11px"
                            }
                        }
                    },
                    yaxis: {
                        labels: {
                            style: {
                                colors: "#64748B",
                                fontSize: "11px"
                            }
                        },
                        axisBorder: {
                            show: true,
                            color: '#ECEEF2'
                        },
                        axisTicks: {
                            show: true,
                            color: '#ECEEF2'
                        }
                    }
                };

                // Initialize and render the chart
                const chart = new ApexCharts(document.querySelector('#cards_with_amount_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}