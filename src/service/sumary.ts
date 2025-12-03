export const getSumaryBook = async (bookName: string) => {
    if (!bookName) {
        throw new Error("Book name is required");
    }
    const VITE_OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    if (!VITE_OPENAI_API_KEY) {
        throw new Error("Server configuration error: VITE_OPENAI_API_KEY is not set");
    }

    // Prompt tóm tắt NGẮN
    const prompt = `Hãy tóm tắt thật ngắn gọn nội dung chính của cuốn sách "${bookName}".
- Viết bằng tiếng Việt, dễ hiểu.
- Chỉ cần 2–3 câu, không liệt kê gạch đầu dòng.
- Tập trung vào ý chính, không phân tích chi tiết.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: "openai/gpt-oss-20b:free",
            messages: [
                { role: "system", content: "Bạn là chuyên gia phân tích và tóm tắt sách. Luôn trả lời rất ngắn gọn." },
                { role: "user", content: prompt },
            ],
            reasoning: { enabled: true },
        }),
    });

    if (!response.ok) {
        const errText = await response.text().catch(() => "");
        console.error("OpenAI API error:", response.status, errText);
        return `Cuốn sách "${bookName}" là một tác phẩm đáng chú ý.`;
    }

    const data = await response.json().catch(() => ({} as any));
    const summary =
        (data?.choices && data.choices[0] && (data.choices[0].message?.content ?? data.choices[0].text)) ||
        `Không có bản tóm tắt nào cho "${bookName}".`;

    return summary;
};
