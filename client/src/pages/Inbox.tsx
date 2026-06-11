import { useEffect, useState } from "react";

export default function Inbox() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    const res = await fetch("http://localhost:5000/conversations");
    const data = await res.json();

    if (data.success) {
      setConversations(data.conversations);
    }
  }

  async function openConversation(id: string) {
    const res = await fetch(
      `http://localhost:5000/conversations/${id}/messages`
    );

    const data = await res.json();

    if (data.success) {
      setSelected(id);
      setMessages(data.messages);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#111417",
        color: "#fff",
      }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          width: 320,
          borderRight: "1px solid #323538",
          overflowY: "auto",
        }}
      >
        <h2
          style={{
            padding: 20,
            color: "#4ff07f",
            fontFamily: "Sora",
          }}
        >
          Inbox
        </h2>

        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => openConversation(conv.id)}
            style={{
              padding: 16,
              cursor: "pointer",
              borderBottom: "1px solid #272a2e",
            }}
          >
            <strong>
              {conv.contact?.name || conv.contact?.phone}
            </strong>

            <br />

            <small
              style={{
                color: "#869584",
              }}
            >
              {conv.contact?.phone}
            </small>
          </div>
        ))}
      </div>

      {/* CHAT AREA */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: 20,
            borderBottom: "1px solid #323538",
          }}
        >
          <h3>Conversation</h3>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 20,
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent:
                  msg.direction === "outgoing"
                    ? "flex-end"
                    : "flex-start",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  background:
                    msg.direction === "outgoing"
                      ? "#25d366"
                      : "#272a2e",
                  color:
                    msg.direction === "outgoing"
                      ? "#000"
                      : "#fff",
                  padding: "12px 16px",
                  borderRadius: 12,
                  maxWidth: 350,
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}