import React from 'react';
import { Layout, Segmented, Button, Space, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { VersionType } from '../types';
import { useExport } from '../hooks/useExport';

interface TopBarProps {
  version: VersionType;
  onVersionChange: (version: VersionType) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ version, onVersionChange }) => {
  const { isExporting, error, exportPage, clearError } = useExport();

  const handleExport = async () => {
    await exportPage('root');
    if (!error) {
      message.success('页面已导出');
    } else {
      message.error(error);
      clearError();
    }
  };

  return (
    <Layout.Header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingInline: 24,
        height: 64,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 600 }}>
        电商行为BI分析平台
      </div>

      <Space size="large">
        <Segmented
          value={version}
          onChange={(value) => onVersionChange(value as VersionType)}
          options={[
            { label: '深色分析版 (V1)', value: 'v1' },
            { label: '浅色商业版 (V2)', value: 'v2' }
          ]}
        />

        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExport}
          loading={isExporting}
        >
          导出当前页面
        </Button>
      </Space>
    </Layout.Header>
  );
};

