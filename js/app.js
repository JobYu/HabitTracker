// 數據存儲
class HabitStorage {
    constructor() {
        this.habits = JSON.parse(localStorage.getItem('habits')) || {
            exercise: {
                name: getText('defaultHabit1') || 'Exercise 20 minutes daily',
                completedDates: [],
                streakHistory: [] // 記錄打卡連續天數的歷史
            },
            water: {
                name: getText('defaultHabit2') || 'Drink 1.5L water daily',
                completedDates: [],
                streakHistory: [] // 記錄打卡連續天數的歷史
            }
        };
        this.saveHabits();
    }

    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

    addHabit(name) {
        const id = name.toLowerCase().replace(/\s+/g, '-');
        if (this.habits[id]) {
            return false;
        }
        this.habits[id] = {
            name: name,
            completedDates: [],
            streakHistory: [] // 初始化連續打卡記錄
        };
        this.saveHabits();
        return true;
    }

    updateHabit(oldId, newName) {
        // 如果名稱沒有變化，直接更新
        if (this.habits[oldId].name === newName) {
            return oldId;
        }
        
        // 生成新的ID
        const newId = newName.toLowerCase().replace(/\s+/g, '-');
        
        // 如果新ID與舊ID相同，直接更新名稱
        if (newId === oldId) {
            this.habits[oldId].name = newName;
            this.saveHabits();
            return oldId;
        }
        
        // 檢查新ID是否已存在
        if (this.habits[newId]) {
            return false;
        }
        
        // 複製習慣數據到新ID
        this.habits[newId] = {
            name: newName,
            completedDates: [...this.habits[oldId].completedDates],
            streakHistory: [...(this.habits[oldId].streakHistory || [])] // 確保連續記錄也被複製
        };
        
        // 刪除舊ID的習慣
        delete this.habits[oldId];
        this.saveHabits();
        return newId;
    }

    removeHabit(id) {
        delete this.habits[id];
        this.saveHabits();
    }

    toggleHabitCompletion(id, date) {
        if (!this.habits[id]) {
            return null; // 防止訪問不存在的習慣
        }

        // 檢查日期是否可以被修改
        const now = new Date();
        if (date > now) {
            console.log(getText('futureDateNotAllowed'));
            return null; // 未來的日期不能被標記
        }

        const habit = this.habits[id];
        const dateStr = this.formatDateString(date);
        const index = habit.completedDates.indexOf(dateStr);
        
        let changed = false;
        if (index === -1) {
            habit.completedDates.push(dateStr);
            habit.completedDates.sort(); // 確保日期是按順序的
            changed = true;
        } else {
            habit.completedDates.splice(index, 1);
            changed = false;
        }
        
        // 計算並更新連續天數
        this.calculateStreaks(id);
        this.saveHabits();
        
        // 檢查是否達到里程碑天數
        const currentStreak = this.getCurrentStreak(id);
        if (changed && (currentStreak === 7 || currentStreak === 21 || currentStreak === 90)) {
            this.showStreakDialog(currentStreak, id);
            return currentStreak; // 返回連續天數以便顯示提醒
        }
        
        return null; // 沒有達到里程碑
    }

    isHabitCompletedOnDate(id, date) {
        if (!this.habits[id]) {
            return false; // 防止訪問不存在的習慣
        }
        const habit = this.habits[id];
        const dateStr = this.formatDateString(date);
        return habit.completedDates.includes(dateStr);
    }

    formatDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // 計算連續完成的天數
    calculateStreaks(habitId) {
        if (!this.habits[habitId]) return;
        
        const habit = this.habits[habitId];
        const dates = [...habit.completedDates].sort();
        
        if (!dates.length) {
            habit.streakHistory = [];
            return;
        }
        
        // 將日期字符串轉換為時間戳數組
        const timestamps = dates.map(dateStr => {
            const [year, month, day] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day).getTime();
        });
        
        // 按時間順序排序
        timestamps.sort((a, b) => a - b);
        
        // 計算連續天數
        const streaks = [];
        let currentStreak = {
            startDate: new Date(timestamps[0]),
            endDate: new Date(timestamps[0]),
            days: 1
        };
        
        for (let i = 1; i < timestamps.length; i++) {
            const currentDate = new Date(timestamps[i]);
            const prevDate = new Date(timestamps[i - 1]);
            
            // 檢查當前日期是否是前一天的后一天
            prevDate.setDate(prevDate.getDate() + 1);
            
            if (this.isSameDay(currentDate, prevDate)) {
                // 連續
                currentStreak.endDate = currentDate;
                currentStreak.days++;
            } else {
                // 中斷，記錄上一個連續記錄，開始新記錄
                streaks.push({ ...currentStreak });
                currentStreak = {
                    startDate: currentDate,
                    endDate: currentDate,
                    days: 1
                };
            }
        }
        
        // 添加最後一個連續記錄
        streaks.push(currentStreak);
        
        // 保存連續記錄歷史
        habit.streakHistory = streaks;
    }
    
    // 檢查兩個日期是否為同一天
    isSameDay(date1, date2) {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    }
    
    // 獲取當前連續天數
    getCurrentStreak(habitId) {
        if (!this.habits[habitId] || !this.habits[habitId].streakHistory || this.habits[habitId].streakHistory.length === 0) {
            return 0;
        }
        
        const habit = this.habits[habitId];
        
        // 獲取最近的連續記錄
        const latestStreak = habit.streakHistory[habit.streakHistory.length - 1];
        
        // 檢查是否是今天或昨天結束的連續記錄（允許昨天的連續記錄視為當前連續）
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const endDate = new Date(latestStreak.endDate);
        endDate.setHours(0, 0, 0, 0);
        
        if (this.isSameDay(endDate, today) || this.isSameDay(endDate, yesterday)) {
            return latestStreak.days;
        }
        
        return 0; // 連續記錄已中斷
    }

    showStreakDialog(streakDays, habitId) {
        const habit = this.habits[habitId];
        if (!habit) return;
        
        const dialog = document.getElementById('streakDialog');
        const message = document.getElementById('streakMessage');
        
        let messageText = '';
        if (streakDays === 7) {
            messageText = getText('streakDay7');
        } else if (streakDays === 21) {
            messageText = getText('streakDay21');
        } else if (streakDays === 90) {
            messageText = getText('streakDay90');
        }
        
        // 添加習慣名稱
        messageText = messageText.replace(/this habit/g, `"${habit.name}"`);
        
        message.textContent = messageText;
        dialog.style.display = 'flex';
    }
}

// 日曆視圖管理
class CalendarView {
    constructor(storage) {
        this.storage = storage;
        this.currentDate = new Date();
        this.currentView = 'week';
        this.editingHabitId = null;
        this.viewingYear = this.currentDate.getFullYear(); // 追蹤正在瀏覽的年份
        this.setupLanguage();
        this.setupEventListeners();
        this.checkNewWeek();
        this.render();
    }

    // 初始化語言設置
    setupLanguage() {
        this.updateUITexts();
    }

    // 更新UI文本
    updateUITexts() {
        // 更新標題和按鈕文本
        document.title = getText('appTitle');
        document.getElementById('appTitle').textContent = getText('appTitle');
        document.getElementById('weekViewBtn').textContent = getText('weekView');
        document.getElementById('monthViewBtn').textContent = getText('monthView');
        document.getElementById('yearViewBtn').textContent = getText('yearView');
        document.getElementById('exportBtn').textContent = getText('exportBtn');
        document.getElementById('prevBtn').textContent = getText('prevBtn');
        document.getElementById('nextBtn').textContent = getText('nextBtn');
        document.getElementById('habitName').placeholder = getText('addHabitPlaceholder');
        document.getElementById('addHabitBtn').textContent = getText('addHabitBtn');
        document.getElementById('streakConfirmBtn').textContent = getText('streakBtn');
        
        // 更新版权信息
        document.getElementById('copyright').textContent = getText('copyright');
        
        // 觸發重新渲染視圖
        this.render();
    }

    setupEventListeners() {
        // 視圖切換按鈕
        document.querySelectorAll('.view-controls button[data-view]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-controls button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentView = btn.getAttribute('data-view');
                this.render();
            });
        });

        // 導航控制按鈕
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        prevBtn.addEventListener('click', () => {
            if (this.currentView === 'week') {
                this.prevWeek();
            } else if (this.currentView === 'month') {
                this.prevMonth();
            } else if (this.currentView === 'year') {
                this.prevYear();
            }
        });

        nextBtn.addEventListener('click', () => {
            if (this.currentView === 'week') {
                this.nextWeek();
            } else if (this.currentView === 'month') {
                this.nextMonth();
            } else if (this.currentView === 'year') {
                this.nextYear();
            }
        });

        // 添加習慣表單
        document.getElementById('addHabitForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const habitNameInput = document.getElementById('habitName');
            const habitName = habitNameInput.value.trim();
            
            if (habitName) {
                this.storage.addHabit(habitName);
                this.render();
                habitNameInput.value = '';
            }
        });

        // 導出圖片按鈕
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportAsImage();
        });

        // 點擊非編輯表單區域關閉表單
        document.addEventListener('click', (e) => {
            const editPanel = document.querySelector('.edit-panel');
            if (editPanel && e.target === editPanel) {
                this.closeEditForm();
            }
        });

        // 語言切換按鈕
        document.getElementById('langEn').addEventListener('click', () => {
            this.switchLanguage('en');
        });

        document.getElementById('langZh').addEventListener('click', () => {
            this.switchLanguage('zh');
        });

        // 連續打卡提醒對話框確認按鈕
        document.getElementById('streakConfirmBtn').addEventListener('click', () => {
            this.hideStreakDialog();
        });
    }

    // 切換語言
    switchLanguage(lang) {
        if (switchLanguage(lang)) {
            // 更新語言按鈕狀態
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.getElementById(`lang${lang.charAt(0).toUpperCase() + lang.slice(1)}`).classList.add('active');
            
            // 更新UI文本
            this.updateUITexts();
        }
    }

    // 顯示連續打卡提醒對話框
    showStreakDialog(streakDays, habitId) {
        const habit = this.storage.habits[habitId];
        if (!habit) return;
        
        const dialog = document.getElementById('streakDialog');
        const message = document.getElementById('streakMessage');
        
        let messageText = '';
        if (streakDays === 7) {
            messageText = getText('streakDay7');
        } else if (streakDays === 21) {
            messageText = getText('streakDay21');
        } else if (streakDays === 90) {
            messageText = getText('streakDay90');
        }
        
        // 添加習慣名稱
        messageText = messageText.replace(/this habit/g, `"${habit.name}"`);
        
        message.textContent = messageText;
        dialog.style.display = 'flex';
    }
    
    // 隱藏連續打卡提醒對話框
    hideStreakDialog() {
        document.getElementById('streakDialog').style.display = 'none';
    }

    formatDate(date, formatType = 'short') {
        if (formatType === 'short') {
            return {
                day: date.getDate(),
                weekDay: getText('weekdays')[date.getDay()]
            };
        } else if (formatType === 'month') {
            return getText('months')[date.getMonth()];
        } else if (formatType === 'monthYear') {
            return `${getText('months')[date.getMonth()]} ${date.getFullYear()}`;
        } else if (formatType === 'full') {
            return `${date.getFullYear()}${getCurrentLang() === 'zh' ? '年' : ' '}${getText('months')[date.getMonth()]}${getCurrentLang() === 'zh' ? ' ' : ' '}${date.getDate()}${getCurrentLang() === 'zh' ? '日' : ''}`;
        } else if (formatType === 'year') {
            return `${date.getFullYear()}${getCurrentLang() === 'zh' ? '年' : ''}`;
        } else if (formatType === 'monthShort') {
            return getText('monthsShort')[date.getMonth()];
        }
    }

    getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        d.setDate(d.getDate() - day); // 設置為本週日
        return d;
    }

    // 檢查是否是新的一週，如果是則自動刷新週視圖
    checkNewWeek() {
        const lastVisitStr = localStorage.getItem('lastVisit');
        const today = new Date();
        const currentMonday = new Date(today);
        
        // 計算本週的週一
        const dayOfWeek = today.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 如果是週日，則計算上週的週一
        currentMonday.setDate(today.getDate() + diff);
        currentMonday.setHours(0, 0, 0, 0);
        
        if (lastVisitStr) {
            const lastVisit = new Date(lastVisitStr);
            const lastMonday = new Date(lastVisit);
            const lastDayOfWeek = lastVisit.getDay();
            const lastDiff = lastDayOfWeek === 0 ? -6 : 1 - lastDayOfWeek;
            lastMonday.setDate(lastVisit.getDate() + lastDiff);
            lastMonday.setHours(0, 0, 0, 0);
            
            // 如果上次訪問和現在的週一不同，就自動設置為週視圖
            if (currentMonday.getTime() !== lastMonday.getTime()) {
                this.currentView = 'week';
                this.currentDate = today;
            }
        }
        
        // 更新最後訪問時間
        localStorage.setItem('lastVisit', today.toISOString());
    }

    // 獲取指定年份的所有日期
    getDatesInYear(year) {
        const dates = [];
        year = year || this.viewingYear; // 使用正在瀏覽的年份
        for (let month = 0; month < 12; month++) {
            const datesInMonth = this.getDatesInMonth(year, month);
            dates.push(...datesInMonth);
        }
        return dates;
    }

    // 獲取指定月份的所有日期
    getDatesInMonth(year, month) {
        const dates = [];
        year = year || this.viewingYear; // 使用正在瀏覽的年份
        const date = new Date(year, month, 1);
        
        while (date.getMonth() === month) {
            dates.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        
        return dates;
    }

    getDates() {
        const dates = [];
        
        if (this.currentView === 'week') {
            // 週視圖：從週日開始，顯示一週
            const startDate = this.getStartOfWeek(this.currentDate);
            for (let i = 0; i < 7; i++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);
                dates.push(date);
            }
        } else if (this.currentView === 'month') {
            // 月視圖：顯示當前月份的日期，按每行9個格子排列
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();
            const lastDay = new Date(year, month + 1, 0).getDate();
            
            // 添加所有當月的日期
            for (let i = 1; i <= lastDay; i++) {
                const date = new Date(year, month, i);
                dates.push(date);
            }
        } else if (this.currentView === 'year') {
            // 年視圖：返回一整年的日期
            return this.getDatesInYear(this.currentDate.getFullYear());
        }
        
        return dates;
    }

    getMonthsInYear() {
        const months = [];
        const year = this.currentDate.getFullYear();
        
        for (let month = 0; month < 12; month++) {
            months.push(new Date(year, month, 1));
        }
        
        return months;
    }

    // 計算指定月份習慣的完成比例
    calculateMonthCompletionRate(habitId, year, month) {
        const dates = this.getDatesInMonth(year, month);
        let completedCount = 0;
        
        for (const date of dates) {
            if (this.storage.isHabitCompletedOnDate(habitId, date)) {
                completedCount++;
            }
        }
        
        return {
            total: dates.length,
            completed: completedCount,
            rate: dates.length > 0 ? completedCount / dates.length : 0
        };
    }

    updateViewTitle() {
        const viewTitleElement = document.querySelector('.view-title');
        const year = this.viewingYear; // 使用正在瀏覽的年份
        
        if (this.currentView === 'week') {
            const startDate = this.getStartOfWeek(this.currentDate);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            
            const startMonth = this.formatDate(startDate, 'month');
            const endMonth = this.formatDate(endDate, 'month');
            const startDay = startDate.getDate();
            const endDay = endDate.getDate();
            
            if (startMonth === endMonth) {
                viewTitleElement.textContent = getCurrentLang() === 'zh' 
                    ? `${year}年 ${startMonth} ${startDay}日 - ${endDay}日`
                    : `${startMonth} ${startDay} - ${endDay}, ${year}`;
            } else {
                viewTitleElement.textContent = getCurrentLang() === 'zh'
                    ? `${year}年 ${startMonth} ${startDay}日 - ${endMonth} ${endDay}日` 
                    : `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
            }
        } else if (this.currentView === 'month') {
            const month = this.formatDate(this.currentDate, 'month');
            viewTitleElement.textContent = getCurrentLang() === 'zh' 
                ? `${year}年 ${month}` 
                : `${month} ${year}`;
        } else if (this.currentView === 'year') {
            viewTitleElement.textContent = getCurrentLang() === 'zh' 
                ? `${year}年` 
                : `${year}`;
        }
    }

    showEditForm(habitId) {
        this.editingHabitId = habitId;
        const habit = this.storage.habits[habitId];
        
        // 移除舊的編輯面板（如果存在）
        const oldPanel = document.querySelector('.edit-panel');
        if (oldPanel) {
            oldPanel.remove();
        }
        
        // 創建編輯面板
        const editPanel = document.createElement('div');
        editPanel.className = 'edit-panel';
        
        const formHtml = `
            <div class="edit-form">
                <h2>${getText('editHabit')}</h2>
                <div class="form-group">
                    <label for="editHabitName">${getText('habitName')}</label>
                    <input type="text" id="editHabitName" value="${habit.name}" required>
                </div>
                <div class="form-buttons">
                    <button type="button" class="save-btn">${getText('saveBtn')}</button>
                    <button type="button" class="cancel-btn">${getText('cancelBtn')}</button>
                    <button type="button" class="delete-btn">${getText('deleteBtn')}</button>
                </div>
            </div>
        `;
        
        editPanel.innerHTML = formHtml;
        document.body.appendChild(editPanel);
        
        // 添加事件監聽器
        editPanel.querySelector('.save-btn').addEventListener('click', () => {
            const newName = document.getElementById('editHabitName').value.trim();
            
            if (!newName) {
                alert(getText('habitEmpty'));
                return;
            }
            
            const result = this.storage.updateHabit(habitId, newName);
            if (result === false) {
                alert(getText('habitExists'));
            } else {
                this.closeEditForm();
                this.render();
            }
        });
        
        editPanel.querySelector('.cancel-btn').addEventListener('click', () => {
            this.closeEditForm();
        });
        
        editPanel.querySelector('.delete-btn').addEventListener('click', () => {
            if (confirm(getText('confirmDelete'))) {
                this.storage.removeHabit(habitId);
                this.closeEditForm();
                this.render();
            }
        });
        
        // 聚焦到輸入框
        document.getElementById('editHabitName').focus();
    }

    closeEditForm() {
        const editPanel = document.querySelector('.edit-panel');
        if (editPanel) {
            editPanel.remove();
        }
        this.editingHabitId = null;
    }

    renderYearView(habitGrid, calendarHeader) {
        // 設置年視圖樣式
        calendarHeader.className = 'calendar-header year-view';
        
        // 清空並更新標題
        this.updateViewTitle();
        
        // 清空月份標題
        const headerCells = calendarHeader.querySelectorAll('span');
        headerCells.forEach(cell => {
            cell.textContent = '';
            cell.style.display = 'none';
        });
        
        // 獲取今天的日期
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // 獲取一整年的日期
        const year = this.viewingYear;
        const allDatesInYear = this.getDatesInYear(year);
        
        // 為每個習慣創建對應的行
        for (const [habitId, habit] of Object.entries(this.storage.habits)) {
            const row = document.createElement('div');
            row.className = 'habit-row year-view';
            
            // 習慣名稱和編輯按鈕
            const nameContainer = document.createElement('div');
            nameContainer.className = 'habit-name-container';
            
            const nameText = document.createElement('div');
            nameText.className = 'habit-name-text';
            nameText.textContent = habit.name;
            
            // 添加連續天數指示器
            const currentStreak = this.storage.getCurrentStreak(habitId);
            if (currentStreak > 0) {
                const streakIndicator = document.createElement('div');
                streakIndicator.className = 'streak-indicator';
                streakIndicator.textContent = `🔥 ${currentStreak}`;
                streakIndicator.title = getCurrentLang() === 'zh' 
                    ? `已連續${currentStreak}天` 
                    : `${currentStreak} day streak`;
                nameText.appendChild(streakIndicator);
            }
            
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.textContent = getText('editBtn') || getText('deleteBtn');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showEditForm(habitId);
            });
            
            nameContainer.appendChild(nameText);
            nameContainer.appendChild(editBtn);
            row.appendChild(nameContainer);
            
            // 創建日期格子容器
            const daysGrid = document.createElement('div');
            daysGrid.className = 'year-days-grid';
            
            // 添加日期格子
            allDatesInYear.forEach(date => {
                const cell = document.createElement('div');
                cell.className = 'habit-cell';
                
                // 檢查是否為今天
                if (date.getFullYear() === today.getFullYear() && 
                    date.getMonth() === today.getMonth() && 
                    date.getDate() === today.getDate()) {
                    cell.classList.add('today');
                }
                
                // 設置完成狀態
                const isCompleted = this.storage.isHabitCompletedOnDate(habitId, date);
                cell.classList.add(isCompleted ? 'completed' : 'not-completed');
                
                // 檢查是否為未來日期
                const isFuture = this.isFutureDate(date);
                if (isFuture) {
                    cell.classList.add('future-date');
                } else {
                    // 添加單擊事件（僅過去和當前日期可點擊）
                    cell.addEventListener('click', () => {
                        const streakDays = this.storage.toggleHabitCompletion(habitId, date);
                        if (streakDays) {
                            this.showStreakDialog(streakDays, habitId);
                        }
                        this.render();
                    });
                }
                
                daysGrid.appendChild(cell);
            });
            
            row.appendChild(daysGrid);
            habitGrid.appendChild(row);
        }
    }

    render() {
        const habitGrid = document.getElementById('habitGrid');
        const calendarHeader = document.querySelector('.calendar-header');
        
        // 清空網格內容
        habitGrid.innerHTML = '';
        
        // 根據當前視圖渲染
        if (this.currentView === 'year') {
            this.renderYearView(habitGrid, calendarHeader);
            return;
        }
        
        // 設置視圖類別
        const isMonthView = this.currentView === 'month';
        const isWeekView = this.currentView === 'week';
        calendarHeader.classList.toggle('month-view', isMonthView);
        calendarHeader.classList.toggle('week-view', isWeekView);
        calendarHeader.classList.toggle('year-view', false);
        
        const dates = this.getDates();
        
        // 更新視圖標題
        this.updateViewTitle();
        
        // 設置每行顯示的日期數量
        const datesPerRow = isMonthView ? 15 : 7;
        
        // 獲取今天的日期
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // 為每個習慣創建對應的行
        for (const [habitId, habit] of Object.entries(this.storage.habits)) {
            const row = document.createElement('div');
            row.className = `habit-row${isMonthView ? ' month-view' : ' week-view'}`;
            
            // 習慣名稱和編輯按鈕
            const nameContainer = document.createElement('div');
            nameContainer.className = 'habit-name-container';
            
            const nameText = document.createElement('div');
            nameText.className = 'habit-name-text';
            nameText.textContent = habit.name;
            
            // 添加連續天數指示器
            const currentStreak = this.storage.getCurrentStreak(habitId);
            if (currentStreak > 0) {
                const streakIndicator = document.createElement('div');
                streakIndicator.className = 'streak-indicator';
                streakIndicator.textContent = `🔥 ${currentStreak}`;
                streakIndicator.title = getCurrentLang() === 'zh' 
                    ? `已連續${currentStreak}天` 
                    : `${currentStreak} day streak`;
                nameText.appendChild(streakIndicator);
            }
            
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.textContent = getText('editBtn') || getText('deleteBtn'); // 兼容舊版本
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showEditForm(habitId);
            });
            
            nameContainer.appendChild(nameText);
            nameContainer.appendChild(editBtn);
            row.appendChild(nameContainer);
            
            // 創建日期格子容器
            const cellsContainer = document.createElement('div');
            cellsContainer.className = 'habit-cells-container';
            
            // 添加日期格子
            dates.forEach(date => {
                const cell = document.createElement('div');
                cell.className = 'habit-cell';
                
                // 檢查是否為今天
                if (date.getFullYear() === today.getFullYear() && 
                    date.getMonth() === today.getMonth() && 
                    date.getDate() === today.getDate()) {
                    cell.classList.add('today');
                }
                
                // 添加日期數字
                const dateNumber = document.createElement('div');
                dateNumber.className = 'date-number';
                dateNumber.textContent = date.getDate();
                cell.appendChild(dateNumber);
                
                // 設置完成狀態
                const isCompleted = this.storage.isHabitCompletedOnDate(habitId, date);
                cell.classList.add(isCompleted ? 'completed' : 'not-completed');
                
                // 檢查是否為未來日期
                const isFuture = this.isFutureDate(date);
                if (isFuture) {
                    cell.classList.add('future-date');
                } else {
                    cell.addEventListener('click', () => {
                        const streakDays = this.storage.toggleHabitCompletion(habitId, date);
                        if (streakDays) {
                            this.showStreakDialog(streakDays, habitId);
                        }
                        this.render();
                    });
                }
                
                cellsContainer.appendChild(cell);
            });
            
            row.appendChild(cellsContainer);
            habitGrid.appendChild(row);
        }
    }

    exportAsImage() {
        const calendarContainer = document.querySelector('.calendar-container');
        
        // 創建一個提示
        const exportMsg = document.createElement('div');
        exportMsg.textContent = getText('exporting');
        exportMsg.style.position = 'fixed';
        exportMsg.style.top = '50%';
        exportMsg.style.left = '50%';
        exportMsg.style.transform = 'translate(-50%, -50%)';
        exportMsg.style.padding = '20px';
        exportMsg.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        exportMsg.style.color = 'white';
        exportMsg.style.borderRadius = '8px';
        exportMsg.style.zIndex = '1000';
        document.body.appendChild(exportMsg);
        
        // 使用html2canvas生成圖片
        html2canvas(calendarContainer, {
            backgroundColor: '#222',
            scale: 2 // 增加解析度
        }).then(canvas => {
            // 移除提示
            document.body.removeChild(exportMsg);
            
            // 創建下載鏈接
            const link = document.createElement('a');
            const appTitle = getText('appTitle').replace(/\s+/g, '_');
            link.download = `${appTitle}_${this.formatDateForFilename(new Date())}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(error => {
            console.error('導出失敗:', error);
            document.body.removeChild(exportMsg);
            alert(getText('exportFailed'));
        });
    }
    
    formatDateForFilename(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }

    // 檢查日期是否為未來日期
    isFutureDate(date) {
        const now = new Date();
        return date > now;
    }

    prevWeek() {
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() - 7);
        
        // 檢查年份變更
        if (newDate.getFullYear() !== this.viewingYear) {
            this.viewingYear = newDate.getFullYear();
        }
        
        this.currentDate = newDate;
        this.render();
    }

    nextWeek() {
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() + 7);
        
        // 檢查年份變更
        if (newDate.getFullYear() !== this.viewingYear) {
            this.viewingYear = newDate.getFullYear();
        }
        
        this.currentDate = newDate;
        this.render();
    }

    prevMonth() {
        const newDate = new Date(this.currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        
        // 檢查年份變更
        if (newDate.getFullYear() !== this.viewingYear) {
            this.viewingYear = newDate.getFullYear();
        }
        
        this.currentDate = newDate;
        this.render();
    }

    nextMonth() {
        const newDate = new Date(this.currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        
        // 檢查年份變更
        if (newDate.getFullYear() !== this.viewingYear) {
            this.viewingYear = newDate.getFullYear();
        }
        
        this.currentDate = newDate;
        this.render();
    }

    prevYear() {
        this.viewingYear -= 1;
        this.currentDate = new Date(this.viewingYear, this.currentDate.getMonth(), 1);
        this.render();
    }

    nextYear() {
        this.viewingYear += 1;
        this.currentDate = new Date(this.viewingYear, this.currentDate.getMonth(), 1);
        this.render();
    }
}

// 添加缺少的翻译
// 这些是为了确保即使 lang.js 没有加载，应用程序仍然能够正常运行
if (typeof getText !== 'function') {
    window.getText = function(key) {
        const enTexts = {
            'defaultHabit1': 'Exercise 20 minutes daily',
            'defaultHabit2': 'Drink 1.5L water daily',
            'editBtn': 'Edit',
            'weekdays': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            'months': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            'monthsShort': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            'futureDateNotAllowed': 'Future dates cannot be marked'
        };
        return enTexts[key] || key;
    };
}

if (typeof getCurrentLang !== 'function') {
    window.getCurrentLang = function() {
        return 'en';
    };
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 设置语言按钮状态
    const currentLang = getCurrentLang ? getCurrentLang() : 'en';
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeLangBtn = document.getElementById(`lang${currentLang.charAt(0).toUpperCase() + currentLang.slice(1)}`);
    if (activeLangBtn) {
        activeLangBtn.classList.add('active');
    }
    
    const storage = new HabitStorage();
    const calendarView = new CalendarView(storage);
});