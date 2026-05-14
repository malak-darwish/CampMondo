import { useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .page-root {
    min-height: 100vh;
    background: #f5f0e8;
    font-family: 'Inter', sans-serif;
  }

  .page-body {
    padding: 40px 48px;
  }

  .page-title {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    color: #2c1810;
  }

  .page-sub {
    font-size: 13px;
    color: #8a7a65;
    margin-top: 4px;
    margin-bottom: 30px;
  }

  .assistant-layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 24px;
  }

  .suggestions-panel,
  .chat-panel {
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-radius: 16px;
    padding: 24px;
  }

  .panel-title {
    font-size: 14px;
    font-weight: 600;
    color: #2c1810;
    margin-bottom: 18px;
  }

  .suggestion-btn {
    width: 100%;
    text-align: left;
    padding: 13px 15px;
    margin-bottom: 10px;
    border-radius: 10px;
    border: 1px solid #e8d5b5;
    background: #fdf8f0;
    cursor: pointer;
    transition: all 0.15s;
    font-size: 13px;
    color: #5a4a35;
  }

  .suggestion-btn:hover {
    background: #f5efe3;
    border-color: #d8c19a;
  }

  .chat-box {
    min-height: 220px;
  }

  .input-row {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }

  .chat-input {
    flex: 1;
    padding: 14px;
    border-radius: 10px;
    border: 1.5px solid #e0d0b8;
    background: #fdf8f0;
    font-size: 13px;
    outline: none;
  }

  .chat-input:focus {
    border-color: #3d6b45;
    background: #fff;
  }

  .send-btn {
    padding: 0 22px;
    border-radius: 10px;
    border: none;
    background: #3d6b45;
    color: white;
    font-weight: 600;
    cursor: pointer;
  }

  .send-btn:hover {
    background: #2c4a2e;
  }

  .activity-card {
    background: #fdf8f0;
    border: 1px solid #eadcc3;
    border-radius: 14px;
    padding: 22px;
  }

  .activity-title {
    font-size: 22px;
    color: #2c1810;
    font-family: 'Playfair Display', serif;
    margin-bottom: 16px;
  }

  .activity-meta {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .meta-badge {
    background: #e8f5e9;
    color: #2e7d32;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
  }

  .section {
    margin-bottom: 18px;
  }

  .section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    color: #8a7a65;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .list {
    padding-left: 18px;
    color: #5a4a35;
    font-size: 13px;
    line-height: 1.7;
  }

  .loading {
    color: #8a7a65;
    font-size: 13px;
  }

  .chat-box {
    display: flex;
    flex-direction: column;
    gap: 18px;
    max-height: 70vh;
    overflow-y: auto;
    padding-right: 6px;
}

.user-message {
    display: flex;
    justify-content: flex-end;
}

.ai-message {
    display: flex;
    justify-content: flex-start;
}

.user-bubble {
    background: #3d6b45;
    color: white;
    padding: 13px 16px;
    border-radius: 18px 18px 4px 18px;
    max-width: 70%;
    font-size: 13px;
    line-height: 1.5;
}

.clear-btn {
    margin-bottom: 20px;
    background: transparent;
    border: 1px solid #d6c2a0;
    color: #7a664f;
    padding: 8px 14px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 12px;
}

.clear-btn:hover {
    background: #f5efe3;
}
`

export default function AIAssistant() {

    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [messages, setMessages] = useState([])

    const suggestions = [
        'Generate a rainy-day activity for children',
        'Create a pirate-themed camp game',
        'Suggest a STEM workshop for teenagers',
        'Generate a low-budget outdoor activity',
    ]

    const sendMessage = async (prompt = message) => {

    if (!prompt.trim()) return

    const userMessage = {
        sender: 'user',
        text: prompt
    }

    setMessages(prev => [...prev, userMessage])

    setLoading(true)

    try {

        const res = await api.post(
            '/chatbot/chat',
            {
                message: prompt
            }
        )

        const aiMessage = {
            sender: 'ai',
            activity: res.data
        }

        setMessages(prev => [
            ...prev,
            aiMessage
        ])

    } catch (err) {
        console.error(err)
    } finally {
        setLoading(false)
        setMessage('')
    }
}

    return (
        <>
            <style>{styles}</style>

            <div className="page-root">
                <Navbar />

                <div className="page-body">

                    <div className="page-title">
                        CampMondo Assistant
                    </div>

                    <button
                        className="clear-btn"
                        onClick={() => setMessages([])}
                    >
                        Clear Conversation
                    </button>

                    <div className="page-sub">
                        AI-powered activity and camp planning assistant
                    </div>

                    <div className="assistant-layout">

                        <div className="suggestions-panel">

                            <div className="panel-title">
                                Quick Prompts
                            </div>

                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    className="suggestion-btn"
                                    onClick={() => {
                                        setMessage(s)
                                        sendMessage(s)
                                    }}
                                >
                                    {s}
                                </button>
                            ))}

                        </div>

                        <div className="chat-panel">

                            <div className="panel-title">
                                Activity Generator
                            </div>

                            <div className="chat-box">

                                {messages.length === 0 && (
                                    <div className="loading">
                                        Start a conversation with CampMondo Assistant.
                                    </div>
                                )}

                                {messages.map((msg, index) => (

                                    <div
                                        key={index}
                                        className={
                                            msg.sender === 'user'
                                                ? 'user-message'
                                                : 'ai-message'
                                        }
                                    >

                                        {msg.sender === 'user' ? (

                                            <div className="user-bubble">
                                                {msg.text}
                                            </div>

                                        ) : (

                                            <div className="activity-card">

                                                <div className="activity-title">
                                                    {msg.activity.title}
                                                </div>

                                                <div className="activity-meta">

                                                    <div className="meta-badge">
                                                        {msg.activity.age_group}
                                                    </div>

                                                    <div className="meta-badge">
                                                        {msg.activity.duration}
                                                    </div>

                                                </div>

                                                <div className="section">
                                                    <div className="section-label">
                                                        Materials
                                                    </div>

                                                    <ul className="list">
                                                        {msg.activity.materials?.map((m, i) => (
                                                            <li key={i}>{m}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="section">
                                                    <div className="section-label">
                                                        Instructions
                                                    </div>

                                                    <ol className="list">
                                                        {msg.activity.instructions?.map((m, i) => (
                                                            <li key={i}>{m}</li>
                                                        ))}
                                                    </ol>
                                                </div>

                                                <div className="section">
                                                    <div className="section-label">
                                                        Safety Notes
                                                    </div>

                                                    <ul className="list">
                                                        {msg.activity.safety_notes?.map((m, i) => (
                                                            <li key={i}>{m}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                            </div>

                                        )}

                                    </div>

                                ))}

                                {loading && (
                                    <div className="loading">
                                        CampMondo Assistant is thinking...
                                    </div>
                                )}

                            </div>

                            <div className="input-row">

                                <input
                                    className="chat-input"
                                    placeholder="Describe the activity you want..."
                                    value={message}
                                    onChange={(e) =>
                                        setMessage(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter'&& !loading) {
                                            sendMessage()
                                        }
                                    }}
                                />

                                <button
                                    className="send-btn"
                                    onClick={() => sendMessage()}
                                >
                                    Generate
                                </button>

                            </div>

                        </div>

                    </div>

                </div>
            </div>
        </>
    )
}