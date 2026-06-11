import { useEffect, useState } from "react";

export default function Contacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const res = await fetch("http://localhost:5000/contacts");
      const data = await res.json();

      setContacts(data.contacts || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm("Delete this contact?")) return;

    try {
      await fetch(`http://localhost:5000/contacts/${id}`, {
        method: "DELETE",
      });

      loadContacts();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111417",
        color: "#e1e2e7",
        padding: "32px",
        fontFamily: "Inter",
      }}
    >
      <h1
        style={{
          color: "#4ff07f",
          fontFamily: "Sora",
        }}
      >
        Contacts
      </h1>

      <p
        style={{
          color: "#869584",
        }}
      >
        Total Contacts: {contacts.length}
      </p>

      {loading ? (
        <h3>Loading...</h3>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 16,
            marginTop: 24,
          }}
        >
          {contacts.map((contact) => (
            <div
              key={contact.id}
              style={{
                background: "#1d2023",
                border: "1px solid #323538",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <h3>{contact.name}</h3>

              <p
                style={{
                  color: "#869584",
                }}
              >
                {contact.phone}
              </p>

              <button
                onClick={() => deleteContact(contact.id)}
                style={{
                  background: "#93000a",
                  color: "white",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
