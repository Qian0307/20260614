import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `你是《歌劇魅影》互動小說的全知敘事者，用繁體中文進行，語氣帶有19世紀巴黎歌劇院的古典戲劇氛圍。

【玩家角色設定】
玩家扮演巴黎歌劇院一位不起眼的芭雷舞女伶，名字由玩家自定（若玩家未說名字，就以「你」稱呼）。
- 是克里斯汀·達厄的朋友，關係親近但不如梅格·吉里那麼顯眼
- 熱愛唱歌，但天生嗓音低沉，音域有限，無法像女高音那樣飆高音
- 一直找不到願意認真指導她的聲樂老師——因為她的嗓音類型在歌劇院並不受重視
- 在芭蕾團裡屬於群舞，沒有獨舞機會，幾乎沒人注意她

【故事起點】
今晚，克里斯汀剛剛悄悄把你拉到角落，告訴你她有個「音樂天使」在秘密指導她唱歌。

【你的任務】
- 以沉浸式、戲劇性的語氣推動劇情，忠實呈現原著人物（克里斯汀、梅格、吉里夫人、魅影、卡洛塔、拉烏爾等）
- 根據玩家的選擇自然推進劇情，克里斯汀是故事核心，玩家是觀察者與參與者
- 偶爾製造與玩家嗓音有關的情境（例如有人聽到她哼歌、某個角落有神秘的音樂飄來）
- 保持懸疑氛圍，魅影的存在要始終神秘而令人不安
- 每次回應結尾留白，讓玩家自由決定下一步行動，不要列出固定選項

【回應格式】每次回應包含：
✦ 場景氣氛描述（簡短，用括號或星號標示環境感）
✦ 角色對話與動作
✦ 以「你……」開頭收尾，描述玩家當下的處境或感受，暗示她可以做什麼，但不強制

語言：繁體中文。氛圍：古典、戲劇、懸疑、略帶哀愁。`;

const OPENING_MESSAGE = `*燭火在後台走廊的鐵架上搖曳，散出微弱的金光。今晚的《漢尼拔》彩排剛剛結束，芭蕾女伶們三三兩兩地脫下舞鞋，笑鬧著散去。*

走廊盡頭，克里斯汀·達厄輕輕拉住了你的袖子。

她的眼睛亮得不像話——那種亮不是興奮，更像是驚喜還沒消化完，還有點……害怕？

「我得告訴你一件事。」她壓低聲音，往兩側瞥了一眼，確認沒人聽見，「你知道……你知道父親去世前答應過我的事嗎？說他會從天堂送來一位音樂天使——」

她停頓了一下，抿了抿唇。

「他來了。」

走廊某處，一個門軸發出低沉的吱呀聲。你們兩個都沒動。

你握著手裡還沒換下的舞鞋，望著克里斯汀那張認真到有些讓你擔憂的臉。`;

// ── API Key 入場畫面 ──────────────────────────────────────────
function ApiKeyGate({ onEnter }) {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmed = key.trim();
    if (!trimmed.startsWith("sk-ant-")) {
      setError("Key 格式不符，Anthropic API Key 應以 sk-ant- 開頭");
      return;
    }
    onEnter(trimmed);
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#080608",
      backgroundImage: `
        radial-gradient(ellipse at 50% 0%, #1a0e0a 0%, transparent 60%),
        radial-gradient(ellipse at 20% 100%, #0e0a14 0%, transparent 50%)
      `,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#e8dcc8",
      padding: "24px"
    }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: 6, color: "#7a6040", textTransform: "uppercase", marginBottom: 10 }}>
          巴黎歌劇院 · 1881
        </div>
        <h1 style={{
          margin: 0,
          fontSize: "clamp(22px, 5vw, 34px)",
          fontWeight: 400,
          letterSpacing: 3,
          color: "#c9a84c",
          textShadow: "0 0 40px rgba(201,168,76,0.3)"
        }}>歌劇魅影</h1>
        <div style={{ fontSize: 12, color: "#5a4a36", marginTop: 6, letterSpacing: 2 }}>✦ 互動敘事 ✦</div>
      </div>

      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "linear-gradient(160deg, #0e0a08, #120c0a)",
        border: "1px solid #2a1e12",
        borderRadius: 6,
        padding: "32px 28px"
      }}>
        <div style={{ fontSize: 13, color: "#8a7050", letterSpacing: 1, marginBottom: 6 }}>
          *後台入口處，一張泛黃的紙條貼在門上……*
        </div>
        <p style={{ color: "#c8baa0", lineHeight: 1.8, fontSize: 14, marginTop: 0 }}>
          入場需持有 <span style={{ color: "#c9a84c" }}>Anthropic API Key</span>。<br />
          Key 僅存於你的瀏覽器，不會傳送至任何第三方。
        </p>

        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 10, color: "#4a3820", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>
            API Key
          </div>
          <div style={{ position: "relative" }}>
            <input
              type={show ? "text" : "password"}
              value={key}
              onChange={e => { setKey(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="sk-ant-api03-..."
              style={{
                width: "100%",
                background: "#0a0806",
                border: "1px solid #2a1e12",
                borderRadius: 4,
                color: "#c8baa0",
                fontSize: 13,
                fontFamily: "monospace",
                padding: "11px 44px 11px 12px",
                outline: "none",
                boxSizing: "border-box",
                letterSpacing: 1
              }}
            />
            <button
              onClick={() => setShow(s => !s)}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", color: "#5a4030", cursor: "pointer",
                fontSize: 13, padding: 0
              }}
            >{show ? "隱藏" : "顯示"}</button>
          </div>
          {error && (
            <div style={{ color: "#9a4030", fontSize: 12, marginTop: 6 }}>{error}</div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!key.trim()}
          style={{
            marginTop: 20,
            width: "100%",
            padding: "12px",
            background: key.trim()
              ? "linear-gradient(135deg, #2a1c08, #3a2810)"
              : "#110d08",
            border: "1px solid",
            borderColor: key.trim() ? "#5a3c18" : "#1e1608",
            borderRadius: 4,
            color: key.trim() ? "#c9a84c" : "#3a2c18",
            fontSize: 14,
            fontFamily: "Georgia, serif",
            letterSpacing: 2,
            cursor: key.trim() ? "pointer" : "not-allowed",
            transition: "all 0.2s"
          }}
        >
          入場 ✦
        </button>

        <div style={{ marginTop: 16, fontSize: 11, color: "#3a2a18", lineHeight: 1.6 }}>
          尚無 API Key？前往{" "}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#6a5030" }}
          >
            console.anthropic.com
          </a>{" "}
          建立。
        </div>
      </div>

      <style>{`* { box-sizing: border-box; }`}</style>
    </div>
  );
}

// ── 主遊戲畫面 ───────────────────────────────────────────────
export default function App() {
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem("phantom_key") || "");
  const [messages, setMessages] = useState([
    { role: "assistant", content: OPENING_MESSAGE }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleEnter = (key) => {
    sessionStorage.setItem("phantom_key", key);
    setApiKey(key);
  };

  const handleClearKey = () => {
    sessionStorage.removeItem("phantom_key");
    setApiKey("");
    setMessages([{ role: "assistant", content: OPENING_MESSAGE }]);
  };

  const sendMessage = async () => {
    const userText = input.trim();
    if (!userText || loading) return;

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (response.status === 401) {
        sessionStorage.removeItem("phantom_key");
        setApiKey("");
        setMessages(prev => [...prev, { role: "assistant", content: "（API Key 驗證失敗，請重新輸入。）" }]);
        return;
      }

      const data = await response.json();
      const reply = data.content?.map(b => b.text || "").join("") || "（敘事者沉默了……）";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "（燭火熄滅了一瞬——連接中斷，請再試一次。）" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatContent = (text) => {
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, i) =>
      part.startsWith("*") && part.endsWith("*")
        ? <em key={i} style={{ color: "#b8956a", fontStyle: "italic" }}>{part.slice(1, -1)}</em>
        : <span key={i}>{part}</span>
    );
  };

  if (!apiKey) return <ApiKeyGate onEnter={handleEnter} />;

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#080608",
      backgroundImage: `
        radial-gradient(ellipse at 50% 0%, #1a0e0a 0%, transparent 60%),
        radial-gradient(ellipse at 20% 100%, #0e0a14 0%, transparent 50%)
      `,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#e8dcc8"
    }}>
      {/* Header */}
      <div style={{
        width: "100%",
        maxWidth: 720,
        padding: "32px 24px 16px",
        textAlign: "center",
        borderBottom: "1px solid #2a1f14",
        position: "relative"
      }}>
        <div style={{ fontSize: 11, letterSpacing: 6, color: "#7a6040", textTransform: "uppercase", marginBottom: 8 }}>
          巴黎歌劇院 · 1881
        </div>
        <h1 style={{
          margin: 0,
          fontSize: "clamp(22px, 5vw, 34px)",
          fontWeight: 400,
          letterSpacing: 3,
          color: "#c9a84c",
          textShadow: "0 0 40px rgba(201,168,76,0.3)"
        }}>
          歌劇魅影
        </h1>
        <div style={{ fontSize: 12, color: "#5a4a36", marginTop: 6, letterSpacing: 2 }}>
          ✦ 互動敘事 ✦
        </div>
        {/* 離場按鈕 */}
        <button
          onClick={handleClearKey}
          title="清除 API Key 並重新開始"
          style={{
            position: "absolute", top: 28, right: 24,
            background: "none", border: "1px solid #2a1e12",
            borderRadius: 3, color: "#4a3820", fontSize: 11,
            padding: "4px 10px", cursor: "pointer", letterSpacing: 1,
            fontFamily: "Georgia, serif"
          }}
        >離場</button>
      </div>

      {/* Story log */}
      <div style={{
        flex: 1,
        width: "100%",
        maxWidth: 720,
        padding: "0 24px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 0
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            padding: "24px 0",
            borderBottom: "1px solid #18120c",
            display: "flex",
            gap: 16,
            alignItems: "flex-start"
          }}>
            {msg.role === "assistant" ? (
              <>
                <div style={{
                  flexShrink: 0, width: 28, height: 28, borderRadius: "50%",
                  background: "linear-gradient(135deg, #2a1a08, #1a0e04)",
                  border: "1px solid #3a2810",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, color: "#c9a84c", marginTop: 2
                }}>✦</div>
                <div style={{
                  flex: 1, lineHeight: 1.85, fontSize: 15, color: "#ddd0b8", whiteSpace: "pre-wrap"
                }}>
                  {formatContent(msg.content)}
                </div>
              </>
            ) : (
              <>
                <div style={{
                  flexShrink: 0, width: 28, height: 28, borderRadius: "50%",
                  background: "linear-gradient(135deg, #0e1420, #080e18)",
                  border: "1px solid #1e2a3a",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, color: "#8aabcc", marginTop: 2
                }}>你</div>
                <div style={{
                  flex: 1, lineHeight: 1.85, fontSize: 15, color: "#a8bfd4",
                  fontStyle: "italic", whiteSpace: "pre-wrap"
                }}>
                  {msg.content}
                </div>
              </>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ padding: "24px 0", display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{
              flexShrink: 0, width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg, #2a1a08, #1a0e04)",
              border: "1px solid #3a2810",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, color: "#c9a84c"
            }}>✦</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: "50%",
                  backgroundColor: "#c9a84c", opacity: 0.4,
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{
        width: "100%",
        maxWidth: 720,
        padding: "16px 24px 28px",
        borderTop: "1px solid #2a1f14"
      }}>
        <div style={{ fontSize: 10, color: "#4a3820", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>
          你的行動或回應
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="輸入你的回應、對話或行動……"
            rows={2}
            style={{
              flex: 1,
              background: "#0e0a08",
              border: "1px solid #2a1e12",
              borderRadius: 4,
              color: "#c8baa0",
              fontSize: 14,
              fontFamily: "Georgia, serif",
              padding: "12px 14px",
              resize: "none",
              outline: "none",
              lineHeight: 1.6,
              caretColor: "#c9a84c",
              transition: "border-color 0.2s"
            }}
            onFocus={e => e.target.style.borderColor = "#4a3010"}
            onBlur={e => e.target.style.borderColor = "#2a1e12"}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim()
                ? "#1a1208"
                : "linear-gradient(135deg, #2a1c08, #3a2810)",
              border: "1px solid",
              borderColor: loading || !input.trim() ? "#1e1608" : "#5a3c18",
              borderRadius: 4,
              color: loading || !input.trim() ? "#3a2c18" : "#c9a84c",
              fontSize: 18,
              width: 44,
              height: 44,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "all 0.2s"
            }}
          >↑</button>
        </div>
        <div style={{ fontSize: 10, color: "#3a2a18", marginTop: 8, letterSpacing: 1 }}>
          Enter 送出　·　Shift+Enter 換行
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.9; transform: scale(1); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0806; }
        ::-webkit-scrollbar-thumb { background: #2a1e10; border-radius: 2px; }
      `}</style>
    </div>
  );
}
