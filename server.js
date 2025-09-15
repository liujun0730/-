const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '.')));

// 数据文件路径
const dataFilePath = path.join(__dirname, 'data', 'courses.json');

// 确保数据目录存在
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// 确保数据文件存在
if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]));
}

// 读取课程数据
function readCourses() {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('读取课程数据失败:', error);
        return [];
    }
}

// 写入课程数据
function writeCourses(courses) {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(courses, null, 2));
        return true;
    } catch (error) {
        console.error('写入课程数据失败:', error);
        return false;
    }
}

// API路由

// 获取所有课程
app.get('/api/courses', (req, res) => {
    const courses = readCourses();
    res.json(courses);
});

// 添加新课程
app.post('/api/courses', (req, res) => {
    const { date, courseName, teacherName } = req.body;
    
    if (!date || !courseName || !teacherName) {
        return res.status(400).json({ error: '所有字段都是必填的' });
    }
    
    const courses = readCourses();
    
    const newCourse = {
        id: Date.now().toString(),
        date,
        courseName,
        teacherName
    };
    
    courses.push(newCourse);
    
    if (writeCourses(courses)) {
        res.status(201).json(newCourse);
    } else {
        res.status(500).json({ error: '保存课程失败' });
    }
});

// 删除课程
app.delete('/api/courses/:id', (req, res) => {
    const { id } = req.params;
    
    let courses = readCourses();
    const initialLength = courses.length;
    
    courses = courses.filter(course => course.id !== id);
    
    if (courses.length === initialLength) {
        return res.status(404).json({ error: '未找到指定课程' });
    }
    
    if (writeCourses(courses)) {
        res.json({ message: '课程删除成功' });
    } else {
        res.status(500).json({ error: '删除课程失败' });
    }
});

// 更新课程
app.put('/api/courses/:id', (req, res) => {
    const { id } = req.params;
    const { date, courseName, teacherName } = req.body;
    
    if (!date || !courseName || !teacherName) {
        return res.status(400).json({ error: '所有字段都是必填的' });
    }
    
    let courses = readCourses();
    const courseIndex = courses.findIndex(course => course.id === id);
    
    if (courseIndex === -1) {
        return res.status(404).json({ error: '未找到指定课程' });
    }
    
    courses[courseIndex] = {
        ...courses[courseIndex],
        date,
        courseName,
        teacherName
    };
    
    if (writeCourses(courses)) {
        res.json(courses[courseIndex]);
    } else {
        res.status(500).json({ error: '更新课程失败' });
    }
});

// 搜索课程
app.get('/api/courses/search', (req, res) => {
    const { type, term } = req.query;
    
    if (!type || !term) {
        return res.status(400).json({ error: '搜索类型和搜索词都是必填的' });
    }
    
    const courses = readCourses();
    
    let results;
    if (type === 'course') {
        results = courses.filter(course => 
            course.courseName.toLowerCase().includes(term.toLowerCase())
        );
    } else if (type === 'teacher') {
        results = courses.filter(course => 
            course.teacherName.toLowerCase().includes(term.toLowerCase())
        );
    } else {
        return res.status(400).json({ error: '无效的搜索类型' });
    }
    
    res.json(results);
});

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});