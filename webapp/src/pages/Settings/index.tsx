import { useCallback } from 'react';
import { motion } from 'motion/react';
import { Tabs } from '@heroui/react';
import type { Key } from 'react';
import { staggerContainer, fadeUpItem } from '../../shared/lib/animations';
import { useNavigate, useParams } from 'react-router-dom';
import { GeneralTab } from './tabs/GeneralTab';
import { ProvidersTab } from './tabs/ProvidersTab';
import { McpTab } from './tabs/McpTab';
import { VoiceTab } from './tabs/VoiceTab';

const tabItems = [
  { key: 'general', label: '通用' },
  { key: 'providers', label: 'API供应商' },
  { key: 'mcp', label: 'MCP服务器' },
  { key: 'voice', label: '语音' },
] as const;

export function SettingsPage() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const activeTab = tab || 'general';

  const handleSelectionChange = useCallback((key: Key) => {
    navigate(`/settings/${String(key)}`);
  }, [navigate]);

  return (
    <motion.div
      animate="show"
      className="space-y-6"
      initial="hidden"
      variants={staggerContainer}
    >
      <motion.div variants={fadeUpItem}>
        <Tabs selectedKey={activeTab} onSelectionChange={handleSelectionChange}>
          <Tabs.ListContainer>
            <Tabs.List aria-label="设置分类">
              {tabItems.map((t) => (
                <Tabs.Tab key={t.key} id={t.key}>
                  <Tabs.Indicator />
                  {t.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </motion.div>

      <motion.div variants={fadeUpItem}>
        {activeTab === 'general' && <GeneralTab />}
        {activeTab === 'providers' && <ProvidersTab />}
        {activeTab === 'mcp' && <McpTab />}
        {activeTab === 'voice' && <VoiceTab />}
      </motion.div>
    </motion.div>
  );
}
