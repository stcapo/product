import React, { useState, useEffect } from 'react';
import { Row, Col, Table, message } from 'antd';
import { FilterBar } from '../components/common/FilterBar';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { GlassCard } from '../components/cards/GlassCard';
import { PaperCard } from '../components/cards/PaperCard';
import { useFilters } from '../hooks/useFilters';
import { VersionType, CohortData } from '../types';
import { fetchTransactionData } from '../services/api';
import { applyFilters, getCohortData } from '../services/dataAdapter';
import { formatNumber } from '../utils/formatters';

interface CohortAnalysisProps {
  version: VersionType;
}

export const CohortAnalysis: React.FC<CohortAnalysisProps> = ({ version }) => {
  const [loading, setLoading] = useState(true);
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  const { filters, updateDateRange, updateCategories, updatePaymentMethods, updateGender, updateAgeGroups, clearFilters, hasActiveFilters } = useFilters();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const rawData = await fetchTransactionData();
        const filtered = applyFilters(rawData, filters);
        const data = getCohortData(filtered);
        setCohortData(data);
      } catch (error) {
        message.error('数据加载失败');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  const CardComponent = version === 'v1' ? GlassCard : PaperCard;

  if (loading) {
    return <LoadingSkeleton count={4} type="card" />;
  }

  // Build cohort table columns
  const maxMonths = Math.max(...cohortData.map(c => Math.max(...Object.keys(c.retentionByMonth).map(Number))), 0);
  const columns: any[] = [
    {
      title: '队列月份',
      dataIndex: 'cohortMonth',
      key: 'cohortMonth',
      width: 120
    },
    {
      title: '队列规模',
      dataIndex: 'cohortSize',
      key: 'cohortSize',
      render: (text: number) => formatNumber(text),
      width: 100
    }
  ];

  for (let i = 0; i <= maxMonths; i++) {
    columns.push({
      title: `M${i}`,
      key: `month_${i}`,
      width: 80,
      render: (_: any, record: CohortData) => {
        const retention = record.retentionByMonth[i];
        if (retention === undefined) return '-';
        return `${retention}%`;
      }
    });
  }

  const tableData = cohortData.map(c => ({
    ...c,
    key: c.cohortMonth
  }));

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

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <CardComponent>
            <h3 style={{ marginBottom: 16 }}>队列留存分析</h3>
            <div style={{ overflowX: 'auto' }}>
              <Table
                dataSource={tableData}
                columns={columns}
                pagination={false}
                rowKey="key"
                size="small"
              />
            </div>
          </CardComponent>
        </Col>
      </Row>
    </div>
  );
};

