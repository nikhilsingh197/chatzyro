import { useEffect, useState } from "react";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    const res = await fetch("http://localhost:5000/campaigns");
    const data = await res.json();
    setCampaigns(data.campaigns || []);
  };

  const createCampaign = async () => {
    const res = await fetch("http://localhost:5000/campaigns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        message,
        workspaceId: "387d644a-2b20-422f-86e1-6e1942cd8d88",
      }),
    });

    const data = await res.json();

    if (data.success) {
      setName("");
      setMessage("");
      loadCampaigns();
    }
  };

  const addContacts = async (id: string) => {
    await fetch(`http://localhost:5000/campaigns/${id}/add-all-contacts`, {
      method: "POST",
    });

    alert("Contacts added");
  };

  const sendCampaign = async (id: string) => {
    await fetch(`http://localhost:5000/campaigns/${id}/send`, {
      method: "POST",
    });

    alert("Campaign sent");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111417",
        color: "#e1e2e7",
        padding: 32,
      }}
    >
      <h1
        style={{
          color: "#4ff07f",
          fontFamily: "Sora",
        }}
      >
        Campaigns
      </h1>

      <div
        style={{
          background: "#1d2023",
          border: "1px solid #323538",
          borderRadius: 16,
          padding: 24,
          marginBottom: 30,
        }}
      >
        <h3>Create Campaign</h3>

        <input
          placeholder="Campaign Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <textarea
          placeholder="Campaign Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{
            ...inputStyle,
            height: 120,
          }}
        />

        <button onClick={createCampaign} style={btnStyle}>
          Create Campaign
        </button>
      </div>

      {campaigns.map((campaign) => (
        <div
          key={campaign.id}
          style={{
            background: "#1d2023",
            border: "1px solid #323538",
            borderRadius: 16,
            padding: 24,
            marginBottom: 20,
          }}
        >
          <h2>{campaign.name}</h2>

          <p>{campaign.message}</p>

          <div
            style={{
              display: "flex",
              gap: 12,
            }}
          >
            <button style={btnStyle} onClick={() => addContacts(campaign.id)}>
              Add Contacts
            </button>

            <button style={btnStyle} onClick={() => sendCampaign(campaign.id)}>
              Send Campaign
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "12px",
  background: "#272a2e",
  border: "1px solid #323538",
  borderRadius: "10px",
  color: "white",
};

const btnStyle = {
  background: "#25d366",
  border: "none",
  padding: "12px 18px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: 700,
};
