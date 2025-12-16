$(document).ready(function() {
    // ==========================================
    // 1. 設定區
    // ==========================================
    const API_KEY = 'AIzaSyAmYjrMGHQCKq8BaCu_ak0aQTLufoBsKOE'; // ⚠️ 請確認這裡是你的最新 API Key
    const MODEL_NAME = 'gemini-2.5-flash'; // ⚠️ 確認使用 2.5 版本

    // 把原本的字串改成這個 JSON 結構的字串
    const RESUME_CONTEXT = `
        你現在是「吳晏均」個人網站的 AI 導覽員。
        你的任務是介紹吳晏均，讓面試官覺得他是個很棒的人才。
        
        
        【回答守則】
        1. 語氣要有禮貌、陽光、不卑不吭，偶爾可以用一點表情符號 😊。
        2. 使用繁體中文回答。
        3. 如果遇到不知道的問題，請回答：「這方面您可以直接聯繫晏均，讓他親自為您解答！」
        4. 回答盡量精簡有力，不要長篇大論，除非對方要求詳細說明。

        【詳細資料庫】
        {
            "基本資料": {
                "姓名": "吳晏均",
                "學校": "大學二年級，主修數位學習科技學系 (教育 + 科技的跨領域專才)",
                "人格特質": "擅長溝通、觀察力敏銳、具備領導力 (曾任吉他社幹部)、溫和且樂於合作",
                "聯絡方式": "Email: jason2005940318@gmail.com / 電話: 0926-147-755"
            },
            "技術能力": {
                "程式語言": ["Python (擅長邏輯運算)", "JavaScript (網頁互動)", "HTML/CSS (網頁切版)", "Scratch (兒童程式教育)"],
                "設計工具": ["Blender (3D建模與動畫)", "Canva/Photoshop (海報設計)"],
                "教學能力": "能夠將複雜的程式邏輯簡化，引導國小至國中學生除錯與思考。"
            },
            "工作與專案經歷": {
                "程式設計老師": "目前在職中。負責教授 Scratch, Python, JS。特色是能引導學生自己找出 Bug，而不只是給答案。",
                "Roblox 營隊講師": "暑期擔任國小 4~6 年級營隊講師，累積了控班與引發學生學習動機的經驗。",
                "學校行政工讀": "受聘於教務處，協助製作課程宣傳海報及維護後台系統，這培養了我的美感與細心度。"
            },
            "吉他與音樂": {
                "角色": "熱愛音樂的吉他手，高中與大學皆熱衷於吉他社活動。",
                "代表作1": "大學成發表演〈不愛自己了〉，擔任吉他伴奏。",
                "代表作2": "高中成發表演〈讓我為你唱情歌〉，展現舞台魅力。",
                "教學資源": "網站上有提供我整理的吉他教學筆記，例如和弦組成原理。"
            },
            "數位學習科技學系": {
                "創立時間": "93年8月",
                "特色": "全台首創結合教育與科技的跨領域學系，培養具備教育理論與科技應用能力的人才。",
                "課程範例": ["程式設計基礎", "教育心理學", "多媒體設計", "學習科技應用"],
                "未來發展": "畢業生可從事教育科技產品開發、數位內容設計、線上教學平台管理等工作。"
                "課程領域":"數位學習系統與數位學習內容",
                "核心能力":"教育理論與教學設計、程式設計與多媒體製作、學習科技應用與管理"

                },
            "常見面試題擬答": {
                "為什麼想做網頁?": "我認為網頁是資訊傳遞最直接的媒介。我喜歡將腦中的設計透過程式碼具現化的過程。",
                "你的優點是什麼?": "我不只懂技術，我更懂『人』。數位學習系的背景讓我懂得如何設計使用者體驗(UX)，而教學經驗讓我擅長溝通與團隊合作。",
                "未來規劃": "希望能成為一名全端工程師，並結合教育背景，開發出好用的教育科技產品。"
                "生涯發展容易誤解之處": "很多人以為數位學習系只能當老師，但事實上我們的跨領域訓練讓我們能勝任教育科技產業的多種角色，例如產品經理、UX設計師等。"
                }
        }
    `;

    // ==========================================
    // 2. 初始化介面
    // ==========================================
    const chatUI = `
        <button id="chat-toggle-btn">💬</button>
        <div id="chat-container">
            <div id="chat-header">
                <span>與我聊聊</span>
                <div class="header-actions">
                    <button id="clear-chat" title="刪除對話紀錄">🗑️</button>
                    <button id="close-chat" title="關閉">×</button>
                </div>
            </div>
            <div id="chat-messages">
                </div>
            <div id="chat-input-area">
                <input type="text" id="user-input" placeholder="輸入訊息...">
                <button id="send-btn">送出</button>
            </div>
        </div>
    `;
    
    if ($('#chat-container').length === 0) {
        $('body').append(chatUI);
    }

    // ★★★ 新增：讀取歷史紀錄 ★★★
    loadChatHistory();

    // ==========================================
    // 3. 事件監聽
    // ==========================================
    
    // 開關聊天室
    $('#chat-toggle-btn, #close-chat').off('click').on('click', function() {
        $('#chat-container').fadeToggle();
    });

    // ★★★ 新增：清除對話 ★★★
    $('#clear-chat').click(function() {
        if(confirm('確定要刪除所有對話紀錄嗎？')) {
            localStorage.removeItem('chat_history_jason'); // 清除儲存
            $('#chat-messages').empty(); // 清除畫面
            // 重新加入歡迎詞
            addMessage('哈囉！我是晏均的 AI 小幫手，關於他的經歷或作品，歡迎問我喔！', 'bot-message', false); 
        }
    });

    $('#send-btn').off('click').on('click', sendMessage);

    $('#user-input').off('keypress').on('keypress', function(e) {
        if (e.which == 13) sendMessage();
    });

    // ==========================================
    // 4. 核心邏輯
    // ==========================================

    async function sendMessage() {
        const userText = $('#user-input').val().trim();
        if (!userText) return;

        // 顯示並儲存使用者訊息
        addMessage(userText, 'user-message', true);
        $('#user-input').val(''); 
        $('#user-input').focus();
        
        // 顯示思考中 (不儲存到紀錄)
        const loadingId = addMessage('...', 'bot-message', false);

        try {
            const responseText = await callGeminiAPI(userText);
            
            // 移除思考中，顯示並儲存 AI 回覆
            $(`#${loadingId}`).remove(); // 先移除 "..."
            addMessage(responseText, 'bot-message', true); // 再新增正式回覆
            
        } catch (error) {
            $(`#${loadingId}`).text('系統發生錯誤，請稍後再試。');
        }
    }

    // 參數 saveToStorage 控制這則訊息要不要存起來 (思考中的 ... 就不存)
    function addMessage(text, className, saveToStorage = true) {
        const id = 'msg-' + Date.now();
        // 將 \n 換行符號轉為 HTML 的 <br>
        const formattedText = text.replace(/\n/g, '<br>');
        
        const msgHtml = `<div id="${id}" class="message ${className}">${formattedText}</div>`;
        $('#chat-messages').append(msgHtml);
        
        // ★★★ 自動捲動到最下方 ★★★
        scrollToBottom();

        // ★★★ 儲存到 LocalStorage ★★★
        if (saveToStorage) {
            saveChatHistory(text, className);
        }
        
        return id;
    }

    function scrollToBottom() {
        const chatBox = $('#chat-messages');
        // 使用 animate 讓捲動滑順一點，直接跳轉可以用 scrollTop(chatBox[0].scrollHeight)
        chatBox.scrollTop(chatBox[0].scrollHeight);
    }

    function saveChatHistory(text, className) {
        let history = JSON.parse(localStorage.getItem('chat_history_jason')) || [];
        history.push({ text: text, class: className });
        localStorage.setItem('chat_history_jason', JSON.stringify(history));
    }

    function loadChatHistory() {
        let history = JSON.parse(localStorage.getItem('chat_history_jason'));
        
        if (history && history.length > 0) {
            history.forEach(msg => {
                // 讀取紀錄時，saveToStorage 設為 false 避免重複儲存
                addMessage(msg.text, msg.class, false);
            });
        } else {
            // 如果沒紀錄，顯示預設歡迎詞 (不存入歷史，這樣使用者一刪除就會看到這個)
            addMessage('哈囉！我是晏均的 AI 小幫手，關於他的經歷或作品，歡迎問我喔！', 'bot-message', false);
        }
    }

    async function callGeminiAPI(userMessage) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
        
        const payload = {
            contents: [{
                parts: [{
                    text: RESUME_CONTEXT + "\n\n訪客問題：" + userMessage
                }]
            }]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('API Error');

        const data = await response.json();
        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "AI 沒有回傳內容。";
        }
    }
});