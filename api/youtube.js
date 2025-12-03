// api-youtube.js

// 💡 ดึง API Key จาก Vercel Environment Variables
const API_KEY = process.env.YOUTUBE_API_KEY; 

export default async function handler(req, res) {
    // ✅ ตรวจสอบ Origin ว่ามาจากเว็บที่อนุญาตเท่านั้น
    const allowedOrigin = "krobjang.vercel.app";
    const origin = req.headers.origin || req.headers.host || "";

    if (!origin.includes(allowedOrigin)) {
        return res.status(403).json({ error: "Forbidden: Invalid origin" });
    }

    // กำหนดค่าเริ่มต้นสำหรับหัวข้อ
    let searchQuery = req.query.q || 'trending in thailand'; // รับค่า q จาก client
    
    // 1. ตรวจสอบ API Key (สำคัญ)
    if (!API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: YOUTUBE_API_KEY is not set.' });
    }

    // 2. สร้าง URL สำหรับเรียก YouTube API
    const maxResults = 10;
    const YOUTUBE_URL = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&q=${encodeURIComponent(searchQuery)}&part=snippet&order=relevance&maxResults=${maxResults}&type=video`;

    try {
        // 3. เรียก YouTube API จาก Server-Side
        const youtubeResponse = await fetch(YOUTUBE_URL);
        const data = await youtubeResponse.json();

        // 4. จัดการ Error จาก YouTube 
        if (data.error) {
            console.error('YouTube API Error:', data.error.message);
            return res.status(youtubeResponse.status).json({ 
                error: 'Failed to fetch videos from YouTube.', 
                details: data.error.message 
            });
        }
        
        // 5. ส่งข้อมูลวิดีโอ (ที่ปลอดภัย) กลับไปให้ Client
        res.status(200).json(data.items);

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
}
