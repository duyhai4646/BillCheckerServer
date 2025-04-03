require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Hỗ trợ đọc JSON body từ request

app.get("/fetch_billing", async (req, res) => {
    try {
        // Nhận cookie từ request header
        if (!req.query.coo) {
            return res.status(400).json({ error: "Cookie is required" });
        }
        const decodedCookie = decodeURIComponent(req.query.coo); // Giải mã cookie

        // Tính toán thời gian
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const order_completed_end_time = Math.floor(todayStart.getTime() / 1000);
        const order_completed_start_time = order_completed_end_time - 86400 * 90; // 90 ngày

        // URL API Shopee
        const url = "https://affiliate.shopee.vn/api/v1/payment/billing_list";

        // Headers
        const headers = {
            "accept": "application/json, text/plain, */*",
            "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
            "affiliate-program-type": "1",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Chromium\";v=\"134\", \"Not:A-Brand\";v=\"24\", \"Google Chrome\";v=\"134\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "Referer": "https://affiliate.shopee.vn/payment/billing",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "cookie": decodedCookie // Nhận cookie từ request client
        };

        // Gửi request đến Shopee
        const response = await axios.get(url, {
            headers, params: {
                order_completed_start_time,
                order_completed_end_time
            }
        });

        // Trả về dữ liệu
        res.json(response.data);
    } catch (error) {
        console.error("Lỗi gọi API Shopee:", error.message);
        res.status(500).json({ error: "Không thể lấy dữ liệu từ Shopee" });
    }
});

// Chạy server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server đang chạy tại http://127.0.0.1:${PORT}`);
});
