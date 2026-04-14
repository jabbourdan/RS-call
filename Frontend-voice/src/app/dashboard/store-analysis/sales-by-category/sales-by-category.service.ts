import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class SalesByCategoryService {

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
                            name: "Electronics",
                            data: [20, 100, 70, 30, 50, 80, 70]
                        },
                        {
                            name: "Non-electronics",
                            data: [68, 80, 33, 80, 70, 40, 30]
                        }
                    ],
                    chart: {
                        height: 344,
                        type: "radar",
                        toolbar: {
                            show: false
                        }
                    },
                    dataLabels: {
                        enabled: true
                    },
                    colors: [
                        "#FC6829", "#757DFF"
                    ],
                    plotOptions: {
                        radar: {
                            polygons: {
                                fill: {
                                    colors: ["#f8f8f8", "#ffffff"]
                                }
                            }
                        }
                    },
                    xaxis: {
                        categories: [
                            "Sunday",
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday"
                        ],
                        labels: {
                            show: true,
                            style: {
                                colors: "#A8A8A8",
                                fontSize: "12px"
                            }
                        }
                    },
                    yaxis: {
                        tickAmount: 5,
                        show: false
                    },
                    legend: {
                        show: true,
                        fontSize: '12px',
                        position: 'bottom',
                        horizontalAlign: 'center',
                        itemMargin: {
                            horizontal: 10,
                            vertical: 0
                        },
                        labels: {
                            colors: '#64748B'
                        },
                        markers: {
                            size: 6,
                            offsetX: -4,
                            offsetY: -.5,
                            strokeWidth: 0,
                            shape: 'square'
                        }
                    }
                };

                // Initialize and render the chart
                const chart = new ApexCharts(document.querySelector('#sales_by_category_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}