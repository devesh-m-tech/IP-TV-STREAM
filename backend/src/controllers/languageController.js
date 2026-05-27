const Language = require("../models/Language");

exports.getLanguages = async (req, res) => {
  try {
    const languages = await Language.find().sort({ name: 1 });
    const tamilIdx = languages.findIndex(l => l.name.toLowerCase() === "tamil");
    if (tamilIdx > -1) {
      const [tamil] = languages.splice(tamilIdx, 1);
      languages.unshift(tamil);
    }
    res.json(languages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createLanguage = async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Language name is required" });
  }

  try {
    const exists = await Language.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
    if (exists) {
      return res.status(400).json({ error: "Language already exists" });
    }

    const lang = new Language({ name: name.trim() });
    await lang.save();
    res.status(201).json({ message: "Language created", id: lang._id, name: lang.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateLanguage = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Language name is required" });
  }

  try {
    const lang = await Language.findById(id);
    if (!lang) return res.status(404).json({ error: "Language not found" });

    const exists = await Language.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      _id: { $ne: id }
    });
    if (exists) {
      return res.status(400).json({ error: "Language already exists" });
    }

    lang.name = name.trim();
    await lang.save();
    res.json({ message: "Language updated", name: lang.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteLanguage = async (req, res) => {
  try {
    const lang = await Language.findById(req.params.id);
    if (!lang) return res.status(404).json({ error: "Language not found" });

    await Language.findByIdAndDelete(req.params.id);
    res.json({ message: "Language deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
