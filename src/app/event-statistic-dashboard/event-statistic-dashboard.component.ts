import {Component, OnInit, ViewChild, ElementRef, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { EventStatisticsService, EventStats } from "../event-statistics.service";
import { Subscription } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-event-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-10">
      <div class="max-w-7xl mx-auto">
        <div class="mb-8">
          <h3 class="font-bold text-gray-900 mb-2">Event ticket sales analytics</h3>
          <p class="text-gray-600">Comprehensive insights into event ticket sales performance</p>
        </div>

        <!-- Data Source Toggle Section -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4"
             [class.border-green-500]="!isUsingSyntheticData"
             [class.border-blue-500]="isUsingSyntheticData">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <svg class="h-8 w-8 mr-3" [class.text-green-600]="!isUsingSyntheticData"
                     [class.text-blue-600]="isUsingSyntheticData" fill="currentColor" viewBox="0 0 20 20">
                  <path *ngIf="!isUsingSyntheticData" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  <path *ngIf="isUsingSyntheticData" d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5z"/>
                </svg>
                <div>
                  <h4 class="text-lg font-semibold text-gray-900">Data Source</h4>
                  <p class="text-sm text-gray-600">
                    {{ isUsingSyntheticData ? 'Currently using synthetic demo data' : 'Connected to live database' }}
                  </p>
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <!-- Toggle Switch -->
              <div class="flex items-center">
                <span class="text-sm text-gray-700 mr-3">
                  {{ isUsingSyntheticData ? 'Demo' : 'Live' }}
                </span>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    class="sr-only peer"
                    [checked]="isUsingSyntheticData"
                    (change)="toggleDataSource()"
                    [disabled]="toggleLoading">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span class="text-sm text-gray-700 ml-3">
                  {{ isUsingSyntheticData ? 'Real' : 'Demo' }}
                </span>
              </div>

              <!-- Status Indicator -->
              <div class="flex items-center">
                <div class="h-3 w-3 rounded-full mr-2"
                     [class.bg-green-400]="!isUsingSyntheticData"
                     [class.bg-blue-400]="isUsingSyntheticData"
                     [class.animate-pulse]="toggleLoading"></div>
                <span class="text-sm font-medium"
                      [class.text-green-600]="!isUsingSyntheticData"
                      [class.text-blue-600]="isUsingSyntheticData">
                  {{ toggleLoading ? 'Switching...' : (isUsingSyntheticData ? 'Demo Data' : 'Live Data') }}
                </span>
              </div>
            </div>
          </div>

          <div *ngIf="dataSourceMessage" class="mt-4 p-3 rounded-md"
               [class.bg-blue-50]="isUsingSyntheticData"
               [class.bg-green-50]="!isUsingSyntheticData">
            <p class="text-sm"
               [class.text-blue-700]="isUsingSyntheticData"
               [class.text-green-700]="!isUsingSyntheticData">
              {{ dataSourceMessage }}
            </p>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-4 mb-6">
          <div class="flex flex-wrap gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Time period</label>
              <select
                [(ngModel)]="selectedTimeframe"
                (change)="onFilterChange()"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All time</option>
                <option value="year">This year</option>
                <option value="quarter">This quarter</option>
                <option value="month">This month</option>
                <option value="week">This week</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Event type</label>
              <select
                [(ngModel)]="selectedEventType"
                (change)="onFilterChange()"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All events</option>
                <option value="CONCERT">Concerts only</option>
                <option value="FESTIVAL">Festivals only</option>
                <option value="THEATER">Theater only</option>
                <option value="SPORTS">Sports only</option>
              </select>
            </div>
            <div class="flex items-end">
              <button
                (click)="refreshData()"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                [disabled]="loading"
              >
                {{ loading ? 'Loading...' : 'Refresh data' }}
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">Loading statistics...</span>
        </div>

        <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error loading statistics</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ error }}</p>
              </div>
              <div class="mt-3">
                <button
                  (click)="refreshData()"
                  class="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors">
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!loading && stats">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Total tickets sold</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.totalTicketsSold | number }}</p>
                  <p class="text-sm text-green-600 flex items-center mt-1">
                    ↗ +15.3%
                  </p>
                </div>
                <div class="p-3 rounded-full bg-blue-100">
                  <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Total revenue</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.totalRevenue | currency }}</p>
                  <p class="text-sm text-green-600 flex items-center mt-1">
                    ↗ +22.1%
                  </p>
                </div>
                <div class="p-3 rounded-full bg-green-100">
                  <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Total events</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.totalEvents | number }}</p>
                  <p class="text-sm text-green-600 flex items-center mt-1">
                    ↗ +8.7%
                  </p>
                </div>
                <div class="p-3 rounded-full bg-purple-100">
                  <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Avg tickets/event</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.averageTicketsPerEvent | number:'1.1-1' }}</p>
                  <p class="text-sm text-red-600 flex items-center mt-1">
                    ↘ -2.4%
                  </p>
                </div>
                <div class="p-3 rounded-full bg-orange-100">
                  <svg class="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow-md p-6">
              <h4 class="font-semibold text-gray-900 mb-4">Monthly sales trends</h4>
              <div class="h-80">
                <canvas #monthlyTrendsChart></canvas>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <h4 class="font-semibold text-gray-900 mb-4">Tickets by event type</h4>
              <div class="h-80">
                <canvas #eventTypeChart></canvas>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow-md p-6">
              <h4 class="font-semibold text-gray-900 mb-4">Sales by day of week</h4>
              <div class="h-80">
                <canvas #dailySalesChart></canvas>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <h4 class="font-semibold text-gray-900 mb-4">Ticket sales by price range</h4>
              <div class="h-80">
                <canvas #priceRangeChart></canvas>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h4 class="text font-semibold text-gray-900 mb-4">Top performing events</h4>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets sold</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg price</th>
                </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let event of stats.topSellingEvents; let i = index" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8">
                        <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span class="text-sm font-medium text-blue-600">{{ i + 1 }}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ event.name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ event.date | date:'shortDate' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ event.tickets | number }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ event.revenue | currency }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ event.avgPrice | currency }}
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-center mb-4">
                <svg class="h-10 w-10 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <h5 class="font-semibold text-gray-900 pt-3">Performance</h5>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Conversion rate</span>
                  <span class="text-sm font-medium">{{ stats.performanceInsights.conversionRate }}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Repeat customers</span>
                  <span class="text-sm font-medium">{{ stats.performanceInsights.repeatCustomers }}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Avg order value</span>
                  <span class="text-sm font-medium">{{ stats.performanceInsights.avgOrderValue | currency }}</span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-center mb-4">
                <svg class="h-10 w-10 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <h5 class="font-semibold text-gray-900 pt-3">Popular venues</h5>
              </div>
              <div class="space-y-3">
                <div *ngFor="let venue of stats.popularVenues" class="flex justify-between">
                  <span class="text-sm text-gray-600">{{ venue.name }}</span>
                  <span class="text-sm font-medium">{{ venue.percentage }}%</span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-center mb-4">
                <svg class="h-10 w-10 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h5 class="font-semibold text-gray-900 pt-3">Peak hours</h5>
              </div>
              <div class="space-y-3">
                <div *ngFor="let hour of stats.peakHours" class="flex justify-between">
                  <span class="text-sm text-gray-600">{{ hour.time }}</span>
                  <span class="text-sm font-medium">{{ hour.percentage }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    canvas {
      max-height: 300px;
    }

    /* Custom toggle switch styling */
    .peer:checked ~ .slider {
      background-color: #3B82F6;
    }

    .peer:focus ~ .slider {
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }
  `]
})
export class EventStatisticsComponent implements OnInit, OnDestroy {
  @ViewChild('monthlyTrendsChart', {static: false}) monthlyTrendsChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('eventTypeChart', {static: false}) eventTypeChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('dailySalesChart', {static: false}) dailySalesChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('priceRangeChart', {static: false}) priceRangeChart!: ElementRef<HTMLCanvasElement>;

  stats: EventStats | null = null;
  loading = true;
  error: string | null = null;
  selectedTimeframe = 'all';
  selectedEventType = 'all';

  // Data source properties
  isUsingSyntheticData = true;
  toggleLoading = false;
  dataSourceMessage = '';

  private charts: { [key: string]: Chart } = {};
  private dataSourceSubscription?: Subscription;

  constructor(private eventStatisticsService: EventStatisticsService) {
  }

  ngOnInit(): void {
    this.dataSourceSubscription = this.eventStatisticsService.dataSource$.subscribe(
      (isUsingSynthetic) => {
        this.isUsingSyntheticData = isUsingSynthetic;
      }
    );

    this.initializeDataSource();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
    if (this.dataSourceSubscription) {
      this.dataSourceSubscription.unsubscribe();
    }
  }

  async initializeDataSource(): Promise<void> {
    try {
      const status = await this.eventStatisticsService.checkDataSourceStatus();
      this.dataSourceMessage = status.message;
      this.isUsingSyntheticData = status.use_synthetic_data;
    } catch (error) {
      console.error('Error checking data source status:', error);
      this.dataSourceMessage = 'Using default synthetic data';
    } finally {
      this.loadStatistics();
    }
  }

  async toggleDataSource(): Promise<void> {
    this.toggleLoading = true;
    this.error = null;

    try {
      const status = await this.eventStatisticsService.toggleDataSource();
      this.dataSourceMessage = status.message;
      this.isUsingSyntheticData = status.use_synthetic_data;

      await this.loadStatistics();
    } catch (error) {
      this.error = 'Failed to switch data source. Please try again.';
      console.error('Error toggling data source:', error);
    } finally {
      this.toggleLoading = false;
    }
  }

  async loadStatistics(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      this.stats = await this.eventStatisticsService.getEventStatistics({
        timeframe: this.selectedTimeframe,
        eventType: this.selectedEventType
      });

      setTimeout(() => {
        this.createCharts();
      }, 100);

    } catch (error) {
      this.error = 'Failed to load statistics. Please try again later.';
      console.error('Error loading statistics:', error);
    } finally {
      this.loading = false;
    }
  }

  onFilterChange(): void {
    this.loadStatistics();
  }

  refreshData(): void {
    this.loadStatistics();
  }

  private createCharts(): void {
    if (!this.stats) return;

    this.destroyCharts();

    this.createMonthlyTrendsChart();

    this.createEventTypeChart();

    this.createDailySalesChart();

    this.createPriceRangeChart();
  }

  private destroyCharts(): void {
    Object.keys(this.charts).forEach(key => {
      if (this.charts[key]) {
        this.charts[key].destroy();
        delete this.charts[key];
      }
    });
  }

  private createMonthlyTrendsChart(): void {
    if (!this.monthlyTrendsChart || !this.stats) return;

    const ctx = this.monthlyTrendsChart.nativeElement.getContext('2d');
    if (!ctx) return;

    this.charts['monthlyTrends'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.stats.monthlyTrends.map(trend => trend.month),
        datasets: [
          {
            label: 'Tickets Sold',
            data: this.stats.monthlyTrends.map(trend => trend.tickets),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Revenue ($)',
            data: this.stats.monthlyTrends.map(trend => trend.revenue),
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Tickets'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Revenue ($)'
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        }
      }
    });
  }

  private createEventTypeChart(): void {
    if (!this.eventTypeChart || !this.stats) return;

    const ctx = this.eventTypeChart.nativeElement.getContext('2d');
    if (!ctx) return;

    this.charts['eventType'] = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.stats.eventTypeDistribution.map(type => type.type),
        datasets: [{
          data: this.stats.eventTypeDistribution.map(type => type.tickets),
          backgroundColor: this.stats.eventTypeDistribution.map(type => type.color),
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} tickets (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  private createDailySalesChart(): void {
    if (!this.dailySalesChart || !this.stats) return;

    const ctx = this.dailySalesChart.nativeElement.getContext('2d');
    if (!ctx) return;

    this.charts['dailySales'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.stats.dailySales.map(day => day.day),
        datasets: [
          {
            label: 'Tickets',
            data: this.stats.dailySales.map(day => day.tickets),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          },
          {
            label: 'Revenue',
            data: this.stats.dailySales.map(day => day.revenue),
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgb(16, 185, 129)',
            borderWidth: 1,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Tickets'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Revenue ($)'
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        }
      }
    });
  }

  private createPriceRangeChart(): void {
    if (!this.priceRangeChart || !this.stats) return;

    const ctx = this.priceRangeChart.nativeElement.getContext('2d');
    if (!ctx) return;

    this.charts['priceRange'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.stats.priceRangeAnalysis.map(range => range.range),
        datasets: [{
          label: 'Tickets Sold',
          data: this.stats.priceRangeAnalysis.map(range => range.tickets),
          backgroundColor: 'rgba(147, 51, 234, 0.8)',
          borderColor: 'rgb(147, 51, 234)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              afterLabel: function (context) {
                const index = context.dataIndex;
                const stats = (context.chart as any).config._config.data.stats;
                if (stats) {
                  const priceData = stats.priceRangeAnalysis[index];
                  return [
                    `Events: ${priceData.events}`,
                    `Avg Price: ${priceData.avgPrice}`
                  ];
                }
                return [];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Tickets'
            }
          }
        }
      }
    });

    (this.charts['priceRange'] as any).config._config.data.stats = this.stats;
  }
}
