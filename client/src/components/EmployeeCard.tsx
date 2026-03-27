import { motion } from 'framer-motion';
import { Trophy, Star } from 'lucide-react';
import type { Employee } from '../../../drizzle/schema';

interface EmployeeCardProps {
  employee: Employee & { hasNewHonor?: boolean };
  onClick: () => void;
  delay?: number;
}

export function EmployeeCard({ employee, onClick, delay = 0 }: EmployeeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -8, boxShadow: '0 16px 48px rgba(0, 0, 0, 0.16)' }}
      onClick={onClick}
      className="cursor-pointer group relative"
    >
      <div className="card-elegant overflow-hidden h-full flex flex-col">
        {/* 工作照背景 */}
        <div className="relative w-full aspect-square bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
          {employee.workPhoto ? (
            <img
              src={employee.workPhoto}
              alt={employee.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-300 mb-2">
                  {employee.name.charAt(0)}
                </div>
                <div className="text-xs text-blue-200">{employee.position}</div>
              </div>
            </div>
          )}

          {/* 荣誉角标 */}
          {employee.hasNewHonor && (
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute top-2 right-2 bg-yellow-400 rounded-full p-2 shadow-lg"
            >
              <Trophy className="w-5 h-5 text-yellow-900" />
            </motion.div>
          )}

          {/* New 标签 */}
          {employee.hasNewHonor && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              New
            </div>
          )}

          {/* 核心骨干标签 */}
          {employee.isCoreBone && (
            <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <Star className="w-3 h-3" />
              核心骨干
            </div>
          )}
        </div>

        {/* 员工信息 */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1 truncate">
              {employee.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-2 truncate">
              {employee.position}
            </p>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-2 py-1 bg-accent/10 text-accent text-xs rounded font-medium">
                {employee.level}
              </span>
              <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium">
                {employee.departmentId}
              </span>
            </div>
          </div>

          {/* 工作信条 */}
          {employee.workTenet && (
            <p className="text-xs text-muted-foreground italic line-clamp-2 border-t pt-2">
              "{employee.workTenet}"
            </p>
          )}
        </div>

        {/* 悬停效果 - 点击提示 */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none rounded-lg" />
      </div>
    </motion.div>
  );
}
