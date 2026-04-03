import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Monitor, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { getLoginUrl } from '@/const';

export default function Home() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* 顶部导航 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100/50 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">深</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              员工风采展示系统
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">
                  欢迎，<span className="font-semibold text-foreground">{user?.name}</span>
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  退出
                </button>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button variant="default">登录</Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-6 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-16"
        >
          {/* 欢迎区域 */}
          <motion.div variants={itemVariants} className="text-center space-y-6 py-12">
            <h2 className="text-5xl font-bold text-foreground">
              深国际港口
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              打造对外展示软实力的重要窗口，展现港口人才梯队风貌
            </p>
          </motion.div>

          {/* 功能卡片 */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* 大屏展示 */}
            <motion.div
              whileHover={{ translateY: -8 }}
              onClick={() => setLocation('/showcase')}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-blue-100/50">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Monitor className="w-20 h-20 text-white opacity-90" />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    大屏展示
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    动态展示员工风采，支持部门筛选、实时时间更新、触控交互
                  </p>
                  <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                    进入展示 →
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 管理系统 */}
            <motion.div
              whileHover={{ translateY: -8 }}
              onClick={() => {
                if (isAuthenticated && user?.role === 'admin') {
                  setLocation('/admin');
                } else if (!isAuthenticated) {
                  window.location.href = getLoginUrl();
                } else {
                  alert('只有管理员可以访问管理系统');
                }
              }}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-blue-100/50">
                <div className="h-48 bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Settings className="w-20 h-20 text-white opacity-90" />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    管理系统
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    员工信息管理、荣誉管理、部门配置、轮播策略设置
                  </p>
                  <div className="flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all">
                    进入管理 →
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* 功能介绍 */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl p-12 shadow-lg border border-blue-100/50">
            <h3 className="text-2xl font-bold text-foreground mb-8">✨ 核心功能</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: '动态员工矩阵',
                  desc: '网格布局展示所有员工，支持卡片浮动和淡入淡出动效',
                },
                {
                  title: '部门筛选',
                  desc: '按部门、管理层、荣誉等维度快速筛选员工信息',
                },
                {
                  title: '员工详情',
                  desc: '点击卡片查看完整信息、工作职责、个人荣誉和座右铭',
                },
                {
                  title: '荣誉管理',
                  desc: '实时更新员工荣誉，支持 New 标签和奖杯图标显示',
                },
                {
                  title: '大屏适配',
                  desc: '针对 1920x1080 及以上分辨率优化，支持触控交互',
                },
                {
                  title: '轮播策略',
                  desc: '支持日常展示、核心骨干、荣誉榜等多种展示模式',
                },
              ].map((feature, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="font-semibold text-foreground">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 快速开始 */}
          <motion.div variants={itemVariants} className="text-center space-y-6 py-12 hidden">
            <h3 className="text-2xl font-bold text-foreground">🚀 快速开始</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setLocation('/showcase')}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Monitor className="w-5 h-5 mr-2" />
                查看大屏展示
              </Button>
              {isAuthenticated && user?.role === 'admin' && (
                <Button
                  onClick={() => setLocation('/admin')}
                  size="lg"
                  variant="outline"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  进入管理系统
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-blue-100/50 bg-white/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          <p>© 2026 深国际港口 | 员工风采展示系统</p>
        </div>
      </footer>
    </div>
  );
}
