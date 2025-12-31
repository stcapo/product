import React from 'react';
import { Layout, ConfigProvider } from 'antd';
import { TopBar } from './TopBar';
import { SideNav } from './SideNav';
import { VersionType } from '../types';
import { themeV1, themeV2 } from '../styles/themes';

interface AppLayoutProps {
  version: VersionType;
  onVersionChange: (version: VersionType) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ version, onVersionChange, children }) => {
  const theme = version === 'v1' ? themeV1 : themeV2;
  const themeClass = version === 'v1' ? 'theme-v1' : 'theme-v2';

  return (
    <ConfigProvider theme={theme}>
      <Layout style={{ minHeight: '100vh' }} className={themeClass}>
        <TopBar version={version} onVersionChange={onVersionChange} />
        <Layout style={{ marginTop: 64 }}>
          <SideNav />
          <Layout.Content
            style={{
              marginLeft: 200,
              padding: 24,
              minHeight: 'calc(100vh - 88px)',
              overflow: 'auto'
            }}
          >
            {children}
          </Layout.Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

