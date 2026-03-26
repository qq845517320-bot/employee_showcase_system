import { useEffect, useState, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

export default function Showcase() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [backgroundUrl, setBackgroundUrl] = useState<string>('');
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const batchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  // 获取员工列表
  const { data: employeesData, isLoading } = trpc.employees.list.useQuery({} as any);
  
  // 获取活跃背景图片
  const { data: backgroundData } = trpc.backgrounds.getActive.useQuery({} as any, {
    refetchInterval: 5000,
  });

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
    } else {
      const results = employees.filter(emp =>
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(results);
    }
    resetInactivityTimer();
  };

  // 重置无操作计时器
  const resetInactivityTimer = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    setIsAutoPlay(false);
    
    inactivityTimeoutRef.current = setTimeout(() => {
      setIsAutoPlay(true);
      startBatchRotation();
    }, 30000); // 30秒无操作后启动轮播
  };

  // 启动批次轮播
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

  // 处理员工点击
  const handleEmployeeClick = (employee: any) => {
    setSelectedEmployee(employee);
    resetInactivityTimer();
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
      if (batchIntervalRef.current) clearInterval(batchIntervalRef.current);
    };
  }, []);

  // 初始化无操作计时器
  useEffect(() => {
    resetInactivityTimer();
  }, []);

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
        resetInactivityTimer();
      }}
    >
      {/* 顶部导航栏 */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between px-8 z-40">
        <div className="flex items-center gap-4">
          <div className="text-white text-2xl font-bold">深国际靖江港</div>
        </div>
        <h1 className="text-4xl font-bold text-white">员工风采展示</h1>
        <div className="text-2xl font-semibold text-white">
          {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="absolute inset-0 pt-24 pb-24 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {selectedEmployee ? (
            // 详情面板
            <motion.div
              key={`detail-${selectedEmployee.id}`}
              initial={{ opacity: 0, scale: 0.9, x: -50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 50 }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-br from-red-800 to-red-900 rounded-2xl p-8 max-w-3xl w-full mx-4 text-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 关闭按钮 */}
              <button
                onClick={() => setSelectedEmployee(null)}
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
          ) : (
            // 2-3-3-2 六边形布局 - 中间大空白
            <div className="w-full h-full flex items-center justify-between px-4">
              {/* 左侧组 (左2 + 左中3) */}
              <div className="flex gap-12 items-center justify-end flex-1">
                {/* 左2列 */}
                <div className="flex flex-col gap-8 justify-center items-center">
                  {leftColumn.map((employee) => (
                    <motion.div
                      key={employee.id}
                      whileHover={{ scale: 1.1 }}
                      className="cursor-pointer"
                      onClick={() => handleEmployeeClick(employee)}
                    >
                      <div
                        className="relative flex items-center justify-center overflow-hidden group"
                        style={{
                          width: '120px',
                          height: '120px',
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
                            <span className="text-white text-xl font-bold">{employee.name?.charAt(0)}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                          <span className="text-white text-xs font-bold text-center px-2">{employee.name}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* 左中3列 */}
                <div className="flex flex-col gap-8 justify-center items-center">
                  {leftMiddleColumn.map((employee) => (
                    <motion.div
                      key={employee.id}
                      whileHover={{ scale: 1.1 }}
                      className="cursor-pointer"
                      onClick={() => handleEmployeeClick(employee)}
                    >
                      <div
                        className="relative flex items-center justify-center overflow-hidden group"
                        style={{
                          width: '120px',
                          height: '120px',
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
                            <span className="text-white text-xl font-bold">{employee.name?.charAt(0)}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                          <span className="text-white text-xs font-bold text-center px-2">{employee.name}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 中间大空白 */}
              <div className="flex-1 mx-8"></div>

              {/* 右侧组 (右中3 + 右2) */}
              <div className="flex gap-12 items-center justify-start flex-1">
                {/* 右中3列 */}
                <div className="flex flex-col gap-8 justify-center items-center">
                  {rightMiddleColumn.map((employee) => (
                    <motion.div
                      key={employee.id}
                      whileHover={{ scale: 1.1 }}
                      className="cursor-pointer"
                      onClick={() => handleEmployeeClick(employee)}
                    >
                      <div
                        className="relative flex items-center justify-center overflow-hidden group"
                        style={{
                          width: '120px',
                          height: '120px',
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
                            <span className="text-white text-xl font-bold">{employee.name?.charAt(0)}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                          <span className="text-white text-xs font-bold text-center px-2">{employee.name}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* 右2列 */}
                <div className="flex flex-col gap-8 justify-center items-center">
                  {rightColumn.map((employee) => (
                    <motion.div
                      key={employee.id}
                      whileHover={{ scale: 1.1 }}
                      className="cursor-pointer"
                      onClick={() => handleEmployeeClick(employee)}
                    >
                      <div
                        className="relative flex items-center justify-center overflow-hidden group"
                        style={{
                          width: '120px',
                          height: '120px',
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
                            <span className="text-white text-xl font-bold">{employee.name?.charAt(0)}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                          <span className="text-white text-xs font-bold text-center px-2">{employee.name}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 底部搜索框 */}
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

      {/* 批次指示器 */}
      {isAutoPlay && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-white/60 text-sm">
          第 {currentBatchIndex + 1} / {Math.ceil(filteredEmployees.length / 10)} 批
        </div>
      )}
    </div>
  );
}
