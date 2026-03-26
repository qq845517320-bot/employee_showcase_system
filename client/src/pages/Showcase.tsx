import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { trpc } from '@/lib/trpc';
import { EmployeeCard } from '@/components/EmployeeCard';
import { EmployeeDetailModal } from '@/components/EmployeeDetailModal';
import { Clock, Grid3x3, Users } from 'lucide-react';
import type { Department, Employee } from '../../../drizzle/schema';

interface EmployeeWithHonor extends Employee {
  hasNewHonor?: boolean;
}

export default function Showcase() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [displayMode, setDisplayMode] = useState<'all' | 'core_bones' | 'honors'>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithHonor | null>(null);

  // 实时时间更新
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 获取部门列表
  const { data: departments = [] } = trpc.departments.list.useQuery();

  // 获取员工列表
  const { data: employees = [] } = trpc.employees.list.useQuery({
    departmentId: selectedDepartment || undefined,
    displayMode,
  });

  // 获取新荣誉列表
  const { data: newHonors = [] } = trpc.honors.listNew.useQuery();

  // 标记员工是否有新荣誉
  const employeesWithHonor: EmployeeWithHonor[] = useMemo(() => {
    const newHonorEmployeeIds = new Set(newHonors.map(h => h.employeeId));
    return employees.map(emp => ({
      ...emp,
      hasNewHonor: newHonorEmployeeIds.has(emp.id),
    }));
  }, [employees, newHonors]);

  // 部门筛选选项
  const filterOptions = [
    { id: null, name: '全部', icon: Grid3x3 },
    { id: -1, name: '荣誉榜', icon: null },
    ...departments,
  ];

  const handleDepartmentFilter = (deptId: number | null) => {
    if (deptId === -1) {
      setDisplayMode('honors');
      setSelectedDepartment(null);
    } else {
      setDisplayMode('all');
      setSelectedDepartment(deptId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* 顶部导航栏 */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/50 shadow-elegant"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 左侧：LOGO 和标题 */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  员工风采
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  深国际靖江港
                </p>
              </div>
            </div>

            {/* 右侧：实时时间 */}
            <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
              <Clock className="w-5 h-5" />
              <span className="font-mono">{currentTime}</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* 部门筛选栏 */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="sticky top-20 z-40 bg-white/90 backdrop-blur-md border-b border-border/50 shadow-sm"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap gap-2 md:gap-3">
            {filterOptions.map((option, idx) => {
              const isActive =
                (option.id === null && displayMode === 'all' && selectedDepartment === null) ||
                (option.id === -1 && displayMode === 'honors') ||
                (option.id && option.id > 0 && selectedDepartment === option.id);

              return (
                <motion.button
                  key={option.id ?? 'all'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDepartmentFilter(option.id ?? null)}
                  className={`px-4 py-2 rounded-full font-medium text-sm md:text-base transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {option.name}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* 员工矩阵网格 */}
      <main className="container mx-auto px-6 py-12">
        {employeesWithHonor.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl text-muted-foreground">暂无员工信息</p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8"
          >
            {employeesWithHonor.map((employee, idx) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                delay={idx * 0.05}
                onClick={() => setSelectedEmployee(employee)}
              />
            ))}
          </motion.div>
        )}
      </main>

      {/* 员工详情弹窗 */}
      <EmployeeDetailModal
        employee={selectedEmployee}
        allEmployees={employeesWithHonor}
        onClose={() => setSelectedEmployee(null)}
        onNavigate={setSelectedEmployee}
      />
    </div>
  );
}
