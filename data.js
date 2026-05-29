// ============ 埋点日志系统 ============
var logBuffer = [];
var LOG_KEY = 'app_track_logs';

function loadLogs() {
    try { logBuffer = JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); } catch(e) { logBuffer = []; }
}
function saveLogs() {
    try { localStorage.setItem(LOG_KEY, JSON.stringify(logBuffer)); } catch(e) {}
}
function trackLog(action, details) {
    var now = new Date();
    var ts = now.getFullYear() + '-' +
        String(now.getMonth()+1).padStart(2,'0') + '-' +
        String(now.getDate()).padStart(2,'0') + ' ' +
        String(now.getHours()).padStart(2,'0') + ':' +
        String(now.getMinutes()).padStart(2,'0') + ':' +
        String(now.getSeconds()).padStart(2,'0') + '.' +
        String(now.getMilliseconds()).padStart(3,'0');
    var entry = { time: ts, action: action, details: details || '' };
    logBuffer.push(entry);
    if (logBuffer.length > 500) logBuffer = logBuffer.slice(-300);
    saveLogs();
    console.log('[TRACK] ' + ts + ' | ' + action + (details ? ' | ' + details : ''));
    // 更新界面日志计数
    var countEl = document.getElementById('logCount');
    if (countEl) countEl.textContent = logBuffer.length;
}

function autoSaveLogFile() {
    var text = logBuffer.map(function(e) { return '[' + e.time + '] ' + e.action + (e.details ? ' | ' + e.details : ''); }).join('\n');
    var blob = new Blob([text], {type:'text/plain'});
    var url = URL.createObjectURL(blob);
    // 尝试使用showSaveFilePicker（需用户授权），降级为自动下载
    var a = document.createElement('a');
    a.href = url;
    a.download = 'log_' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
}
function downloadLogs() {
    var text = logBuffer.map(function(e) { return '[' + e.time + '] ' + e.action + (e.details ? ' | ' + e.details : ''); }).join('\n');
    var blob = new Blob([text], {type:'text/plain'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'log_' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '.txt';
    a.click();
    setTimeout(function() { URL.revokeObjectURL(a.href); }, 1000);
}

function clearCache() {
    if (!confirm('确定要清除所有缓存吗？\n将包括日志、上传历史、设计历史等数据。')) return;
    ['app_track_logs', 'upload_history', 'design_history', 'design_share_history'].forEach(function(k) { localStorage.removeItem(k); });
    logBuffer = [];
    var countEl = document.getElementById('logCount');
    if (countEl) countEl.textContent = '0';
    alert('缓存已清除');
}
loadLogs();
// 初始化日志计数
var countEl = document.getElementById('logCount');
if (countEl) countEl.textContent = logBuffer.length;
trackLog('APP_START', '应用启动，加载历史日志');

// ============ 数据层 ============
const CATEGORY_NAMES = { sofa:'沙发', table:'茶几', bed:'床', cabinet:'电视柜', lamp:'吊灯' };
const furnitureDB = {
    sofa: [
        { id:'s1', name:'经济布艺三人沙发', originalPrice:1580, price:680,  factory:'佛山龙江·XX布艺厂' },
        { id:'s2', name:'北欧科技布沙发',   originalPrice:2280, price:1380, factory:'东莞大岭山·XX家具厂' },
        { id:'s3', name:'意式极简真皮沙发', originalPrice:3880, price:2980, factory:'佛山顺德·XX皮革厂' },
        { id:'s4', name:'头层牛皮转角沙发', originalPrice:6680, price:5800, factory:'佛山南海·XX定制厂' },
    ],
    table: [
        { id:'t1', name:'简约铁艺小茶几',   originalPrice:480,  price:150,  factory:'泉州安溪·XX铁艺厂' },
        { id:'t2', name:'原木风实木边几',   originalPrice:680,  price:380,  factory:'赣州南康·XX实木厂' },
        { id:'t3', name:'黑金岩板茶几',     originalPrice:1080, price:720,  factory:'佛山南海·XX石材厂' },
        { id:'t4', name:'天然大理石茶几',   originalPrice:2580, price:1980, factory:'云浮·XX石材厂' },
    ],
    bed: [
        { id:'b1', name:'简约铁架双人床',   originalPrice:1680, price:880,  factory:'佛山龙江·XX金属厂' },
        { id:'b2', name:'北欧实木双人床',   originalPrice:2580, price:1680, factory:'赣州南康·XX实木厂' },
        { id:'b3', name:'意式轻奢皮床',     originalPrice:4080, price:3200, factory:'佛山顺德·XX软体厂' },
        { id:'b4', name:'高端真皮软包床',   originalPrice:7080, price:6200, factory:'佛山南海·XX定制厂' },
    ],
    cabinet: [
        { id:'c1', name:'简约白色电视柜',   originalPrice:880,  price:420,  factory:'佛山龙江·XX板材厂' },
        { id:'c2', name:'原木风实木电视柜', originalPrice:1580, price:880,  factory:'赣州南康·XX实木厂' },
        { id:'c3', name:'岩板轻奢电视柜',   originalPrice:2480, price:1580, factory:'佛山南海·XX石材厂' },
        { id:'c4', name:'大理石高端电视柜', originalPrice:4280, price:3500, factory:'云浮·XX石材厂' },
    ],
    lamp: [
        { id:'l1', name:'简约吸顶灯',       originalPrice:480,  price:180,  factory:'中山古镇·XX灯饰厂' },
        { id:'l2', name:'北欧分子吊灯',     originalPrice:780,  price:380,  factory:'中山古镇·XX照明厂' },
        { id:'l3', name:'轻奢水晶吊灯',     originalPrice:1680, price:880,  factory:'中山横栏·XX水晶厂' },
        { id:'l4', name:'设计师款吊灯',     originalPrice:2580, price:1880, factory:'中山古镇·XX设计厂' },
    ],
};

// 全局状态
let cart = {};
let currentBBox = 'sofa';
let selectedStyleTag = null;
let drawingMode = false;
let softMode = 'recognize';
let emptyMode = 'style';
let resultSourcePage = 'page-huxing'; // 记录结果页的来源
Object.keys(furnitureDB).forEach(k => cart[k] = null);

// ============ Canvas 涂鸦状态（结果页） ============
let canvas = null, ctx = null, isDrawing = false, penColor = '#ef4444', penSize = 2, drawHistory = [];
let textMode = false;

// ============ 空房图涂鸦状态 ============
let emCanvas = null, emCtx = null, emIsDrawing = false, emPenColor = '#ef4444', emPenSize = 2, emDrawHistory = [];

// ============ 软装涂鸦状态 ============
let softCanvas = null, softCtx = null, softIsDrawing = false, softPenColor = '#ef4444', softPenSize = 5, softDrawHistory = [];

// ============ 结果页 Canvas ============
function initCanvas() {
    canvas = document.getElementById('drawCanvas');
    if (!canvas) return;
    const container = document.getElementById('resultImageContainer');
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    drawHistory = [];
}

function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: cx - rect.left, y: cy - rect.top };
}

function startDraw(e) {
    if (!drawingMode) return;
    e.preventDefault();
    if (textMode) {
        var p = getCanvasPos(e);
        addTextAt(p.x, p.y);
        return;
    }
    isDrawing = true;
    var p = getCanvasPos(e);
    ctx.beginPath(); ctx.moveTo(p.x, p.y);
    ctx.strokeStyle = penColor; ctx.lineWidth = penSize;
    saveState();
}

function toggleTextMode() {
    textMode = !textMode;
    var btn = document.getElementById('btnTextMode');
    if (textMode) {
        btn.classList.add('active');
        canvas.style.cursor = 'text';
        showToast('文字模式：点击图片任意位置添加文案');
    } else {
        btn.classList.remove('active');
        canvas.style.cursor = 'crosshair';
    }
}

function addTextAt(x, y) {
    var text = prompt('请输入要添加的文案：', '');
    if (!text || !text.trim()) return;
    saveState();
    var fontSize = penSize === 2 ? 14 : (penSize === 5 ? 22 : 32);
    ctx.font = 'bold ' + fontSize + 'px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillStyle = penColor;
    ctx.textBaseline = 'top';
    // 文字描边提高可读性
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 3;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    saveState();
    showToast('文案已添加');
}
function draw(e) { if (!isDrawing || !drawingMode) return; e.preventDefault(); const p = getCanvasPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); }
function stopDraw() { if (!isDrawing) return; isDrawing = false; ctx.closePath(); }
function saveState() { if (drawHistory.length > 50) drawHistory.shift(); drawHistory.push(canvas.toDataURL()); }
function undoDraw() { if (drawHistory.length <= 1) { clearCanvas(); return; } drawHistory.pop(); const img = new Image(); img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); }; img.src = drawHistory[drawHistory.length - 1]; }
function clearCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); drawHistory = []; saveState(); showToast('涂鸦已清除'); }
function selectPen(el) { document.querySelectorAll('#drawingToolbar .pen-color').forEach(p => p.classList.remove('active')); el.classList.add('active'); penColor = el.dataset.color; }
function selectPenSize(el) { document.querySelectorAll('#drawingToolbar .pen-size-btn').forEach(b => b.classList.remove('active')); el.classList.add('active'); penSize = parseInt(el.dataset.size); }

function toggleDrawingMode() {
    trackLog('DRAWING_MODE', drawingMode ? '退出涂鸦' : '进入涂鸦');
    drawingMode = !drawingMode;
    const toolbar = document.getElementById('drawingToolbar');
    const inputBar = document.getElementById('inputBar');
    const btnModify = document.getElementById('btnModify');
    const canvasEl = document.getElementById('drawCanvas');
    const btnLayout = document.getElementById('btnLayoutModify');
    if (drawingMode) {
        toolbar.classList.add('show'); inputBar.classList.add('show'); btnModify.classList.add('show');
        canvasEl.style.display = 'block';
        btnLayout.innerHTML = '✏️ 退出涂鸦'; btnLayout.style.borderColor = '#ef4444'; btnLayout.style.color = '#dc2626'; btnLayout.style.background = '#fef2f2';
        document.getElementById('resultImageContainer').style.height = '300px';
        setTimeout(() => { initCanvas(); saveState(); }, 100);
    } else {
        toolbar.classList.remove('show'); inputBar.classList.remove('show'); btnModify.classList.remove('show');
        canvasEl.style.display = 'none';
        btnLayout.innerHTML = '✏️ 布局修改'; btnLayout.style.borderColor = '#f59e0b'; btnLayout.style.color = '#d97706'; btnLayout.style.background = '#fffbeb';
        document.getElementById('resultImageContainer').style.height = 'auto';
        textMode = false;
        var textBtn = document.getElementById('btnTextMode');
        if (textBtn) { textBtn.classList.remove('active'); }
        if (ctx) { ctx.clearRect(0, 0, canvas.width, canvas.height); drawHistory = []; }
    }
}

// ============ 空房图涂鸦 ============
function initEmCanvas() {
    const c = document.getElementById('emptyDoodleCanvas');
    const cv = document.getElementById('emDoodleCanvas');
    const rect = c.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    cv.width = rect.width * dpr; cv.height = rect.height * dpr;
    cv.style.width = rect.width + 'px'; cv.style.height = rect.height + 'px';
    emCtx = cv.getContext('2d'); emCtx.scale(dpr, dpr);
    emCtx.lineCap = 'round'; emCtx.lineJoin = 'round';
    emCtx.fillStyle = '#ffffff'; emCtx.fillRect(0, 0, rect.width, rect.height);
    emDrawHistory = [];
}

function getEmCanvasPos(e) {
    const rect = document.getElementById('emDoodleCanvas').getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: cx - rect.left, y: cy - rect.top };
}

function startEmDraw(e) { e.preventDefault(); emIsDrawing = true; const p = getEmCanvasPos(e); emCtx.beginPath(); emCtx.moveTo(p.x, p.y); emCtx.strokeStyle = emPenColor; emCtx.lineWidth = emPenSize; emSaveState(); }
function emDraw(e) { if (!emIsDrawing) return; e.preventDefault(); const p = getEmCanvasPos(e); emCtx.lineTo(p.x, p.y); emCtx.stroke(); }
function stopEmDraw() { if (!emIsDrawing) return; emIsDrawing = false; emCtx.closePath(); }
function emSaveState() { if (emDrawHistory.length > 50) emDrawHistory.shift(); emDrawHistory.push(document.getElementById('emDoodleCanvas').toDataURL()); }
function undoEmDraw() { if (emDrawHistory.length <= 1) { clearEmCanvas(); return; } emDrawHistory.pop(); const img = new Image(); img.onload = () => { emCtx.clearRect(0, 0, document.getElementById('emDoodleCanvas').width, document.getElementById('emDoodleCanvas').height); emCtx.drawImage(img, 0, 0); }; img.src = emDrawHistory[emDrawHistory.length - 1]; }
function clearEmCanvas() { const cv = document.getElementById('emDoodleCanvas'); emCtx.clearRect(0, 0, cv.width, cv.height); emCtx.fillStyle = '#ffffff'; emCtx.fillRect(0, 0, cv.width / (window.devicePixelRatio || 1), cv.height / (window.devicePixelRatio || 1)); emDrawHistory = []; emSaveState(); }
function selectEmPen(el) { document.querySelectorAll('#emDoodleToolbar .pen-color').forEach(p => p.classList.remove('active')); el.classList.add('active'); emPenColor = el.dataset.color; }
function selectEmPenSize(el) { document.querySelectorAll('#emDoodleToolbar .pen-size-btn').forEach(b => b.classList.remove('active')); el.classList.add('active'); emPenSize = parseInt(el.dataset.size); }

function toggleEmptyDoodle() {
    const panel = document.getElementById('emptyDoodleCanvas');
    const toolbar = document.getElementById('emDoodleToolbar');
    const showing = panel.classList.contains('show');
    if (showing) {
        panel.classList.remove('show'); toolbar.classList.remove('show');
    } else {
        panel.classList.add('show'); toolbar.classList.add('show');
        setTimeout(() => { initEmCanvas(); emSaveState(); }, 100);
    }
    // 绑定事件
    const cv = document.getElementById('emDoodleCanvas');
    cv.onmousedown = startEmDraw; cv.onmousemove = emDraw; cv.onmouseup = stopEmDraw; cv.onmouseleave = stopEmDraw;
    cv.addEventListener('touchstart', startEmDraw, { passive: false });
    cv.addEventListener('touchmove', emDraw, { passive: false });
    cv.addEventListener('touchend', stopEmDraw);
}

// ============ 软装涂鸦 ============
function initSoftCanvas() {
    const box = document.getElementById('softPreviewBox');
    const cv = document.getElementById('softCanvas');
    const rect = box.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    cv.width = rect.width * dpr; cv.height = rect.height * dpr;
    cv.style.width = rect.width + 'px'; cv.style.height = rect.height + 'px';
    softCtx = cv.getContext('2d'); softCtx.scale(dpr, dpr);
    softCtx.lineCap = 'round'; softCtx.lineJoin = 'round';
    softDrawHistory = [];
}

function getSoftCanvasPos(e) {
    const rect = document.getElementById('softCanvas').getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: cx - rect.left, y: cy - rect.top };
}

function startSoftDraw(e) { e.preventDefault(); softIsDrawing = true; const p = getSoftCanvasPos(e); softCtx.beginPath(); softCtx.moveTo(p.x, p.y); softCtx.strokeStyle = softPenColor; softCtx.lineWidth = softPenSize; softSaveState(); }
function softDraw(e) { if (!softIsDrawing) return; e.preventDefault(); const p = getSoftCanvasPos(e); softCtx.lineTo(p.x, p.y); softCtx.stroke(); }
function stopSoftDraw() { if (!softIsDrawing) return; softIsDrawing = false; softCtx.closePath(); }
function softSaveState() { if (softDrawHistory.length > 50) softDrawHistory.shift(); softDrawHistory.push(document.getElementById('softCanvas').toDataURL()); }
function undoSoftDraw() { if (softDrawHistory.length <= 1) { clearSoftCanvas(); return; } softDrawHistory.pop(); const img = new Image(); img.onload = () => { softCtx.clearRect(0, 0, document.getElementById('softCanvas').width, document.getElementById('softCanvas').height); softCtx.drawImage(img, 0, 0); }; img.src = softDrawHistory[softDrawHistory.length - 1]; }
function clearSoftCanvas() { const cv = document.getElementById('softCanvas'); softCtx.clearRect(0, 0, cv.width, cv.height); softDrawHistory = []; softSaveState(); showToast('涂抹已清除'); }
function selectSoftPen(el) { document.querySelectorAll('#softDrawToolbar .pen-color').forEach(p => p.classList.remove('active')); el.classList.add('active'); softPenColor = el.dataset.color; }
function selectSoftPenSize(el) { document.querySelectorAll('#softDrawToolbar .pen-size-btn').forEach(b => b.classList.remove('active')); el.classList.add('active'); softPenSize = parseInt(el.dataset.size); }

// ============ 导航 ============
// 导航历史栈
var navHistory = [];

function navigateTo(pageId) {
    trackLog('NAVIGATE', '跳转页面: ' + pageId);
    var currentPage = document.querySelector('.page.active');
    if (currentPage && currentPage.id !== pageId) {
        // 避免重复入栈同一页面
        if (navHistory.length === 0 || navHistory[navHistory.length-1] !== currentPage.id) {
            navHistory.push(currentPage.id);
        }
    }
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    document.getElementById(pageId).classList.add('active');
    closeUploadSheet();
    updateTabActive(pageId);
}

function goBack() {
    var prevPage = navHistory.pop() || 'page-home';
    trackLog('GO_BACK', '回退到: ' + prevPage);
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    document.getElementById(prevPage).classList.add('active');
    closeUploadSheet();
    updateTabActive(prevPage);
}

function switchTab(tab) {
    var floatBtns = document.getElementById('agentFloatBtns');
    if (tab === 'home') { navigateTo('page-home'); floatBtns.classList.remove('show'); }
    else if (tab === 'agent') { navigateTo('page-huxing-chat'); initHuxingChat(); floatBtns.classList.add('show'); }
    else if (tab === 'mine') { navigateTo('page-vip'); floatBtns.classList.remove('show'); }
}

function updateTabActive(pageId) {
    document.querySelectorAll('.bottom-tab').forEach(function(t) { t.classList.remove('active'); });
    if (pageId === 'page-home') document.getElementById('tabHome').classList.add('active');
    else if (pageId === 'page-huxing-chat') document.getElementById('tabAgent').classList.add('active');
    else if (pageId === 'page-vip' || pageId === 'page-vip-detail') document.getElementById('tabMine').classList.add('active');
    // 非智能体页面隐藏悬浮按钮
    if (pageId !== 'page-huxing-chat') {
        document.getElementById('agentFloatBtns').classList.remove('show');
    }
}

// ============ AI户型设计对话 ============
const hxQuestionPool = [
    { q: '请问居住人口数量？', options: ['单人', '双人', '三人', '四人居住'] },
    { q: '您希望装修的风格是？', options: ['现代简约', '现代轻奢', '奶油风格', '新中式', '北欧风格', '法式风格'] },
    { q: '是否需要修改户型结构？', options: ['是，需要拆改墙体', '否，保持原有结构'] },
    { q: '是否打通厨房与客厅？', options: ['是，做开放式厨房', '否，保持独立厨房'] },
    { q: '您特别关注哪些空间？', options: ['客厅', '主卧室', '厨房', '卫生间', '阳台'] },
    { q: '您对收纳空间的需求？', options: ['基础收纳即可', '需要较多收纳', '需要最大收纳空间'] },
    { q: '您的整体装修预算？', options: ['10万以内', '10-20万', '20-30万', '30万以上'] },
    { q: '是否需要书房/办公区？', options: ['需要独立书房', '需要办公角落即可', '不需要'] },
];

let hxChatState = { questions: [], currentIdx: 0, answers: [], waitingForImage: true };

function shuffleAndPick(arr, count) {
    var shuffled = arr.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
    }
    return shuffled.slice(0, count);
}

function initHuxingChat() {
    trackLog('INIT_CHAT', '初始化AI户型设计对话, 已有图片: ' + (uploadedImageData ? '是' : '否'));
    hxChatState.questions = shuffleAndPick(hxQuestionPool, 5);
    hxChatState.currentIdx = 0;
    hxChatState.answers = [];
    var floatGenBtn = document.getElementById('btnFloatGenerate');
    if (floatGenBtn) floatGenBtn.disabled = true;
    // 始终显示对话容器，隐藏旧的上传遮罩区域
    document.getElementById('chatUploadArea').style.display = 'none';
    document.getElementById('chatContainer').style.display = 'flex';
    if (uploadedImageData) {
        // 已有图片：跳过上传步骤，直接进入对话
        hxChatState.waitingForImage = false;
        var previewImg = document.getElementById('chatPreviewImg');
        if (previewImg) {
            previewImg.src = uploadedImageData;
            previewImg.style.display = 'block';
        }
    } else {
        // 无图片：显示打招呼+上传按钮
        hxChatState.waitingForImage = true;
    }
    renderHxChat();
}

function startChatAfterUpload() {
    document.getElementById('chatUploadArea').style.display = 'none';
    document.getElementById('chatContainer').style.display = 'flex';
    var previewImg = document.getElementById('chatPreviewImg');
    if (uploadedImageData && previewImg) {
        previewImg.src = uploadedImageData;
        previewImg.style.display = 'block';
    }
    renderHxChat();
}

function renderHxChat() {
    var container = document.getElementById('chatContainer');
    var html = '';

    // 初始欢迎消息
    html += '<div class="chat-msg ai"><div class="chat-bubble">您好！我是您的<b>私人AI设计师</b>，请让我帮助您精准设计户型！</div></div>';

    if (hxChatState.waitingForImage) {
        // 等待上传图片：显示提示+内联上传按钮
        html += '<div class="chat-msg ai"><div class="chat-bubble">请先上传您的<b>户型图</b>，我将根据您的户型进行精准设计与风格匹配。</div></div>';
        html += '<div class="chat-msg ai"><button class="chat-upload-inline-btn" onclick="openUploadSheet(\'户型图\')">📷 上传户型图</button></div>';
    } else {
        // 显示已上传的图片预览
        if (uploadedImageData) {
            html += '<div class="chat-msg user"><div class="chat-bubble" style="padding:4px;background:transparent;overflow:hidden;"><img src="' + uploadedImageData + '" style="max-width:200px;border-radius:12px;display:block;" /></div></div>';
        }

        // 渲染已完成的历史Q&A
        for (var i = 0; i < hxChatState.currentIdx; i++) {
            var qItem = hxChatState.questions[i];
            html += '<div class="chat-msg ai"><div class="chat-bubble">' + qItem.q + '</div></div>';
            html += '<div class="chat-msg user"><div class="chat-bubble">' + hxChatState.answers[i] + '</div></div>';
        }

        // 渲染当前问题
        if (hxChatState.currentIdx < hxChatState.questions.length) {
            var curQ = hxChatState.questions[hxChatState.currentIdx];
            html += '<div class="chat-msg ai">';
            html += '<div class="chat-bubble">' + curQ.q + '</div>';
            html += '<div class="chat-options" id="currentOptions">';
            for (var o = 0; o < curQ.options.length; o++) {
                html += '<button class="chat-option-btn" onclick="selectHxOption(\'' + curQ.options[o].replace(/'/g, "\\'") + '\')">' + curQ.options[o] + '</button>';
            }
            html += '</div>';
            html += '</div>';
        } else {
            // 全部回答完成
            html += '<div class="chat-msg ai"><div class="chat-bubble">✅ 需求收集完成！请点击下方<b>「生成设计方案」</b>按钮，AI将根据您的需求定制专属户型方案。</div></div>';
            document.getElementById('btnFloatGenerate').disabled = false;
        }
    }

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
}

function selectHxOption(optionText) {
    hxChatState.answers.push(optionText);
    hxChatState.currentIdx++;
    renderHxChat();
}

function startGeneratingFromChat() {
    // 将用户选择整理为设计需求
    var requirements = [];
    for (var i = 0; i < hxChatState.questions.length; i++) {
        requirements.push(hxChatState.questions[i].q + '：' + hxChatState.answers[i]);
    }
    // 提取风格选择
    var styleAnswer = '';
    for (var j = 0; j < hxChatState.questions.length; j++) {
        if (hxChatState.questions[j].q.indexOf('风格') !== -1) {
            styleAnswer = hxChatState.answers[j];
            break;
        }
    }
    if (styleAnswer.indexOf('现代简约') !== -1) selectedStyleTag = '现代简约';
    else if (styleAnswer.indexOf('现代轻奢') !== -1) selectedStyleTag = '现代轻奢';
    else if (styleAnswer.indexOf('奶油') !== -1) selectedStyleTag = '奶油风格';
    else if (styleAnswer.indexOf('新中式') !== -1) selectedStyleTag = '新中式';
    else if (styleAnswer.indexOf('北欧') !== -1) selectedStyleTag = '北欧风格';
    else if (styleAnswer.indexOf('法式') !== -1) selectedStyleTag = '法式风格';
    else selectedStyleTag = '现代简约';

    currentUploadType = '户型图';
    resultSourcePage = 'page-huxing-chat';
    startGenerating('huxing');
}

function toggleTypeButtons() {
    trackLog('CLICK_UPLOAD_BTN', '点击首页上传按钮');
    const btn = document.getElementById('mainUploadBtn');
    if (btn.classList.contains('uploaded')) return;
    const btns = document.getElementById('typeButtons');
    btns.style.display = btns.style.display === 'none' ? 'flex' : 'none';
}

// ============ 上传面板 ============
let currentUploadType = '';
let uploadedImageData = null;
let homeQuickSource = ''; // 首页快捷按钮来源: empty/soft/cover/agent

// 小区户型图数据库
// 效果图风格图片库
var fgStyleDB = [
    { style:'现代简约', img:'img/fg (1).webp' },
    { style:'现代轻奢', img:'img/fg (2).webp' },
    { style:'奶油风格', img:'img/fg (3).webp' },
    { style:'新中式',   img:'img/fg (4).webp' },
    { style:'北欧风格', img:'img/fg (5).webp' },
    { style:'法式风格', img:'img/fg (6).webp' },
];

const communityDB = [
    { city:'北京', abbr:'BJ', name:'朝阳首府',   img:'img/hx (1).jpeg' },
    { city:'上海', abbr:'SH', name:'浦东花木苑', img:'img/hx (2).jpeg' },
    { city:'广州', abbr:'GZ', name:'珠江帝景苑', img:'img/hx (3).jpeg' },
    { city:'深圳', abbr:'SZ', name:'南山豪庭',   img:'img/hx (4).jpeg' },
    { city:'杭州', abbr:'HZ', name:'武林壹号院', img:'img/hx (5).jpeg' },
    { city:'成都', abbr:'CD', name:'麓湖生态城', img:'img/hx (6).jpeg' },
];

const exampleSets = {
    '户型图': [
        { emoji: '🏠', label: '标准户型', bg: 'linear-gradient(160deg, #667eea 0%, #764ba2 50%, #a78bfa 100%)' },
        { emoji: '🏢', label: '大平层', bg: 'linear-gradient(160deg, #f093fb 0%, #f5576c 50%, #f97316 100%)' },
        { emoji: '🏡', label: '复式别墅', bg: 'linear-gradient(160deg, #4facfe 0%, #00f2fe 50%, #06b6d4 100%)' },
        { emoji: '🏘️', label: '联排户型', bg: 'linear-gradient(160deg, #a8b8d8 0%, #6c8cbf 50%, #c4b5fd 100%)' },
        { emoji: '🌇', label: '公寓户型', bg: 'linear-gradient(160deg, #fda4af 0%, #fb7185 50%, #e11d48 100%)' },
        { emoji: '🏰', label: '洋房户型', bg: 'linear-gradient(160deg, #86efac 0%, #22c55e 50%, #16a34a 100%)' },
    ],
    '空房图': [
        { emoji: '🏗️', label: '毛坯客厅', bg: 'linear-gradient(160deg, #a18cd1 0%, #fbc2eb 50%, #c084fc 100%)' },
        { emoji: '🪜', label: '毛坯卧室', bg: 'linear-gradient(160deg, #ffecd2 0%, #fcb69f 50%, #fb923c 100%)' },
        { emoji: '🧱', label: '毛坯全屋', bg: 'linear-gradient(160deg, #89f7fe 0%, #66a6ff 50%, #3b82f6 100%)' },
        { emoji: '🚪', label: '毛坯厨房', bg: 'linear-gradient(160deg, #d4a574 0%, #b8855a 50%, #a0522d 100%)' },
        { emoji: '🛁', label: '毛坯卫浴', bg: 'linear-gradient(160deg, #bfdbfe 0%, #93c5fd 50%, #60a5fa 100%)' },
        { emoji: '📐', label: '毛坯玄关', bg: 'linear-gradient(160deg, #ddd6fe 0%, #c4b5fd 50%, #a78bfa 100%)' },
    ],
    '效果图': [
        { emoji: '✨', label: '现代简约', bg: 'linear-gradient(160deg, #e0c3fc 0%, #8ec5fc 50%, #60a5fa 100%)' },
        { emoji: '🛋️', label: '现代轻奢', bg: 'linear-gradient(160deg, #fccb90 0%, #d57eeb 50%, #c084fc 100%)' },
        { emoji: '🎨', label: '奶油风格', bg: 'linear-gradient(160deg, #96fbc4 0%, #f9f586 50%, #fbbf24 100%)' },
        { emoji: '🏮', label: '新中式', bg: 'linear-gradient(160deg, #d4a574 0%, #c68b5e 50%, #b87333 100%)' },
        { emoji: '🪵', label: '北欧风格', bg: 'linear-gradient(160deg, #e8d5b7 0%, #d4c4a8 50%, #c9b99a 100%)' },
        { emoji: '🥐', label: '法式风格', bg: 'linear-gradient(160deg, #fce4ec 0%, #f8bbd0 50%, #f48fb1 100%)' },
    ],
};

function openUploadSheet(type) {
    trackLog('OPEN_SHEET', '类型: ' + type);
    document.getElementById('typeButtons').style.display = 'none';
    currentUploadType = type;
    uploadedImageData = null;

    var isHuxing = (type === '户型图');
    var isEmpty = (type === '空房图');
    var isEffect = (type === '效果图');

    document.getElementById('sheetTitle').textContent = isHuxing ? '户型图' : (isEffect ? '上传效果图' : (type === '软装换搭' ? '上传图片，AI识别家具' : ('上传' + type)));

    // 户型图Tab切换
    var tabBar = document.getElementById('hxSheetTabs');
    var searchContent = document.getElementById('hxSheetSearchContent');
    var uploadContent = document.getElementById('hxSheetUploadContent');
    var otherActions = document.getElementById('uploadActions');
    var otherNext = document.getElementById('btnUploadNextOther');
    var hxNext = document.getElementById('btnUploadNext');

    if (isHuxing) {
        tabBar.style.display = 'flex';
        searchContent.classList.add('show');
        uploadContent.classList.remove('show');
        otherActions.style.display = 'none';
        otherNext.style.display = 'none';
        hxNext.style.display = 'none';
        // 默认搜户型tab激活
        document.getElementById('hxTabSearch').classList.add('active');
        document.getElementById('hxTabUpload').classList.remove('active');
        // 初始化搜索
        document.getElementById('hxSearchBar').style.display = 'flex';
        renderCommunityGrid(communityDB);
        document.getElementById('hxCommunityGrid').classList.add('show');
        document.getElementById('efStyleSelectGrid').style.display = 'none';
        document.getElementById('exampleRow1').style.display = 'none';
        document.getElementById('exampleRow2').style.display = 'none';
    } else {
        tabBar.style.display = 'none';
        searchContent.classList.remove('show');
        uploadContent.classList.remove('show');
        hxNext.style.display = 'none';
        // 其他类型显示独立的上传操作
        otherActions.style.display = 'flex';
        otherNext.style.display = 'none';
        document.getElementById('hxSearchBar').style.display = 'none';
        document.getElementById('hxCommunityGrid').classList.remove('show');
    }

    // 效果图/空房图/软装：不显示风格网格，直接上传
    var styleGrid = document.getElementById('efStyleSelectGrid');
    styleGrid.style.display = 'none';
    document.getElementById('exampleRow1').style.display = 'none';
    document.getElementById('exampleRow2').style.display = 'none';

    document.getElementById('cameraPreviewBar').classList.remove('show');
    document.getElementById('historyView').classList.remove('show');
    var overlay = document.getElementById('uploadSheetOverlay');
    overlay.style.display = 'block';
    overlay.offsetHeight;
    overlay.classList.add('show');
}

var hxSheetCurrentTab = 'search';

function switchHxSheetTab(tab) {
    hxSheetCurrentTab = tab;
    document.getElementById('hxTabSearch').classList.toggle('active', tab === 'search');
    document.getElementById('hxTabUpload').classList.toggle('active', tab === 'upload');
    document.getElementById('hxSheetSearchContent').classList.toggle('show', tab === 'search');
    document.getElementById('hxSheetUploadContent').classList.toggle('show', tab === 'upload');
    // 切换时更新下一步按钮显示
    var hxNext = document.getElementById('btnUploadNext');
    if (tab === 'upload' && uploadedImageData) {
        hxNext.style.display = 'block';
    } else if (tab === 'search') {
        hxNext.style.display = uploadedImageData ? 'block' : 'none';
    }
    // 隐藏历史记录视图，回到上传主界面
    document.getElementById('historyView').classList.remove('show');
}

function getNextBtn() {
    return currentUploadType === '户型图' ? document.getElementById('btnUploadNext') : document.getElementById('btnUploadNextOther');
}

function renderCommunityGrid(list) {
    var grid = document.getElementById('hxCommunityGrid');
    grid.innerHTML = list.map(function(item) {
        return '<div class="hx-community-card" onclick="useCommunityItem(\'' + item.name + '\', \'' + item.city + '\', \'' + item.img + '\')"><div class="comm-header"><span class="comm-city">' + item.city + '</span><span class="comm-abbr">' + item.abbr + '</span></div><div class="comm-img"><img src="' + item.img + '" style="width:100%;height:100%;object-fit:cover;" /></div><div class="comm-name">' + item.name + '</div></div>';
    }).join('');
    grid.classList.add('show');
}

function searchCommunity() {
    var keyword = document.getElementById('hxSearchInput').value.trim();
    var filtered = communityDB.filter(function(item) {
        if (!keyword) return true;
        return item.city.indexOf(keyword) !== -1 || item.name.indexOf(keyword) !== -1 || item.abbr.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
    });
    renderCommunityGrid(filtered);
}

function selectEffectStyleFromSheet(styleName) {
    selectedStyleTag = styleName;
    currentUploadType = '效果图';
    // 高亮选中的卡片，移除其他高亮
    var cards = document.querySelectorAll('#efStyleSelectGrid .ef-scroll-card');
    cards.forEach(function(c) { c.style.borderColor = '#e2e8f0'; c.style.boxShadow = 'none'; });
    cards.forEach(function(c) {
        if (c.querySelector('.ef-card-label').textContent === styleName) {
            c.style.borderColor = '#2563eb';
            c.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.15)';
        }
    });
    document.getElementById('sheetTitle').textContent = '已选「' + styleName + '」— 请上传效果图';
    showToast('已选择「' + styleName + '」，请拍照或从相册上传效果图');
}

function useCommunityItem(name, city, imgSrc) {
    currentUploadType = '户型图';
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
        var cv = document.createElement('canvas');
        cv.width = img.naturalWidth || 400;
        cv.height = img.naturalHeight || 400;
        var c = cv.getContext('2d');
        c.drawImage(img, 0, 0, cv.width, cv.height);
        // 叠加城市和小区名称
        c.font = 'bold 28px "PingFang SC","Microsoft YaHei",sans-serif';
        c.fillStyle = 'rgba(255,255,255,0.9)';
        c.textAlign = 'center';
        c.fillText(city + ' · ' + name, cv.width / 2, cv.height - 30);
        uploadedImageData = cv.toDataURL('image/png');
        saveToHistory();
        showOnHomeButton();
        getNextBtn().style.display = 'block';
    };
    img.onerror = function() {
        var cv = document.createElement('canvas'); cv.width = 400; cv.height = 400;
        var c = cv.getContext('2d');
        c.fillStyle = '#667eea'; c.fillRect(0, 0, 400, 400);
        c.font = 'bold 32px "PingFang SC","Microsoft YaHei",sans-serif'; c.fillStyle = '#fff';
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(name, 200, 200);
        c.fillText(city, 200, 250);
        uploadedImageData = cv.toDataURL('image/png');
        saveToHistory();
        showOnHomeButton();
        getNextBtn().style.display = 'block';
    };
    img.src = imgSrc;
}

function closeUploadSheet() {
    const overlay = document.getElementById('uploadSheetOverlay');
    if (!overlay.classList.contains('show')) return;
    overlay.classList.remove('show');
    clearTimeout(overlay._hideTimer);
    overlay._hideTimer = setTimeout(() => { overlay.style.display = 'none'; }, 360);
}

function useExample(el, type) {
    currentUploadType = type;
    const cv = document.createElement('canvas'); cv.width = 400; cv.height = 400;
    const c = cv.getContext('2d');
    c.fillStyle = '#f0f0f0'; c.fillRect(0, 0, 400, 400);
    const emoji = el.querySelector('.example-emoji');
    c.font = '120px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(emoji ? emoji.textContent : '🏠', 200, 180);
    const label = el.querySelector('.example-label');
    c.font = 'bold 28px -apple-system, sans-serif';
    c.fillText(label ? label.textContent : '', 200, 270);
    uploadedImageData = cv.toDataURL('image/png');
    saveToHistory();
    closeUploadSheet();
    showOnHomeButton();
}

function showOnHomeButton() {
    // 如果是首页快捷按钮上传，只更新对应按钮
    if (homeQuickSource) {
        var map = { empty: 'Empty', soft: 'Soft', cover: 'Cover', agent: 'Agent' };
        var suffix = map[homeQuickSource] || '';
        var qBtn = document.getElementById('quickBtn' + suffix);
        var qImg = document.getElementById('quickImg' + suffix);
        if (qBtn && qImg && uploadedImageData) {
            qImg.src = uploadedImageData;
            qImg.style.display = 'block';
            qBtn.classList.add('uploaded');
            qBtn.querySelector('.retake-badge').style.display = 'flex';
            qBtn.onclick = goNextAfterUpload;
        }
        // 同步智能体页面
        syncChatIfWaiting();
        return;
    }

    // 首页主按钮
    var btn = document.getElementById('mainUploadBtn');
    var img = document.getElementById('homePreviewImg');
    if (img) { img.src = uploadedImageData; img.style.display = 'block'; }
    if (btn) { btn.classList.add('uploaded'); btn.onclick = goNextAfterUpload; }
    var typeBtns = document.getElementById('typeButtons');
    if (typeBtns) typeBtns.style.display = 'none';
    // 装修报价页上传按钮
    var qfBtn = document.getElementById('quoteFormUploadBtn');
    var qfImg = document.getElementById('quoteFormPreviewImg');
    if (qfBtn && qfImg && uploadedImageData) {
        qfImg.src = uploadedImageData;
        qfImg.style.display = 'block';
        qfBtn.classList.add('uploaded');
        qfBtn.onclick = function(e) { openUploadSheet('户型图'); };
    }
    // 同步智能体页面：仅当chat页面active且等待图片时，才自动关闭弹窗
    syncChatIfWaiting();
}

function syncChatIfWaiting() {
    var chatPageActive = document.getElementById('page-huxing-chat').classList.contains('active');
    if (uploadedImageData && hxChatState.waitingForImage && chatPageActive) {
        closeUploadSheet();
        hxChatState.waitingForImage = false;
        var previewImg = document.getElementById('chatPreviewImg');
        if (previewImg) {
            previewImg.src = uploadedImageData;
            previewImg.style.display = 'block';
        }
        renderHxChat();
    }
}

function resetQuickBtn(source) {
    homeQuickSource = '';
    uploadedImageData = null; currentUploadType = '';
    var map = { empty: 'Empty', soft: 'Soft', cover: 'Cover', agent: 'Agent' };
    var suffix = map[source] || '';
    var qBtn = document.getElementById('quickBtn' + suffix);
    var qImg = document.getElementById('quickImg' + suffix);
    if (qBtn) {
        qBtn.classList.remove('uploaded');
        qBtn.querySelector('.retake-badge').style.display = 'none';
        qBtn.onclick = function() { homeQuickSource = source; openUploadSheet(getSourceType(source)); };
    }
    if (qImg) { qImg.src = ''; qImg.style.display = 'none'; }
}
function getSourceType(source) {
    var typeMap = { empty: '空房图', soft: '软装换搭', cover: '效果图', agent: '户型图' };
    return typeMap[source] || '户型图';
}

function resetQuoteFormUpload(e) {
    e.stopPropagation();
    uploadedImageData = null; currentUploadType = '';
    var btn = document.getElementById('quoteFormUploadBtn');
    var img = document.getElementById('quoteFormPreviewImg');
    if (btn) { btn.classList.remove('uploaded'); btn.onclick = function() { openUploadSheet('户型图'); }; }
    if (img) { img.src = ''; img.style.display = 'none'; }
}

function triggerFilePicker() { document.getElementById('hiddenFileInput').click(); }
function triggerCamera() { document.getElementById('hiddenCameraInput').click(); }

function handleFileSelect(event) {
    var file = event.target.files[0];
    if (!file) return;
    trackLog('FILE_SELECT', '选择文件: ' + file.name + ' (' + (file.size/1024).toFixed(1) + 'KB) type=' + file.type);
    if (file.size > 4 * 1024 * 1024) {
        trackLog('FILE_TOO_LARGE', '文件超4MB');
        showToast('图片过大(' + (file.size/1024/1024).toFixed(1) + 'MB)，请使用小于4MB的图片');
        event.target.value = '';
        return;
    }
    var reader = new FileReader();
    var fileName = file.name;
    reader.addEventListener('load', function(e) {
        uploadedImageData = e.target.result;
        saveToHistory();
        showOnHomeButton();
        var bar = document.getElementById('cameraPreviewBar');
        if (bar) {
            document.getElementById('cameraPreviewImg').src = e.target.result;
            document.getElementById('cameraPreviewInfo').textContent = fileName || '已选择照片';
            bar.classList.add('show');
        }
        getNextBtn().style.display = 'block';
        trackLog('FILE_LOADED', '文件加载成功: ' + fileName + ' dataLen=' + (uploadedImageData ? uploadedImageData.length : 0));
    });
    reader.addEventListener('error', function(e) {
        trackLog('FILE_ERROR', '文件读取失败: ' + fileName + ' err=' + JSON.stringify(reader.error));
        showToast('图片读取失败，请尝试其他图片');
    });
    reader.addEventListener('abort', function() {
        trackLog('FILE_ABORT', '文件读取中止: ' + fileName);
    });
    try {
        reader.readAsDataURL(file);
    } catch(ex) {
        trackLog('FILE_EXCEPTION', '读取异常: ' + fileName + ' ex=' + ex.message);
        showToast('图片格式不支持，请换一张图片');
    }
    event.target.value = '';
}

function clearCameraPreview(e) {
    e.stopPropagation();
    document.getElementById('cameraPreviewBar').classList.remove('show');
    getNextBtn().style.display = 'none';
    uploadedImageData = null;
}

function confirmCameraUpload() {
    if (!uploadedImageData) return;
    saveToHistory();
    showOnHomeButton();
    getNextBtn().style.display = 'block';
}

function resetHomeUpload(e) {
    e.stopPropagation();
    uploadedImageData = null; currentUploadType = ''; homeQuickSource = '';
    // 首页按钮
    var btn = document.getElementById('mainUploadBtn');
    var img = document.getElementById('homePreviewImg');
    if (img) { img.src = ''; img.style.display = 'none'; }
    if (btn) { btn.classList.remove('uploaded'); btn.onclick = toggleTypeButtons; }
    var nextBtn = document.getElementById('btnHomeNext');
    if (nextBtn) nextBtn.classList.remove('show');
    // 智能体页面：重置后回到等待上传状态
    var chatArea = document.getElementById('chatUploadArea');
    var chatContainer = document.getElementById('chatContainer');
    if (chatArea) { chatArea.style.display = 'none'; }
    if (chatContainer) { chatContainer.style.display = 'flex'; }
    hxChatState.waitingForImage = true;
    renderHxChat();
    var floatGenBtn = document.getElementById('btnFloatGenerate');
    if (floatGenBtn) floatGenBtn.disabled = true;
}

function goNextAfterUpload() {
    switch (currentUploadType) {
        case '户型图':
            navigateTo('page-huxing-chat');
            initHuxingChat();
            break;
        case '效果图':
            navigateTo('page-effect');
            updateEfPreview();
            break;
        case '空房图':
            navigateTo('page-empty');
            updateEmPreview();
            break;
        case '软装换搭':
            navigateTo('page-soft');
            setSoftPreviewImage();
            startAiRecognition();
            break;
        default:
            navigateTo('page-huxing');
    }
}

function updateHxPreview() {
    const preview = document.getElementById('hxPreview');
    if (uploadedImageData) {
        preview.innerHTML = '<img src="' + uploadedImageData + '" /><div class="preview-hint">已上传的户型图预览</div>';
    }
}
function updateEfPreview() {
    const preview = document.getElementById('efPreview');
    if (uploadedImageData) {
        preview.innerHTML = '<img src="' + uploadedImageData + '" /><div class="preview-hint">已上传的效果图预览</div>';
    }
}
function updateEmPreview() {
    const preview = document.getElementById('emPreview');
    if (uploadedImageData) {
        preview.innerHTML = '<img src="' + uploadedImageData + '" /><div class="preview-hint">已上传的空房图预览</div>';
    }
}

// ============ 上传历史 ============
function getHistory() { try { return JSON.parse(localStorage.getItem('upload_history') || '[]'); } catch (e) { return []; } }

function createThumbnail(dataUrl, maxWidth) {
    return new Promise(function (resolve) {
        var img = new Image();
        img.onload = function () {
            var w = img.width, h = img.height;
            if (w <= maxWidth) { resolve(dataUrl); return; }
            var ratio = maxWidth / w;
            var cv = document.createElement('canvas');
            cv.width = maxWidth; cv.height = Math.round(h * ratio);
            var ctx = cv.getContext('2d');
            ctx.drawImage(img, 0, 0, cv.width, cv.height);
            resolve(cv.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = function () { resolve(dataUrl); };
        img.src = dataUrl;
    });
}

function saveToHistory() {
    if (!uploadedImageData) return;
    createThumbnail(uploadedImageData, 200).then(function (thumb) {
        var history = getHistory();
        history.unshift({ type: currentUploadType, dataUrl: thumb, date: new Date().toLocaleString('zh-CN') });
        if (history.length > 20) history.length = 20;
        try { localStorage.setItem('upload_history', JSON.stringify(history)); } catch (e) { /* quota exceeded, silently drop */ }
    });
}

// 3D效果图历史记录
function getDesignHistory() { try { return JSON.parse(localStorage.getItem('design_history') || '[]'); } catch (e) { return []; } }

function saveDesignToHistory() {
    var style = selectedStyleTag || '现代简约';
    var imgData = uploadedImageData;
    // 如果没有上传图片，截取结果页作为缩略图
    if (!imgData) {
        var container = document.getElementById('resultPlaceholder');
        if (container) {
            // 用canvas绘制颜色+文字作为记录
            var cv = document.createElement('canvas'); cv.width = 400; cv.height = 300;
            var c = cv.getContext('2d');
            c.fillStyle = '#f0f4ff'; c.fillRect(0, 0, 400, 300);
            c.font = 'bold 36px "PingFang SC","Microsoft YaHei",sans-serif';
            c.fillStyle = '#2563eb'; c.textAlign = 'center'; c.textBaseline = 'middle';
            c.fillText('🏗️ 3D效果图', 200, 120);
            c.fillText(style, 200, 180);
            imgData = cv.toDataURL('image/png');
        }
    }
    var history = getDesignHistory();
    createThumbnail(imgData, 200).then(function (thumb) {
        history.unshift({ style: style, dataUrl: thumb, date: new Date().toLocaleString('zh-CN') });
        if (history.length > 20) history.length = 20;
        try { localStorage.setItem('design_history', JSON.stringify(history)); } catch (e) { /* quota exceeded, silently drop */ }
    });
}

function showHistory() {
    const history = getHistory();
    const view = document.getElementById('historyView');
    const empty = document.getElementById('historyEmpty');
    const list = document.getElementById('historyList');
    document.getElementById('exampleRow1').style.display = 'none';
    document.getElementById('exampleRow2').style.display = 'none';
    document.getElementById('hxSearchBar').style.display = 'none';
    document.getElementById('hxCommunityGrid').classList.remove('show');
    document.getElementById('efStyleSelectGrid').style.display = 'none';
    document.getElementById('uploadActions').style.display = 'none';
    document.getElementById('hxSheetSearchContent').classList.remove('show');
    document.getElementById('hxSheetUploadContent').classList.remove('show');
    getNextBtn().style.display = 'none';
    document.getElementById('btnUploadNextOther').style.display = 'none';
    document.getElementById('cameraPreviewBar').classList.remove('show');
    view.classList.add('show');
    if (history.length === 0) {
        empty.style.display = 'block'; list.innerHTML = '';
    } else {
        empty.style.display = 'none';
        list.innerHTML = history.map((item, i) => `
            <div class="history-item" onclick="useHistoryItem(${i})">
                <img class="thumb" src="${item.dataUrl}" />
                <div class="info"><div class="htype">${item.type}</div><div class="hdate">${item.date}</div></div>
                <button class="del-btn" onclick="deleteHistoryItem(event, ${i})">✕</button>
            </div>`).join('');
    }
}

function showUploadMain() {
    document.getElementById('historyView').classList.remove('show');
    var type = currentUploadType;
    var isHuxing = (type === '户型图');
    document.getElementById('exampleRow1').style.display = 'none';
    document.getElementById('exampleRow2').style.display = 'none';
    if (isHuxing) {
        // 恢复户型图tab结构
        document.getElementById('hxSheetTabs').style.display = 'flex';
        document.getElementById('hxSearchBar').style.display = 'flex';
        document.getElementById('hxCommunityGrid').classList.add('show');
        document.getElementById('uploadActions').style.display = 'none';
        document.getElementById('btnUploadNextOther').style.display = 'none';
        document.getElementById('hxSheetSearchContent').classList.toggle('show', hxSheetCurrentTab === 'search');
        document.getElementById('hxSheetUploadContent').classList.toggle('show', hxSheetCurrentTab === 'upload');
        if (uploadedImageData) {
            getNextBtn().style.display = 'block';
        }
    } else {
        document.getElementById('hxSheetTabs').style.display = 'none';
        document.getElementById('hxSheetSearchContent').classList.remove('show');
        document.getElementById('hxSheetUploadContent').classList.remove('show');
        document.getElementById('hxSearchBar').style.display = 'none';
        document.getElementById('hxCommunityGrid').classList.remove('show');
        document.getElementById('uploadActions').style.display = 'flex';
        document.getElementById('efStyleSelectGrid').style.display = (type === '效果图') ? 'grid' : 'none';
        if (uploadedImageData) {
            document.getElementById('cameraPreviewBar').classList.add('show');
            getNextBtn().style.display = 'block';
        }
    }
}

function useHistoryItem(index) {
    const history = getHistory(); const item = history[index];
    if (!item) return;
    uploadedImageData = item.dataUrl; currentUploadType = item.type;
    closeUploadSheet(); showOnHomeButton();
}
function deleteHistoryItem(event, index) {
    event.stopPropagation();
    const history = getHistory(); history.splice(index, 1);
    try { localStorage.setItem('upload_history', JSON.stringify(history)); } catch (e) { /* ignore */ }
    showHistory();
}

// ============ 户型图页 风格选择 ============
function selectHxStyle(el, styleName) {
    document.querySelectorAll('#hxStyleGrid .style-tag').forEach(t => t.classList.remove('selected'));
    el.classList.add('selected');
    selectedStyleTag = styleName;
    document.getElementById('hxNextBtn').disabled = false;
}

// ============ 效果图页 ============
function openEffectStylePanel() {
    const panel = document.getElementById('effectStylePanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}
function selectEfStyle(el, styleName) {
    document.querySelectorAll('#efStyleGrid .style-tag').forEach(t => t.classList.remove('selected'));
    el.classList.add('selected');
    selectedStyleTag = styleName;
}
function toggleEffectCustom() {
    const input = document.getElementById('efCustomInput');
    input.style.display = input.style.display === 'none' ? 'flex' : 'none';
}
let efRecording = false;
function toggleEfVoice() {
    const btn = event.target.closest('.voice-btn') || document.querySelector('#efCustomInput .voice-btn');
    efRecording = !efRecording;
    if (efRecording) {
        btn.classList.add('recording'); btn.textContent = '⏹';
        setTimeout(() => {
            if (efRecording) {
                document.getElementById('efCustomText').value = '把效果图风格替换为奶油风';
                btn.classList.remove('recording'); btn.textContent = '🎤'; efRecording = false;
                showToast('语音识别完成');
            }
        }, 2000);
    } else {
        btn.classList.remove('recording'); btn.textContent = '🎤';
    }
}
function goToSoftFromEffect() { resultSourcePage = 'page-effect'; navigateTo('page-soft'); setSoftPreviewImage(); startAiRecognition(); }

// ============ 空房图页 ============
function switchEmptyMode(mode) {
    emptyMode = mode;
    document.getElementById('btnEmptyStyle').classList.toggle('selected', mode === 'style');
    document.getElementById('btnEmptyCustom').classList.toggle('selected', mode === 'custom');
    document.getElementById('emptyStyleGrid').style.display = mode === 'style' ? 'block' : 'none';
    document.getElementById('emptyCustomOptions').classList.toggle('show', mode === 'custom');
}
function selectEmStyle(el, styleName) {
    document.querySelectorAll('#emptyStyleGrid .style-tag').forEach(t => t.classList.remove('selected'));
    el.classList.add('selected');
    selectedStyleTag = styleName;
}
function toggleEmptyDialog() {
    const input = document.getElementById('emptyDialogInput');
    input.style.display = input.style.display === 'none' ? 'flex' : 'none';
}
let emRecording = false;
function toggleEmVoice() {
    const btn = document.querySelector('#emptyDialogInput .voice-btn');
    emRecording = !emRecording;
    if (emRecording) {
        btn.classList.add('recording'); btn.textContent = '⏹';
        setTimeout(() => {
            if (emRecording) {
                document.getElementById('emptyDialogText').value = '现代简约风格，白色墙面，浅色木地板';
                btn.classList.remove('recording'); btn.textContent = '🎤'; emRecording = false;
                showToast('语音识别完成');
            }
        }, 2000);
    } else { btn.classList.remove('recording'); btn.textContent = '🎤'; }
}

// ============ 方案生成 ============
function startGenerating(type) {
    trackLog('START_GENERATE', '生成类型: ' + type + ', 风格: ' + (selectedStyleTag||'未选'));
    if (type === 'huxing' && !selectedStyleTag) return showToast('请先选择一个风格');
    if (type === 'effect_style' && !selectedStyleTag) return showToast('请先选择一个风格');
    if (type === 'empty' && emptyMode === 'style' && !selectedStyleTag) return showToast('请先选择一个风格');

    // 追踪来源页面，用于结果页按钮切换
    // 注意：不要覆盖智能体对话设置的 page-huxing-chat
    if (type === 'huxing' && resultSourcePage !== 'page-huxing-chat') resultSourcePage = 'page-huxing';
    else if (type === 'effect_style') resultSourcePage = 'page-effect';
    else if (type === 'empty') resultSourcePage = 'page-empty';

    const overlay = document.getElementById('generatingOverlay');
    const genText = document.getElementById('genText');
    const genSub = document.getElementById('genSub');
    const progressBar = document.getElementById('genProgressBar');
    overlay.classList.add('show'); progressBar.style.width = '0%';

    if (type === 'huxing') {
        genText.textContent = '方案生成中...';
        genSub.textContent = 'AI正在融合「' + selectedStyleTag + '」风格设计空间';
    } else if (type === 'modify') {
        const inputVal = document.getElementById('modifyInput').value.trim();
        genText.textContent = '方案生成中...';
        genSub.textContent = inputVal ? '正在执行：' + inputVal : '正在根据涂鸦标记重新生成方案';
    } else if (type === '3d') {
        genText.textContent = '3D效果图生成中...'; genSub.textContent = '正在构建三维空间模型，请稍候';
    } else if (type === 'effect_style') {
        genText.textContent = '风格替换生成中...'; genSub.textContent = 'AI正在替换为「' + selectedStyleTag + '」风格';
    } else if (type === 'empty') {
        genText.textContent = '方案生成中...'; genSub.textContent = 'AI正在根据您的设定生成空间方案';
    } else if (type === 'soft_generate') {
        genText.textContent = '正在生成中...'; genSub.textContent = 'AI正在根据您的选择进行软装替换';
    }

    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 25 + 5;
        if (progress >= 90) { progress = 90; clearInterval(progressInterval); }
        progressBar.style.width = progress + '%';
    }, 400);

    setTimeout(() => {
        clearInterval(progressInterval); progressBar.style.width = '100%';
        setTimeout(() => {
            overlay.classList.remove('show'); progressBar.style.width = '0%';
            if (type === '3d') {
                saveDesignToHistory();
                showToast('3D效果图已生成，请在结果页查看');
            } else if (type === 'soft_generate') {
                showToast('软装替换已完成');
            } else {
                updateResultPage(type);
                navigateTo('page-result');
            }
        }, 400);
    }, 2000 + Math.random() * 1000);
}

function updateResultPage(type) {
    const styleEmojiMap = {
        '现代简约':'🪑', '现代轻奢':'✨', '奶油风格':'🍰', '宋式美学':'🏯', '意式轻奢':'🛋️',
        '新中式':'🏮', '北欧风格':'🪵', '法式风格':'🥐', '中古风格':'📻'
    };
    const style = selectedStyleTag || '现代简约';
    const emoji = styleEmojiMap[style] || '🖼️';
    const bgMap = {
        '现代简约':'linear-gradient(160deg, #f8f9fa 0%, #e9ecef 25%, #dee2e6 50%, #f1f3f5 100%)',
        '现代轻奢':'linear-gradient(160deg, #3d3d3d 0%, #2a2a2a 25%, #363636 50%, #2f2f2f 100%)',
        '奶油风格':'linear-gradient(160deg, #fefaf3 0%, #fdf6ea 30%, #fef9f2 55%, #faf3e6 100%)',
        '宋式美学':'linear-gradient(160deg, #f5f0e8 0%, #e8dcc8 30%, #faf7f0 55%, #ede0cc 100%)',
        '意式轻奢':'linear-gradient(160deg, #383838 0%, #2c2c2c 40%, #404040 70%, #323232 100%)',
        '新中式':'linear-gradient(160deg, #f8f3ec 0%, #ede0cc 25%, #faf6f0 55%, #f2e8d8 100%)',
        '北欧风格':'linear-gradient(160deg, #faf3ed 0%, #f0e6da 30%, #fdf8f4 55%, #f5ebe0 100%)',
        '法式风格':'linear-gradient(160deg, #fdf8f5 0%, #f5e8dc 30%, #fefaf7 55%, #faf0e6 100%)',
        '中古风格':'linear-gradient(160deg, #f5f0e6 0%, #e6d5b8 30%, #faf5ec 55%, #ede0c8 100%)',
    };
    // 显示上传的图片作为背景，风格渐变作为降级
    if (uploadedImageData) {
        document.getElementById('resultPlaceholder').style.backgroundImage = 'url(' + uploadedImageData + ')';
        document.getElementById('resultPlaceholder').style.backgroundSize = 'cover';
        document.getElementById('resultPlaceholder').style.backgroundPosition = 'center';
    } else {
        document.getElementById('resultPlaceholder').style.background = bgMap[style] || bgMap['现代简约'];
    }
    document.getElementById('resultEmoji').textContent = emoji;
    document.getElementById('resultLabel').textContent = style + ' · AI生成方案';
    document.getElementById('resultTitle').textContent = style + '方案';
    if (drawingMode) toggleDrawingMode();
    document.getElementById('modifyInput').value = '';
    document.getElementById('resultImageContainer').style.height = 'auto';

    // 根据来源页面切换按钮
    var btn3D = document.getElementById('btn3DEffect');
    var btn3DGen = document.getElementById('btn3DGenerate');
    var btnGoAi = document.getElementById('btnGoAi');
    var btnHistory = document.getElementById('btnHistory');
    var btnConfirm = document.getElementById('btnConfirmPlan');
    if (resultSourcePage === 'page-huxing-chat') {
        // 智能体对话过来：先隐藏3D按钮，显示确认方案
        btn3D.style.display = 'none';
        btn3DGen.style.display = 'none';
        btnGoAi.style.display = 'none';
        btnHistory.style.display = 'block';
        btnConfirm.style.display = 'block';
    } else if (resultSourcePage === 'page-effect' || resultSourcePage === 'page-empty') {
        // 效果图/空房图：软装换搭(action行) + 下一步
        btn3D.innerHTML = '🛋️ 软装换搭';
        btn3D.className = 'result-action-btn soft-furnish';
        btn3D.onclick = goToSoftFromResult;
        btn3D.style.display = 'block';
        btn3DGen.style.display = 'none';
        btnGoAi.style.display = 'block';
        btnHistory.style.display = 'none';
    } else {
        // 户型图(旧流程)：历史记录(action行) + 生成3D效果图(替换下一步位置)
        btn3D.style.display = 'none';
        btn3DGen.style.display = 'block';
        btnGoAi.style.display = 'none';
        btnHistory.style.display = 'block';
        btnConfirm.style.display = 'none';
    }
}

function confirmPlan() {
    trackLog('CONFIRM_PLAN', '确认方案，显示3D效果图生成按钮');
    showToast('方案已确认！');
    document.getElementById('btnConfirmPlan').style.display = 'none';
    document.getElementById('btn3DGenerate').style.display = 'block';
}

function goBackFromResult() {
    if (drawingMode) toggleDrawingMode();
    goBack();
}

function goToSoftFromResult() {
    if (drawingMode) toggleDrawingMode();
    resultSourcePage = 'page-result';
    navigateTo('page-soft');
    setSoftPreviewImage();
    startAiRecognition();
}

function setSoftPreviewImage() {
    if (uploadedImageData) {
        document.getElementById('softPreviewBox').style.backgroundImage = 'url(' + uploadedImageData + ')';
        document.getElementById('softPreviewBox').style.backgroundSize = 'cover';
        document.getElementById('softPreviewBox').style.backgroundPosition = 'center';
    }
}

function goBackFromSoft() {
    // 关闭软装涂鸦
    const cv = document.getElementById('softCanvas');
    cv.style.display = 'none';
    document.getElementById('softDrawToolbar').classList.remove('show');
    goBack();
}

// ============ 语音输入（结果页） ============
let isRecording = false;
function toggleVoiceInput() {
    const btn = document.getElementById('voiceBtn');
    const input = document.getElementById('modifyInput');
    isRecording = !isRecording;
    if (isRecording) {
        btn.classList.add('recording'); btn.textContent = '⏹'; input.placeholder = '正在聆听...';
        showToast('🎤 语音识别已开启');
        setTimeout(() => {
            if (isRecording) {
                input.value = '把沙发向左移动，茶几换成圆形';
                input.placeholder = '输入修改指令...';
                btn.classList.remove('recording'); btn.textContent = '🎤'; isRecording = false;
                showToast('语音识别完成');
            }
        }, 2500);
    } else { btn.classList.remove('recording'); btn.textContent = '🎤'; input.placeholder = '输入修改指令，如：把沙发换成灰色...'; }
}

// ============ AI识别 ============
function startAiRecognition() {
    Object.keys(cart).forEach(k => cart[k] = null);
    updateCartBadge();
    document.querySelectorAll('.bbox').forEach(b => {
        b.classList.remove('replaced', 'active-bbox');
        b.innerHTML = CATEGORY_NAMES[b.id.replace('bbox-', '')] + '区';
    });
    const overlay = document.getElementById('aiLoadingOverlay');
    overlay.classList.add('show');
    setTimeout(() => {
        overlay.classList.remove('show');
        currentBBox = 'sofa';
        focusBBox('sofa');
        updateReplaceAllButton();
        showToast('AI识别完成，共发现5件家具');
    }, 1800);
}

function focusBBox(category) {
    currentBBox = category;
    document.querySelectorAll('.bbox').forEach(b => b.classList.remove('active-bbox'));
    const box = document.getElementById('bbox-' + category);
    if (box) box.classList.add('active-bbox');
    document.getElementById('panelCategoryTitle').innerHTML = getCategoryEmoji(category) + ' 选择' + CATEGORY_NAMES[category];
    renderFurnitureList(category);
}

function getCategoryEmoji(cat) { const m = { sofa:'🛋️', table:'☕', bed:'🛏️', cabinet:'📺', lamp:'💡' }; return m[cat] || '📦'; }

function renderFurnitureList(category) {
    var list = document.getElementById('furnitureList');
    var items = furnitureDB[category] || [];
    var selectedId = cart[category] ? cart[category].id : null;
    list.innerHTML = items.map(function(item) {
        var isSelected = item.id === selectedId;
        var actionHtml = '';
        if (isSelected) {
            actionHtml = '<div style="display:flex;gap:6px;"><button class="btn-select-furniture selected">✓ 已入车</button><button class="btn-select-furniture" style="border-color:#ef4444;color:#dc2626;background:#fef2f2;" onclick="removeFromCart(\'' + category + '\')">✕ 删除</button></div>';
        } else {
            actionHtml = '<button class="btn-select-furniture" onclick="addToCart(\'' + category + '\', \'' + item.id + '\')">＋ 入车</button>';
        }
        return '<div class="furniture-row"><div><div class="info"><div class="name">' + item.name + '</div><div class="meta">🏭 ' + item.factory + '</div></div><div><span class="price-original">¥' + item.originalPrice.toLocaleString() + '</span><span class="price-discount blurred">¥' + item.price.toLocaleString() + '</span></div></div>' + actionHtml + '</div>';
    }).join('');
}

function removeFromCart(category) {
    trackLog('REMOVE_CART', '品类: ' + category);
    var item = cart[category];
    if (!item) return;
    cart[category] = null;
    // 重置对应bbox
    var box = document.getElementById('bbox-' + category);
    if (box) {
        box.classList.remove('replaced');
        box.innerHTML = CATEGORY_NAMES[category] + '区';
    }
    updateCartBadge();
    renderFurnitureList(category);
    updateReplaceAllButton();
    showToast('已从购物车移除「' + item.name + '」');
}

function addToCart(category, itemId) {
    trackLog('ADD_CART', '品类: ' + category + ', 商品: ' + itemId);
    const item = furnitureDB[category].find(i => i.id === itemId);
    if (!item) return;
    cart[category] = { ...item };
    const box = document.getElementById('bbox-' + category);
    if (box) { box.classList.add('replaced'); box.innerHTML = '<span style="font-size:10px;">' + item.name + '<br>¥' + item.originalPrice.toLocaleString() + '</span>'; }
    updateCartBadge(); renderFurnitureList(category); updateReplaceAllButton();
    const cartFloat = document.querySelector('.cart-float');
    cartFloat.classList.remove('bounce'); void cartFloat.offsetWidth; cartFloat.classList.add('bounce');
}

function replaceAllCartItems() {
    var replaceCount = Object.values(cart).filter(function(v) { return v !== null; }).length;
    if (replaceCount === 0) return showToast('购物车为空，请先手动入车至少一件家具');
    // 将购物车中已选中的家具渲染到识别区
    Object.keys(cart).forEach(function(cat) {
        var item = cart[cat];
        if (item) {
            var box = document.getElementById('bbox-' + cat);
            if (box) { box.classList.add('replaced'); box.innerHTML = '<span style="font-size:10px;">' + item.name + '<br>¥' + item.originalPrice.toLocaleString() + '</span>'; }
        }
    });
    updateCartBadge(); renderFurnitureList(currentBBox); updateReplaceAllButton();
    var cartFloat = document.querySelector('.cart-float');
    cartFloat.classList.remove('bounce'); void cartFloat.offsetWidth; cartFloat.classList.add('bounce');
    showToast('已应用购物车内 ' + replaceCount + ' 件家具到方案');
}

function updateReplaceAllButton() { document.getElementById('btnReplaceAll').disabled = !Object.values(cart).some(v => v !== null); }

function matchByBudget() {
    trackLog('MATCH_BUDGET', '预算匹配, 输入: ' + document.getElementById('budgetInput').value);
    const raw = document.getElementById('budgetInput').value.trim();
    if (!raw || isNaN(raw) || parseInt(raw) <= 0) return showToast('请输入有效的预算金额');
    const budget = parseInt(raw);
    const categories = Object.keys(furnitureDB);
    let bestCombo = {}; let maxTotal = -1;
    function bruteForce(idx, total, combo) {
        if (idx >= categories.length) { if (total <= budget && total > maxTotal) { maxTotal = total; bestCombo = { ...combo }; } return; }
        const cat = categories[idx];
        for (const item of furnitureDB[cat]) {
            if (total + item.originalPrice > budget) continue;
            combo[cat] = item; bruteForce(idx + 1, total + item.originalPrice, combo);
            if (idx === 0) { const w = { ...combo }; delete w[cat]; bruteForce(idx + 1, total, w); }
        }
    }
    bruteForce(0, 0, {});
    if (Object.keys(bestCombo).length > 0) {
        Object.entries(bestCombo).forEach(function(e) { var cat = e[0]; var item = e[1]; cart[cat] = { ...item }; const box = document.getElementById('bbox-' + cat); if (box) { box.classList.add('replaced'); box.innerHTML = '<span style="font-size:10px;">' + item.name + '<br>¥' + item.originalPrice.toLocaleString() + '</span>'; } });
        updateCartBadge(); renderFurnitureList(currentBBox); updateReplaceAllButton();
        const cartFloat = document.querySelector('.cart-float'); cartFloat.classList.remove('bounce'); void cartFloat.offsetWidth; cartFloat.classList.add('bounce');
        showToast(`AI匹配完成！总价 ¥${maxTotal.toLocaleString()}，符合预算 ¥${budget.toLocaleString()}`);
    } else {
        let minTotal = 0; const minCombo = {};
        categories.forEach(cat => { const minItem = furnitureDB[cat].reduce((a, b) => a.originalPrice < b.originalPrice ? a : b); minCombo[cat] = minItem; minTotal += minItem.originalPrice; });
        Object.entries(minCombo).forEach(function(e) { var cat = e[0]; var item = e[1]; cart[cat] = { ...item }; const box = document.getElementById('bbox-' + cat); if (box) { box.classList.add('replaced'); box.innerHTML = '<span style="font-size:10px;">' + item.name + '<br>¥' + item.originalPrice.toLocaleString() + '</span>'; } });
        updateCartBadge(); renderFurnitureList(currentBBox); updateReplaceAllButton();
        showToast(`预算不足，已为您匹配最高性价比组合（最低 ¥${minTotal.toLocaleString()}）`);
    }
}

function updateCartBadge() { document.getElementById('cartBadge').textContent = Object.values(cart).filter(v => v !== null).length; }

// ============ 软装换搭主Tab ============
var softMainActiveTab = 'ai_change';

function switchSoftMainTab(tab) {
    softMainActiveTab = tab;
    // 更新主tab栏样式
    document.querySelectorAll('#softMainTabs .soft-mode-tab').forEach(function(t) {
        t.classList.toggle('active', t.dataset.maintab === tab);
    });
    // 切换面板
    document.getElementById('softPanelChange').classList.toggle('show', tab === 'ai_change');
    document.getElementById('softPanelTools').classList.toggle('show', tab === 'ai_tools');
    document.getElementById('softPanelFree').classList.toggle('show', tab === 'free');
    // 重置工具状态
    if (tab !== 'ai_change') {
        // 离开AI换搭时重置涂鸦
        var softCv = document.getElementById('softCanvas');
        if (softCv) softCv.style.display = 'none';
        document.getElementById('softDrawToolbar').classList.remove('show');
        document.getElementById('softDrawToolbar2').classList.remove('show');
        document.getElementById('softCommandBar').classList.remove('show');
        document.getElementById('softCommandBar2').classList.remove('show');
    }
}

function switchSoftMainTool(mode) {
    // Tab2中的工具切换
    document.querySelectorAll('#softPanelTools .soft-mode-tab').forEach(function(t) {
        t.classList.remove('active');
    });
    // 找到被点击的按钮并激活
    var btns = document.querySelectorAll('#softPanelTools .soft-mode-tab');
    var modeMap = { 'recognize': 0, 'draw': 1, 'command': 2, 'erase': 3 };
    if (modeMap[mode] !== undefined) btns[modeMap[mode]].classList.add('active');

    var drawToolbar = document.getElementById('softDrawToolbar2');
    var commandBar = document.getElementById('softCommandBar2');
    var softCv = document.getElementById('softCanvas');
    var bboxes = document.querySelectorAll('.bbox');

    drawToolbar.classList.remove('show');
    commandBar.classList.remove('show');
    softCv.style.display = 'none';
    bboxes.forEach(function(b) { b.style.pointerEvents = 'auto'; });

    if (mode === 'draw' || mode === 'erase') {
        softCv.style.display = 'block';
        drawToolbar.classList.add('show');
        setTimeout(function() { initSoftCanvas(); softSaveState(); }, 100);
    } else if (mode === 'command') {
        commandBar.classList.add('show');
    }

    // 绑定Canvas事件
    var cv = document.getElementById('softCanvas');
    cv.onmousedown = startSoftDraw; cv.onmousemove = softDraw; cv.onmouseup = stopSoftDraw; cv.onmouseleave = stopSoftDraw;
    cv.addEventListener('touchstart', startSoftDraw, { passive: false });
    cv.addEventListener('touchmove', softDraw, { passive: false });
    cv.addEventListener('touchend', stopSoftDraw);
}

function searchFreeFurniture() {
    var keyword = document.getElementById('freeSearchInput').value.trim();
    if (!keyword) return showToast('请输入搜索关键词');
    // 在所有家具品类中搜索
    var results = [];
    Object.keys(furnitureDB).forEach(function(cat) {
        furnitureDB[cat].forEach(function(item) {
            if (item.name.indexOf(keyword) !== -1 || CATEGORY_NAMES[cat].indexOf(keyword) !== -1) {
                results.push({ cat: cat, item: item });
            }
        });
    });
    var container = document.getElementById('freeSearchResults');
    document.getElementById('freePanelTitle').textContent = '📦 搜索"' + keyword + '" (' + results.length + '个)';
    if (results.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#94a3b8;">未找到匹配的家具</div>';
        return;
    }
    container.innerHTML = results.map(function(r) {
        var inCart = cart[r.cat] && cart[r.cat].id === r.item.id;
        var actionHtml = '';
        if (inCart) {
            actionHtml = '<button class="btn-select-furniture selected">✓ 已入车</button>';
        } else {
            actionHtml = '<button class="btn-select-furniture" onclick="addToCart(\'' + r.cat + '\', \'' + r.item.id + '\')">＋ 入车</button>';
        }
        return '<div class="furniture-row"><div><div class="info"><div class="name">' + getCategoryEmoji(r.cat) + ' ' + r.item.name + '</div><div class="meta">🏭 ' + r.item.factory + '</div></div><div><span class="price-original">¥' + r.item.originalPrice.toLocaleString() + '</span><span class="price-discount blurred">¥' + r.item.price.toLocaleString() + '</span></div></div>' + actionHtml + '</div>';
    }).join('');
}

// ============ 软装换搭4模式 ============
function switchSoftMode(mode) {
    softMode = mode;
    // 只操作AI换搭面板内的4模式tab
    document.querySelectorAll('#softPanelChange .soft-mode-tab[data-mode]').forEach(function(t) { t.classList.remove('active'); });
    var modeBtn = document.querySelector('#softPanelChange .soft-mode-tab[data-mode="' + mode + '"]');
    if (modeBtn) modeBtn.classList.add('active');
    const drawToolbar = document.getElementById('softDrawToolbar');
    const commandBar = document.getElementById('softCommandBar');
    const bboxes = document.querySelectorAll('.bbox');
    const softCv = document.getElementById('softCanvas');

    // 重置
    drawToolbar.classList.remove('show');
    commandBar.classList.remove('show');
    softCv.style.display = 'none';
    bboxes.forEach(b => b.style.pointerEvents = 'auto');

    switch (mode) {
        case 'recognize':
            // 显示BBox，可点击选择
            bboxes.forEach(b => b.style.pointerEvents = 'auto');
            break;
        case 'draw':
            // 显示涂抹画布
            softCv.style.display = 'block';
            drawToolbar.classList.add('show');
            setTimeout(() => { initSoftCanvas(); softSaveState(); }, 100);
            break;
        case 'command':
            // 显示指令输入
            commandBar.classList.add('show');
            break;
        case 'erase':
            // 涂抹消除
            softCv.style.display = 'block';
            drawToolbar.classList.add('show');
            setTimeout(() => { initSoftCanvas(); softSaveState(); }, 100);
            break;
    }

    // 绑定软装Canvas事件
    const cv = document.getElementById('softCanvas');
    cv.onmousedown = startSoftDraw; cv.onmousemove = softDraw; cv.onmouseup = stopSoftDraw; cv.onmouseleave = stopSoftDraw;
    cv.addEventListener('touchstart', startSoftDraw, { passive: false });
    cv.addEventListener('touchmove', softDraw, { passive: false });
    cv.addEventListener('touchend', stopSoftDraw);

    // 显示生成按钮
    document.getElementById('btnReplaceAll').textContent = mode === 'erase' ? '🗑 一键消除 →' : '🔄 一键生成替换 →';
}

let softRecording = false;
function toggleSoftVoice() {
    const btn = document.querySelector('#softCommandBar .voice-btn');
    softRecording = !softRecording;
    if (softRecording) {
        btn.classList.add('recording'); btn.textContent = '⏹';
        setTimeout(() => {
            if (softRecording) {
                document.getElementById('softCommandText').value = '把沙发换成灰色布艺款式，茶几换成圆形玻璃';
                btn.classList.remove('recording'); btn.textContent = '🎤'; softRecording = false;
                showToast('语音识别完成');
            }
        }, 2000);
    } else { btn.classList.remove('recording'); btn.textContent = '🎤'; }
}

// ============ 报价页 ============
function goToQuote() {
    if (Object.values(cart).filter(v => v !== null).length === 0) return showToast('购物车为空，请先选择家具入车');
    navigateTo('page-quote'); renderQuote(false);
}

function buildDesignPlanHTML(planItems, total) {
    var style = selectedStyleTag || '现代简约';
    var itemNames = planItems.map(function(e) { return e[1].name; }).join('、');
    var html = '';
    html += '<div class="design-plan-box" style="display:block;margin-top:16px;">';
    html += '<div class="plan-header">📋 完整设计方案</div>';
    html += '<div class="plan-body">';
    // 设计说明文案 (~50字)
    html += '<div class="plan-desc-box">';
    html += '<div class="desc-title">📝 设计说明</div>';
    html += '<div class="desc-text">本方案基于「<b>' + style + '</b>」风格设计，配置' + planItems.length + '件核心家具，出厂总价<b>¥' + total.toLocaleString() + '</b>。空间动线与功能分区经AI智能优化，精选' + itemNames + '等单品，材质色彩统一呼应，直连佛山源头工厂，对比市场价可节省约30%-50%。</div>';
    html += '</div>';
    // 四宫格分析图
    html += '<div class="plan-analysis-grid">';
    html += '<div class="plan-analysis-card"><div class="card-img" style="background:linear-gradient(160deg,#e0e7ff,#c4b5fd);">📐</div><div class="card-label">方案设计分析图</div></div>';
    html += '<div class="plan-analysis-card"><div class="card-img" style="background:linear-gradient(160deg,#fef3c7,#fde68a);">🏠</div><div class="card-label">户型分析图</div></div>';
    html += '<div class="plan-analysis-card"><div class="card-img" style="background:linear-gradient(160deg,#d1fae5,#a7f3d0);">🖼️</div><div class="card-label">空间效果图</div></div>';
    html += '<div class="plan-analysis-card"><div class="card-img" style="background:linear-gradient(160deg,#fce7f3,#fbcfe8);">🛋️</div><div class="card-label">软装设计分析图</div></div>';
    html += '</div>';
    // 上传原图 vs 效果图对比
    html += '<div class="plan-compare-row">';
    html += '<div class="plan-compare-item"><div class="compare-img" style="background:linear-gradient(160deg,#f1f5f9,#e2e8f0);">📷</div><div class="compare-label">上传原图</div></div>';
    html += '<div class="plan-compare-arrow">→</div>';
    html += '<div class="plan-compare-item"><div class="compare-img" style="background:linear-gradient(160deg,#e0e7ff,#c4b5fd);">✨</div><div class="compare-label">AI效果图</div></div>';
    html += '</div>';
    html += '</div></div>';
    return html;
}

function renderQuote(isPaid) {
    var card = document.getElementById('quoteCard');
    var planItems = Object.entries(cart).filter(function(e) { return e[1] !== null; });
    var total = 0;
    var rowsHtml = '';

    // 报价明细
    Object.entries(cart).forEach(function(entry) {
        var cat = entry[0]; var item = entry[1];
        if (!item) return;
        total += item.price;
        rowsHtml += '<div class="quote-row"><div><div class="q-name">' + getCategoryEmoji(cat) + ' ' + CATEGORY_NAMES[cat] + ' — ' + item.name + '</div><div style="font-size:11px;color:#94a3b8;margin-top:2px;">' + item.factory + '</div></div><div class="q-price ' + (isPaid ? '' : 'blurred') + '">' + (isPaid ? '¥' + item.price.toLocaleString() : '¥****') + '</div></div>';
    });
    rowsHtml += '<div class="quote-total-bar"><span class="total-label">💰 出厂总价</span><span class="total-price ' + (isPaid ? '' : 'blurred') + '">' + (isPaid ? '¥' + total.toLocaleString() : '¥****') + '</span></div>';

    // 完整设计方案 —— 始终可见，位于服务基地上方
    rowsHtml += buildDesignPlanHTML(planItems, total);

    // 售前咨询框 —— 始终可见，位于设计方案下方、服务基地上方
    rowsHtml += '<div class="cs-contact-box"><div class="cs-title">💁 售前咨询</div><div class="cs-text">如有售前问题请联系线上美学顾问</div><div class="cs-phone">联系电话：400-888-6688</div><div class="cs-text" style="margin-top:4px;">扫码添加企业微信：</div><div class="cs-qr-placeholder">📱</div></div>';

    if (!isPaid) {
        rowsHtml += '<div class="savings-badge">🔒 支付后显示真实出厂价 & 工厂联系方式</div>';
    } else {
        rowsHtml += '<div class="service-base-box"><div class="base-header"><div class="base-icon">🏢</div><div><div class="base-title">自创家AI服务基地</div><div class="base-subtitle">佛山·乐从 总部体验中心</div></div></div><div class="base-detail"><div class="address-line"><span>📍</span><span>广东省佛山市顺德区乐从镇XX路XX号<br>自创家AI家具供应链基地 3F 展厅</span></div><div class="address-line"><span>🕐</span><span>周一至周日 9:00 - 18:00（节假日照常）</span></div><div class="address-line"><span>🚗</span><span>导航搜索「自创家AI服务基地」即可到达<br>提供免费停车 & 专人接待</span></div><div style="margin-top:8px;font-size:11px;color:#3b82f6;font-weight:600;">💡 到店可现场看家具实物，工作人员一对一服务</div></div></div>';
        var factoryList = Object.values(cart).filter(function(v) { return v !== null; }).map(function(v) { return { name: v.factory, phone: '400-XXX-XXXX 转 ' + v.factory.slice(0,2) }; }).filter(function(v, i, a) { return a.findIndex(function(x) { return x.name === v.name; }) === i; });
        rowsHtml += '<div class="factory-contact-box"><div class="contact-header">📞 源头工厂联系方式（已解锁）</div>' + factoryList.map(function(f) { return '<div class="factory-contact-item"><span class="fc-name">🏭 ' + f.name + '</span><span class="fc-phone">' + f.phone + '</span></div>'; }).join('') + '</div>';
        rowsHtml += '<div class="savings-badge" style="background:#f0fdf4;color:#166534;">✅ 已省去中间商差价 | 对比市场价节省约 30%-50%</div>';
    }

    card.innerHTML = rowsHtml;
    document.getElementById('btnSaveTrigger').style.display = isPaid ? 'block' : 'none';
}

function payToReveal() {
    trackLog('PAY_REVEAL', '支付解锁报价');
    const btn = document.getElementById('payRevealBtn');
    btn.disabled = true; btn.textContent = '正在拉起支付...';
    setTimeout(() => {
        renderQuote(true); btn.style.display = 'none';
        showToast('支付成功！出厂底价已解锁');
    }, 1600);
}

// ============ 保存方案弹窗 ============
function openSaveModal() {
    document.getElementById('saveModalOverlay').classList.add('show');
}

function closeSaveModal() {
    document.getElementById('saveModalOverlay').classList.remove('show');
}

// 水印绘制
function addWatermark(canvas) {
    var ctx = canvas.getContext('2d');
    var watermarkText = '自创家AI-小程序';
    var fontSize = Math.max(canvas.width * 0.04, 24);
    ctx.save();
    ctx.font = 'bold ' + fontSize + 'px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // 旋转-25度，铺满画布
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-25 * Math.PI / 180);
    var textWidth = ctx.measureText(watermarkText).width;
    var spacing = textWidth * 2.5;
    var rowSpacing = fontSize * 2.5;
    var cols = Math.ceil(canvas.width / spacing) + 4;
    var rows = Math.ceil(canvas.height / rowSpacing) + 4;
    for (var r = -rows; r < rows; r++) {
        for (var c = -cols; c < cols; c++) {
            ctx.fillText(watermarkText, c * spacing, r * rowSpacing);
        }
    }
    ctx.restore();
    return canvas;
}

// 生成截图Canvas
function captureQuotePage() {
    var quotePage = document.getElementById('page-quote');
    var origOverflow = quotePage.style.overflow;
    quotePage.style.overflow = 'visible';
    return html2canvas(quotePage, { backgroundColor: '#f8fafc', scale: 2, useCORS: true }).then(function(canvas) {
        quotePage.style.overflow = origOverflow;
        return canvas;
    }).catch(function(err) {
        quotePage.style.overflow = origOverflow;
        throw err;
    });
}

function shareDesignLink() {
    closeSaveModal();
    // 生成推广链接（基于当前设计方案的标识）
    var style = selectedStyleTag || '现代简约';
    var shareText = '【自创家AI】' + style + '风格完整设计方案\n' +
        '🏭 直连佛山源头工厂 | AI智能家具匹配\n' +
        '💰 省去中间商差价30%-50%\n' +
        '👉 点击查看我的设计方案：https://zichuangjia.cn/s/' +
        Math.random().toString(36).substring(2, 10);
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).then(function() {
            showToast('推广链接已复制到剪贴板');
        }).catch(function() {
            showToast('复制失败，请重试');
        });
    } else {
        // 降级方案：显示prompt
        var textarea = document.createElement('textarea');
        textarea.value = shareText;
        textarea.style.position = 'fixed'; textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try { document.execCommand('copy'); showToast('推广链接已复制到剪贴板'); } catch (e) { showToast('复制失败，请重试'); }
        document.body.removeChild(textarea);
    }
}

function saveImageWithWatermark() {
    trackLog('SAVE_IMAGE', '保存带水印图片');
    closeSaveModal();
    showToast('正在生成图片...');
    captureQuotePage().then(function(canvas) {
        addWatermark(canvas);
        canvas.toBlob(function(blob) {
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url; a.download = '设计方案_' + new Date().toISOString().slice(0, 10) + '.png';
            a.click(); URL.revokeObjectURL(url);
            showToast('图片已保存到本地');
        }, 'image/png');
    }).catch(function() {
        showToast('生成失败，请重试');
    });
}

function savePDFWithWatermark() {
    closeSaveModal();
    showToast('正在生成PDF...');
    captureQuotePage().then(function(canvas) {
        addWatermark(canvas);
        var imgData = canvas.toDataURL('image/png');
        var printWindow = window.open('', '_blank', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write('<html><head><title>设计方案</title><style>body{margin:0;display:flex;justify-content:center;}img{width:100%;max-width:794px;}</style></head><body><img src="' + imgData + '" onload="window.print();" /></body></html>');
            printWindow.document.close();
        } else {
            var a = document.createElement('a');
            a.href = imgData;
            a.download = '设计方案_' + new Date().toISOString().slice(0, 10) + '.png';
            a.click();
        }
        showToast('PDF已生成，请在打印对话框中选择"另存为PDF"');
    }).catch(function() {
        showToast('生成失败，请重试');
    });
}

// ============ 会员页 ============
function goToVipPage() {
    closeSaveModal();
    navigateTo('page-vip-detail');
}

// ============ AI家居图对话 ============
var imgChatReferencedImage = null;

function triggerImgChatUpload() {
    document.getElementById('hiddenImgChatInput').click();
}

function handleImgChatUpload(event) {
    var file = event.target.files[0];
    if (!file) return;
    trackLog('IMG_CHAT_UPLOAD', 'AI家居图上传: ' + file.name + ' (' + (file.size/1024).toFixed(1) + 'KB)');
    if (file.size > 4 * 1024 * 1024) {
        showToast('图片过大，请使用小于4MB的图片');
        event.target.value = '';
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        referenceImgChatImage(e.target.result);
        showToast('图片已就绪，输入描述后点击发送');
    };
    reader.onerror = function(e) {
        showToast('图片读取失败，请重试');
        event.target.value = '';
    };
    reader.readAsDataURL(file);
    event.target.value = '';
}

function referenceImgChatImage(imgSrc) {
    imgChatReferencedImage = imgSrc;
    var btn = document.getElementById('imgChatUploadBtn');
    var thumb = document.getElementById('imgChatRefThumb');
    var clear = document.getElementById('imgRefClear');
    if (thumb) { thumb.src = imgSrc; }
    if (btn) { btn.classList.add('has-ref'); }
    if (clear) { clear.classList.add('show'); }
    showToast('图片已引用，下次发送时将携带此图');
}

function clearReferencedImage() {
    imgChatReferencedImage = null;
    var btn = document.getElementById('imgChatUploadBtn');
    var thumb = document.getElementById('imgChatRefThumb');
    var clear = document.getElementById('imgRefClear');
    if (thumb) { thumb.src = ''; }
    if (btn) { btn.classList.remove('has-ref'); }
    if (clear) { clear.classList.remove('show'); }
    showToast('已取消引用');
}

function sendImgChatMsg() {
    var input = document.getElementById('imgChatInput');
    var text = input.value.trim();
    if (!text && !imgChatReferencedImage) return showToast('请输入描述内容或引用图片');
    input.value = '';
    var container = document.getElementById('imgChatContainer');
    var html = '';
    // 如果有引用图片，一并显示
    if (imgChatReferencedImage) {
        html += '<div class="img-msg" id="imgMsg' + Date.now() + '">';
        html += '<div class="img-msg-img"><img src="' + imgChatReferencedImage + '" /></div>';
        html += '</div>';
    }
    if (text) {
        html += '<div class="chat-msg user"><div class="chat-bubble">' + text + '</div></div>';
    }
    // AI模拟回复
    html += '<div class="chat-msg ai"><div class="chat-bubble">已收到您的需求' + (imgChatReferencedImage ? '和引用图片' : '') + '，正在为您分析处理中...</div></div>';
    container.innerHTML += html;
    container.scrollTop = container.scrollHeight;
    // 清除引用状态
    clearReferencedImage();
}

function addImgChatMsg(imgSrc) {
    var container = document.getElementById('imgChatContainer');
    var msgId = 'imgMsg' + Date.now();
    var html = '<div class="img-msg" id="' + msgId + '">';
    html += '<div class="img-msg-img"><img src="' + imgSrc + '" /></div>';
    html += '<div class="img-msg-actions">';
    html += '<button class="img-action-btn edit" onclick="toggleImgEditMenu(\'' + msgId + '\')">✏️ 编辑</button>';
    html += '<button class="img-action-btn quote-ref" onclick="referenceImgChatImage(\'' + imgSrc.replace(/'/g, "\\'") + '\')">💬 引用</button>';
    html += '<button class="img-action-btn retry" onclick="retryImgUpload()">🔄 重试</button>';
    html += '</div>';
    html += '<div class="img-edit-menu" id="' + msgId + '_menu">';
    html += '<button class="img-edit-item soft" onclick="carryImageToPage(\'' + imgSrc + '\', \'page-soft\');setSoftPreviewImage();startAiRecognition();">🛋️ 软装换搭</button>';
    html += '<button class="img-edit-item design" onclick="carryImageToPage(\'' + imgSrc + '\', \'page-result\');">🎨 图片设计</button>';
    html += '</div>';
    html += '</div>';
    container.innerHTML += html;
    container.scrollTop = container.scrollHeight;
}

function carryImageToPage(imgSrc, targetPage) {
    uploadedImageData = imgSrc;
    currentUploadType = '效果图';
    trackLog('CARRY_IMAGE', '携带图片跳转: ' + targetPage);
    navigateTo(targetPage);
}

function toggleImgEditMenu(msgId) {
    var menu = document.getElementById(msgId + '_menu');
    menu.classList.toggle('show');
}

function retryImgUpload() {
    document.getElementById('hiddenImgChatInput').click();
}

// ============ 装修报价表单 ============
var quoteFormState = { houseInfo: null, decoInfo: null };

function initQuoteForm() {
    quoteFormState.houseInfo = null;
    quoteFormState.decoInfo = null;
    // 房屋信息单选
    var houseOptions = [
        { label:'60-90㎡', value:'60-90㎡' },
        { label:'90-120㎡', value:'90-120㎡' },
        { label:'120-150㎡', value:'120-150㎡' },
        { label:'150㎡以上', value:'150㎡以上' },
    ];
    document.getElementById('houseInfoRadios').innerHTML = houseOptions.map(function(o, i) {
        return '<div class="qf-radio" onclick="selectQuoteRadio(this, \'houseInfo\', \'' + o.value + '\')">' + o.label + '</div>';
    }).join('');
    // 装修信息单选
    var decoOptions = [
        { label:'经济简装', value:'经济简装' },
        { label:'中档装修', value:'中档装修' },
        { label:'高档精装', value:'高档精装' },
        { label:'豪华装修', value:'豪华装修' },
    ];
    document.getElementById('decoInfoRadios').innerHTML = decoOptions.map(function(o, i) {
        return '<div class="qf-radio" onclick="selectQuoteRadio(this, \'decoInfo\', \'' + o.value + '\')">' + o.label + '</div>';
    }).join('');
}

function selectQuoteRadio(el, field, value) {
    var group = el.parentElement;
    group.querySelectorAll('.qf-radio').forEach(function(r) { r.classList.remove('selected'); });
    el.classList.add('selected');
    quoteFormState[field] = value;
}

function calcQuotePrice() {
    if (!quoteFormState.houseInfo) return showToast('请选择房屋面积');
    if (!quoteFormState.decoInfo) return showToast('请选择装修档次');
    var basePrice = { '60-90㎡':80000, '90-120㎡':120000, '120-150㎡':180000, '150㎡以上':250000 };
    var decoMultiplier = { '经济简装':1, '中档装修':1.5, '高档精装':2.2, '豪华装修':3.5 };
    var price = Math.round((basePrice[quoteFormState.houseInfo] || 120000) * (decoMultiplier[quoteFormState.decoInfo] || 1.5));
    showToast('预估装修报价：¥' + (price / 10000).toFixed(1) + '万');
}

function purchaseVip() {
    showToast('正在拉起支付...');
    setTimeout(function() {
        showToast('会员开通成功！后续导出将自动去除水印');
    }, 1500);
}

// 3D设计历史页
function goToDesignHistory() {
    navigateTo('page-design-history');
    renderDesignHistory();
}

function renderDesignHistory() {
    var history = getDesignHistory();
    var list = document.getElementById('designHistoryList');
    var empty = document.getElementById('designHistoryEmpty');
    if (history.length === 0) {
        list.innerHTML = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        list.innerHTML = history.map(function(item, i) {
            return '<div class="history-item" style="margin-bottom:8px;"><img class="thumb" src="' + item.dataUrl + '" /><div class="info"><div class="htype">🏗️ ' + item.style + ' · 3D效果图</div><div class="hdate">' + item.date + '</div></div><button class="btn-share-link" style="margin-right:6px;flex-shrink:0;" onclick="event.stopPropagation();carryImageToPage(\'' + item.dataUrl + '\', \'page-soft\');setTimeout(function(){setSoftPreviewImage();startAiRecognition();},200);">🛋️ 软装换搭</button><button class="del-btn" onclick="deleteDesignItem(event, ' + i + ')">✕</button></div>';
        }).join('');
    }
}

function deleteDesignItem(event, index) {
    event.stopPropagation();
    var history = getDesignHistory();
    history.splice(index, 1);
    try { localStorage.setItem('design_history', JSON.stringify(history)); } catch (e) { /* ignore */ }
    renderDesignHistory();
}

// 保留旧函数名兼容
function saveQuoteAsImage() {
    saveImageWithWatermark();
}

function showFengshuiModal() {
    document.getElementById('fengshuiModalOverlay').classList.add('show');
}
function closeFengshuiModal() {
    document.getElementById('fengshuiModalOverlay').classList.remove('show');
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('show'), 2000);
}

// ============ 产品库 ============
var productLibCategories = [];
var productLibActiveTab = '';

function initProductLib() {
    // 随机选5个品类
    var allCats = ['沙发', '茶几', '床', '电视柜', '吊灯', '餐桌', '椅子', '书柜', '衣柜', '梳妆台'];
    productLibCategories = [];
    var shuffled = allCats.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
    }
    productLibCategories = shuffled.slice(0, 5);
    productLibActiveTab = productLibCategories[0];
    renderProductTabs();
    renderProductGrid();
}

function renderProductTabs() {
    var html = '';
    for (var i = 0; i < productLibCategories.length; i++) {
        var cat = productLibCategories[i];
        html += '<button class="lib-tab' + (cat === productLibActiveTab ? ' active' : '') + '" onclick="switchProductTab(\'' + cat + '\')">' + cat + '</button>';
    }
    document.getElementById('productTabs').innerHTML = html;
}

function switchProductTab(cat) {
    productLibActiveTab = cat;
    renderProductTabs();
    renderProductGrid();
}

function renderProductGrid() {
    // 生成6张产品图片（用picsum占位）
    var html = '';
    for (var i = 0; i < 9; i++) {
        var seed = productLibActiveTab + i;
        var imgUrl = 'https://picsum.photos/seed/' + encodeURIComponent(seed) + '/200/200';
        html += '<div class="lib-card" onclick="showToast(\'' + productLibActiveTab + '详情开发中\')">';
        html += '<img class="lib-card-img" src="' + imgUrl + '" loading="lazy" />';
        html += '<div class="lib-card-label">' + productLibActiveTab + ' #' + (i + 1) + '</div>';
        html += '</div>';
    }
    document.getElementById('productGrid').innerHTML = html;
}

// ============ 风格库 ============
var styleLibList = ['现代简约', '现代轻奢', '奶油风格', '新中式', '北欧风格', '法式风格', '宋式美学', '意式轻奢', '中古风格'];
var styleLibActiveTab = '现代简约';

function initStyleLib() {
    styleLibActiveTab = '现代简约';
    renderStyleTabs();
    renderStyleGrid();
}

function renderStyleTabs() {
    var html = '';
    for (var i = 0; i < styleLibList.length; i++) {
        var s = styleLibList[i];
        html += '<button class="lib-tab' + (s === styleLibActiveTab ? ' active' : '') + '" onclick="switchStyleTab(\'' + s + '\')">' + s + '</button>';
    }
    document.getElementById('styleTabs').innerHTML = html;
}

function switchStyleTab(style) {
    styleLibActiveTab = style;
    renderStyleTabs();
    renderStyleGrid();
}

function renderStyleGrid() {
    var html = '';
    for (var i = 0; i < 9; i++) {
        var seed = 'style_' + encodeURIComponent(styleLibActiveTab) + '_' + i;
        var imgUrl = 'https://picsum.photos/seed/' + seed + '/200/200';
        html += '<div class="lib-card">';
        html += '<img class="lib-card-img" src="' + imgUrl + '" loading="lazy" />';
        html += '<div class="lib-card-label">' + styleLibActiveTab + ' #' + (i + 1) + '</div>';
        html += '</div>';
    }
    document.getElementById('styleGrid').innerHTML = html;
}

// ============ 设计方案共创 ============
function getDesignShareHistory() {
    try { return JSON.parse(localStorage.getItem('design_share_history') || '[]'); } catch(e) { return []; }
}

function saveDesignShareRecord() {
    var designData = {
        style: selectedStyleTag || '现代简约',
        date: new Date().toLocaleString('zh-CN'),
        cartItems: Object.entries(cart).filter(function(e) { return e[1] !== null; }).map(function(e) { return {cat: e[0], name: e[1].name, price: e[1].price}; }),
    };
    // 如果有上传的图片，也保存
    if (uploadedImageData) {
        designData.image = uploadedImageData;
    }
    var history = getDesignShareHistory();
    history.unshift(designData);
    if (history.length > 20) history.length = 20;
    try { localStorage.setItem('design_share_history', JSON.stringify(history)); } catch (e) { /* ignore */ }
}

function renderDesignShare() {
    var history = getDesignShareHistory();
    var list = document.getElementById('designShareList');
    var empty = document.getElementById('designShareEmpty');
    if (history.length === 0) {
        list.innerHTML = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        var html = '';
        for (var i = 0; i < history.length; i++) {
            var rec = history[i];
            var itemNames = rec.cartItems ? rec.cartItems.map(function(c) { return c.name; }).join('、') : '';
            html += '<div class="share-record">';
            html += '<div class="sr-header">';
            html += '<div><div style="font-size:14px;font-weight:700;color:#1e293b;">' + rec.style + ' 设计方案</div><div class="sr-date">' + rec.date + '</div></div>';
            html += '<button class="btn-share-link" onclick="event.stopPropagation();shareDesignRecord(' + i + ')">🔗 分享链接</button>';
            html += '</div>';
            if (rec.image) {
                html += '<div class="sr-images"><img class="sr-thumb" src="' + rec.image + '" /></div>';
            }
            if (itemNames) {
                html += '<div style="font-size:12px;color:#64748b;margin-top:8px;">🛒 ' + itemNames + '</div>';
            }
            html += '</div>';
        }
        list.innerHTML = html;
    }
}

function shareDesignRecord(index) {
    var history = getDesignShareHistory();
    var rec = history[index];
    if (!rec) return;
    var shareText = '【自创家AI】' + rec.style + '风格设计方案\n' +
        '🏭 直连佛山源头工厂 | AI智能家具匹配\n' +
        '💰 省去中间商差价30%-50%\n' +
        '📅 ' + rec.date + '\n' +
        '👉 点击查看：https://zichuangjia.cn/s/' + Math.random().toString(36).substring(2, 10);
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).then(function() {
            showToast('分享链接已复制到剪贴板');
        }).catch(function() {
            showToast('复制失败，请重试');
        });
    } else {
        var textarea = document.createElement('textarea');
        textarea.value = shareText;
        textarea.style.position = 'fixed'; textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try { document.execCommand('copy'); showToast('分享链接已复制到剪贴板'); } catch(e) { showToast('复制失败，请重试'); }
        document.body.removeChild(textarea);
    }
}

// 在软装换搭完成时保存设计记录
var _origGoToQuote = goToQuote;
goToQuote = function() {
    saveDesignShareRecord();
    _origGoToQuote();
};

// ============ Canvas事件绑定 ============
document.addEventListener('DOMContentLoaded', () => {
    const canvasEl = document.getElementById('drawCanvas');
    canvasEl.addEventListener('mousedown', startDraw);
    canvasEl.addEventListener('mousemove', draw);
    canvasEl.addEventListener('mouseup', stopDraw);
    canvasEl.addEventListener('mouseleave', stopDraw);
    canvasEl.addEventListener('touchstart', startDraw, { passive: false });
    canvasEl.addEventListener('touchmove', draw, { passive: false });
    canvasEl.addEventListener('touchend', stopDraw);
});
