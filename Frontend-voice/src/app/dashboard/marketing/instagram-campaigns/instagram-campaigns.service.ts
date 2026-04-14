import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class InstagramCampaignsService {

    private isBrowser: boolean;
    private chartInstance: any;
    private updateInterval: any;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(): Promise<void> {
        if (this.isBrowser) {
            try {
                // Dynamically import ApexCharts
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options: ApexCharts.ApexOptions = {
                    series: [
                        {
                            name: "Budget",
                            data: [80, 200, 90, 220, 110, 220, 85]
                        },
                        {
                            name: "Followers",
                            data: [20, 120, 155, 90, 165, 100, 120]
                        }
                    ],
                    chart: {
                        type: "area",
                        height: 140,
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
                    stroke: {
                        curve: "smooth",
                        width: 2
                    },
                    colors: [
                        "#AD63F6", "#FF6D57"
                    ],
                    fill: {
                        type: 'gradient',
                        gradient: {
                            stops: [0, 90, 100],
                            shadeIntensity: 1,
                            opacityFrom: 0.5,
                            opacityTo: 0.5
                        }
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
                            show: false,
                            style: {
                                colors: "#8695AA",
                                fontSize: "12px"
                            }
                        }
                    },
                    yaxis: {
                        // tickAmount: 5,
                        show: false,
                        max: 250,
                        // min: 0,
                        labels: {
                            show: true,
                            style: {
                                colors: "#64748B",
                                fontSize: "12px"
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
                    },
                    grid: {
                        show: false,
                        borderColor: "#ECEEF2"
                    },
                    legend: {
                        show: false,
                        position: 'top',
                        fontSize: '12px',
                        horizontalAlign: 'center',
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
                    },
                    tooltip: {
                        y: {
                            formatter: (value: number, { seriesIndex }: { seriesIndex: number }) => {
                                return seriesIndex === 0 ? `$${value}` : value.toString();
                            }
                        }
                    }
                };
                // Render the chart
                this.chartInstance = new ApexCharts(document.querySelector('#instagram_campaigns_chart'), options);
                this.chartInstance.render();

                // Start live updates
                this.startLiveUpdates();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

    private startLiveUpdates(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.updateInterval = setInterval(() => {
            if (this.chartInstance) {
                this.chartInstance.updateSeries([
                    {
                        name: "Budget",
                        data: this.generateRandomData(7, 50, 250)
                    },
                    {
                        name: "Followers",
                        data: this.generateRandomData(7, 10, 200)
                    }
                ]);
            }
        }, 2000);
    }

    private generateRandomData(count: number, min: number, max: number): number[] {
        const data: number[] = [];
        for (let i = 0; i < count; i++) {
            data.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        return data;
    }

    stopLiveUpdates(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }

}