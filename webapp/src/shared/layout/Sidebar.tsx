import type { ComponentType, ReactNode, SVGProps } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bars, Xmark } from '@gravity-ui/icons';
import { Button, Dropdown, Label } from '@heroui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  icon: ComponentType<SVGProps<SVGSVGElement>> | (() => ReactNode);
  id: string;
  path: string;
  showInBottomNav: boolean;
  isIconOnly: boolean;
}

interface SidebarProps {
  brand?: string;
  collapsed: boolean;
  items: NavItem[];
  onToggle: (v: boolean) => void;
}

export function Sidebar({
  brand = 'HeroUI',
  collapsed,
  items,
  onToggle,
}: SidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 hidden sm:block
        transition-all duration-300 ease-in-out bg-white border-r border-neutral-200
        ${collapsed ? 'w-18' : 'w-64'}`}
      >
        <div className="flex flex-col h-full p-4">
          <div
            className={`flex items-center mb-6 transition-all duration-300 ${
              collapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  initial={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden cursor-pointer"
                  onClick={() => onToggle(!collapsed)}
                >
                  <span className="text-lg font-bold whitespace-nowrap block text-neutral-900">
                    {brand}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              isIconOnly
              aria-label="Toggle sidebar"
              size="sm"
              variant="ghost"
              onPress={() => onToggle(!collapsed)}
            >
              {collapsed ? <Bars className="w-5 h-5" /> : <Xmark className="w-5 h-5" />}
            </Button>
          </div>

          <motion.nav
            layout
            className="flex-1 flex flex-col gap-1"
            transition={{ layout: { staggerChildren: 0.08 } }}
          >
            {items.map((item) => {
              const isActive = pathname === item.path;
              return (
                <motion.div key={item.id} layout className="flex items-center">
                  <Button
                    isIconOnly={collapsed}
                    size="lg"
                    variant={isActive ? 'primary' : 'ghost'}
                    className={`flex-1 justify-start px-3 mr-1 transition-all duration-300 ${isActive ? 'rounded-[15px]' : ''}`}
                    onPress={() => navigate(item.path)}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span
                      className="overflow-hidden whitespace-nowrap transition-all duration-300 font-bold"
                      style={{
                        maxWidth: collapsed ? 0 : '14rem',
                        opacity: collapsed ? 0 : 1,
                      }}
                    >
                      {item.id}
                    </span>
                  </Button>
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        animate={{ width: 8, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        initial={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="h-6 bg-blue-500 shrink-0 rounded-md"
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.nav>

          {/* User info at bottom */}
          <SidebarFooter collapsed={collapsed} />
        </div>
      </aside>

      <BottomNav items={items.filter((i) => i.showInBottomNav)} />
    </>
  );
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  if (collapsed) {
    return (
      <div className="border-t border-neutral-200 pt-3 flex justify-center">
        <Dropdown>
          <Button isIconOnly size="sm" variant="ghost" aria-label="用户菜单">
            <span className="text-xs font-medium">{user.username.charAt(0).toUpperCase()}</span>
          </Button>
          <Dropdown.Popover>
            <Dropdown.Menu onAction={(key) => { if (key === 'logout') logout(); }}>
              <Dropdown.Item id="logout" textValue="退出登录" variant="danger">
                <Label>退出登录</Label>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>
    );
  }

  return (
    <div className="border-t border-neutral-200 pt-3 px-1">
      <Dropdown>
        <Button variant="ghost" className="w-full justify-start px-2 py-5 rounded-xl">
          <div className="flex items-center gap-2 w-full">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700 shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate">{user.username}</p>
              <p className="text-xs text-neutral-400">{user.role === 'admin' ? '管理员' : '成员'}</p>
            </div>
          </div>
        </Button>
        <Dropdown.Popover>
          <Dropdown.Menu onAction={(key) => { if (key === 'logout') logout(); }}>
            <Dropdown.Item id="logout" textValue="退出登录" variant="danger">
              <Label>退出登录</Label>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </div>
  );
}
