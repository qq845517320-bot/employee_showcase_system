import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/lib/trpc';
import { ChevronLeft, ChevronRight, X, Search } from 'lucide-react';
import type { Employee } from '../../../drizzle/schema';

export default function Showcase() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 获取员工列表
  const { data: employeesData, isLoading } = trpc.employees.list.useQuery({});

  useEffect(() => {
    if (employeesData) {
      setEmployees(employeesData);
    }
  }, [employeesData]);

  // 重置无操作计时器
  const resetInactivityTimer = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    if (!selectedEmployee) {
      inactivityTimeoutRef.current = setTimeout(() => {
        setIsAutoPlay(true);
      }, 30000) as unknown as NodeJS.Timeout; // 30秒无操作后开始自动轮播
    }
  };

  // 监听用户操作
  useEffect(() => {
    const handleUserActivity = () => {
      if (isAutoPlay) {
        setIsAutoPlay(false);
        setCurrentIndex(0);
      }
      resetInactivityTimer();
    };

    window.addEventListener('click', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    resetInactivityTimer();

    return () => {
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [isAutoPlay, selectedEmployee]);

  // 自动轮播逻辑
  useEffect(() => {
    if (isAutoPlay && employees.length > 0) {
      autoPlayIntervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % employees.length);
      }, 5000) as unknown as NodeJS.Timeout; // 每5秒切换一次

      return () => {
        if (autoPlayIntervalRef.current) {
          clearInterval(autoPlayIntervalRef.current);
        }
      };
    }
  }, [isAutoPlay, employees.length]);

  // 处理员工卡片点击
  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsAutoPlay(false);
  };

  // 处理下一个员工
  const handleNextEmployee = () => {
    const currentIdx = employees.findIndex((e) => e.id === selectedEmployee?.id);
    if (currentIdx !== -1) {
      const nextIdx = (currentIdx + 1) % employees.length;
      setSelectedEmployee(employees[nextIdx]);
    }
  };

  // 处理上一个员工
  const handlePrevEmployee = () => {
    const currentIdx = employees.findIndex((e) => e.id === selectedEmployee?.id);
    if (currentIdx !== -1) {
      const prevIdx = currentIdx === 0 ? employees.length - 1 : currentIdx - 1;
      setSelectedEmployee(employees[prevIdx]);
    }
  };

  // 处理关闭详情面板
  const handleCloseDetail = () => {
    setSelectedEmployee(null);
    resetInactivityTimer();
  };

  if (isLoading) {
    return (
      <div className="showcase-container flex items-center justify-center">
        <div className="text-white text-2xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="showcase-container">
      {/* 顶部导航栏 */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">港</span>
            </div>
            <h1 className="text-3xl font-bold text-white">深国际靖江港 - 员工风采展示</h1>
          </div>
          <div className="text-white text-lg font-semibold">
            {new Date().toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="container mx-auto px-6 py-12">
        {/* 自动轮播状态指示 */}
        {isAutoPlay && (
          <div className="text-center mb-8">
            <motion.div
              animate={{ opacity: [0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="inline-block px-6 py-2 bg-white/20 rounded-full text-white text-lg font-semibold"
            >
              自动轮播中... 点击任意位置可交互
            </motion.div>
          </div>
        )}

        {/* 六边形网格布局 */}
        <div className="hexagon-grid">
          <AnimatePresence mode="wait">
            {isAutoPlay ? (
              // 自动轮播模式 - 显示当前员工
              <motion.div
                key={`carousel-${currentIndex}`}
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.6 }}
                className="w-full flex justify-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleEmployeeClick(employees[currentIndex])}
                  className="hexagon-item group"
                >
                  <div className="hexagon-clip bg-white/10">
                  {employees[currentIndex]?.workPhoto ? (
                    <img
                      src={employees[currentIndex].workPhoto}
                        alt={employees[currentIndex].name}
                        className="hexagon-image"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold">
                          {employees[currentIndex]?.name?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="hexagon-overlay">
                    <span className="text-white text-xl font-bold">点击查看详情</span>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              // 交互模式 - 显示所有员工
              <>
                {employees.map((employee) => (
                  <motion.div
                    key={employee.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleEmployeeClick(employee)}
                    className="hexagon-item group"
                  >
                    <div className="hexagon-clip bg-white/10">
                      {employee.workPhoto ? (
                        <img
                          src={employee.workPhoto}
                          alt={employee.name}
                          className="hexagon-image"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                          <span className="text-white text-4xl font-bold">
                            {employee.name?.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="hexagon-overlay">
                      <div className="text-center">
                        <div className="text-white text-lg font-bold">{employee.name}</div>
                        <div className="text-white/80 text-sm">{employee.position}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* 轮播指示器 */}
        {isAutoPlay && employees.length > 0 && (
          <div className="carousel-indicator mt-8">
            {employees.map((_, idx) => (
              <div
                key={idx}
                className={`indicator-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 详情面板 */}
      <AnimatePresence>
        {selectedEmployee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="detail-panel"
            onClick={handleCloseDetail}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: -50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 50 }}
              transition={{ duration: 0.4 }}
              className="detail-content"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 关闭按钮 */}
              <button
                onClick={handleCloseDetail}
                className="absolute top-4 right-4 z-10 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* 详情头部 */}
              <div className="detail-header">
                <div className="detail-photo">
                  {selectedEmployee.workPhoto ? (
                    <img
                      src={selectedEmployee.workPhoto}
                      alt={selectedEmployee.name}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                      <span className="text-white text-6xl font-bold">
                        {selectedEmployee.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="detail-info">
                  <div className="text-4xl font-bold mb-6">{selectedEmployee.name}</div>
                  <div className="detail-info-item">
                    <span className="detail-info-label">部门：</span>
                    <span className="detail-info-value">{selectedEmployee.departmentId}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-info-label">岗位：</span>
                    <span className="detail-info-value">{selectedEmployee.position}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-info-label">职务：</span>
                    <span className="detail-info-value">{selectedEmployee.level}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-info-label">入职时间：</span>
                    <span className="detail-info-value">
                      {selectedEmployee.joinDate
                        ? new Date(selectedEmployee.joinDate).toLocaleDateString('zh-CN')
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 详情内容 */}
              <div className="detail-body">
                {selectedEmployee.jobResponsibilities && (
                  <div className="detail-section">
                    <div className="detail-section-title">工作职责</div>
                    <div className="detail-section-content">
                      {selectedEmployee.jobResponsibilities}
                    </div>
                  </div>
                )}

                {selectedEmployee.motto && (
                  <div className="detail-section">
                    <div className="detail-section-title">工作信条</div>
                    <div className="detail-section-content italic">
                      "{selectedEmployee.motto}"
                    </div>
                  </div>
                )}
              </div>

              {/* 导航按钮 */}
              <div className="flex items-center justify-between px-8 py-4 border-t border-red-600/50">
                <button
                  onClick={handlePrevEmployee}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                <div className="text-white/70 text-sm">
                  {employees.findIndex((e) => e.id === selectedEmployee?.id) + 1} / {employees.length}
                </div>

                <button
                  onClick={handleNextEmployee}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 搜索框 - 底部中央 */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20">
            <Search className="w-5 h-5 text-gray-600" />
            <input
              type="text"
              placeholder="搜索员工..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                // 搜索员工
                if (e.target.value.trim()) {
                  const found = employees.find(
                    (emp) =>
                      emp.name.includes(e.target.value) ||
                      emp.position.includes(e.target.value)
                  );
                  if (found) {
                    setSelectedEmployee(found);
                    setIsAutoPlay(false);
                  }
                }
              }}
              className="bg-transparent outline-none text-gray-900 placeholder-gray-500 w-64"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
