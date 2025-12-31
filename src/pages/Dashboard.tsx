import React, { useState, useEffect } from 'react';
import { Row, Col, message } from 'antd';
import { FilterBar } from '../components/common/FilterBar';
import { KPICard } from '../components/common/KPICard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { GlassCard } from '../components/cards/GlassCard';
import { PaperCard } from '../components/cards/PaperCard';
import { TrendChart } from '../components/charts/v1/TrendChart';
import { CategoryDonutChart } from '../components/charts/v1/CategoryDonutChart';
import { CategoryBarChart } from '../components/charts/v1/CategoryBarChart';
import { HeatmapChart } from '../components/charts/v1/HeatmapChart';
import { CalendarHeatmap } from '../components/charts/v1/CalendarHeatmap';
import { HistogramChart } from '../components/charts/v1/HistogramChart';
import { AreaChart } from '../components/charts/v2/AreaChart';
import { StackedAreaChart } from '../components/charts/v2/StackedAreaChart';
import { DistributionChart } from '../components/charts/v2/DistributionChart';
import { StackedBarChart } from '../components/charts/v2/StackedBarChart';
import { ParetoChart } from '../components/charts/v2/ParetoChart';
import { GrowthRankChart } from '../components/charts/v2/GrowthRankChart';
import { useFilters } from '../hooks/useFilters';
import { VersionType, DashboardData } from '../types';
import { fetchTransactionData } from '../services/api';
import { applyFilters, getDashboardData } from '../services/dataAdapter';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface DashboardProps {
  version: VersionType;
}

export const Dashboard: React.FC<DashboardProps> = ({ version }) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const { filters, updateDateRange, updateCategories, updatePaymentMethods, updateGender, updateAgeGroups, clearFilters, hasActiveFilters } = useFilters();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const rawData = await fetchTransactionData();
        const filtered = applyFilters(rawData, filters);
        const data = getDashboardData(filtered, version);
        setDashboardData(data);
      } catch (error) {
        message.error('数据加载失败');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters, version]);

  const CardComponent = version === 'v1' ? GlassCard : PaperCard;

  if (loading || !dashboardData) {
    return <LoadingSkeleton count={4} type="card" />;
  }

  const kpiData = [
    { label: 'GMV', value: formatCurrency(dashboardData.kpis.gmv) },
    { label: '订单数', value: formatNumber(dashboardData.kpis.orderCount) },
    { label: '买家数', value: formatNumber(dashboardData.kpis.uniqueBuyers) },
    { label: '客单价', value: formatCurrency(dashboardData.kpis.aov) },
    { label: '件单价', value: formatCurrency(dashboardData.kpis.ipv) },
    { label: '复购率', value: `${dashboardData.kpis.repurchaseRate}%` }
  ];

  return (
    <div>
      <FilterBar
        filters={filters}
        onDateRangeChange={updateDateRange}
        onCategoriesChange={updateCategories}
        onPaymentMethodsChange={updatePaymentMethods}
        onGenderChange={updateGender}
        onAgeGroupsChange={updateAgeGroups}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters()}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpiData.map((kpi, index) => (
          <Col xs={24} sm={12} md={8} lg={4} key={index}>
            <KPICard data={kpi} version={version} />
          </Col>
        ))}
      </Row>

      {version === 'v1' ? (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <CardComponent>
                <TrendChart data={dashboardData.trendData} />
              </CardComponent>
            </Col>
            <Col xs={24} lg={12}>
              <CardComponent>
                <CategoryDonutChart data={dashboardData.categoryData} />
              </CardComponent>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <CardComponent>
                <CategoryBarChart data={dashboardData.categoryData} />
              </CardComponent>
            </Col>
            <Col xs={24} lg={12}>
              <CardComponent>
                <HeatmapChart data={dashboardData.paymentMethodData} xAxisKey="category" yAxisKey="payment" />
              </CardComponent>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24}>
              <CardComponent>
                <CalendarHeatmap data={dashboardData.calendarData} />
              </CardComponent>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <CardComponent>
                <HistogramChart data={dashboardData.ageDistribution} />
              </CardComponent>
            </Col>
          </Row>
        </>
      ) : (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <CardComponent>
                <AreaChart data={dashboardData.trendData} />
              </CardComponent>
            </Col>
            <Col xs={24} lg={12}>
              <CardComponent>
                <StackedAreaChart data={dashboardData.userNewVsReturning} />
              </CardComponent>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <CardComponent>
                <DistributionChart data={dashboardData.orderValueDistribution} />
              </CardComponent>
            </Col>
            <Col xs={24} lg={12}>
              <CardComponent>
                <StackedBarChart data={dashboardData.userNewVsReturning} seriesNames={['new', 'returning']} />
              </CardComponent>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <CardComponent>
                <ParetoChart data={dashboardData.userGmvPareto} />
              </CardComponent>
            </Col>
            <Col xs={24} lg={12}>
              <CardComponent>
                <GrowthRankChart data={dashboardData.categoryGrowth} />
              </CardComponent>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

