import { useEffect, useState, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';

/* ========== HexPhoto ========== */
function HexPhoto({ employee, size = 150, isHighlighted = false, onClick, delay = 0, fromX = 0, isAutoPlay = false }: {
  employee: any; size?: number; isHighlighted?: boolean; onClick?: (e: React.MouseEvent) => void; delay?: number; fromX?: number; isAutoPlay?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: fromX }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: fromX }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.15, filter: 'drop-shadow(0 0 20px rgba(239,68,68,0.6))' }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <div
        className={`relative flex items-center justify-center overflow-hidden group transition-all duration-500 ${isHighlighted ? 'scale-110 z-10' : ''}`}
        style={{
          width: `${size}px`, height: `${size}px`,
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          filter: isHighlighted ? 'drop-shadow(0 0 25px rgba(250,204,21,0.8))' : undefined,
          backgroundColor: '#dc2626',
        }}
      >
        {employee.workPhoto ? (
          <img src={employee.workPhoto} alt={employee.name} className="w-full h-full object-contain object-center" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{employee.name?.charAt(0)}</span>
          </div>
        )}
        <div className={`absolute inset-0 transition-all duration-500 ${isHighlighted ? 'bg-black/5' : 'bg-black/30 group-hover:bg-black/10'}`} />
        {isHighlighted && !isAutoPlay && (
          <div className="absolute bottom-1 left-0 right-0 text-center">
            <span className="text-white text-xs font-bold drop-shadow-lg bg-black/40 px-2 py-0.5 rounded">{employee.name}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ========== PhotoColumn ========== */
function PhotoColumn({ employees, highlightedId, size = 150, fromX = 0, baseDelay = 0, onClickEmployee, isAutoPlay = false }: {
  employees: any[]; highlightedId?: number | null; size?: number; fromX?: number; baseDelay?: number; onClickEmployee: (emp: any) => void; isAutoPlay?: boolean;
}) {
  return (
    <div className="flex flex-col gap-8 justify-center items-center">
      {employees.map((emp, idx) => (
        <HexPhoto key={emp.id} employee={emp} size={size} isHighlighted={highlightedId === emp.id}
          fromX={fromX} delay={(baseDelay + idx) * 0.1}
          onClick={(e) => { e.stopPropagation(); onClickEmployee(emp); }}
          isAutoPlay={isAutoPlay}
        />
      ))}
    </div>
  );
}

/* ========== DetailPanel ========== */
function DetailPanel({ employee, isAutoPlay = false, onClose, onClick, getDepartmentName, selectedEmployeeDetail, onPrevious, onNext, canGoPrevious, canGoNext }: {
  employee: any; isAutoPlay?: boolean; onClose?: () => void; onClick?: (e: React.MouseEvent) => void; getDepartmentName?: (deptId: any) => string; selectedEmployeeDetail?: any; onPrevious?: () => void; onNext?: () => void; canGoPrevious?: boolean; canGoNext?: boolean;
}) {
  return (
    <motion.div
      key={`detail-${isAutoPlay ? 'auto' : 'manual'}-${employee.id}`}
      initial={isAutoPlay ? { opacity: 0, scale: 0.95, y: 30 } : { opacity: 0, scale: 0.9, x: -50, rotateZ: -2 }}
      animate={isAutoPlay ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, scale: 1, x: 0, rotateZ: 0 }}
      exit={isAutoPlay ? { opacity: 0, scale: 0.95, y: -30 } : { opacity: 0, scale: 0.9, x: 50, rotateZ: 2 }}
      transition={{ duration: isAutoPlay ? 0.7 : 0.5, ease: 'easeInOut' }}
      className="bg-gradient-to-br from-red-800/95 via-red-900/95 to-red-950/95 backdrop-blur-sm rounded-2xl p-12 w-full text-white shadow-2xl border border-red-600/60 relative"
      style={{ maxWidth: '900px' }}
      onClick={onClick}
    >
      {!isAutoPlay && onClose && (
        <button onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-5 right-5 text-white/60 hover:text-white text-3xl z-10">{"\u2715"}</button>
      )}
      {!isAutoPlay && onPrevious && onNext && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onPrevious(); }}
            disabled={!canGoPrevious}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-3xl z-10 transition-colors">{'<'}</button>
          <button onClick={(e) => { e.stopPropagation(); onNext(); }}
            disabled={!canGoNext}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-3xl z-10 transition-colors">{'>'}</button>
        </>
      )}
      {isAutoPlay && (
        <div className="absolute top-4 right-5 flex items-center gap-2 text-yellow-300/80">
          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="text-xs font-medium">{"\u81ea\u52a8\u8f6e\u64ad\u4e2d"}</span>
        </div>
      )}
      <div className="flex flex-col w-full h-full">
        {/* 上部分：照片 + 基本信息（3/5 高度） */}
        <div className="flex-[3] flex gap-12 pb-8 border-b border-white/30">
          <div className="flex-shrink-0">
            {employee.workPhoto ? (
              <img src={employee.workPhoto} alt={employee.name} className="h-full aspect-square rounded-xl object-contain shadow-lg" />
            ) : (
              <div className="h-full aspect-square bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-9xl font-bold">{employee.name?.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-4">
            <div>
              <div className="text-6xl font-bold mb-4">{employee.name}</div>
            </div>
            <div className="space-y-3 text-2xl">
              <div>{"\u90e8\u95e8\uff1a"}{getDepartmentName ? getDepartmentName(employee.departmentId) : employee.departmentId}</div>
              <div>{"\u5c97\u4f4d\uff1a"}{employee.position}</div>
              <div>{"\u804c\u52a1\uff1a"}{employee.level}</div>
              <div>{"\u5165\u804c\u65f6\u95f4\uff1a"}{new Date(employee.joinDate || 0).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
        {/* 下部分：工作职责、工作信条、奖励荣誉（2/5 高度） */}
        <div className="flex-[2] flex gap-12 pt-8 overflow-y-auto">
          <div className="flex-1 space-y-4 text-lg">
            <div>
              <div className="font-semibold mb-2 text-xl">{"\u5de5\u4f5c\u804c\u8d23\uff1a"}</div>
              <div className="leading-relaxed">{employee.jobResponsibilities || "\u6682\u65e0\u6570\u636e"}</div>
            </div>
            <div>
              <div className="font-semibold mb-2 text-xl">{"\u5de5\u4f5c\u4fe1\u6761\uff1a"}</div>
              <div className="italic">{employee.workTenet || "\u6682\u65e0\u6570\u636e"}</div>
            </div>
          </div>
          <div className="flex-1">
            <div className="font-semibold mb-2 text-xl">{"\u5956\u52b1\u8363\u8a89\uff1a"}</div>
            <div className="text-base space-y-1">
              {selectedEmployeeDetail?.honors && selectedEmployeeDetail.honors.length > 0 ? (
                selectedEmployeeDetail.honors.map((honor: any, idx: number) => (
                  <div key={idx} className="text-sm leading-relaxed">• {honor.honorName}</div>
                ))
              ) : (
                <div>{"\u6682\u65e0\u6570\u636e"}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ========== Main Showcase ========== */
export default function Showcase() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [currentDetailIndex, setCurrentDetailIndex] = useState(0);
  const [backgroundUrl, setBackgroundUrl] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const batchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const detailIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isAutoPlayDetail, setIsAutoPlayDetail] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<number | string | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);

  const { data: employeesData, isLoading } = trpc.employees.list.useQuery({} as any);
  const { data: departmentsData } = trpc.departments.list.useQuery({} as any);
  const { data: backgroundData } = trpc.backgrounds.getActive.useQuery({} as any, { refetchInterval: 5000 });
  
  // Get detailed employee info including honors
  const { data: selectedEmployeeDetail } = trpc.employees.get.useQuery(
    { id: selectedEmployee?.id || 0 },
    { enabled: !!selectedEmployee?.id }
  );

  // Get department name by ID
  const getDepartmentName = (deptId: number | string | null) => {
    if (!deptId) return 'Unknown Department';
    const dept = departments.find(d => d.id === deptId);
    return dept?.name || `Department ${deptId}`;
  };

  // Real-time clock
  useEffect(() => {
    timeIntervalRef.current = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => { if (timeIntervalRef.current) clearInterval(timeIntervalRef.current); };
  }, []);

  useEffect(() => { if (employeesData) { setEmployees(employeesData); setFilteredEmployees(employeesData); } }, [employeesData]);
  useEffect(() => { if (departmentsData) setDepartments(departmentsData); }, [departmentsData]);
  useEffect(() => { if (backgroundData?.backgroundUrl) setBackgroundUrl(backgroundData.backgroundUrl); }, [backgroundData]);

  const handleDepartmentClick = (deptId: number | string | null) => {
    setSelectedDepartment(deptId);
    setSelectedEmployee(null);
    setIsAutoPlayDetail(false);
    if (detailIntervalRef.current) clearInterval(detailIntervalRef.current);
    resetInactivityTimer();
  };

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
      if (results.length > 0) { setSelectedEmployee(results[0]); setCurrentDetailIndex(0); }
    }
    resetInactivityTimer();
  };

  const resetInactivityTimer = () => {
    if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
    setIsAutoPlayDetail(false);
    if (detailIntervalRef.current) clearInterval(detailIntervalRef.current);
    startBatchRotation();
    inactivityTimeoutRef.current = setTimeout(() => {
      setIsAutoPlayDetail(true);
      stopBatchRotation();
      startDetailRotation();
    }, 30000);
  };

  const startBatchRotation = () => {
    if (batchIntervalRef.current) clearInterval(batchIntervalRef.current);
    batchIntervalRef.current = setInterval(() => {
      setCurrentBatchIndex(prev => {
        const total = Math.ceil(filteredEmployees.length / 10);
        return total > 0 ? (prev + 1) % total : 0;
      });
    }, 5000);
  };

  const stopBatchRotation = () => {
    if (batchIntervalRef.current) clearInterval(batchIntervalRef.current);
  };

  const startDetailRotation = () => {
    if (detailIntervalRef.current) clearInterval(detailIntervalRef.current);
    let index = currentDetailIndex;
    if (filteredEmployees.length > 0) {
      setSelectedEmployee(filteredEmployees[index]);
    }
    detailIntervalRef.current = setInterval(() => {
      if (filteredEmployees.length === 0) return;
      index = (index + 1) % filteredEmployees.length;
      setCurrentDetailIndex(index);
      setSelectedEmployee(filteredEmployees[index]);
    }, 5000);
  };

  const handleEmployeeClick = (employee: any) => {
    setIsAutoPlayDetail(false);
    setSelectedEmployee(employee);
    if (batchIntervalRef.current) clearInterval(batchIntervalRef.current);
    resetInactivityTimer();
  };

  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!selectedEmployee || isAutoPlayDetail) return;
      if (wheelTimeoutRef.current) return;
      wheelTimeoutRef.current = setTimeout(() => { wheelTimeoutRef.current = null; }, 300);
      e.preventDefault();
      const idx = filteredEmployees.findIndex(emp => emp.id === selectedEmployee.id);
      if (e.deltaY < 0 && idx > 0) {
        setSelectedEmployee(filteredEmployees[idx - 1]);
        setCurrentDetailIndex(idx - 1);
        resetInactivityTimer();
      } else if (e.deltaY > 0 && idx < filteredEmployees.length - 1) {
        setSelectedEmployee(filteredEmployees[idx + 1]);
        setCurrentDetailIndex(idx + 1);
        resetInactivityTimer();
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => { window.removeEventListener('wheel', handleWheel); if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current); };
  }, [selectedEmployee, isAutoPlayDetail, filteredEmployees]);

  useEffect(() => {
    return () => {
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      if (batchIntervalRef.current) clearInterval(batchIntervalRef.current);
      if (detailIntervalRef.current) clearInterval(detailIntervalRef.current);
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    };
  }, []);

  useEffect(() => { resetInactivityTimer(); }, [filteredEmployees]);

  useEffect(() => {
    if (isAutoPlayDetail && filteredEmployees.length > 0) {
      if (!selectedEmployee) { setSelectedEmployee(filteredEmployees[0]); setCurrentDetailIndex(0); }
      startDetailRotation();
    }
    return () => { if (detailIntervalRef.current) clearInterval(detailIntervalRef.current); };
  }, [isAutoPlayDetail, filteredEmployees]);

  const handleDetailPanelClick = (e: React.MouseEvent) => { e.stopPropagation(); };

  if (isLoading) {
    return <div className="w-full h-screen flex items-center justify-center bg-red-900">{"\u52a0\u8f7d\u4e2d..."}</div>;
  }

  const batchSize = 10;
  const startIdx = currentBatchIndex * batchSize;
  const currentBatch = filteredEmployees.slice(startIdx, startIdx + batchSize);

  const displayEmployees = selectedDepartment === null
    ? filteredEmployees
    : selectedDepartment === 'honors'
    ? filteredEmployees.filter(emp => emp.honors && emp.honors.length > 0)
    : filteredEmployees.filter(emp => emp.departmentId === selectedDepartment);

  const centerSortedEmployees = (() => {
    if (displayEmployees.length === 0) return [];
    const sorted: any[] = [];
    const middle = Math.floor(displayEmployees.length / 2);
    sorted.push(displayEmployees[middle]);
    for (let i = 1; i <= middle; i++) {
      if (middle - i >= 0) sorted.push(displayEmployees[middle - i]);
      if (middle + i < displayEmployees.length) sorted.push(displayEmployees[middle + i]);
    }
    return sorted;
  })();

  const leftColumn = currentBatch.slice(0, 2);
  const leftMiddleColumn = currentBatch.slice(2, 5);
  const rightMiddleColumn = currentBatch.slice(5, 8);
  const rightColumn = currentBatch.slice(8, 10);

  // Auto-play mode: calculate batch based on current playing employee
  const getAutoPlayBatch = () => {
    if (!selectedEmployee || filteredEmployees.length === 0) {
      return { left1: [], left2: [], right1: [], right2: [] };
    }
    // Find which batch the current employee belongs to
    const empIndex = filteredEmployees.findIndex(e => e.id === selectedEmployee.id);
    if (empIndex === -1) {
      return { left1: [], left2: [], right1: [], right2: [] };
    }
    // Calculate batch start index
    const batchStartIdx = Math.floor(empIndex / batchSize) * batchSize;
    const batchEndIdx = Math.min(batchStartIdx + batchSize, filteredEmployees.length);
    const batch = filteredEmployees.slice(batchStartIdx, batchEndIdx);
    
    return {
      left1: batch.slice(0, 2),
      left2: batch.slice(2, 5),
      right1: batch.slice(5, 8),
      right2: batch.slice(8, 10)
    };
  };
  
  const autoPlayBatch = getAutoPlayBatch();
  const allLeft1 = autoPlayBatch.left1;
  const allLeft2 = autoPlayBatch.left2;
  const allRight1 = autoPlayBatch.right1;
  const allRight2 = autoPlayBatch.right2;

  const highlightedId = selectedEmployee?.id || null;

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
        if (detailIntervalRef.current) clearInterval(detailIntervalRef.current);
        resetInactivityTimer();
      }}
    >
      {/* Top nav */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent z-40">
        <div className="h-20 flex items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663273338301/dTX999GnT8s8oqjJyp2eQW/深国际Logo_597125f6.jpg" alt="Logo" className="h-12 w-auto" />
            <div className="text-white text-lg font-bold">{"\u6df1\u56fd\u9645\u6e2f\u53e3 | \u6c5f\u82cf\u9756\u6c5f\u6e2f"}</div>
          </div>
          <h1 className="text-4xl font-bold text-white">{"\u5458\u5de5\u98ce\u91c7\u5c55\u793a"}</h1>
          <div className="text-2xl font-semibold text-white font-mono tracking-wider">{currentTime}</div>
        </div>
        {!isAutoPlayDetail && (
        <div className="flex items-center justify-center gap-3 px-8 pb-4 flex-wrap">
          <button onClick={() => handleDepartmentClick(null)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${selectedDepartment === null ? 'bg-red-600 text-white shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}>
            {"\u5168\u90e8"}
          </button>
          {departments.map((dept) => (
            <button key={dept.id} onClick={() => handleDepartmentClick(dept.id)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${selectedDepartment === dept.id ? 'bg-red-600 text-white shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}>
              {dept.name}
            </button>
          ))}
          <button onClick={() => handleDepartmentClick('honors')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${selectedDepartment === 'honors' ? 'bg-red-600 text-white shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}>
            {"\u2605\u8363\u8a89\u699c\u2605"}
          </button>
        </div>
        )}
      </div>

      {/* Content area */}
      <div className="absolute inset-0 pt-40 pb-24 flex items-center justify-center">
        {/* ====== AUTO-PLAY MODE: photo wall + detail overlay ====== */}
        {isAutoPlayDetail && selectedEmployee && selectedDepartment === null ? (
          <div className="w-full h-full flex items-center justify-between px-4 relative">
            {/* Left columns */}
            <div className="flex gap-6 items-center">
              <PhotoColumn employees={allLeft1} highlightedId={highlightedId} size={150} fromX={-100} baseDelay={0} onClickEmployee={handleEmployeeClick} isAutoPlay={true} />
              <PhotoColumn employees={allLeft2} highlightedId={highlightedId} size={150} fromX={-100} baseDelay={2} onClickEmployee={handleEmployeeClick} isAutoPlay={true} />
            </div>

            {/* Center detail panel (absolute overlay) */}
            <div className="flex-1 flex items-center justify-center px-4 z-10">
              <DetailPanel key={`auto-${selectedEmployee.id}`} employee={selectedEmployee} isAutoPlay={true} onClick={handleDetailPanelClick} getDepartmentName={getDepartmentName} selectedEmployeeDetail={selectedEmployeeDetail} />
            </div>

            {/* Right columns */}
            <div className="flex gap-6 items-center">
              <PhotoColumn employees={allRight1} highlightedId={highlightedId} size={150} fromX={100} baseDelay={0} onClickEmployee={handleEmployeeClick} isAutoPlay={true} />
              <PhotoColumn employees={allRight2} highlightedId={highlightedId} size={150} fromX={100} baseDelay={3} onClickEmployee={handleEmployeeClick} isAutoPlay={true} />
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* ====== MANUAL DETAIL MODE ====== */}
            {selectedEmployee && !isAutoPlayDetail ? (
              <DetailPanel key={`manual-${selectedEmployee.id}`} employee={selectedEmployee} isAutoPlay={false}
                onClose={() => { setSelectedEmployee(null); resetInactivityTimer(); }}
                onClick={handleDetailPanelClick}
                getDepartmentName={getDepartmentName}
                selectedEmployeeDetail={selectedEmployeeDetail}
                onPrevious={() => {
                  const currentIndex = filteredEmployees.findIndex(e => e.id === selectedEmployee.id);
                  if (currentIndex > 0) {
                    setSelectedEmployee(filteredEmployees[currentIndex - 1]);
                    setCurrentDetailIndex(currentIndex - 1);
                    resetInactivityTimer();
                  }
                }}
                onNext={() => {
                  const currentIndex = filteredEmployees.findIndex(e => e.id === selectedEmployee.id);
                  if (currentIndex < filteredEmployees.length - 1) {
                    setSelectedEmployee(filteredEmployees[currentIndex + 1]);
                    setCurrentDetailIndex(currentIndex + 1);
                    resetInactivityTimer();
                  }
                }}
                canGoPrevious={filteredEmployees.findIndex(e => e.id === selectedEmployee.id) > 0}
                canGoNext={filteredEmployees.findIndex(e => e.id === selectedEmployee.id) < filteredEmployees.length - 1}
              />
            ) : selectedDepartment !== null ? (
              /* ====== DEPARTMENT FILTER MODE ====== */
              <motion.div className="w-full h-full flex flex-col items-center justify-center px-4 overflow-y-auto"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
                {centerSortedEmployees.length > 0 ? (
                  <div className="flex flex-wrap gap-6 justify-center items-center max-w-7xl py-8">
                    {centerSortedEmployees.map((employee, idx) => (
                      <motion.div key={employee.id}
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        whileHover={{ scale: 1.1, filter: 'drop-shadow(0 0 20px rgba(239,68,68,0.8))' }}
                        className="cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); handleEmployeeClick(employee); }}
                      >
                        <div className="relative flex items-center justify-center overflow-hidden group rounded-lg shadow-lg"
                          style={{ width: '160px', height: '160px', backgroundColor: '#dc2626' }}>
                          {employee.workPhoto ? (
                            <img src={employee.workPhoto} alt={employee.name} className="w-full h-full object-contain object-center" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                              <span className="text-white text-4xl font-bold">{employee.name?.charAt(0)}</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-300" />
                          {!isAutoPlayDetail && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white text-center">
                            <div className="font-bold text-sm">{employee.name}</div>
                            <div className="text-xs text-gray-200">{employee.position}</div>
                          </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-white text-2xl font-bold">{"\u8be5\u90e8\u95e8\u6682\u65e0\u5458\u5de5"}</div>
                )}
              </motion.div>
            ) : (
              /* ====== DEFAULT PHOTO WALL ====== */
              <motion.div className="w-full h-full flex items-center justify-between px-4"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
                <div className="flex gap-6 items-center justify-end">
                  <PhotoColumn employees={leftColumn} size={150} fromX={-100} baseDelay={0} onClickEmployee={handleEmployeeClick} />
                  <PhotoColumn employees={leftMiddleColumn} size={150} fromX={-100} baseDelay={2} onClickEmployee={handleEmployeeClick} />
                </div>
                <div className="flex-1 mx-12" />
                <div className="flex gap-6 items-center justify-start">
                  <PhotoColumn employees={rightMiddleColumn} size={150} fromX={100} baseDelay={0} onClickEmployee={handleEmployeeClick} />
                  <PhotoColumn employees={rightColumn} size={150} fromX={100} baseDelay={3} onClickEmployee={handleEmployeeClick} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Bottom search */}
      {!isAutoPlayDetail && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-6 py-3 border border-white/30">
            <Search className="w-5 h-5 text-white" />
            <input type="text" placeholder={"\u641c\u7d22\u5458\u5de5..."} value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-transparent text-white placeholder-white/60 outline-none w-64"
            />
            <button onClick={handleSearch}
              className="px-4 py-1 bg-white/30 hover:bg-white/40 rounded-full text-white text-sm font-semibold transition-all">
              {"\u641c\u7d22"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
