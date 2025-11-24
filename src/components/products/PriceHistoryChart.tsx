'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate } from '@/lib/utils';
import { Price } from '@/lib/supabase';

interface PriceHistoryData extends Price {
  retailer_name: string;
  retailer_slug: string;
}

interface PriceHistoryChartProps {
  data: PriceHistoryData[];
  productName: string;
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

export function PriceHistoryChart({ data, productName }: PriceHistoryChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  // Filter data based on time range
  const getFilteredData = () => {
    const now = new Date();
    const filtered = data.filter((item) => {
      const itemDate = new Date(item.scraped_at);
      const daysDiff = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));

      switch (timeRange) {
        case '7d':
          return daysDiff <= 7;
        case '30d':
          return daysDiff <= 30;
        case '90d':
          return daysDiff <= 90;
        default:
          return true;
      }
    });

    // Group by retailer and date
    const groupedByRetailer: { [key: string]: any[] } = {};

    filtered.forEach((item) => {
      if (!groupedByRetailer[item.retailer_slug]) {
        groupedByRetailer[item.retailer_slug] = [];
      }

      groupedByRetailer[item.retailer_slug].push({
        date: new Date(item.scraped_at).toISOString(),
        price: item.total_price,
        retailer: item.retailer_name,
      });
    });

    // Create chart data structure - use ISO dates for proper parsing
    const allDates = Array.from(
      new Set(filtered.map((item) => new Date(item.scraped_at).toISOString().split('T')[0]))
    ).sort();

    return allDates.map((date) => {
      const dataPoint: any = { date };

      Object.entries(groupedByRetailer).forEach(([slug, prices]) => {
        const priceOnDate = prices.find(
          (p) => new Date(p.date).toISOString().split('T')[0] === date
        );

        if (priceOnDate) {
          dataPoint[slug] = priceOnDate.price;
        }
      });

      return dataPoint;
    });
  };

  const chartData = getFilteredData();

  // Get unique retailers for legend colors - properly deduplicate by slug
  const retailerMap = new Map<string, { name: string; slug: string }>();
  data.forEach((item) => {
    if (!retailerMap.has(item.retailer_slug)) {
      retailerMap.set(item.retailer_slug, {
        name: item.retailer_name,
        slug: item.retailer_slug,
      });
    }
  });
  const retailers = Array.from(retailerMap.values());

  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
  ];

  // Calculate statistics
  const allPrices = data.map((d) => d.total_price);
  const lowestPrice = Math.min(...allPrices);
  const highestPrice = Math.max(...allPrices);
  const averagePrice = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Prishistorikk</CardTitle>
            <CardDescription>{productName}</CardDescription>
          </div>

          {/* Time range selector */}
          <div className="flex gap-2">
            {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === 'all' ? 'Alle' : range}
              </Button>
            ))}
          </div>
        </div>

        {/* Price statistics */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-sm text-muted-foreground">Laveste</p>
            <p className="text-lg font-bold text-green-600">{formatPrice(lowestPrice)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Gjennomsnitt</p>
            <p className="text-lg font-bold">{formatPrice(averagePrice)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Høyeste</p>
            <p className="text-lg font-bold text-red-600">{formatPrice(highestPrice)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('nb-NO', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${Math.floor(value)}kr`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => formatPrice(value)}
                labelFormatter={(label) => formatDate(label)}
              />
              <Legend />
              {retailers.map((retailer, index) => (
                <Line
                  key={retailer.slug}
                  type="monotone"
                  dataKey={retailer.slug}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  name={retailer.name}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            Ingen prishistorikk tilgjengelig for valgt periode
          </div>
        )}
      </CardContent>
    </Card>
  );
}
