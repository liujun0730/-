// 全局变量
let courses = [];
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let filteredCourses = null;

// DOM元素
const calendarEl = document.getElementById('calendar');
const monthYearEl = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const courseForm = document.getElementById('course-form');
const dateInput = document.getElementById('date');
const courseNameInput = document.getElementById('course-name');
const teacherNameInput = document.getElementById('teacher-name');
const searchTypeSelect = document.getElementById('search-type');
const searchTermInput = document.getElementById('search-term');
const searchBtn = document.getElementById('search-btn');
const clearSearchBtn = document.getElementById('clear-search-btn');
const modal = document.getElementById('course-details');
const closeModal = document.querySelector('.close');
const courseListEl = document.getElementById('course-list');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadCoursesFromStorage();
    renderCalendar();
    setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    courseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addCourse();
    });

    searchBtn.addEventListener('click', searchCourses);
    clearSearchBtn.addEventListener('click', clearSearch);

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// 从本地存储加载课程数据
function loadCoursesFromStorage() {
    const storedCourses = localStorage.getItem('courses');
    if (storedCourses) {
        courses = JSON.parse(storedCourses);
    }
}

// 保存课程数据到本地存储
function saveCoursesToStorage() {
    localStorage.setItem('courses', JSON.stringify(courses));
}

// 添加新课程
function addCourse() {
    const date = dateInput.value;
    const courseName = courseNameInput.value;
    const teacherName = teacherNameInput.value;

    if (!date || !courseName || !teacherName) {
        alert('请填写所有必填字段！');
        return;
    }

    const newCourse = {
        id: Date.now().toString(),
        date: date,
        courseName: courseName,
        teacherName: teacherName
    };

    courses.push(newCourse);
    saveCoursesToStorage();
    
    // 重置表单
    courseForm.reset();
    
    // 如果添加的课程在当前显示的月份，则更新日历
    const courseDate = new Date(date);
    if (courseDate.getMonth() === currentMonth && courseDate.getFullYear() === currentYear) {
        renderCalendar();
    } else {
        // 如果不在当前月份，跳转到该课程的月份
        currentMonth = courseDate.getMonth();
        currentYear = courseDate.getFullYear();
        renderCalendar();
    }

    alert('课程添加成功！');
}

// 删除课程
function deleteCourse(id) {
    // 从本地数组中移除课程
    courses = courses.filter(course => course.id !== id);
    saveCoursesToStorage();
    renderCalendar();
    
    // 如果当前有打开的模态框，关闭它
    modal.style.display = 'none';
    
    alert('课程删除成功！');
}

// 搜索课程
function searchCourses() {
    const searchType = searchTypeSelect.value;
    const searchTerm = searchTermInput.value.trim().toLowerCase();

    if (!searchTerm) {
        alert('请输入搜索内容！');
        return;
    }

    filteredCourses = courses.filter(course => {
        if (searchType === 'course') {
            return course.courseName.toLowerCase().includes(searchTerm);
        } else {
            return course.teacherName.toLowerCase().includes(searchTerm);
        }
    });

    renderCalendar();
    
    if (filteredCourses.length === 0) {
        alert('未找到匹配的课程');
    }
}

// 清除搜索
function clearSearch() {
    searchTermInput.value = '';
    filteredCourses = null;
    renderCalendar();
}

// 渲染日历
function renderCalendar() {
    // 更新月份和年份显示
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    monthYearEl.textContent = `${currentYear}年${monthNames[currentMonth]}`;

    // 清空日历
    calendarEl.innerHTML = '';

    // 获取当月第一天
    const firstDay = new Date(currentYear, currentMonth, 1);
    
    // 获取当月最后一天
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // 获取当月第一天是星期几（0-6，0表示星期日）
    const firstDayIndex = firstDay.getDay();
    
    // 获取当月天数
    const daysInMonth = lastDay.getDate();
    
    // 获取上个月最后一天
    const prevLastDay = new Date(currentYear, currentMonth, 0);
    const prevDaysInMonth = prevLastDay.getDate();

    // 获取今天的日期信息
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    // 填充上个月的日期
    for (let i = firstDayIndex; i > 0; i--) {
        const dayEl = document.createElement('div');
        dayEl.classList.add('calendar-day', 'other-month');
        
        const dayNumber = document.createElement('div');
        dayNumber.classList.add('day-number');
        dayNumber.textContent = prevDaysInMonth - i + 1;
        
        dayEl.appendChild(dayNumber);
        calendarEl.appendChild(dayEl);
    }

    // 填充当月的日期
    for (let i = 1; i <= daysInMonth; i++) {
        const dayEl = document.createElement('div');
        dayEl.classList.add('calendar-day');
        
        // 检查是否是今天
        if (i === todayDate && currentMonth === todayMonth && currentYear === todayYear) {
            dayEl.classList.add('today');
        }
        
        const dayNumber = document.createElement('div');
        dayNumber.classList.add('day-number');
        dayNumber.textContent = i;
        
        dayEl.appendChild(dayNumber);
        
        // 添加当天的课程
        const currentDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayCourses = (filteredCourses || courses).filter(course => {
            return course.date === currentDateStr;
        });
        
        if (dayCourses.length > 0) {
            dayEl.classList.add('has-courses');
            
            // 最多显示3个课程，超过则显示"更多"
            const displayCourses = dayCourses.slice(0, 3);
            
            displayCourses.forEach(course => {
                const courseItem = document.createElement('div');
                courseItem.classList.add('course-item');
                courseItem.textContent = `${course.courseName} - ${course.teacherName}`;
                courseItem.addEventListener('click', () => showCourseDetails(currentDateStr));
                dayEl.appendChild(courseItem);
            });
            
            if (dayCourses.length > 3) {
                const moreItem = document.createElement('div');
                moreItem.classList.add('course-item');
                moreItem.textContent = `还有${dayCourses.length - 3}个课程...`;
                moreItem.addEventListener('click', () => showCourseDetails(currentDateStr));
                dayEl.appendChild(moreItem);
            }
        }
        
        calendarEl.appendChild(dayEl);
    }

    // 填充下个月的日期
    const totalCells = 42; // 6行7列
    const remainingCells = totalCells - (firstDayIndex + daysInMonth);
    
    for (let i = 1; i <= remainingCells; i++) {
        const dayEl = document.createElement('div');
        dayEl.classList.add('calendar-day', 'other-month');
        
        const dayNumber = document.createElement('div');
        dayNumber.classList.add('day-number');
        dayNumber.textContent = i;
        
        dayEl.appendChild(dayNumber);
        calendarEl.appendChild(dayEl);
    }
}

// 显示课程详情
function showCourseDetails(dateStr) {
    const dayCourses = (filteredCourses || courses).filter(course => course.date === dateStr);
    
    if (dayCourses.length === 0) return;
    
    courseListEl.innerHTML = '';
    
    const dateObj = new Date(dateStr);
    const formattedDate = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
    
    const dateHeader = document.createElement('h3');
    dateHeader.textContent = formattedDate;
    courseListEl.appendChild(dateHeader);
    
    dayCourses.forEach(course => {
        const courseDetail = document.createElement('div');
        courseDetail.classList.add('course-detail');
        
        const courseTitle = document.createElement('h3');
        courseTitle.textContent = course.courseName;
        
        const teacherInfo = document.createElement('p');
        teacherInfo.textContent = `讲师: ${course.teacherName}`;
        
        // 添加删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('btn');
        deleteBtn.textContent = '删除课程';
        deleteBtn.addEventListener('click', () => {
            if (confirm('确定要删除这个课程吗？')) {
                deleteCourse(course.id);
            }
        });
        
        courseDetail.appendChild(courseTitle);
        courseDetail.appendChild(teacherInfo);
        courseDetail.appendChild(deleteBtn);
        courseListEl.appendChild(courseDetail);
    });
    
    modal.style.display = 'block';
}