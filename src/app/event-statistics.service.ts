import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, BehaviorSubject } from 'rxjs';
import {environment} from "../environments/environment";
import {httpHelper} from "./utils/HttpHelper";

export interface EventStats {
  totalTicketsSold: number;
  totalRevenue: number;
  totalEvents: number;
  averageTicketsPerEvent: number;
  topSellingEvents: TopSellingEvent[];
  monthlyTrends: MonthlyTrend[];
  eventTypeDistribution: EventTypeDistribution[];
  dailySales: DailySales[];
  priceRangeAnalysis: PriceRangeAnalysis[];
  performanceInsights: PerformanceInsights;
  popularVenues: PopularVenue[];
  peakHours: PeakHour[];
}

export interface TopSellingEvent {
  name: string;
  tickets: number;
  revenue: number;
  date: string;
  avgPrice: number;
}

export interface MonthlyTrend {
  month: string;
  tickets: number;
  revenue: number;
  events: number;
}

export interface EventTypeDistribution {
  type: string;
  tickets: number;
  percentage: number;
  color: string;
}

export interface DailySales {
  day: string;
  tickets: number;
  revenue: number;
}

export interface PriceRangeAnalysis {
  range: string;
  tickets: number;
  events: number;
  avgPrice: number;
}

export interface PerformanceInsights {
  conversionRate: number;
  repeatCustomers: number;
  avgOrderValue: number;
}

export interface PopularVenue {
  name: string;
  percentage: number;
}

export interface PeakHour {
  time: string;
  percentage: number;
}

export interface StatisticsFilter {
  timeframe: string;
  eventType: string;
}

export interface DataSourceStatus {
  use_synthetic_data: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventStatisticsService {
  private apiUrl = `${environment.apiUrl}/events/statistics`;

  private dataSourceSubject = new BehaviorSubject<boolean>(true);
  public dataSource$ = this.dataSourceSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkDataSourceStatus();
  }

  async getEventStatistics(filters: StatisticsFilter): Promise<EventStats> {
    let params = new HttpParams();

    if (filters.timeframe !== 'all') {
      params = params.set('timeframe', filters.timeframe);
    }
    if (filters.eventType !== 'all') {
      params = params.set('event_type', filters.eventType);
    }

    return firstValueFrom(
      this.http.get<EventStats>(`${this.apiUrl}`, { params: params, headers: httpHelper.getAuthHeaders() })
    );
  }

  async getTopSellingEvents(limit = 10): Promise<TopSellingEvent[]> {
    const params = new HttpParams().set('limit', limit.toString());

    return firstValueFrom(
      this.http.get<TopSellingEvent[]>(`${this.apiUrl}/top-selling/`, { params: params, headers: httpHelper.getAuthHeaders() })
    );
  }

  async getMonthlyTrends(year?: number): Promise<MonthlyTrend[]> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }

    return firstValueFrom(
      this.http.get<MonthlyTrend[]>(`${this.apiUrl}/monthly-trends/`, { params: params, headers: httpHelper.getAuthHeaders() })
    );
  }

  async getEventTypeDistribution(): Promise<EventTypeDistribution[]> {
    return firstValueFrom(
      this.http.get<EventTypeDistribution[]>(`${this.apiUrl}/type-distribution/`, { headers: httpHelper.getAuthHeaders() })
    );
  }

  async toggleDataSource(): Promise<DataSourceStatus> {
    const response = await firstValueFrom(
      this.http.post<DataSourceStatus>(`${this.apiUrl}/toggle-data-source/`, { headers: httpHelper.getAuthHeaders() })
    );

    this.dataSourceSubject.next(response.use_synthetic_data);

    return response;
  }

  async checkDataSourceStatus(): Promise<DataSourceStatus> {
    try {
      const response = await firstValueFrom(
        this.http.get<DataSourceStatus>(`${this.apiUrl}/data-source-status/`, { headers: httpHelper.getAuthHeaders() })
      );

      console.log(response);

      this.dataSourceSubject.next(response.use_synthetic_data);

      return response;
    } catch (error) {
      console.error('Error checking data source status:', error);
      this.dataSourceSubject.next(true);
      return { use_synthetic_data: true, message: 'API not available, using synthetic data' };
    }
  }

  getCurrentDataSource(): boolean {
    return this.dataSourceSubject.value;
  }

  isUsingSyntheticData(): boolean {
    return this.dataSourceSubject.value;
  }

  isUsingRealData(): boolean {
    return !this.dataSourceSubject.value;
  }

  async useSyntheticData(): Promise<DataSourceStatus> {
    if (this.isUsingRealData()) {
      return this.toggleDataSource();
    }
    return this.checkDataSourceStatus();
  }


  async useRealData(): Promise<DataSourceStatus> {
    if (this.isUsingSyntheticData()) {
      return this.toggleDataSource();
    }
    return this.checkDataSourceStatus();
  }
}
