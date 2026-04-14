import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class SocialSearchService {

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
                    series: [35, 50, 60, 70],
                    chart: {
                        height: 255,
                        type: 'radialBar'
                    },
                    plotOptions: {
                        radialBar: {
                            hollow: {
                                size: '40%'
                            },
                            dataLabels: {
                                show: true,
                                name: {
                                    offsetY: -10,
                                    fontSize: '14px',
                                    color: '#64748B',
                                    fontWeight: '400'
                                },
                                value: {
                                    show: true,
                                    color: '#3A4252',
                                    fontSize: '22px',
                                    fontWeight: '600',
                                    offsetY: 3
                                },
                                total: {
                                    show: false,
                                    fontSize: '14px',
                                    color: '#64748B',
                                    fontWeight: '400'
                                }
                            }
                        }
                    },
                    labels: ['Facebook', 'Instagram', 'Linkedin', 'YouTube'],
                    colors: ['#AD63F6', '#3584FC', '#37D80A', '#FD5812']
                };

                // Initialize and render the chart
                const chart = new ApexCharts(document.querySelector('#social_search_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}