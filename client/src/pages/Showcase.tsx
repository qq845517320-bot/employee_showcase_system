import { useEffect, useState, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';

export default function Showcase() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [currentDetailIndex, setCurrentDetailIndex] = useState(0);
  const [backgroundUrl, setBackgroundUrl] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const batchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const detailIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isAutoPlayDetail, setIsAutoPlayDetail] = useState(false);

  // 获取员工列表
  const { data: employeesData, isLoading } = trpc.employees.list.useQuery({} as any);
  
  // 获取活跃背景图片
  const { data: backgroundData } = trpc.backgrounds.getActive.useQuery({} as any, {
    refetchInterval: 5000,
  });

  // 实时时间更新
  useEffect(() => {
    timeIntervalRef.current = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (employeesData) {
      setEmployees(employeesData);
      setFilteredEmployees(employeesData);
    }
  }, [employeesData]);

  useEffect(() => {
    if (backgroundData?.backgroundUrl) {
      setBackgroundUrl(backgroundData.backgroundUrl);
    }
  }, [backgroundData]);

  // 搜索功能
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees);
      setSelectedEmployee(null);
    } else {
      const results = employees.filter(emp =>
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(results);
      // 搜索后显示第一个结果的详情
      if (results.length > 0) {
        setSelectedEmployee(results[0]);
        setCurrentDetailIndex(0);
      }
    }
    resetInactivityTimer();
  };

  // 重置无操作计时器
  const resetInactivityTimer = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    setIsAutoPlayDetail(false);
    
    // 停止详情轮播
    if (detailIntervalRef.current) {
      clearInterval(detailIntervalRef.current);
    }
    
    // 启动照片墙轮播
    startBatchRotation();
    
    inactivityTimeoutRef.current = setTimeout(() => {
      setIsAutoPlayDetail(true);
      stopBatchRotation();
      startDetailRotation();
    }, 30000); // 30秒无操作后启动详情轮播
  };

  // 启动批次轮播（照片墙）
  const startBatchRotation = () => {
    if (batchIntervalRef.current) {
      clearInterval(batchIntervalRef.current);
    }
    
    batchIntervalRef.current = setInterval(() => {
      setCurrentBatchIndex(prev => {
        const totalBatches = Math.ceil(filteredEmployees.length / 10);
        return (prev + 1) % totalBatches;
      });
    }, 5000); // 每5秒切换一批
  };

  // 停止批次轮播
  const stopBatchRotation = () => {
    if (batchIntervalRef.current) {
      clearInterval(batchIntervalRef.current);
    }
  };

  // 启动详情轮播
  const startDetailRotation = () => {
    if (detailIntervalRef.current) {
      clearInterval(detailIntervalRef.current);
    }
    
    let index = currentDetailIndex;
    detailIntervalRef.current = setInterval(() => {
      index = (index + 1) % filteredEmployees.length;
      setCurrentDetailIndex(index);
      setSelectedEmployee(filteredEmployees[index]);
    }, 5000); // 每5秒切换一位员工
  };

  // 处理员工点击
  const handleEmployeeClick = (employee: any) => {
    setIsAutoPlayDetail(false);
    setSelectedEmployee(employee);
    if (batchIntervalRef.current) {
      clearInterval(batchIntervalRef.current);
    }
    resetInactivityTimer();
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      if (batchIntervalRef.current) clearInterval(batchIntervalRef.current);
      if (detailIntervalRef.current) clearInterval(detailIntervalRef.current);
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    };
  }, []);

  // 初始化无操作计时器
  useEffect(() => {
    resetInactivityTimer();
  }, [filteredEmployees]);

  // 当进入详情轮播模式时，启动轮播
  useEffect(() => {
    if (isAutoPlayDetail && filteredEmployees.length > 0) {
      if (!selectedEmployee) {
        setSelectedEmployee(filteredEmployees[0]);
        setCurrentDetailIndex(0);
      }
      startDetailRotation();
    }
    return () => {
      if (detailIntervalRef.current) {
        clearInterval(detailIntervalRef.current);
      }
    };
  }, [isAutoPlayDetail, filteredEmployees]);

  // 打印调试信息
  useEffect(() => {
    console.log('selectedEmployee:', selectedEmployee);
    console.log('isAutoPlayDetail:', isAutoPlayDetail);
  }, [selectedEmployee, isAutoPlayDetail]);

  // 处理详情轮播面板点击
  const handleDetailPanelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (isLoading) {
    return <div className="w-full h-screen flex items-center justify-center bg-red-900">加载中...</div>;
  }

  // 获取当前批次的10个员工
  const batchSize = 10;
  const startIndex = currentBatchIndex * batchSize;
  const currentBatch = filteredEmployees.slice(startIndex, startIndex + batchSize);

  // 分布：左2 - 左中3 - 中间空白 - 右中3 - 右2
  const leftColumn = currentBatch.slice(0, 2);
  const leftMiddleColumn = currentBatch.slice(2, 5);
  const rightMiddleColumn = currentBatch.slice(5, 8);
  const rightColumn = currentBatch.slice(8, 10);

  return (
    <div
      className="w-full h-screen overflow-hidden relative"
      style={{
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={() => {
        setSelectedEmployee(null);
        setIsAutoPlayDetail(false);
        if (detailIntervalRef.current) {
          clearInterval(detailIntervalRef.current);
        }
        resetInactivityTimer();
      }}
    >
      {/* 顶部导航栏 */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between px-8 z-40">
        <div className="flex items-center gap-4">
          <div className="text-white text-2xl font-bold">深国际靖江港</div>
        </div>
        <h1 className="text-4xl font-bold text-white">员工风采展示</h1>
        <div className="text-2xl font-semibold text-white font-mono tracking-wider">
          {currentTime}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="absolute inset-0 pt-24 pb-24 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {selectedEmployee && !isAutoPlayDetail ? (
            // 详情面板（用户操作时）
            <motion.div
              key={`detail-${selectedEmployee.id}`}
              initial={{ opacity: 0, scale: 0.9, x: -50, rotateZ: -2 }}
              animate={{ opacity: 1, scale: 1, x: 0, rotateZ: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 50, rotateZ: 2 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="bg-gradient-to-br from-red-800 via-red-850 to-red-900 rounded-2xl p-8 max-w-3xl w-full mx-4 text-white shadow-2xl border border-red-700/50 hover:border-red-600/80 transition-colors"
              onClick={handleDetailPanelClick}
            >
              {/* 关闭按钮 */}
              <button
                onClick={() => {
                  setSelectedEmployee(null);
                  resetInactivityTimer();
                }}
                className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl"
              >
                ✕
              </button>

              {/* 详情头部 */}
              <div className="flex gap-8">
                {/* 左侧照片 */}
                <div className="flex-shrink-0">
                  {selectedEmployee.workPhoto ? (
                    <img
                      src={selectedEmployee.workPhoto}
                      alt={selectedEmployee.name}
                      className="w-48 h-48 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-6xl font-bold">{selectedEmployee.name?.charAt(0)}</span>
                    </div>
                  )}
                </div>

                {/* 右侧信息 */}
                <div className="space-y-4 flex-1">
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
                </div>
              </div>
            </motion.div>
          ) : isAutoPlayDetail && selectedEmployee ? (
            // 详情轮播面板（无操作时）
            <motion.div
              key={`detail-auto-${selectedEmployee.id}`}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              className="bg-gradient-to-br from-red-800 via-red-850 to-red-900 rounded-2xl p-8 max-w-3xl w-full mx-4 text-white shadow-2xl border border-red-700/50"
              onClick={handleDetailPanelClick}
            >
              {/* 详情头部 */}
              <div className="flex gap-8">
                {/* 左侧照片 */}
                <div className="flex-shrink-0">
                  {selectedEmployee.workPhoto ? (
                    <img
                      src={selectedEmployee.workPhoto}
                      alt={selectedEmployee.name}
                      className="w-48 h-48 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-6xl font-bold">{selectedEmployee.name?.charAt(0)}</span>
                    </div>
                  )}
                </div>

                {/* 右侧信息 */}
                <div className="space-y-4 flex-1">
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
                </div>
              </div>
            </motion.div>
          ) : (
            // 照片墙（2-3-3-2 六边形布局）
            <motion.div 
              className="w-full h-full flex items-center justify-between px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* 左侧组 (左2 + 左中3) */}
              <div className="flex gap-6 items-center justify-end">
                {/* 左2列 */}
                <div className="flex flex-col gap-8 justify-center items-center">
                  {leftColumn.map((employee, idx) => (
                    <motion.div
                      key={employee.id}
                      initial={{ opacity: 0, x: -100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      whileHover={{ scale: 1.15, filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.6))' }}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEmployeeClick(employee);
                      }}
                    >
                      <div
                        className="relative flex items-center justify-center overflow-hidden group"
                        style={{
                          width: '150px',
                          height: '150px',
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
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-300"></div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* 左中3列 */}
                <div className="flex flex-col gap-8 justify-center items-center">
                  {leftMiddleColumn.map((employee, idx) => (
                    <motion.div
                      key={employee.id}
                      initial={{ opacity: 0, x: -100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.5, delay: (idx + 2) * 0.1 }}
                      whileHover={{ scale: 1.15, filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.6))' }}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEmployeeClick(employee);
                      }}
                    >
                      <div
                        className="relative flex items-center justify-center overflow-hidden group"
                        style={{
                          width: '150px',
                          height: '150px',
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
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-300"></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 中间大空白 */}
              <div className="flex-1 mx-12"></div>

              {/* 右侧组 (右中3 + 右2) */}
              <div className="flex gap-6 items-center justify-start">
                {/* 右中3列 */}
                <div className="flex flex-col gap-8 justify-center items-center">
                  {rightMiddleColumn.map((employee, idx) => (
                    <motion.div
                      key={employee.id}
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      whileHover={{ scale: 1.15, filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.6))' }}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEmployeeClick(employee);
                      }}
                    >
                      <div
                        className="relative flex items-center justify-center overflow-hidden group"
                        style={{
                          width: '150px',
                          height: '150px',
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
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-300"></div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* 右2列 */}
                <div className="flex flex-col gap-8 justify-center items-center">
                  {rightColumn.map((employee, idx) => (
                    <motion.div
                      key={employee.id}
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.5, delay: (idx + 3) * 0.1 }}
                      whileHover={{ scale: 1.15, filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.6))' }}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEmployeeClick(employee);
                      }}
                    >
                      <div
                        className="relative flex items-center justify-center overflow-hidden group"
                        style={{
                          width: '150px',
                          height: '150px',
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
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-300"></div>
                      </div>
                    </motion.div>
                  ))}  
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 底部搜索框 */}
      {!isAutoPlayDetail && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-6 py-3 border border-white/30">
            <Search className="w-5 h-5 text-white" />
            <input
              type="text"
              placeholder="搜索员工..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-transparent text-white placeholder-white/60 outline-none w-64"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-1 bg-white/30 hover:bg-white/40 rounded-full text-white text-sm font-semibold transition-all"
            >
              搜索
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
