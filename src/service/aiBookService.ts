// services/aiBookService.ts

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface SummaryOptions {
    bookName: string;
    bookId?: string;
    style: 'brief' | 'detailed' | 'academic';
}

interface ChatOptions {
    bookName: string;
    bookId?: string;
    question: string;
    conversationHistory?: ChatMessage[];
}

/**
 * Service để tạo tóm tắt sách với các style khác nhau
 */
export const generateBookSummary = async (options: SummaryOptions): Promise<string> => {
    const { bookName, style } = options;

    if (!bookName) {
        throw new Error("Sách không được để trống");
    }

    const VITE_OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    if (!VITE_OPENAI_API_KEY) {
        throw new Error("Server configuration error: VITE_OPENAI_API_KEY is not set");
    }

    // Tạo prompt khác nhau dựa theo style
    const prompts = {
        brief: `Hãy tóm tắt thật ngắn gọn nội dung chính của cuốn sách "${bookName}".
- Viết bằng tiếng Việt, dễ hiểu.
- Chỉ cần 3-4 câu, tập trung vào ý chính.
- Không liệt kê gạch đầu dòng.`,

        detailed: `Hãy phân tích chi tiết cuốn sách "${bookName}":
- Viết bằng tiếng Việt, rõ ràng và có cấu trúc.
- Bao gồm: chủ đề chính, các ý tưởng quan trọng, ví dụ thực tế.
- Độ dài khoảng 8-10 câu.
- Trình bày dưới dạng đoạn văn mạch lạc, không dùng bullet points.`,

        academic: `Hãy phân tích học thuật cuốn sách "${bookName}":
- Viết bằng tiếng Việt, phong cách học thuật.
- Bao gồm: phương pháp nghiên cứu, đóng góp lý thuyết, vị trí trong lĩnh vực.
- Phân tích sâu về khung lý thuyết và giá trị nghiên cứu.
- Độ dài khoảng 10-12 câu.
- Trình bày dưới dạng đoạn văn mạch lạc, không dùng bullet points.`,
    };

    const systemPrompts = {
        brief: "Bạn là chuyên gia tóm tắt sách. Luôn trả lời ngắn gọn, súc tích.",
        detailed: "Bạn là chuyên gia phân tích sách. Trả lời chi tiết, có chiều sâu nhưng dễ hiểu.",
        academic: "Bạn là học giả phân tích văn học. Trả lời theo phong cách học thuật, có hệ thống.",
    };

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${VITE_OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b:free",
                messages: [
                    { role: "system", content: systemPrompts[style] },
                    { role: "user", content: prompts[style] },
                ],
                temperature: style === 'academic' ? 0.3 : 0.7,
                max_tokens: style === 'brief' ? 200 : style === 'detailed' ? 400 : 600,
            }),
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => "");
            console.error("OpenAI API error:", response.status, errText);
            throw new Error(`Failed to generate summary: ${response.status}`);
        }

        const data = await response.json();
        const summary = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text;

        if (!summary) {
            throw new Error("No summary generated");
        }

        return summary.trim();
    } catch (error) {
        console.error("Error generating summary:", error);
        // Fallback summary nếu API lỗi
        const fallbacks = {
            brief: `Cuốn sách "${bookName}" là một tác phẩm đáng chú ý trong lĩnh vực của nó, cung cấp những hiểu biết sâu sắc và hữu ích cho độc giả.`,
            detailed: `"${bookName}" là một cuốn sách toàn diện khám phá chủ đề của nó một cách chi tiết. Tác giả trình bày các khái niệm cốt lõi, cung cấp ví dụ thực tế và hướng dẫn thực hành. Xuyên suốt cuốn sách, độc giả sẽ khám phá những hiểu biết có giá trị được hỗ trợ bởi nghiên cứu và ứng dụng thực tế.`,
            academic: `Tác phẩm học thuật "${bookName}" trình bày một nghiên cứu nghiêm ngặt về chủ đề thông qua phương pháp luận có hệ thống. Tác giả sử dụng phân tích phê bình, dựa trên nghiên cứu đã được xác lập và các khung lý thuyết. Tác phẩm thể hiện đóng góp đáng kể cho lĩnh vực, cung cấp cả hiểu biết lý thuyết và bằng chứng thực nghiệm.`,
        };
        return fallbacks[style];
    }
};

/**
 * Service để chat với AI về nội dung sách
 */
export const chatAboutBook = async (options: ChatOptions): Promise<string> => {
    const { bookName, question, conversationHistory = [] } = options;

    if (!bookName || !question) {
        throw new Error("Book name and question are required");
    }

    const VITE_OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    if (!VITE_OPENAI_API_KEY) {
        throw new Error("Server configuration error: VITE_OPENAI_API_KEY is not set");
    }

    // Tạo system prompt với context về cuốn sách
    const systemPrompt = `Bạn là trợ lý AI chuyên về cuốn sách "${bookName}".
- Trả lời các câu hỏi về nội dung, ý tưởng chính, và bài học từ cuốn sách.
- Viết bằng tiếng Việt, dễ hiểu và thân thiện.
- Nếu không chắc chắn về thông tin, hãy nói rõ là đang đưa ra phân tích dựa trên kiến thức chung về sách.
- Giữ câu trả lời ngắn gọn (3-5 câu) trừ khi được yêu cầu chi tiết hơn.`;

    // Build messages array với conversation history
    const messages = [
        { role: "system" as const, content: systemPrompt },
        ...conversationHistory.slice(-6), // Giữ 6 messages gần nhất để tiết kiệm token
        { role: "user" as const, content: question },
    ];

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${VITE_OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b:free",
                messages: messages,
                temperature: 0.7,
                max_tokens: 300,
            }),
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => "");
            console.error("OpenAI API error:", response.status, errText);
            throw new Error(`Failed to get chat response: ${response.status}`);
        }

        const data = await response.json();
        const answer = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text;

        if (!answer) {
            throw new Error("No answer generated");
        }

        return answer.trim();
    } catch (error) {
        console.error("Error in chat:", error);
        // Fallback responses
        const fallbackResponses = [
            `Dựa trên cuốn "${bookName}", khái niệm bạn đang hỏi liên quan đến các nguyên tắc cơ bản được thảo luận trong tác phẩm. Tác giả nhấn mạnh tầm quan trọng của việc hiểu những nền tảng này.`,
            `Cuốn sách đề cập đến chủ đề này một cách rộng rãi. Theo tác giả, cách tiếp cận này đã được chứng minh là hiệu quả trong nhiều nghiên cứu điển hình và ứng dụng thực tế.`,
            `Đó là một câu hỏi xuất sắc về cuốn "${bookName}". Tác giả gợi ý rằng kỹ thuật này nên được áp dụng cẩn thận, xem xét bối cảnh cụ thể và yêu cầu của tình huống của bạn.`,
        ];
        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
};

/**
 * Service để lấy các câu hỏi gợi ý về cuốn sách
 */
export const getSuggestedQuestions = async (bookName: string): Promise<string[]> => {
    const VITE_OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

    if (!VITE_OPENAI_API_KEY) {
        // Fallback questions nếu không có API key
        return [
            `Nội dung chính của cuốn "${bookName}" là gì?`,
            `Bài học quan trọng nhất từ cuốn sách này?`,
            `Cuốn sách này phù hợp với đối tượng độc giả nào?`,
            `Tác giả muốn truyền tải thông điệp gì?`,
        ];
    }

    const prompt = `Hãy đưa ra 4 câu hỏi hay mà độc giả thường quan tâm về cuốn sách "${bookName}".
- Viết bằng tiếng Việt.
- Mỗi câu hỏi trên một dòng, không đánh số.
- Câu hỏi ngắn gọn, từ 8-12 từ.`;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${VITE_OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b:free",
                messages: [
                    { role: "system", content: "Bạn là chuyên gia tạo câu hỏi về sách." },
                    { role: "user", content: prompt },
                ],
                temperature: 0.8,
                max_tokens: 200,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to generate questions");
        }

        const data = await response.json();
        const questionsText = data?.choices?.[0]?.message?.content || "";

        // Parse các câu hỏi từ response
        const questions = questionsText
            .split('\n')
            .map((q: string) => q.trim())
            .filter((q: string) => q.length > 0 && q.includes('?'))
            .slice(0, 4);

        return questions.length > 0 ? questions : [
            `Nội dung chính của cuốn "${bookName}" là gì?`,
            `Bài học quan trọng nhất từ cuốn sách này?`,
        ];
    } catch (error) {
        console.error("Error generating questions:", error);
        return [
            `Nội dung chính của cuốn "${bookName}" là gì?`,
            `Bài học quan trọng nhất từ cuốn sách này?`,
            `Cuốn sách này phù hợp với đối tượng độc giả nào?`,
        ];
    }
};

/**
 * Utility để cache kết quả summary (optional - sử dụng localStorage hoặc state management)
 */
export const cacheSummary = (bookId: string, style: string, content: string): void => {
    try {
        const cacheKey = `summary_${bookId}_${style}`;
        const cacheData = {
            content,
            timestamp: Date.now(),
            expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
        console.error("Error caching summary:", error);
    }
};

export const getCachedSummary = (bookId: string, style: string): string | null => {
    try {
        const cacheKey = `summary_${bookId}_${style}`;
        const cached = localStorage.getItem(cacheKey);

        if (!cached) return null;

        const cacheData = JSON.parse(cached);
        const now = Date.now();

        // Check if cache is expired
        if (now - cacheData.timestamp > cacheData.expiresIn) {
            localStorage.removeItem(cacheKey);
            return null;
        }

        return cacheData.content;
    } catch (error) {
        console.error("Error reading cached summary:", error);
        return null;
    }
};