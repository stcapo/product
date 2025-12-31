import React from 'react';
import { Layout } from 'antd';
import { VersionType } from '../types';

interface TopBarProps {
  version: VersionType;
  onVersionChange: (version: VersionType) => void;
}

export const TopBar: React.FC<TopBarProps> = () => {
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
        电商零售数据分析的可视化大屏
      </div>
    </Layout.Header>
  );
};

