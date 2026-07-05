import { House, Camera, Person, Gear, Comment, Picture, Pin, HeartPulse } from '@gravity-ui/icons';

export const siteConfig = {
  name: '智能管家',
  description: '面向独居人群的智能家居管理系统',
};

export type PageKey = 'Dashboard' | 'Emotion' | 'Camera' | 'Family' | 'Chat' | 'Album' | 'Memo' | 'Settings';

export const pages: {
  icon: typeof House;
  id: PageKey;
  path: string;
  subtitle: string;
  showInBottomNav: boolean;
  isIconOnly: boolean;
}[] = [
  {
    icon: House,
    id: 'Dashboard',
    path: '/',
    subtitle: '系统总览与传感器数据',
    showInBottomNav: true,
    isIconOnly: false,
  },
  {
    icon: HeartPulse,
    id: 'Emotion',
    path: '/emotion',
    subtitle: '情绪分析与心理健康',
    showInBottomNav: true,
    isIconOnly: false,
  },
  {
    icon: Person,
    id: 'Family',
    path: '/family',
    subtitle: '家庭成员与健康状态',
    showInBottomNav: true,
    isIconOnly: false,
  },
  {
    icon: Picture,
    id: 'Album',
    path: '/album',
    subtitle: '家庭相册与照片管理',
    showInBottomNav: true,
    isIconOnly: false,
  },
  {
    icon: Pin,
    id: 'Memo',
    path: '/memo',
    subtitle: '家庭备忘录与留言板',
    showInBottomNav: true,
    isIconOnly: false,
  },
  {
    icon: Comment,
    id: 'Chat',
    path: '/chat',
    subtitle: 'AI 智能会话助手',
    showInBottomNav: true,
    isIconOnly: false,
  },
  {
    icon: Camera,
    id: 'Camera',
    path: '/camera',
    subtitle: '硬件设备管理与实时监控',
    showInBottomNav: true,
    isIconOnly: false,
  },
  {
    icon: Gear,
    id: 'Settings',
    path: '/settings',
    subtitle: 'API供应商、Skills、MCP及系统设置',
    showInBottomNav: true,
    isIconOnly: false,
  },
];
