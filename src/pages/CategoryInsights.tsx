import React, { useState, useEffect } from 'react';
import { Row, Col, Table, message } from 'antd';
import { FilterBar } from '../components/common/FilterBar';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { GlassCard } from '../components/cards/GlassCard';
import { PaperCard } from '../components/cards/PaperCard';
import { StackedBarChart } from '../components/charts/v2/StackedBarChart';
import { GrowthRankChart } from '../components/charts/v2/GrowthRankChart';
import { useFilters } from '../hooks/useFilters';
import { VersionType, CategoryInsightsData } from '../types';
import { fetchTransactionData } from '../services/api';
import { applyFilters, getCategoryData } from '../services/dataAdapter';
import { formatCurrency } from '../utils/formatters';

interface CategoryInsightsProps {
  version: VersionType;
}

export const CategoryInsights: React.FC<CategoryInsightsProps> = ({ version }) => {
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<CategoryInsightsData | null>(null);
  const { filters, updateDateRange, updateCategories, updatePaymentMethods, updateGender, updateAgeGroups, clearFilters, hasActiveFilters } = useFilters();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const rawData = await fetchTransactionData();
        const filtered = applyFilters(rawData, filters);
        const data = getCategoryData(filtered, version);
        setCategoryData(data);
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

  if (loading || !categoryData) {
    return <LoadingSkeleton count={4} type="card" />;
  }

  const aovColumns = [
    { title: '品类', dataIndex: 'category', key: 'category' },
    { title: '客单价', dataIndex: 'aov', key: 'aov', render: (text: number) => formatCurrency(text) }
  ];

  const growthColumns = [
    { title: '品类', dataIndex: 'category', key: 'category' },
    { title: '增长率', dataIndex: 'growthRate', key: 'growthRate', render: (text: number) => `${text}%` }
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
        <Col xs={24} lg={12}>
          <CardComponent>
            <StackedBarChart data={categoryData.categoryTrends} title="品类趋势分析" seriesNames={categoryData.categoryTrends[0] ? Object.keys(categoryData.categoryTrends[0]).filter(k => k !== 'date') : []} />
          </CardComponent>
        </Col>
        <Col xs={24} lg={12}>
          <CardComponent>
            <GrowthRankChart data={categoryData.categoryGrowth} title="品类增长排行" />
          </CardComponent>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <CardComponent>
            <h3 style={{ marginBottom: 16 }}>品类客单价排行</h3>
            <Table
              dataSource={categoryData.categoryAov}
              columns={aovColumns}
              pagination={false}
              rowKey="category"
            />
          </CardComponent>
        </Col>
        <Col xs={24} lg={12}>
          <CardComponent>
            <h3 style={{ marginBottom: 16 }}>品类增长排行</h3>
            <Table
              dataSource={categoryData.categoryGrowth}
              columns={growthColumns}
              pagination={false}
              rowKey="category"
            />
          </CardComponent>
        </Col>
      </Row>
    </div>
  );
};

