import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Define all interfaces in the service
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

@Injectable({
  providedIn: 'root'
})
export class EventStatisticsService {
  private apiUrl = '/api/events';
  private useSyntheticData = true; // Toggle for using synthetic data

  constructor(private http: HttpClient) {}

  async getEventStatistics(filters: StatisticsFilter): Promise<EventStats> {
    if (this.useSyntheticData) {
      // Return synthetic data with a simulated delay
      return firstValueFrom(
        of(this.generateSyntheticData(filters)).pipe(delay(500))
      );
    }

    // Real API call
    let params = new HttpParams();
    if (filters.timeframe !== 'all') {
      params = params.set('timeframe', filters.timeframe);
    }
    if (filters.eventType !== 'all') {
      params = params.set('event_type', filters.eventType);
    }

    return firstValueFrom(
      this.http.get<EventStats>(`${this.apiUrl}/statistics`, { params })
    );
  }

  async getTopSellingEvents(limit = 10): Promise<TopSellingEvent[]> {
    if (this.useSyntheticData) {
      return firstValueFrom(
        of(this.generateTopSellingEvents(limit)).pipe(delay(300))
      );
    }

    const params = new HttpParams().set('limit', limit.toString());
    return firstValueFrom(
      this.http.get<TopSellingEvent[]>(`${this.apiUrl}/top-selling`, { params })
    );
  }

  async getMonthlyTrends(year?: number): Promise<MonthlyTrend[]> {
    if (this.useSyntheticData) {
      return firstValueFrom(
        of(this.generateMonthlyTrends()).pipe(delay(300))
      );
    }

    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }

    return firstValueFrom(
      this.http.get<MonthlyTrend[]>(`${this.apiUrl}/monthly-trends`, { params })
    );
  }

  async getEventTypeDistribution(): Promise<EventTypeDistribution[]> {
    if (this.useSyntheticData) {
      return firstValueFrom(
        of(this.generateEventTypeDistribution()).pipe(delay(300))
      );
    }

    return firstValueFrom(
      this.http.get<EventTypeDistribution[]>(`${this.apiUrl}/type-distribution`)
    );
  }

  // Synthetic data generation methods
  private generateSyntheticData(filters: StatisticsFilter): EventStats {
    // Apply some filtering logic to modify data based on filters
    let baseMultiplier = 1;

    switch (filters.timeframe) {
      case 'week':
        baseMultiplier = 0.05;
        break;
      case 'month':
        baseMultiplier = 0.2;
        break;
      case 'quarter':
        baseMultiplier = 0.5;
        break;
      case 'year':
        baseMultiplier = 0.8;
        break;
    }

    const eventTypeMultiplier = filters.eventType === 'all' ? 1 : 0.25;
    const multiplier = baseMultiplier * eventTypeMultiplier;

    return {
      totalTicketsSold: Math.round(45678 * multiplier),
      totalRevenue: Math.round(2345678 * multiplier),
      totalEvents: Math.round(234 * multiplier),
      averageTicketsPerEvent: 195.2,
      topSellingEvents: this.generateTopSellingEvents(5),
      monthlyTrends: this.generateMonthlyTrends(),
      eventTypeDistribution: this.generateEventTypeDistribution(),
      dailySales: this.generateDailySales(),
      priceRangeAnalysis: this.generatePriceRangeAnalysis(),
      performanceInsights: {
        conversionRate: 68.5,
        repeatCustomers: 42.3,
        avgOrderValue: 89.99
      },
      popularVenues: this.generatePopularVenues(),
      peakHours: this.generatePeakHours()
    };
  }

  private generateTopSellingEvents(limit: number): TopSellingEvent[] {
    const events = [
      { name: 'Taylor Swift - Eras Tour', tickets: 15000, revenue: 2250000, date: '2024-06-15', avgPrice: 150 },
      { name: 'Coachella Music Festival', tickets: 12000, revenue: 1800000, date: '2024-04-12', avgPrice: 150 },
      { name: 'Hamilton Broadway Show', tickets: 8500, revenue: 1445000, date: '2024-03-20', avgPrice: 170 },
      { name: 'NBA Finals Game 7', tickets: 7200, revenue: 1440000, date: '2024-06-18', avgPrice: 200 },
      { name: 'Comic-Con 2024', tickets: 6800, revenue: 816000, date: '2024-07-25', avgPrice: 120 },
      { name: 'Beyoncé Renaissance Tour', tickets: 6500, revenue: 975000, date: '2024-05-10', avgPrice: 150 },
      { name: 'Super Bowl LVIII', tickets: 5200, revenue: 2080000, date: '2024-02-11', avgPrice: 400 },
      { name: 'Burning Man Festival', tickets: 4800, revenue: 720000, date: '2024-08-27', avgPrice: 150 },
      { name: 'The Lion King Broadway', tickets: 4500, revenue: 675000, date: '2024-04-05', avgPrice: 150 },
      { name: 'UFC Championship Fight', tickets: 4200, revenue: 630000, date: '2024-03-30', avgPrice: 150 }
    ];

    return events.slice(0, limit);
  }

  private generateMonthlyTrends(): MonthlyTrend[] {
    return [
      { month: 'Jan', tickets: 3200, revenue: 320000, events: 15 },
      { month: 'Feb', tickets: 3800, revenue: 380000, events: 18 },
      { month: 'Mar', tickets: 4200, revenue: 420000, events: 22 },
      { month: 'Apr', tickets: 5100, revenue: 510000, events: 25 },
      { month: 'May', tickets: 5800, revenue: 580000, events: 28 },
      { month: 'Jun', tickets: 6200, revenue: 620000, events: 30 },
      { month: 'Jul', tickets: 5900, revenue: 590000, events: 28 },
      { month: 'Aug', tickets: 5400, revenue: 540000, events: 26 },
      { month: 'Sep', tickets: 4800, revenue: 480000, events: 23 },
      { month: 'Oct', tickets: 4300, revenue: 430000, events: 20 },
      { month: 'Nov', tickets: 3900, revenue: 390000, events: 18 },
      { month: 'Dec', tickets: 3500, revenue: 350000, events: 16 }
    ];
  }

  private generateEventTypeDistribution(): EventTypeDistribution[] {
    const distribution = [
      { type: 'Concerts', tickets: 18500, percentage: 40.5, color: '#3B82F6' },
      { type: 'Sports', tickets: 12300, percentage: 26.9, color: '#10B981' },
      { type: 'Theater', tickets: 8200, percentage: 17.9, color: '#F59E0B' },
      { type: 'Festivals', tickets: 4600, percentage: 10.1, color: '#EF4444' },
      { type: 'Other', tickets: 2078, percentage: 4.6, color: '#8B5CF6' }
    ];

    return distribution;
  }

  private generateDailySales(): DailySales[] {
    return [
      { day: 'Monday', tickets: 4200, revenue: 378000 },
      { day: 'Tuesday', tickets: 4800, revenue: 432000 },
      { day: 'Wednesday', tickets: 5200, revenue: 468000 },
      { day: 'Thursday', tickets: 5800, revenue: 522000 },
      { day: 'Friday', tickets: 8200, revenue: 738000 },
      { day: 'Saturday', tickets: 9500, revenue: 855000 },
      { day: 'Sunday', tickets: 7978, revenue: 718020 }
    ];
  }

  private generatePriceRangeAnalysis(): PriceRangeAnalysis[] {
    return [
      { range: '$0-50', tickets: 8500, events: 45, avgPrice: 35 },
      { range: '$51-100', tickets: 12300, events: 62, avgPrice: 75 },
      { range: '$101-200', tickets: 15600, events: 78, avgPrice: 150 },
      { range: '$201-500', tickets: 7800, events: 39, avgPrice: 350 },
      { range: '$500+', tickets: 1478, events: 10, avgPrice: 750 }
    ];
  }

  private generatePopularVenues(): PopularVenue[] {
    return [
      { name: 'Madison Square Garden', percentage: 22.5 },
      { name: 'Hollywood Bowl', percentage: 18.3 },
      { name: 'Red Rocks Amphitheatre', percentage: 15.7 },
      { name: 'The Forum', percentage: 12.1 },
      { name: 'Other Venues', percentage: 31.4 }
    ];
  }

  private generatePeakHours(): PeakHour[] {
    return [
      { time: '6:00 PM - 8:00 PM', percentage: 35.2 },
      { time: '8:00 PM - 10:00 PM', percentage: 28.6 },
      { time: '2:00 PM - 4:00 PM', percentage: 18.4 },
      { time: '10:00 AM - 12:00 PM', percentage: 12.3 },
      { time: 'Other Hours', percentage: 5.5 }
    ];
  }
}
