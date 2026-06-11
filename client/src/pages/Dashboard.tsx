import { useEffect, useState } from "react";
import { LogOut, Users, MessageSquare, Bot, Send } from "lucide-react";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [stats, setStats] = useState({
    contacts: 0,
    campaigns: 0,
    conversations: 0,
    agents: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const contactsRes = await fetch("http://localhost:5000/contacts");

      const contactsData = await contactsRes.json();

      const campaignsRes = await fetch("http://localhost:5000/campaigns");

      const campaignsData = await campaignsRes.json();

      setStats({
        contacts: contactsData.contacts?.length || 0,
        campaigns: campaignsData.campaigns?.length || 0,
        conversations: 0,
        agents: 0,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111417",
        color: "#e1e2e7",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          height: 80,
          borderBottom: "1px solid #323538",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          backdropFilter: "blur(20px)",
          background: "rgba(17,20,23,0.8)",
          position: "sticky",
          top: 0,
        }}
      >
        {" "}
        <div>
          <h2
            style={{
              margin: 0,
              color: "#4ff07f",
              fontFamily: "Sora",
            }}
          >
            Chatzyro{" "}
          </h2>

          <span
            style={{
              color: "#869584",
              fontSize: 13,
            }}
          >
            AI WhatsApp Platform
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div>
            <div>{user.name}</div>

            <small
              style={{
                color: "#869584",
              }}
            >
              {user.email}
            </small>
          </div>

          <button
            onClick={logout}
            style={{
              background: "#272a2e",
              border: "1px solid #323538",
              color: "white",
              padding: "10px 16px",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div
        style={{
          padding: 32,
        }}
      >
        <h1
          style={{
            fontFamily: "Sora",
            fontSize: 42,
            marginBottom: 10,
          }}
        >
          Welcome back 👋
        </h1>

        <p
          style={{
            color: "#869584",
            marginBottom: 40,
          }}
        >
          Manage contacts, campaigns, agents and AI conversations.
        </p>

        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
            gap: 20,
          }}
        >
          <Card
            title="Contacts"
            value={stats.contacts}
            icon={<Users size={28} />}
            color="#4ff07f"
          />

          <Card
            title="Campaigns"
            value={stats.campaigns}
            icon={<Send size={28} />}
            color="#00f1fe"
          />

          <Card
            title="Conversations"
            value={stats.conversations}
            icon={<MessageSquare size={28} />}
            color="#4ff07f"
          />

          <Card
            title="AI Agents"
            value={stats.agents}
            icon={<Bot size={28} />}
            color="#00f1fe"
          />
        </div>

        {/* QUICK ACTIONS */}
        <div
          style={{
            marginTop: 40,
          }}
        >
          <h2
            style={{
              fontFamily: "Sora",
            }}
          >
            Quick Actions
          </h2>

          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <button
              style={actionBtn}
              onClick={() => (window.location.href = "/campaigns")}
            >
              Create Campaign
            </button>

            <button
              style={actionBtn}
              onClick={() => (window.location.href = "/contacts")}
            >
              Import Contacts
            </button>

            <button
              style={actionBtn}
              onClick={() => (window.location.href = "/agents")}
            >
              Create AI Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, icon, color }: any) {
  return (
    <div
      style={{
        background: "rgba(29,32,35,0.8)",
        border: "1px solid #323538",
        borderRadius: 18,
        padding: 24,
        backdropFilter: "blur(20px)",
        boxShadow: `0 0 20px ${color}22`,
      }}
    >
      <div
        style={{
          color,
          marginBottom: 20,
        }}
      >
        {icon}{" "}
      </div>

      <h3
        style={{
          color: "#869584",
          marginBottom: 8,
        }}
      >
        {title}
      </h3>

      <h1
        style={{
          margin: 0,
          fontFamily: "Sora",
        }}
      >
        {value}
      </h1>
    </div>
  );
}

const actionBtn = {
  background: "#25d366",
  color: "#003915",
  border: "none",
  padding: "14px 22px",
  borderRadius: "12px",
  fontWeight: 700,
  cursor: "pointer",
};
