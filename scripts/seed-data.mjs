import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '../drizzle/schema.ts';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

async function seedDatabase() {
  try {
    const db = drizzle(DATABASE_URL);

    console.log('🌱 开始插入示例数据...');

    // 1. 插入部门
    const departments = [
      { name: '管理层', description: '公司管理团队', order: 1 },
      { name: '商务部', description: '商务拓展和合作', order: 2 },
      { name: '工程部', description: '技术开发团队', order: 3 },
      { name: '安环部', description: '安全和环境管理', order: 4 },
      { name: '调度运行部', description: '港口调度和运营', order: 5 },
      { name: '综合部', description: '综合管理和支持', order: 6 },
    ];

    console.log('📝 插入部门数据...');
    for (const dept of departments) {
      await db.insert(schema.departments).values(dept).onDuplicateKeyUpdate({
        set: { name: dept.name, description: dept.description, order: dept.order },
      });
    }

    // 2. 获取部门 ID
    const depts = await db.select().from(schema.departments);
    const deptMap = Object.fromEntries(depts.map(d => [d.name, d.id]));

    // 3. 插入员工
    const employees = [
      {
        name: '张明',
        departmentId: deptMap['管理层'],
        position: '总经理',
        level: '高级',
        joinDate: new Date('2015-03-15'),
        jobResponsibilities: '负责公司整体战略规划和运营管理，确保各部门目标达成。',
        motto: '以人为本，持续创新',
        status: 'active',
        isCoreBone: true,
      },
      {
        name: '李华',
        departmentId: deptMap['商务部'],
        position: '商务经理',
        level: '中级',
        joinDate: new Date('2018-06-20'),
        jobResponsibilities: '开拓新市场，维护客户关系，推进商务合作。',
        motto: '诚信合作，互利共赢',
        status: 'active',
        isCoreBone: true,
      },
      {
        name: '王芳',
        departmentId: deptMap['工程部'],
        position: '技术总监',
        level: '高级',
        joinDate: new Date('2016-09-10'),
        jobResponsibilities: '领导技术团队，推进系统开发和技术创新。',
        motto: '技术驱动，创新引领',
        status: 'active',
        isCoreBone: true,
      },
      {
        name: '陈刚',
        departmentId: deptMap['工程部'],
        position: '高级工程师',
        level: '中级',
        joinDate: new Date('2019-01-15'),
        jobResponsibilities: '负责核心系统开发和维护，解决技术难题。',
        motto: '代码改变世界',
        status: 'active',
        isCoreBone: false,
      },
      {
        name: '刘晓',
        departmentId: deptMap['安环部'],
        position: '安全主管',
        level: '中级',
        joinDate: new Date('2017-07-01'),
        jobResponsibilities: '制定和执行安全管理制度，确保港口安全运营。',
        motto: '安全第一，预防为主',
        status: 'active',
        isCoreBone: false,
      },
      {
        name: '周敏',
        departmentId: deptMap['调度运行部'],
        position: '调度主任',
        level: '中级',
        joinDate: new Date('2018-03-20'),
        jobResponsibilities: '协调港口运营，优化调度流程，提高效率。',
        motto: '高效运营，精准调度',
        status: 'active',
        isCoreBone: true,
      },
      {
        name: '黄丽',
        departmentId: deptMap['综合部'],
        position: '人力资源经理',
        level: '中级',
        joinDate: new Date('2019-05-10'),
        jobResponsibilities: '人才招聘、培养和管理，员工关系维护。',
        motto: '人才是第一资源',
        status: 'active',
        isCoreBone: false,
      },
      {
        name: '吴涛',
        departmentId: deptMap['工程部'],
        position: '系统架构师',
        level: '高级',
        joinDate: new Date('2017-11-01'),
        jobResponsibilities: '设计系统架构，指导技术方向，提升系统性能。',
        motto: '架构即未来',
        status: 'active',
        isCoreBone: true,
      },
    ];

    console.log('👥 插入员工数据...');
    for (const emp of employees) {
      await db.insert(schema.employees).values(emp).onDuplicateKeyUpdate({
        set: emp,
      });
    }

    // 4. 获取员工 ID
    const emps = await db.select().from(schema.employees);
    const empMap = Object.fromEntries(emps.map(e => [e.name, e.id]));

    // 5. 插入荣誉
    const honors = [
      {
        employeeId: empMap['张明'],
        title: '2024年度优秀管理者',
        description: '在公司战略规划和团队管理中表现突出',
        awardDate: new Date('2024-12-15'),
        icon: 'trophy',
        isNew: true,
      },
      {
        employeeId: empMap['李华'],
        title: '商务拓展先进个人',
        description: '成功签署多项重要合作协议',
        awardDate: new Date('2024-11-20'),
        icon: 'star',
        isNew: true,
      },
      {
        employeeId: empMap['王芳'],
        title: '技术创新奖',
        description: '推进系统现代化改造，提升运营效率',
        awardDate: new Date('2024-10-30'),
        icon: 'rocket',
        isNew: false,
      },
      {
        employeeId: empMap['陈刚'],
        title: '班组之星',
        description: '技术能力强，团队协作好',
        awardDate: new Date('2024-09-15'),
        icon: 'star',
        isNew: false,
      },
      {
        employeeId: empMap['周敏'],
        title: '港口运营优秀奖',
        description: '调度效率提升15%，获得客户好评',
        awardDate: new Date('2024-12-10'),
        icon: 'trophy',
        isNew: true,
      },
      {
        employeeId: empMap['吴涛'],
        title: '系统稳定性贡献奖',
        description: '架构优化使系统可用性提升至99.9%',
        awardDate: new Date('2024-11-05'),
        icon: 'award',
        isNew: false,
      },
    ];

    console.log('🏆 插入荣誉数据...');
    for (const honor of honors) {
      await db.insert(schema.honors).values(honor).onDuplicateKeyUpdate({
        set: honor,
      });
    }

    // 6. 插入轮播策略
    const strategies = [
      {
        name: '日常展示',
        displayMode: 'all',
        description: '展示全部员工，每5秒切换一次',
        autoPlayInterval: 5000,
        isActive: true,
      },
      {
        name: '核心骨干展示',
        displayMode: 'core_bones',
        description: '仅展示核心骨干成员，每8秒切换一次',
        autoPlayInterval: 8000,
        isActive: false,
      },
      {
        name: '荣誉榜',
        displayMode: 'honors',
        description: '展示获得荣誉的员工，每10秒切换一次',
        autoPlayInterval: 10000,
        isActive: false,
      },
    ];

    console.log('🎬 插入轮播策略数据...');
    for (const strategy of strategies) {
      await db.insert(schema.playbackStrategies).values(strategy).onDuplicateKeyUpdate({
        set: strategy,
      });
    }

    console.log('✅ 示例数据插入完成！');
    console.log(`
📊 数据统计：
  - 部门数：${departments.length}
  - 员工数：${employees.length}
  - 荣誉数：${honors.length}
  - 轮播策略数：${strategies.length}
    `);
  } catch (error) {
    console.error('❌ 数据插入失败:', error);
    process.exit(1);
  }
}

seedDatabase();
