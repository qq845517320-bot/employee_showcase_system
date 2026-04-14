import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { CompanyPhotoCard } from '@/components/CompanyPhotoCard';

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
function DetailPanel({ employee, isAutoPlay = false, onClose, onClick, getDepartmentName, selectedEmployeeDetail, isLoadingDetail, onPrevious, onNext, canGoPrevious, canGoNext, fallbackHonors }: {
  employee: any; isAutoPlay?: boolean; onClose?: () => void; onClick?: (e: React.MouseEvent) => void; getDepartmentName?: (deptId: any) => string; selectedEmployeeDetail?: any; isLoadingDetail?: boolean; onPrevious?: () => void; onNext?: () => void; canGoPrevious?: boolean; canGoNext?: boolean; fallbackHonors?: any[];
}) {
  return (
    <motion.div
      key={`detail-${isAutoPlay ? 'auto' : 'manual'}-${employee.id}`}
      initial={isAutoPlay ? { opacity: 0, scale: 0.9, y: 40 } : { opacity: 0, scale: 0.85, x: -80, rotateZ: -5 }}
      animate={isAutoPlay ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, scale: 1, x: 0, rotateZ: 0 }}
      exit={isAutoPlay ? { opacity: 0, scale: 0.9, y: -40 } : { opacity: 0, scale: 0.85, x: 80, rotateZ: 5 }}
      transition={isAutoPlay ? { duration: 0.8, ease: [0.34, 1.56, 0.64, 1], type: 'spring', stiffness: 80, damping: 20 } : { duration: 0.6, ease: 'easeInOut', type: 'spring', stiffness: 100, damping: 15 }}
      className={`bg-gradient-to-br from-red-800/95 via-red-900/95 to-red-950/95 backdrop-blur-sm rounded-2xl px-12 py-8 text-white shadow-2xl border border-red-600/60 relative ${isAutoPlay ? 'card-glow-pulse' : ''}`}
      style={{
        width: '950px',
        height: '750px',
        paddingTop: '40px',
        boxShadow: isAutoPlay
          ? '0 0 60px rgba(212, 175, 55, 0.6), 0 0 100px rgba(212, 175, 55, 0.3), inset 0 0 60px rgba(212, 175, 55, 0.1)'
          : '0 0 40px rgba(0, 0, 0, 0.5), 0 0 80px rgba(0, 0, 0, 0.3)'
      }}
      onClick={onClick}
    >
      {!isAutoPlay && onClose && (
        <button onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-5 right-5 text-white/60 hover:text-white text-3xl z-50 pointer-events-auto">{"\u2715"}</button>
      )}
      {!isAutoPlay && onPrevious && onNext && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onPrevious(); }}
            disabled={!canGoPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed z-10 transition-colors">
            <ChevronLeft size={40} strokeWidth={2.5} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onNext(); }}
            disabled={!canGoNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed z-10 transition-colors">
            <ChevronRight size={40} strokeWidth={2.5} />
          </button>
        </>
      )}
      {isAutoPlay && (
        <div className="absolute top-4 right-5 flex items-center gap-2 text-yellow-300/80">
          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="text-xs font-medium">{"\u81ea\u52a8\u8f6e\u64ad\u4e2d"}</span>
        </div>
      )}
      <div className="flex flex-col w-full h-full items-center justify-center overflow-hidden">
        {/* 上部分：照片 + 基本信息（3/5 高度） */}
        <div className="flex-[3.4] flex gap-12 pb-8 border-b border-white/30 items-center justify-center w-full">
          <div className="flex-shrink-0" style={{ width: '330px', height: '420px', marginLeft: '60px', marginTop: '-15px' }}>
            {employee.workPhoto ? (
              <img src={employee.workPhoto} alt={employee.name} className="h-full w-full rounded-xl object-cover shadow-lg" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-9xl font-bold">{employee.name?.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-4" style={{ marginLeft: '90px' }}>
            <div className="flex items-start gap-3">
              <div className="text-5xl font-bold">{employee.name}</div>
              {employee.isPartyMember && (
                <img 
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663273338301/dTX999GnT8s8oqjJyp2eQW/Partyemblem_a1be73e2.png" 
                  alt="党员" 
                  className="w-12 h-12 -mt-2"
                  style={{
                    filter: 'hue-rotate(0deg) saturate(1.2) brightness(1.1)',
                  }}
                  title="党员"
                />
              )}
            </div>
            <div className="space-y-3 text-xl mt-2">
              <div>{"\u90e8\u95e8\uff1a"}{getDepartmentName ? getDepartmentName(employee.departmentId) : employee.departmentId}</div>
              <div>{"\u5c97\u4f4d\uff1a"}{employee.position}</div>
              <div>{"\u804c\u52a1\uff1a"}{employee.level}</div>
              <div>{"\u5165\u804c\u65f6\u95f4\uff1a"}{new Date(employee.joinDate || 0).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
        {/* 下部分：工作职责+工作信条、奖励荣誉（2/5 高度） */}
        <div className="flex-[1.6] flex gap-12 pt-2 mt-0 overflow-y-auto justify-between w-full">
          <div className="flex-1 space-y-4 text-lg">
            <div>
              <div className="font-semibold mb-2 text-xl">{"\u5de5\u4f5c\u804c\u8d23\uff1a"}</div>
              <div className="leading-relaxed text-left">{employee.jobResponsibilities || "\u6682\u65e0\u6570\u636e"}</div>
            </div>
            <div>
              <div className="font-semibold mb-2 text-xl">{"\u5de5\u4f5c\u4fe1\u6761\uff1a"}</div>
              <div className="italic text-left">{employee.workTenet || "\u6682\u65e0\u6570\u636e"}</div>
            </div>
          </div>
          <div className="flex-1" style={{ marginLeft: '10px' }}>
            <div className="font-semibold mb-2 text-xl">{"\u5956\u52b1\u8363\u8a89\uff1a"}</div>
            <div className="text-base space-y-1 text-left">
              {isLoadingDetail && !fallbackHonors ? (
                <div className="space-y-2">
                  <div className="h-4 bg-red-700/40 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-red-700/40 rounded animate-pulse w-2/3"></div>
                </div>
              ) : (selectedEmployeeDetail?.honors && selectedEmployeeDetail.honors.length > 0) || (fallbackHonors && fallbackHonors.length > 0) ? (
                (selectedEmployeeDetail?.honors && selectedEmployeeDetail.honors.length > 0 ? selectedEmployeeDetail.honors : fallbackHonors).map((honor: any, idx: number) => (
                  <div key={idx} className="text-sm leading-relaxed">• {honor.title}</div>
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
  const displayEmployeesRef = useRef<any[]>([]);
  const filteredEmployeesRef = useRef<any[]>([]);
  const isAutoPlayDetailRef = useRef(false);
  const currentDetailIndexRef = useRef(0);
  const activeStrategyRef = useRef<any>(null);
  const initialLoadDoneRef = useRef(false);
  const companyShowcaseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isAutoPlayDetail, setIsAutoPlayDetail] = useState(false);
  const [isAutoPlayCompanyShowcase, setIsAutoPlayCompanyShowcase] = useState(false);
  const [companyShowcaseClickExit, setCompanyShowcaseClickExit] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<number | string | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<number | string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedHonorCategory, setSelectedHonorCategory] = useState<string | null>(null);
  const [showHonorDropdown, setShowHonorDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [selectedCompanyPhoto, setSelectedCompanyPhoto] = useState<any>(null);
  const [showcasePhotoIndex, setShowcasePhotoIndex] = useState(0);
  const showcasePhotoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const showcaseCompanyPhotosRef = useRef<any[]>([]); // ref 版本，避免闭包问题
  const batchSize = 10;
  const companyShowcaseAutoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const { data: activeStrategy } = trpc.playback.getActive.useQuery({} as any, { refetchInterval: 5000 });
  const { data: employeesData, isLoading } = trpc.employees.list.useQuery(
    { displayMode: activeStrategy?.displayMode === 'core_bones' ? 'core_bones' : 'all' } as any,
    { refetchInterval: 5000 }
  );
  const { data: departmentsData } = trpc.departments.list.useQuery({} as any);
  const { data: companiesData } = trpc.companies.list.useQuery({} as any);
  const { data: backgroundData } = trpc.backgrounds.getActive.useQuery({} as any, { refetchInterval: 5000 });
  const { data: honorCategoriesData = [] } = trpc.honors.listCategories.useQuery({} as any);
  const honorCategories = honorCategoriesData.map((cat: any) => cat.name);
  
  // Get company photos
  const companyIdNumber = typeof selectedCompany === 'number' ? selectedCompany : (typeof selectedCompany === 'string' ? parseInt(selectedCompany, 10) : null);
  const { data: companyPhotos = [] } = trpc.companies.getPhotos.useQuery(
    { companyId: companyIdNumber || 0 },
    { enabled: !!companyIdNumber && typeof companyIdNumber === 'number' }
  );
  
  // Get all company photos when "全部" is selected
  const { data: allCompanyPhotos = [] } = trpc.companies.getAllPhotos.useQuery(
    undefined,
    { enabled: selectedCompany === null && selectedDepartment === 'company' }
  );
  
  // Get all company photos for company showcase mode
  // 始终启用查询，避免 enabled 条件变化导致数据丢失（影响轮播渲染）
  const { data: showcaseCompanyPhotos = [] } = trpc.companies.getAllPhotos.useQuery(
    undefined,
    { enabled: true }
  );
  // 同步到 ref，供 setTimeout 回调中使用，避免闭包捕获旧值
  showcaseCompanyPhotosRef.current = showcaseCompanyPhotos;
  
  // Use single company photos when a specific company is selected, all photos when "全部" is selected
  const displayPhotos = selectedCompany === null ? allCompanyPhotos : companyPhotos;
  const showPhotos = selectedDepartment === 'company' && displayPhotos.length > 0;
  
  // Get detailed employee info including honors
  const { data: selectedEmployeeDetail, isLoading: isLoadingDetail } = trpc.employees.get.useQuery(
    { id: selectedEmployee?.id || 0 },
    { enabled: !!selectedEmployee?.id }
  );

  // Get department name by ID
  const getDepartmentName = (deptId: number | string | null) => {
    if (!deptId) return 'Unknown Department';
    const dept = departments.find(d => d.id === deptId);
    return dept?.name || `Department ${deptId}`;
  };

  // Company showcase photo rotation
  useEffect(() => {
    if (activeStrategy?.displayMode === 'company_showcase' && showcaseCompanyPhotos.length > 0) {
      if (showcasePhotoIntervalRef.current) clearInterval(showcasePhotoIntervalRef.current);
      
      showcasePhotoIntervalRef.current = setInterval(() => {
        setShowcasePhotoIndex(prev => (prev + 1) % showcaseCompanyPhotos.length);
      }, (activeStrategy?.autoPlayInterval || 5) * 1000);
      
      return () => {
        if (showcasePhotoIntervalRef.current) clearInterval(showcasePhotoIntervalRef.current);
      };
    }
  }, [activeStrategy?.displayMode, showcaseCompanyPhotos.length, activeStrategy?.autoPlayInterval]);

  // Real-time clock
  useEffect(() => {
    timeIntervalRef.current = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => { if (timeIntervalRef.current) clearInterval(timeIntervalRef.current); };
  }, []);

  useEffect(() => {
    if (employeesData) {
      setEmployees(employeesData);
      setFilteredEmployees(employeesData);
      // 只在首次加载时启动不活动计时器
      if (!initialLoadDoneRef.current) {
        initialLoadDoneRef.current = true;
        // 延迟启动，确保 displayEmployeesRef 已更新
        setTimeout(() => resetInactivityTimer(), 100);
      }
    }
  }, [employeesData]);
  useEffect(() => { if (departmentsData) setDepartments(departmentsData); }, [departmentsData]);
  useEffect(() => { if (companiesData) setCompanies(companiesData); }, [companiesData]);
  useEffect(() => { if (backgroundData?.backgroundUrl) setBackgroundUrl(backgroundData.backgroundUrl); }, [backgroundData]);

  const handleDepartmentClick = (deptId: number | string | null) => {
    // 仅切换下拉菜单，不改变 selectedDepartment
    if (deptId === 'honors') {
      setShowHonorDropdown(!showHonorDropdown);
      setShowDepartmentDropdown(false);
      setShowCompanyDropdown(false);
    } else if (deptId === 'department') {
      setShowDepartmentDropdown(!showDepartmentDropdown);
      setShowHonorDropdown(false);
      setShowCompanyDropdown(false);
    } else if (deptId === 'company') {
      // 仅展开/关闭公司下拉菜单，不改变 selectedDepartment
      setShowCompanyDropdown(!showCompanyDropdown);
      setShowDepartmentDropdown(false);
      setShowHonorDropdown(false);
    } else {
      // 选择具体部门时才改变 selectedDepartment
      setShowHonorDropdown(false);
      setShowDepartmentDropdown(false);
      setShowCompanyDropdown(false);
      setSelectedDepartment(deptId);
      setSelectedEmployee(null);
      // 不设置 setIsAutoPlayDetail(false)，保持当前值，允许30秒后进入自动轮播
      if (detailIntervalRef.current) clearInterval(detailIntervalRef.current);
      // 当选择具体部门时，允许批次轮播
      startBatchRotation();
      resetInactivityTimer();
      return;
    }
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
    if (detailIntervalRef.current) clearInterval(detailIntervalRef.current);
    if (companyShowcaseIntervalRef.current) clearInterval(companyShowcaseIntervalRef.current);
    
    // 如果是公司风采模式，启动公司风采自动轮播
    if (activeStrategyRef.current?.displayMode === 'company_showcase') {
      inactivityTimeoutRef.current = setTimeout(() => {
        setShowcasePhotoIndex(0); // 从第一张开始轮播
        setIsAutoPlayCompanyShowcase(true);
        // 注意：不在此处直接调用 startCompanyShowcaseRotation()
        // 而是通过 useEffect 监听 isAutoPlayCompanyShowcase 变化来启动，避免时序问题
      }, 30000);
    } else {
      // 总是启动批次轮播
      startBatchRotation();
      inactivityTimeoutRef.current = setTimeout(() => {
        // 使用 ref 获取最新的 displayEmployees
        if (displayEmployeesRef.current.length > 0) {
          setIsAutoPlayDetail(true);
          isAutoPlayDetailRef.current = true;
          stopBatchRotation();
          startDetailRotationFromRef();
        }
      }, 30000);
    }
  };

  const startBatchRotation = () => {
    if (batchIntervalRef.current) clearInterval(batchIntervalRef.current);
    const interval = activeStrategyRef.current?.autoPlayInterval || 5000;
    batchIntervalRef.current = setInterval(() => {
      setCurrentBatchIndex(prev => {
        const total = Math.ceil(displayEmployeesRef.current.length / 10);
        return total > 0 ? (prev + 1) % total : 0;
      });
    }, interval);
  };

  const stopBatchRotation = () => {
    if (batchIntervalRef.current) clearInterval(batchIntervalRef.current);
  };

  const startCompanyShowcaseRotation = () => {
    if (companyShowcaseIntervalRef.current) clearInterval(companyShowcaseIntervalRef.current);
    const interval = activeStrategyRef.current?.autoPlayInterval || 5000;
    // 使用 ref 而非闭包中的 state，避免从部门模式触发时 showcaseCompanyPhotos 为旧值
    companyShowcaseIntervalRef.current = setInterval(() => {
      setShowcasePhotoIndex(prev => {
        const total = showcaseCompanyPhotosRef.current.length;
        return total > 0 ? (prev + 1) % total : 0;
      });
    }, interval);
  };

  const stopCompanyShowcaseRotation = () => {
    if (companyShowcaseIntervalRef.current) clearInterval(companyShowcaseIntervalRef.current);
  };

  // 使用 ref 的版本，避免闭包问题
  const startDetailRotationFromRef = () => {
    if (detailIntervalRef.current) clearInterval(detailIntervalRef.current);
    const emps = displayEmployeesRef.current;
    if (emps.length === 0) {
      setSelectedEmployee(null);
      return;
    }
    let index = currentDetailIndexRef.current;
    if (index >= emps.length) index = 0;
    setSelectedEmployee(emps[index]);
    setCurrentDetailIndex(index);
    currentDetailIndexRef.current = index;
    const interval = activeStrategyRef.current?.autoPlayInterval || 5000;
    detailIntervalRef.current = setInterval(() => {
      const currentEmps = displayEmployeesRef.current;
      if (currentEmps.length === 0) return;
      const nextIndex = (currentDetailIndexRef.current + 1) % currentEmps.length;
      currentDetailIndexRef.current = nextIndex;
      setCurrentDetailIndex(nextIndex);
      setSelectedEmployee(currentEmps[nextIndex]);
    }, interval);
  };

  const handleEmployeeClick = (employee: any) => {
    setIsAutoPlayDetail(false);
    isAutoPlayDetailRef.current = false;
    setSelectedEmployee(employee);
    // 计算正确的 currentBatchIndex
    const empIndex = displayEmployeesRef.current.findIndex(emp => emp.id === employee.id);
    if (empIndex !== -1) {
      const batchIdx = Math.floor(empIndex / batchSize);
      setCurrentBatchIndex(batchIdx);
      currentDetailIndexRef.current = empIndex;
      setCurrentDetailIndex(empIndex);
    }
    // 停止批次轮播和详情轮播，设置 30 秒后进入自动轮播模式
    // 注意：不调用 resetInactivityTimer()，因为那会重新启动批次轮播
    if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
    if (detailIntervalRef.current) clearInterval(detailIntervalRef.current);
    stopBatchRotation();
    inactivityTimeoutRef.current = setTimeout(() => {
      if (displayEmployeesRef.current.length > 0) {
        setIsAutoPlayDetail(true);
        isAutoPlayDetailRef.current = true;
        startDetailRotationFromRef();
      }
    }, 30000);
  };

  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Handle any click to exit company showcase autoplay
  useEffect(() => {
    if (!isAutoPlayCompanyShowcase || activeStrategy?.displayMode !== 'company_showcase') return;

    const handleClick = (e: MouseEvent) => {
      setIsAutoPlayCompanyShowcase(false);
      if (companyShowcaseIntervalRef.current) clearInterval(companyShowcaseIntervalRef.current);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isAutoPlayCompanyShowcase, activeStrategy?.displayMode]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!selectedEmployee || isAutoPlayDetail) return;
      if (wheelTimeoutRef.current) return;
      wheelTimeoutRef.current = setTimeout(() => { wheelTimeoutRef.current = null; }, 300);
      e.preventDefault();
      const idx = displayEmployees.findIndex(emp => emp.id === selectedEmployee.id);
      if (e.deltaY < 0) {
        // 上翻，实现循环
        const newIdx = (idx - 1 + displayEmployees.length) % displayEmployees.length;
        setSelectedEmployee(displayEmployees[newIdx]);
        setCurrentDetailIndex(newIdx);
        const batchIdx = Math.floor(newIdx / batchSize);
        setCurrentBatchIndex(batchIdx);
        resetInactivityTimer();
      } else if (e.deltaY > 0) {
        // 下翻，实现循环
        const newIdx = (idx + 1) % displayEmployees.length;
        setSelectedEmployee(displayEmployees[newIdx]);
        setCurrentDetailIndex(newIdx);
        const batchIdx = Math.floor(newIdx / batchSize);
        setCurrentBatchIndex(batchIdx);
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

  // 同步 ref 值
  useEffect(() => {
    filteredEmployeesRef.current = filteredEmployees;
  }, [filteredEmployees]);

  useEffect(() => {
    currentDetailIndexRef.current = currentDetailIndex;
  }, [currentDetailIndex]);

  // 用 ref 跟踪上一次的策略 id 和 displayMode，避免 refetchInterval 每5秒重置计时器
  const prevStrategyIdRef = useRef<number | null | undefined>(undefined);
  const prevStrategyModeRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    // 始终同步 ref
    activeStrategyRef.current = activeStrategy;

    const newId = activeStrategy?.id ?? null;
    const newMode = activeStrategy?.displayMode ?? null;

    // 只有策略真正切换时（id 或 displayMode 变化）才重置计时器
    const isFirstLoad = prevStrategyIdRef.current === undefined;
    const strategyChanged = prevStrategyIdRef.current !== newId || prevStrategyModeRef.current !== newMode;

    prevStrategyIdRef.current = newId;
    prevStrategyModeRef.current = newMode;

    if (!isFirstLoad && !strategyChanged) {
      // 仅轮询刷新，策略未变化，不重置计时器
      return;
    }

    // 清除所有计时器和轮播状态
    if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
    if (detailIntervalRef.current) clearInterval(detailIntervalRef.current);
    if (companyShowcaseIntervalRef.current) clearInterval(companyShowcaseIntervalRef.current);
    if (batchIntervalRef.current) clearInterval(batchIntervalRef.current);
    setIsAutoPlayDetail(false);
    setIsAutoPlayCompanyShowcase(false);
    // 重新启动计时器
    resetInactivityTimer();
  }, [activeStrategy]);

  // 当 isAutoPlayDetail 变化时的处理
  useEffect(() => {
    if (isAutoPlayDetail && displayEmployeesRef.current.length > 0) {
      stopBatchRotation();
      startDetailRotationFromRef();
    }
    return () => { if (detailIntervalRef.current) clearInterval(detailIntervalRef.current); };
  }, [isAutoPlayDetail]);

  // 当 isAutoPlayCompanyShowcase 变为 true 时，启动公司风采轮播 interval
  // 通过 useEffect 而非在 setTimeout 回调中直接调用，确保 React 状态更新后再启动
  useEffect(() => {
    if (isAutoPlayCompanyShowcase && activeStrategyRef.current?.displayMode === 'company_showcase') {
      startCompanyShowcaseRotation();
    } else {
      if (companyShowcaseIntervalRef.current) clearInterval(companyShowcaseIntervalRef.current);
    }
    return () => { if (companyShowcaseIntervalRef.current) clearInterval(companyShowcaseIntervalRef.current); };
  }, [isAutoPlayCompanyShowcase]);

  const handleDetailPanelClick = (e: React.MouseEvent) => { e.stopPropagation(); };

  if (isLoading) {
    return <div className="w-full h-screen flex items-center justify-center bg-red-900">{"\u52a0\u8f7d\u4e2d..."}</div>;
  }

  // 根据轮播策略和选中的部门过滤员工
  const getDisplayEmployees = () => {
    let employees = filteredEmployees;
    
    // 首先应用轮播策略的过滤
    if (activeStrategy?.displayMode === 'core_bones') {
      employees = employees.filter(emp => emp.isCoreBone);
    }
    
    // 然后应用部门筛选
    if (selectedDepartment === 'honors') {
      // 按荣誉分类筛选
      if (selectedHonorCategory) {
        employees = employees.filter(emp => 
          emp.honors && emp.honors.some((h: any) => h.category === selectedHonorCategory)
        );
      } else {
        employees = employees.filter(emp => emp.honors && emp.honors.length > 0);
      }
    } else if (selectedDepartment === 'management') {
      // 筛选管理层员工（基于部门ID）
      const managementDept = departments.find(d => d.name === '管理层');
      if (managementDept) {
        employees = employees.filter(emp => emp.departmentId === managementDept.id);
      } else {
        // 如果找不到管理层部门，显示空列表
        employees = [];
      }
    
    } else if (selectedDepartment === 'company') {
      // 公司模式：不显示员工，显示照片
      employees = [];
    } else if (selectedDepartment !== null && selectedDepartment !== 'honors') {
      // 选择了具体部门，进一步过滤
      employees = employees.filter(emp => emp.departmentId === selectedDepartment);
    }
    
    return employees;
  };
  
  // 根据轮播策略获取应该显示的部门列表
  const getDisplayDepartments = () => {
    let displayEmps = filteredEmployees;
    
    // 根据轮播策略过滤员工
    if (activeStrategy?.displayMode === 'core_bones') {
      displayEmps = filteredEmployees.filter(emp => emp.isCoreBone);
    }
    
    // 获取这些员工中存在的部门ID
    const deptIds = new Set(displayEmps.map(emp => emp.departmentId).filter(id => id));
    
    // 返回存在的部门
    return departments.filter(dept => deptIds.has(dept.id));
  };
  
  const displayEmployees = getDisplayEmployees();
  // 更新 ref，保证 setTimeout 回调中能获取最新的 displayEmployees
  displayEmployeesRef.current = displayEmployees;
  const totalBatches = Math.ceil(displayEmployees.length / batchSize);
  const startIdx = currentBatchIndex * batchSize;
  const currentBatch = displayEmployees.slice(startIdx, startIdx + batchSize);
  
  // 翻页处理函数
  const handlePreviousBatch = () => {
    setCurrentBatchIndex((prev) => (prev - 1 + totalBatches) % totalBatches);
    resetInactivityTimer();
  };
  
  const handleNextBatch = () => {
    setCurrentBatchIndex((prev) => (prev + 1) % totalBatches);
    resetInactivityTimer();
  };



  // 根据是否选择了部门来决定排序方式
  // 如果选择了具体部门或荣誉榜，使用从左往右的排序（displayEmployees 的原始顺序）
  // 如果没有选择部门（全员模式），使用从中心开始的排序（centerSortedEmployees）
  const centerSortedEmployees = (() => {
    if (selectedDepartment !== null) {
      // 部门模式或荣誉模式：直接使用 displayEmployees 的顺序（从左往右）
      return displayEmployees;
    }
    // 全员模式：从中心开始排序
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
    if (!selectedEmployee || displayEmployees.length === 0) {
      return { left1: [], left2: [], right1: [], right2: [] };
    }
    // Find which batch the current employee belongs to
    const empIndex = displayEmployees.findIndex(e => e.id === selectedEmployee.id);
    if (empIndex === -1) {
      return { left1: [], left2: [], right1: [], right2: [] };
    }
    // Calculate batch start index
    const batchStartIdx = Math.floor(empIndex / batchSize) * batchSize;
    const batchEndIdx = Math.min(batchStartIdx + batchSize, displayEmployees.length);
    const batch = displayEmployees.slice(batchStartIdx, batchEndIdx);
    
    return {
      left1: batch.slice(0, 2),
      left2: batch.slice(2, 5),
      right1: batch.slice(5, 8),
      right2: batch.slice(8, 10)
    };
  };
  
  const autoPlayBatch = getAutoPlayBatch();
  // 在自动轮播模式下，左右照片墙应该显示 selectedEmployee 所在批次的固定列
  // 而不是基于 currentBatchIndex 的列
  const autoPlayLeftColumn = autoPlayBatch.left1;
  const autoPlayLeftMiddleColumn = autoPlayBatch.left2;
  const autoPlayRightMiddleColumn = autoPlayBatch.right1;
  const autoPlayRightColumn = autoPlayBatch.right2;

  const highlightedId = selectedEmployee?.id || null;

  return (
    <div
      className="w-full h-screen overflow-hidden relative"
      style={{
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={(e) => {
        // 只有点击背景（非子元素）时才关闭详情
        if (e.target !== e.currentTarget) return;
        setSelectedEmployee(null);
        setIsAutoPlayDetail(false);
        if (detailIntervalRef.current) clearInterval(detailIntervalRef.current);
        resetInactivityTimer();
      }}
    >
      {/* Top nav */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent z-40">
        <div className="h-20 flex items-center justify-between px-3">
          <div className="flex items-center gap-3 mt-5">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663273338301/dTX999GnT8s8oqjJyp2eQW/Logo_022bef7c.webp" alt="Logo" className="h-16 w-auto" />
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
            <h1 className="showcase-title" style={{ fontFamily: 'Microsoft YaHei, 微软雅黑, sans-serif' }}>
              {activeStrategy?.displayMode === 'core_bones' ? '骨干风采展示' : activeStrategy?.displayMode === 'company_showcase' ? '公司风采展示' : '员工风采展示'}
            </h1>
          </div>
          <div className="text-2xl font-semibold text-white tracking-wider" style={{ fontFamily: 'Noto Sans SC, sans-serif' }}>{currentTime}</div>
        </div>
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: selectedEmployee || isAutoPlayCompanyShowcase ? 0 : 1 }}
          transition={{ duration: 0.5 }}
          style={{ pointerEvents: selectedEmployee || isAutoPlayCompanyShowcase ? 'none' : 'auto' }}
          className="flex items-center justify-center gap-3 px-8 pb-4 flex-wrap"
        >
          {/* 部门下拉框 */}
          <div className="relative">
            <button onClick={() => handleDepartmentClick('department')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 w-32 justify-center ${selectedDepartment !== 'honors' && selectedDepartment !== 'company' && selectedDepartment !== null ? 'bg-red-600 text-white shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}>
              <span>部门</span>
            </button>
            {showDepartmentDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-2 left-0 bg-transparent z-50 w-32"
              >
                <button
                  onClick={() => {
                    setSelectedDepartment(null);
                    setShowDepartmentDropdown(false);
                    setSelectedEmployee(null);
                    setIsAutoPlayDetail(false);
                    if (detailIntervalRef.current) clearInterval(detailIntervalRef.current);
                    startBatchRotation();
                    resetInactivityTimer();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm font-medium transition-colors rounded bg-white/10 text-white hover:bg-white/20 mb-1"
                >
                  全部
                </button>
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => {
                      setSelectedDepartment(dept.id);
                      setShowDepartmentDropdown(false);
                      setSelectedEmployee(null);
                      setIsAutoPlayDetail(false);
                      if (detailIntervalRef.current) clearInterval(detailIntervalRef.current);
                      startBatchRotation();
                      resetInactivityTimer();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm font-medium transition-colors rounded bg-white/10 text-white hover:bg-white/20 mb-1"
                  >
                    {dept.name}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* 公司下拉框 */}
          <div className="relative">
            <button onClick={() => handleDepartmentClick('company')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 w-32 justify-center ${selectedDepartment === 'company' ? 'bg-red-600 text-white shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}>
              <span>公司</span>
            </button>
            {showCompanyDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-2 left-0 bg-transparent z-50 w-32"
              >
                <button
                  onClick={() => {
                    setSelectedCompany(null);
                    setSelectedDepartment('company');
                    setShowCompanyDropdown(false);
                    setSelectedEmployee(null);
                    setIsAutoPlayDetail(false);
                    if (detailIntervalRef.current) clearInterval(detailIntervalRef.current);
                    resetInactivityTimer();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm font-medium transition-colors rounded bg-white/10 text-white hover:bg-white/20 mb-1"
                >
                  全部
                </button>
                {companies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => {
                      setSelectedCompany(company.id);
                      setSelectedDepartment('company');
                      setShowCompanyDropdown(false);
                      setSelectedEmployee(null);
                      setIsAutoPlayDetail(false);
                      if (detailIntervalRef.current) clearInterval(detailIntervalRef.current);
                      startBatchRotation();
                      resetInactivityTimer();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm font-medium transition-colors rounded bg-white/10 text-white hover:bg-white/20 mb-1"
                  >
                    {company.name}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* 荣誉榜按钮 */}
          <div className="relative group">
            <button onClick={() => handleDepartmentClick('honors')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 w-32 justify-center ${selectedDepartment === 'honors' ? 'bg-red-600 text-white shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}>
              <span>☆</span>
              <span>荣誉榜</span>
              <span>☆</span>
            </button>
            {showHonorDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-2 left-0 right-0 bg-transparent z-50 w-full"
              >
                <button
                  onClick={() => {
                    setSelectedHonorCategory(null);
                    setSelectedDepartment('honors');
                    setShowHonorDropdown(false);
                    setSelectedEmployee(null);
                    setIsAutoPlayDetail(false);
                    if (detailIntervalRef.current) clearInterval(detailIntervalRef.current);
                    startBatchRotation();
                    resetInactivityTimer();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm font-medium transition-colors rounded bg-white/10 text-white hover:bg-white/20 mb-1"
                >
                  全部荣誉
                </button>
                {honorCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedHonorCategory(category);
                      setSelectedDepartment('honors');
                      setShowHonorDropdown(false);
                      setSelectedEmployee(null);
                      setIsAutoPlayDetail(false);
                      if (detailIntervalRef.current) clearInterval(detailIntervalRef.current);
                      startBatchRotation();
                      resetInactivityTimer();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm font-medium transition-colors rounded bg-white/10 text-white hover:bg-white/20 mb-1"
                  >
                    {category}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Content area */}
      <div className="absolute inset-0 pt-40 pb-24 flex items-center justify-center">
        {/* ====== COMPANY SHOWCASE AUTO-PLAY MODE ====== */}
        {isAutoPlayCompanyShowcase ? (
          <div className="w-full h-full flex items-center justify-center px-4 relative">
            {/* Center company showcase card - full screen in autoplay mode */}
            <div className="flex items-center justify-center px-4 z-10">
              {(() => {
                const photos = showcaseCompanyPhotosRef.current.length > 0 ? showcaseCompanyPhotosRef.current : showcaseCompanyPhotos;
                const photo = photos[showcasePhotoIndex];
                return photos.length > 0 && photo ? (
                <motion.div
                  key={`showcase-auto-${photo?.id || showcasePhotoIndex}`}
                  initial={{ opacity: 0, scale: 0.85, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -40 }}
                  transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1], type: 'spring', stiffness: 80, damping: 20 }}
                  className="bg-gradient-to-br from-red-800/95 via-red-900/95 to-red-950/95 backdrop-blur-sm rounded-2xl px-12 py-8 text-white shadow-2xl border border-red-600/60 relative card-glow-pulse"
                  style={{
                    width: '950px',
                    height: '750px',
                    paddingTop: '40px',
                    boxShadow: '0 0 60px rgba(212, 175, 55, 0.6), 0 0 100px rgba(212, 175, 55, 0.3), inset 0 0 60px rgba(212, 175, 55, 0.1)'
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl">
                    <img
                      src={photo.photoUrl}
                      alt="公司风采照片"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
              ) : (
                <div className="text-white text-2xl font-bold">暂无公司风采照片</div>
              );
              })()}
            </div>
          </div>
        ) : isAutoPlayDetail && selectedEmployee && selectedDepartment === null && activeStrategy?.displayMode !== 'company_showcase' ? (
          <div className="w-full h-full flex items-center justify-between px-4 relative">
            {/* Left columns - use autoPlay batch to match center card */}
            <div className="flex gap-6 items-center">
              <PhotoColumn employees={autoPlayLeftColumn} highlightedId={highlightedId} size={150} fromX={-100} baseDelay={0} onClickEmployee={handleEmployeeClick} isAutoPlay={true} />
              <PhotoColumn employees={autoPlayLeftMiddleColumn} highlightedId={highlightedId} size={150} fromX={-100} baseDelay={3} onClickEmployee={handleEmployeeClick} isAutoPlay={true} />
            </div>

            {/* Center detail panel (absolute overlay) */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center px-4 z-10">
              <DetailPanel key={`auto-${selectedEmployee.id}`} employee={selectedEmployee} isAutoPlay={true} onClick={handleDetailPanelClick} getDepartmentName={getDepartmentName} selectedEmployeeDetail={selectedEmployeeDetail} isLoadingDetail={isLoadingDetail} fallbackHonors={selectedEmployee?.honors} />
            </div>

            {/* Right columns */}
            <div className="flex gap-6 items-center">
              <PhotoColumn employees={autoPlayRightMiddleColumn} highlightedId={highlightedId} size={150} fromX={100} baseDelay={0} onClickEmployee={handleEmployeeClick} isAutoPlay={true} />
              <PhotoColumn employees={autoPlayRightColumn} highlightedId={highlightedId} size={150} fromX={100} baseDelay={3} onClickEmployee={handleEmployeeClick} isAutoPlay={true} />
            </div>
          </div>
        ) : isAutoPlayDetail && selectedEmployee && (selectedDepartment === 'honors' || (selectedDepartment !== null && selectedDepartment !== 'company')) && activeStrategy?.displayMode === 'company_showcase' ? (
          /* 在公司风采展示策略下，部门和荣誉榜模式仅显示中间员工详情，不显示两边照片墙 */
          <div className="w-full h-full flex items-center justify-center px-4 relative">
            {/* Center detail panel only */}
            <div className="flex items-center justify-center px-4 z-10">
              <DetailPanel key={`auto-${selectedEmployee.id}`} employee={selectedEmployee} isAutoPlay={true} onClick={handleDetailPanelClick} getDepartmentName={getDepartmentName} selectedEmployeeDetail={selectedEmployeeDetail} isLoadingDetail={isLoadingDetail} fallbackHonors={selectedEmployee?.honors} />
            </div>
          </div>
        ) : isAutoPlayDetail && selectedEmployee && selectedDepartment === null && activeStrategy?.displayMode !== 'company_showcase' ? (
          <div className="w-full h-full flex items-center justify-between px-4 relative">
            {/* Left columns - use autoPlay batch to match center card */}
            <div className="flex gap-6 items-center">
              <PhotoColumn employees={autoPlayLeftColumn} highlightedId={highlightedId} size={150} fromX={-100} baseDelay={0} onClickEmployee={handleEmployeeClick} isAutoPlay={true} />
              <PhotoColumn employees={autoPlayLeftMiddleColumn} highlightedId={highlightedId} size={150} fromX={-100} baseDelay={3} onClickEmployee={handleEmployeeClick} isAutoPlay={true} />
            </div>

            {/* Center detail panel (absolute overlay) */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center px-4 z-10">
              <DetailPanel key={`auto-${selectedEmployee.id}`} employee={selectedEmployee} isAutoPlay={true} onClick={handleDetailPanelClick} getDepartmentName={getDepartmentName} selectedEmployeeDetail={selectedEmployeeDetail} isLoadingDetail={isLoadingDetail} fallbackHonors={selectedEmployee?.honors} />
            </div>

            {/* Right columns */}
            <div className="flex gap-6 items-center">
              <PhotoColumn employees={autoPlayRightMiddleColumn} highlightedId={highlightedId} size={150} fromX={100} baseDelay={0} onClickEmployee={handleEmployeeClick} isAutoPlay={true} />
              <PhotoColumn employees={autoPlayRightColumn} highlightedId={highlightedId} size={150} fromX={100} baseDelay={3} onClickEmployee={handleEmployeeClick} isAutoPlay={true} />
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* ====== MANUAL DETAIL MODE ====== */}
            {selectedEmployee && !isAutoPlayDetail ? (
              <div className="w-full h-full flex items-center justify-between px-4 relative">
                {/* Left columns - hide when department is selected */}
                {/* Use autoPlay batch so photos match the center card, not the rotating batch */}
                {selectedDepartment === null && (
                  <div className="flex gap-6 items-center">
                    <PhotoColumn employees={autoPlayLeftColumn} highlightedId={selectedEmployee.id} size={150} fromX={-100} baseDelay={0} onClickEmployee={handleEmployeeClick} isAutoPlay={false} />
                    <PhotoColumn employees={autoPlayLeftMiddleColumn} highlightedId={selectedEmployee.id} size={150} fromX={-100} baseDelay={2} onClickEmployee={handleEmployeeClick} isAutoPlay={false} />
                  </div>
                )}

                {/* Center detail panel */}
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center px-4 z-50">
                  <AnimatePresence mode="wait">
                    {isAutoPlayDetail ? (
                      <DetailPanel key={`auto-${selectedEmployee.id}`} employee={selectedEmployee} isAutoPlay={true}
                        onClose={() => { setSelectedEmployee(null); resetInactivityTimer(); }}
                        onClick={handleDetailPanelClick}
                        getDepartmentName={getDepartmentName}
                        selectedEmployeeDetail={selectedEmployeeDetail}
                        isLoadingDetail={isLoadingDetail}
                        fallbackHonors={selectedEmployee?.honors}
                        onPrevious={() => {}}
                        onNext={() => {}}
                        canGoPrevious={false}
                        canGoNext={false}
                      />
                    ) : (
                      <DetailPanel key={`manual-${selectedEmployee.id}`} employee={selectedEmployee} isAutoPlay={false}
                        onClose={() => { setSelectedEmployee(null); resetInactivityTimer(); }}
                        onClick={handleDetailPanelClick}
                        getDepartmentName={getDepartmentName}
                        selectedEmployeeDetail={selectedEmployeeDetail}
                        isLoadingDetail={isLoadingDetail}
                        fallbackHonors={selectedEmployee?.honors}
                        onPrevious={() => {
                          const currentEmployees = selectedDepartment !== null ? displayEmployees : filteredEmployees;
                          const currentIndex = currentEmployees.findIndex(e => e.id === selectedEmployee.id);
                          if (currentEmployees.length > 0) {
                            // 实现循环翻页：第一个人的前一页接到最后一位员工
                            const newIndex = (currentIndex - 1 + currentEmployees.length) % currentEmployees.length;
                            setSelectedEmployee(currentEmployees[newIndex]);
                            setCurrentDetailIndex(newIndex);
                            // 同时更新 currentBatchIndex，使照片墙与员工详情同步
                            const newBatchIndex = Math.floor(newIndex / batchSize);
                            setCurrentBatchIndex(newBatchIndex);
                            resetInactivityTimer();
                          }
                        }}
                        onNext={() => {
                          const currentEmployees = selectedDepartment !== null ? displayEmployees : filteredEmployees;
                          const currentIndex = currentEmployees.findIndex(e => e.id === selectedEmployee.id);
                          if (currentEmployees.length > 0) {
                            // 实现循环翻页：最后一位员工的下一页接到第一个人
                            const newIndex = (currentIndex + 1) % currentEmployees.length;
                            setSelectedEmployee(currentEmployees[newIndex]);
                            setCurrentDetailIndex(newIndex);
                            // 同时更新 currentBatchIndex，使照片墙与员工详情同步
                            const newBatchIndex = Math.floor(newIndex / batchSize);
                            setCurrentBatchIndex(newBatchIndex);
                            resetInactivityTimer();
                          }
                        }}
                        canGoPrevious={true}
                        canGoNext={true}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Right columns - hide when department is selected */}
                {/* Use autoPlay batch so photos match the center card, not the rotating batch */}
                {selectedDepartment === null && (
                  <div className="flex gap-6 items-center">
                    <PhotoColumn employees={autoPlayRightMiddleColumn} highlightedId={selectedEmployee.id} size={150} fromX={100} baseDelay={0} onClickEmployee={handleEmployeeClick} isAutoPlay={false} />
                    <PhotoColumn employees={autoPlayRightColumn} highlightedId={selectedEmployee.id} size={150} fromX={100} baseDelay={3} onClickEmployee={handleEmployeeClick} isAutoPlay={false} />
                  </div>
                )}
              </div>
            ) : showPhotos ? (
              /* ====== COMPANY PHOTOS MODE ====== */
              selectedCompanyPhoto ? (
                /* 单张大卡片模式 */
                <div className="w-full h-full flex items-center justify-between px-4 relative">
                  {/* 中央大卡片 */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center px-4 z-50">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.4 }}
                      className="relative"
                    >
                      <div className="bg-gradient-to-br from-red-800/95 via-red-900/95 to-red-950/95 backdrop-blur-sm rounded-2xl text-white border border-red-600/60 relative card-glow-pulse overflow-hidden"
                        style={{ width: '950px', height: '750px', boxShadow: '0 0 60px rgba(212, 175, 55, 0.6), 0 0 100px rgba(212, 175, 55, 0.3), inset 0 0 60px rgba(212, 175, 55, 0.1)' }}>
                        <img
                          src={selectedCompanyPhoto.photoUrl}
                          alt="公司风采照片"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* 关闭按钮 */}
                      <button
                        onClick={() => setSelectedCompanyPhoto(null)}
                        className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors text-2xl font-bold"
                      >
                        ✕
                      </button>
                      {/* 左右翻页按钮 */}
                      <button
                        onClick={() => {
                          const currentIndex = displayPhotos.findIndex(p => p.id === selectedCompanyPhoto.id);
                          if (displayPhotos.length > 0) {
                            const newIndex = (currentIndex - 1 + displayPhotos.length) % displayPhotos.length;
                            setSelectedCompanyPhoto(displayPhotos[newIndex]);
                          }
                        }}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-16 text-white hover:text-red-400 transition-colors text-4xl font-bold"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => {
                          const currentIndex = displayPhotos.findIndex(p => p.id === selectedCompanyPhoto.id);
                          if (displayPhotos.length > 0) {
                            const newIndex = (currentIndex + 1) % displayPhotos.length;
                            setSelectedCompanyPhoto(displayPhotos[newIndex]);
                          }
                        }}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-16 text-white hover:text-red-400 transition-colors text-4xl font-bold"
                      >
                        ›
                      </button>
                      {/* 计数器 */}
                      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white text-lg font-semibold">
                        {displayPhotos.findIndex(p => p.id === selectedCompanyPhoto.id) + 1} / {displayPhotos.length}
                      </div>
                    </motion.div>
                  </div>
                </div>
              ) : (
                /* 网格缩略图模式 */
                <motion.div className="w-full h-full flex flex-col items-center justify-center px-4 overflow-y-auto"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center items-center max-w-7xl py-8">
                    {displayPhotos.map((photo: any, idx: number) => (
                      <motion.div key={photo.id}
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        className="cursor-pointer"
                        onClick={() => setSelectedCompanyPhoto(photo)}
                      >
                        <div style={{ width: '280px', height: '200px' }}>
                          <CompanyPhotoCard photoUrl={photo.photoUrl} alt="公司风采照片" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )
            ) : activeStrategy?.displayMode === 'company_showcase' && !isAutoPlayCompanyShowcase && selectedDepartment === null ? (
              /* ====== COMPANY SHOWCASE NORMAL MODE - EMPTY DISPLAY ====== */
              /* ====== COMPANY SHOWCASE NORMAL MODE ====== */
              <div className="w-full h-full flex items-center justify-between px-4 relative">
                {/* Left columns */}
                <div className="flex gap-6 items-center">
                  <PhotoColumn employees={leftColumn} highlightedId={highlightedId} size={150} fromX={-100} baseDelay={0} onClickEmployee={handleEmployeeClick} isAutoPlay={false} />
                  <PhotoColumn employees={leftMiddleColumn} highlightedId={highlightedId} size={150} fromX={-100} baseDelay={2} onClickEmployee={handleEmployeeClick} isAutoPlay={false} />
                </div>

                {/* Center - empty, waiting for auto play */}
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center px-4 z-10">
                  {/* Empty space - no card displayed until auto play starts */}
                </div>

                {/* Right columns */}
                <div className="flex gap-6 items-center">
                  <PhotoColumn employees={rightMiddleColumn} highlightedId={highlightedId} size={150} fromX={100} baseDelay={0} onClickEmployee={handleEmployeeClick} isAutoPlay={false} />
                  <PhotoColumn employees={rightColumn} highlightedId={highlightedId} size={150} fromX={100} baseDelay={3} onClickEmployee={handleEmployeeClick} isAutoPlay={false} />
                </div>
              </div>
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

      {/* Bottom pagination buttons */}
      <motion.div
        className="absolute bottom-8 left-8 z-40"
        initial={{ opacity: 1 }}
        animate={{ opacity: selectedEmployee || isAutoPlayCompanyShowcase ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        style={{ pointerEvents: selectedEmployee || isAutoPlayCompanyShowcase ? 'none' : 'auto' }}
      >
        <button onClick={handlePreviousBatch}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-2xl font-bold transition-all border border-white/30">
          {"\u2190"}
        </button>
      </motion.div>

      {/* Bottom search */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40"
        initial={{ opacity: 1 }}
        animate={{ opacity: selectedEmployee || isAutoPlayCompanyShowcase ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        style={{ pointerEvents: selectedEmployee || isAutoPlayCompanyShowcase ? 'none' : 'auto' }}
      >
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
      </motion.div>

      {/* Bottom right pagination button */}
      <motion.div
        className="absolute bottom-8 right-8 z-40"
        initial={{ opacity: 1 }}
        animate={{ opacity: selectedEmployee || isAutoPlayCompanyShowcase ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        style={{ pointerEvents: selectedEmployee || isAutoPlayCompanyShowcase ? 'none' : 'auto' }}
      >
        <button onClick={handleNextBatch}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-2xl font-bold transition-all border border-white/30">
          {"\u2192"}
        </button>
      </motion.div>

      {/* Batch indicator - 公司风采轮播模式下隐藏 */}
      {!isAutoPlayCompanyShowcase && (
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center z-30"
        initial={{ opacity: 1 }}
        animate={{ opacity: selectedEmployee ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        style={{ pointerEvents: 'none' }}
      >
        <div className="text-white/60 text-xs font-semibold">
          {totalBatches > 0 ? `${currentBatchIndex + 1} / ${totalBatches}` : '0 / 0'}
        </div>
      </motion.div>
      )}
    </div>
  );
}
