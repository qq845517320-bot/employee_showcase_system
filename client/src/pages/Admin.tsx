import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { Users, Settings, LogOut } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import EmployeeManagement from '@/components/admin/EmployeeManagement';
import DepartmentManagement from '@/components/admin/DepartmentManagement';
import CompanyManagement from '@/components/admin/CompanyManagement';
import HonorManagement from '@/components/admin/HonorManagement';
import PlaybackStrategyManagement from '@/components/admin/PlaybackStrategyManagement';
import BackgroundManagement from '@/components/admin/BackgroundManagement';
import CoreBoneManagement from '@/components/admin/CoreBoneManagement';
import AwardManagement from '@/components/admin/AwardManagement';

type AdminTab = 'employees' | 'departments' | 'companies' | 'honors' | 'playback' | 'background' | 'coreBone' | 'awards';

export default function Admin() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<AdminTab>('employees');

  // 检查是否为管理员
  if (!isAuthenticated) {
    setLocation('/');
    return null;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">无访问权限</h1>
          <p className="text-muted-foreground mb-4">只有管理员可以访问此页面</p>
          <button
            onClick={() => setLocation('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'employees' as AdminTab, label: '员工管理', icon: Users },
    { id: 'departments' as AdminTab, label: '部门管理', icon: Settings },
    { id: 'companies' as AdminTab, label: '公司管理', icon: Settings },
    { id: 'coreBone' as AdminTab, label: '骨干管理', icon: Settings },
    { id: 'honors' as AdminTab, label: '荣誉管理', icon: Settings },
    { id: 'awards' as AdminTab, label: '奖项管理', icon: Settings },
    { id: 'playback' as AdminTab, label: '轮播策略', icon: Settings },
    { id: 'background' as AdminTab, label: '背景管理', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-border/50 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">员工风采管理系统</h1>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </header>

      <div className="flex">
        {/* 侧边栏 */}
        <aside className="w-48 bg-white border-r border-border/50 min-h-screen">
          <nav className="p-4 space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* 主内容区域 */}
        <main className="flex-1">
          <div className="container mx-auto px-6 py-8">
            <div className="bg-card rounded-lg border border-border/50 shadow-lg">
              {activeTab === 'employees' && <EmployeeManagement />}
              {activeTab === 'departments' && <DepartmentManagement />}
              {activeTab === 'companies' && <CompanyManagement />}
              {activeTab === 'coreBone' && <CoreBoneManagement />}
              {activeTab === 'honors' && <HonorManagement />}
              {activeTab === 'awards' && <AwardManagement />}
              {activeTab === 'playback' && <PlaybackStrategyManagement />}
              {activeTab === 'background' && <BackgroundManagement />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
