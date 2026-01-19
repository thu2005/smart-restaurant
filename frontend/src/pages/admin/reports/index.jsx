import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../../contexts/CurrencyContext';
import OverviewMetrics from './components/OverviewMetrics';
import RevenueOverTimeChart from './components/RevenueOverTimeChart';
import PeakHoursChart from './components/PeakHoursChart';
import TopSellingItemsTable from './components/TopSellingItemsTable';
import TopItemsModal from './components/TopItemsModal';
import DateRangeSelector from './components/DateRangeSelector';
import ExportButtons from './components/ExportButtons';
import reportApi from '../../../services/reportApi';

const Reports = () => {
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();
    const [dateRange, setDateRange] = useState('last7days');
    const [chartPeriod, setChartPeriod] = useState('daily');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Data states
    const [metrics, setMetrics] = useState([]);
    const [revenueChartData, setRevenueChartData] = useState([]);
    const [peakHoursData, setPeakHoursData] = useState([]);
    const [topItems, setTopItems] = useState([]);
    const [allTopItems, setAllTopItems] = useState([]);
    const [showAllItemsModal, setShowAllItemsModal] = useState(false);

    // Get restaurantId from localStorage
    const getRestaurantId = () => {
        return localStorage.getItem('restaurantId') || 'default-restaurant-id';
    };

    // Calculate date range based on selection
    const getDateRangeFromSelection = (selection) => {
        const now = new Date();
        let startDate, endDate;

        switch (selection) {
            case 'last7days':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                endDate = now;
                break;
            case 'last30days':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                endDate = now;
                break;
            case 'thisMonth':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = now;
                break;
            case 'lastMonth':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                endDate = now;
        }

        return { startDate, endDate };
    };

    // Fetch all report data
    const fetchReportData = async () => {
        try {
            setLoading(true);
            setError(null);

            const restaurantId = getRestaurantId();
            const { startDate, endDate } = getDateRangeFromSelection(dateRange);

            // Calculate previous period for comparison
            const previousPeriod = reportApi.calculatePreviousPeriod(startDate, endDate);

            // Fetch data in parallel
            const [
                currentRevenueData,
                previousRevenueData,
                topItemsData,
                chartData,
                hourlyData,
                ordersData,
            ] = await Promise.all([
                reportApi.getRevenueReport(restaurantId, startDate, endDate),
                reportApi.getRevenueReport(restaurantId, previousPeriod.startDate, previousPeriod.endDate),
                reportApi.getTopItems(restaurantId, 5, startDate, endDate),
                reportApi.getRevenueChartData(restaurantId, chartPeriod, startDate, endDate),
                reportApi.getRevenueChartData(restaurantId, 'hourly', startDate, endDate),
                reportApi.getOrders(restaurantId, startDate, endDate),
            ]);

            // Calculate period comparison
            const comparison = reportApi.calculatePeriodComparison(
                currentRevenueData,
                previousRevenueData
            );

            // Calculate average prep time
            const avgPrepTime = reportApi.calculateAveragePrepTime(ordersData);

            // Calculate peak hours
            const peakHours = reportApi.getPeakHours(hourlyData.chartData, 6);

            // Build metrics
            const newMetrics = [
                {
                    title: t('reports.metrics.totalRevenue'),
                    value: formatCurrency(comparison.totalRevenue.current),
                    change: `${comparison.totalRevenue.change >= 0 ? '+' : ''}${comparison.totalRevenue.change.toFixed(1)}% ${t('reports.metrics.vsLastPeriod')}`,
                    changeType: comparison.totalRevenue.change >= 0 ? 'positive' : 'negative',
                    icon: 'DollarSign',
                    iconColor: '#27ae60',
                },
                {
                    title: t('reports.metrics.totalOrders'),
                    value: comparison.totalOrders.current.toString(),
                    change: `${comparison.totalOrders.change >= 0 ? '+' : ''}${comparison.totalOrders.change.toFixed(1)}% ${t('reports.metrics.vsLastPeriod')}`,
                    changeType: comparison.totalOrders.change >= 0 ? 'positive' : 'negative',
                    icon: 'ShoppingBag',
                    iconColor: '#3498db',
                },
                {
                    title: t('reports.metrics.avgOrderValue'),
                    value: formatCurrency(comparison.averageOrderValue.current),
                    change: `${comparison.averageOrderValue.change >= 0 ? '+' : ''}${comparison.averageOrderValue.change.toFixed(1)}% ${t('reports.metrics.vsLastPeriod')}`,
                    changeType: comparison.averageOrderValue.change >= 0 ? 'positive' : 'negative',
                    icon: 'TrendingUp',
                    iconColor: '#f39c12',
                },
                {
                    title: t('reports.metrics.avgPrepTime'),
                    value: `${avgPrepTime} ${t('common.time.min')}`,
                    change: t('reports.metrics.currentPeriod'),
                    changeType: 'neutral',
                    icon: 'Clock',
                    iconColor: '#e74c3c',
                },
            ];

            setMetrics(newMetrics);
            setRevenueChartData(chartData.chartData || []);
            setPeakHoursData(peakHours);
            setTopItems(topItemsData);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching report data:', err);
            setError(err.message || 'Failed to load report data');
            setLoading(false);
        }
    };

    // Fetch data on mount and when filters change
    useEffect(() => {
        fetchReportData();
    }, [dateRange]);

    // Fetch chart data when period changes
    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const restaurantId = getRestaurantId();
                const { startDate, endDate } = getDateRangeFromSelection(dateRange);
                const chartData = await reportApi.getRevenueChartData(
                    restaurantId,
                    chartPeriod,
                    startDate,
                    endDate
                );
                setRevenueChartData(chartData.chartData || []);
            } catch (err) {
                console.error('Error fetching chart data:', err);
            }
        };

        fetchChartData();
    }, [chartPeriod]);

    // Handle export to PDF
    const handleExportPDF = () => {
        const { startDate, endDate } = getDateRangeFromSelection(dateRange);
        const exportData = {
            restaurantId: getRestaurantId(),
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            dateRange,
        };
        reportApi.exportToPDF(exportData, `report-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    // Handle export to CSV
    const handleExportCSV = () => {
        const exportData = {
            metrics,
            topItems,
            dateRange,
        };
        reportApi.exportToCSV(exportData, `report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`);
    };

    // Handle View All Items
    const handleViewAllItems = async () => {
        try {
            const restaurantId = getRestaurantId();
            const { startDate, endDate } = getDateRangeFromSelection(dateRange);

            // Fetch all top items (limit 50)
            const allItems = await reportApi.getTopItems(restaurantId, 50, startDate, endDate);
            setAllTopItems(allItems);
            setShowAllItemsModal(true);
        } catch (error) {
            console.error('Error fetching all items:', error);
        }
    };

    // Loading state
    if (loading && metrics.length === 0) {
        return (
            <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-[1920px] mx-auto">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">{t('reports.loading')}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error && metrics.length === 0) {
        return (
            <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-[1920px] mx-auto">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <h2 className="text-xl font-semibold mb-2">{t('reports.error.title')}</h2>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <button
                            onClick={fetchReportData}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                        >
                            {t('reports.error.retry')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-[1920px] mx-auto">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
                            {t('reports.title')}
                        </h1>
                        <p className="text-sm md:text-base text-muted-foreground">
                            {t('reports.subtitle')}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <DateRangeSelector value={dateRange} onChange={setDateRange} />
                        <ExportButtons
                            onExportPDF={handleExportPDF}
                            onExportCSV={handleExportCSV}
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>

            {/* Overview Metrics */}
            <div className="mb-6 md:mb-8">
                <OverviewMetrics metrics={metrics} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="lg:col-span-2">
                    <RevenueOverTimeChart
                        data={revenueChartData}
                        period={chartPeriod}
                        onPeriodChange={setChartPeriod}
                    />
                </div>
                <div>
                    <PeakHoursChart data={peakHoursData} />
                </div>
            </div>

            {/* Top Selling Items Table */}
            <div>
                <TopSellingItemsTable
                    items={topItems}
                    onViewAll={handleViewAllItems}
                />
            </div>

            {/* View All Items Modal */}
            {showAllItemsModal && (
                <TopItemsModal
                    items={allTopItems}
                    onClose={() => setShowAllItemsModal(false)}
                />
            )}
        </div>
    );
};

export default Reports;
