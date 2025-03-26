// 语言配置
const langConfig = {
    'en': {
        // 页面文本
        'appTitle': 'Habit Tracker',
        'weekView': 'Week',
        'monthView': 'Month',
        'yearView': 'Year',
        'exportBtn': 'Export',
        'prevBtn': 'Previous',
        'nextBtn': 'Next',
        'addHabitPlaceholder': 'Enter new habit name',
        'addHabitBtn': 'Add Habit',
        
        // 默认习惯
        'defaultHabit1': 'Exercise 20 minutes daily',
        'defaultHabit2': 'Drink 1.5L water daily',
        
        // 日期和月份
        'weekdays': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        'months': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        'monthsShort': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        
        // 编辑表单
        'editHabit': 'Edit Habit',
        'habitName': 'Habit Name',
        'editBtn': 'Edit',
        'saveBtn': 'Save',
        'cancelBtn': 'Cancel',
        'deleteBtn': 'Delete',
        'confirmDelete': 'Are you sure you want to delete this habit?',
        'habitExists': 'This habit name already exists!',
        'habitEmpty': 'Habit name cannot be empty',
        
        // 导出相关
        'exporting': 'Exporting...',
        'exportFailed': 'Export failed, please try again',
        
        // 连续打卡提醒
        'streakDay7': 'Congratulations! You have completed this habit for 7 consecutive days! 🎉',
        'streakDay21': 'Amazing! You have completed this habit for 21 consecutive days! Keep going! 🔥',
        'streakDay90': 'Incredible achievement! You have completed this habit for 90 consecutive days! This habit is now part of your life! 🏆',
        'streakBtn': 'Continue',
        'futureDateNotAllowed': 'Future dates cannot be marked',
        
        // 版权信息
        'copyright': '© PixelBear 32@32comic.com'
    },
    'zh': {
        // 页面文本
        'appTitle': '习惯打卡日记',
        'weekView': '周视图',
        'monthView': '月视图',
        'yearView': '年视图',
        'exportBtn': '导出图片',
        'prevBtn': '上一个',
        'nextBtn': '下一个',
        'addHabitPlaceholder': '输入新习惯名称',
        'addHabitBtn': '新增习惯',
        
        // 默认习惯
        'defaultHabit1': 'Exercise 20 minutes daily',
        'defaultHabit2': 'Drink 1.5L water daily',
        
        // 日期和月份
        'weekdays': ['日', '一', '二', '三', '四', '五', '六'],
        'months': ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        'monthsShort': ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        
        // 编辑表单
        'editHabit': '编辑习惯',
        'habitName': '习惯名称',
        'editBtn': 'Edit',
        'saveBtn': '保存',
        'cancelBtn': '取消',
        'deleteBtn': '删除',
        'confirmDelete': '确定要删除这个习惯吗？',
        'habitExists': '该习惯名称已存在！',
        'habitEmpty': '习惯名称不能为空',
        
        // 导出相关
        'exporting': '导出中...',
        'exportFailed': '导出失败，请重试',
        
        // 连续打卡提醒
        'streakDay7': '恭喜！你已经连续完成这个习惯7天了！🎉',
        'streakDay21': '太棒了！你已经连续完成这个习惯21天了！继续加油！🔥',
        'streakDay90': '非凡的成就！你已经连续完成这个习惯90天了！这个习惯已经成为你生活的一部分！🏆',
        'streakBtn': '继续',
        'futureDateNotAllowed': '未来的日期不能被标记',
        
        // 版权信息
        'copyright': '© PixelBear 32@32comic.com'
    }
};

// 默认语言
let currentLang = localStorage.getItem('habitDiaryLang') || 'en';

// 获取文本
function getText(key) {
    return langConfig[currentLang][key] || key;
}

// 切换语言
function switchLanguage(lang) {
    if (langConfig[lang]) {
        currentLang = lang;
        localStorage.setItem('habitDiaryLang', lang);
        return true;
    }
    return false;
}

// 获取当前语言
function getCurrentLang() {
    return currentLang;
} 