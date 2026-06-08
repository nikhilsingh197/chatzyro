router.post("/webhook", async (req, res) => {
  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) return res.sendStatus(200);

    const from = message.from;
    const text = message.text?.body;

    if (!text) return res.sendStatus(200);

    // ✅ HERE IS "BEFORE AI" POINT
    const { safetyFilter } = await import("../services/safety.service");

    const check = safetyFilter(text);

    if (!check.safe) {
      await sendWhatsAppMessage(
        from,
        "Sorry, I cannot process this message."
      );
      return res.sendStatus(200);
    }

    // 👇 AI LOGIC STARTS AFTER THIS