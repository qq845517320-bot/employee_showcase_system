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
  const [backgroundUrl, setBackgroundUrl] = useState<string>('');
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 获取员工列表
  const { data: employeesData, isLoading } = trpc.employees.list.useQuery({} as any);
  
  // 获取活跃背景图片
  const { data: backgroundData } = trpc.backgrounds.getActive.useQuery({} as any, {
    refetchInterval: 5000, // 每5秒检查一次
  });

  useEffect(() => {
    if (employeesData) {
      setEmployees(employeesData);
    }
  }, [employeesData]);

  useEffect(() => {
    if (backgroundData?.backgroundUrl) {
      setBackgroundUrl(backgroundData.backgroundUrl);
    }
  }, [backgroundData]);

  // 重置不活动计时器
  const resetInactivityTimer = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    setIsAutoPlay(false);
    
    inactivityTimeoutRef.current = setTimeout(() => {
      setIsAutoPlay(true);
      setCurrentIndex(0);
    }, 30000); // 30秒后开始自动轮播
  };

  useEffect(() => {
    resetInactivityTimer();
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, []);

  // 自动轮播逻辑
  useEffect(() => {
    if (isAutoPlay && employees.length > 0) {
      autoPlayIntervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % employees.length);
      }, 5000); // 每5秒切换一个员工
    } else {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    }

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, [isAutoPlay, employees.length]);

  const handleCloseDetail = () => {
    setSelectedEmployee(null);
    resetInactivityTimer();
  };

  const handlePrevEmployee = () => {
    const currentIdx = employees.findIndex((e) => e.id === selectedEmployee?.id);
    if (currentIdx > 0) {
      setSelectedEmployee(employees[currentIdx - 1]);
    }
    resetInactivityTimer();
  };

  const handleNextEmployee = () => {
    const currentIdx = employees.findIndex((e) => e.id === selectedEmployee?.id);
    if (currentIdx < employees.length - 1) {
      setSelectedEmployee(employees[currentIdx + 1]);
    }
    resetInactivityTimer();
  };

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsAutoPlay(false);
    resetInactivityTimer();
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const found = employees.find(
        (emp) =>
          emp.name.includes(searchQuery) ||
          emp.position.includes(searchQuery)
      );
      if (found) {
        setSelectedEmployee(found);
        setIsAutoPlay(false);
        resetInactivityTimer();
      } else {
        alert('未找到该员工');
      }
    }
  };

  if (isLoading) {
    return <div className="w-full h-screen flex items-center justify-center bg-red-900">加载中...</div>;
  }

  // 分左右两列 - 每列最多4个
  const leftColumn = employees.slice(0, Math.min(4, employees.length));
  const rightColumn = employees.slice(Math.min(4, employees.length), Math.min(8, employees.length));

  return (
    <div
      className="w-full h-screen overflow-hidden relative"
      style={{
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={() => {
        if (isAutoPlay) {
          setIsAutoPlay(false);
          resetInactivityTimer();
        }
      }}
    >
      {/* 背景遮罩 */}
      {!backgroundUrl && <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-red-800 to-red-900 opacity-90" />}

      {/* 顶部导航 */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-red-900">
            港
          </div>
          <h1 className="text-4xl font-bold">员工风采展示</h1>
        </div>
        <div className="text-2xl font-semibold">
          {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="absolute inset-0 pt-24 pb-20 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isAutoPlay && employees.length > 0 ? (
            // 自动轮播模式 - 全屏展示单个员工
            <motion.div
              key={`autoplay-${currentIndex}`}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.6 }}
              className="w-full h-full flex items-center justify-center"
            >
              <div className="flex items-center gap-12">
                {/* 左侧照片 */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex-shrink-0"
                >
                  <div
                    className="relative"
                    style={{
                      width: '300px',
                      height: '300px',
                      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    }}
                  >
                    {employees[currentIndex]?.workPhoto ? (
                      <img
                        src={employees[currentIndex].workPhoto}
                        alt={employees[currentIndex].name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                        <span className="text-white text-6xl font-bold">
                          {employees[currentIndex]?.name?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* 右侧信息 */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-white space-y-6 flex-1"
                >
                  <div>
                    <div className="text-5xl font-bold mb-2">{employees[currentIndex]?.name}</div>
                    <div className="text-2xl text-red-200">职级：{employees[currentIndex]?.level}</div>
                  </div>
                  <div className="space-y-3 text-xl">
                    <div>岗位：{employees[currentIndex]?.position}</div>
                    <div>入职时间：{new Date(employees[currentIndex]?.joinDate || 0).toLocaleDateString()}</div>
                  </div>
                  <div className="border-t border-white/30 pt-4">
                    <div className="font-semibold mb-2">工作职责：</div>
                    <div className="text-lg leading-relaxed">{employees[currentIndex]?.jobResponsibilities}</div>
                  </div>
                  <div className="border-t border-white/30 pt-4">
                    <div className="font-semibold mb-2">工作信条：</div>
                    <div className="text-lg italic">{employees[currentIndex]?.motto}</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            // 交互模式 - 显示所有员工的六边形
            <div className="w-full h-full flex items-center justify-between px-12">
              {/* 左列 - 4个六边形 */}
              <div className="flex flex-col gap-6 justify-center">
                {leftColumn.map((employee) => (
                  <motion.div
                    key={employee.id}
                    whileHover={{ scale: 1.15 }}
                    className="cursor-pointer"
                    onClick={() => handleEmployeeClick(employee)}
                  >
                    <div
                      className="relative flex items-center justify-center overflow-hidden group"
                      style={{
                        width: '140px',
                        height: '140px',
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                      }}
                    >
                      {employee.workPhoto ? (
                        <img
                          src={employee.workPhoto}
                          alt={employee.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">{employee.name?.charAt(0)}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <span className="text-white text-xs font-bold text-center px-2">点击查看</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 右列 - 4个六边形 */}
              <div className="flex flex-col gap-6 justify-center">
                {rightColumn.map((employee) => (
                  <motion.div
                    key={employee.id}
                    whileHover={{ scale: 1.15 }}
                    className="cursor-pointer"
                    onClick={() => handleEmployeeClick(employee)}
                  >
                    <div
                      className="relative flex items-center justify-center overflow-hidden group"
                      style={{
                        width: '140px',
                        height: '140px',
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                      }}
                    >
                      {employee.workPhoto ? (
                        <img
                          src={employee.workPhoto}
                          alt={employee.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">{employee.name?.charAt(0)}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <span className="text-white text-xs font-bold text-center px-2">点击查看</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 详情面板 */}
      <AnimatePresence>
        {selectedEmployee && !isAutoPlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center"
            onClick={handleCloseDetail}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: -50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 50 }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-br from-red-800 to-red-900 rounded-2xl p-8 max-w-3xl w-full mx-4 text-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 关闭按钮 */}
              <button
                onClick={handleCloseDetail}
                className="absolute top-4 right-4 z-10 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              <div className="grid grid-cols-2 gap-8">
                {/* 左侧照片 */}
                <div>
                  <div
                    className="relative overflow-hidden"
                    style={{
                      width: '280px',
                      height: '280px',
                      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    }}
                  >
                    {selectedEmployee.workPhoto ? (
                      <img
                        src={selectedEmployee.workPhoto}
                        alt={selectedEmployee.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                        <span className="text-white text-6xl font-bold">{selectedEmployee.name?.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 右侧信息 */}
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold mb-1">{selectedEmployee.name}</div>
                    <div className="text-red-200">职级：{selectedEmployee.level}</div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>岗位：{selectedEmployee.position}</div>
                    <div>入职时间：{new Date(selectedEmployee.joinDate || 0).toLocaleDateString()}</div>
                  </div>

                  <div className="border-t border-white/30 pt-3">
                    <div className="font-semibold mb-2 text-sm">工作职责：</div>
                    <div className="text-xs leading-relaxed">{selectedEmployee.jobResponsibilities}</div>
                  </div>

                  <div className="border-t border-white/30 pt-3">
                    <div className="font-semibold mb-2 text-sm">工作信条：</div>
                    <div className="text-xs italic">{selectedEmployee.motto}</div>
                  </div>

                  {/* 荣誉展示 - 暂时隐藏，待后续实现 */}
                </div>
              </div>

              {/* 导航按钮 */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/30">
                <button
                  onClick={handlePrevEmployee}
                  disabled={employees.findIndex((e) => e.id === selectedEmployee.id) === 0}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <span className="text-sm text-gray-300">
                  {employees.findIndex((e) => e.id === selectedEmployee.id) + 1} / {employees.length}
                </span>
                <button
                  onClick={handleNextEmployee}
                  disabled={employees.findIndex((e) => e.id === selectedEmployee.id) === employees.length - 1}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20">
            <input
              type="text"
              placeholder="搜索员工名称或岗位..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="bg-transparent outline-none text-gray-900 placeholder-gray-500 w-64"
            />
            <button
              onClick={handleSearch}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>
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
