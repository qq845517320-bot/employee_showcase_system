import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Trophy, Calendar, Briefcase, Quote } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import type { Employee } from '../../../drizzle/schema';

interface EmployeeDetailModalProps {
  employee: Employee | null;
  allEmployees: Employee[];
  onClose: () => void;
  onNavigate?: (employee: Employee) => void;
}

export function EmployeeDetailModal({
  employee,
  allEmployees,
  onClose,
  onNavigate,
}: EmployeeDetailModalProps) {
  const { data: honors = [] } = trpc.honors.listByEmployee.useQuery(
    { employeeId: employee?.id || 0 },
    { enabled: !!employee }
  );

  if (!employee) return null;

  const currentIndex = allEmployees.findIndex(e => e.id === employee.id);
  const hasNext = currentIndex < allEmployees.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = () => {
    if (hasNext && onNavigate) {
      onNavigate(allEmployees[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (hasPrev && onNavigate) {
      onNavigate(allEmployees[currentIndex - 1]);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-elegant-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* 内容区域 */}
          <div className="overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
              {/* 左侧：工作照 */}
              <div className="md:col-span-1">
                <div className="sticky top-8">
                  <div className="aspect-square rounded-xl overflow-hidden shadow-elegant mb-4 bg-gradient-to-br from-blue-100 to-blue-50">
                    {employee.workPhoto ? (
                      <img
                        src={employee.workPhoto}
                        alt={employee.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl font-bold text-blue-300 mb-2">
                            {employee.name.charAt(0)}
                          </div>
                          <div className="text-sm text-blue-200">{employee.position}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 基本信息卡片 */}
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">入职时间</p>
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(employee.joinDate).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">职级</p>
                      <p className="text-sm font-semibold">{employee.level}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">岗位</p>
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        {employee.position}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右侧：详细信息 */}
              <div className="md:col-span-2 space-y-6">
                {/* 姓名和部门 */}
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">
                    {employee.name}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    部门 ID: {employee.departmentId}
                  </p>
                </div>

                {/* 工作职责 */}
                {employee.jobResponsibilities && (
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      工作职责
                    </h2>
                    <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
                      {employee.jobResponsibilities}
                    </p>
                  </div>
                )}

                {/* 座右铭 */}
                {employee.motto && (
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-blue-600">
                    <div className="flex gap-3">
                      <Quote className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">座右铭</p>
                        <p className="text-base font-semibold text-foreground italic">
                          {employee.motto}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 个人荣誉 */}
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    个人荣誉
                  </h2>
                  {honors.length === 0 ? (
                    <p className="text-muted-foreground">暂无荣誉记录</p>
                  ) : (
                    <div className="space-y-2">
                      {honors.map(honor => (
                        <motion.div
                          key={honor.id}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                        >
                          <Trophy className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground">{honor.title}</p>
                            {honor.description && (
                              <p className="text-sm text-muted-foreground">{honor.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(honor.awardDate).toLocaleDateString('zh-CN')}
                            </p>
                          </div>
                          {honor.isNew && (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded font-bold whitespace-nowrap">
                              New
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 导航按钮 */}
          <div className="border-t bg-muted/30 px-8 py-4 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={!hasPrev}
              className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <p className="text-sm text-muted-foreground">
              {currentIndex + 1} / {allEmployees.length}
            </p>

            <button
              onClick={handleNext}
              disabled={!hasNext}
              className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
