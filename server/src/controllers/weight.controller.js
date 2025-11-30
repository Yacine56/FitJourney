import WeightProgress from "../models/WeightProgress.js";
import User from "../models/User.js";

/** Helper: Get local midnight (fix timezone issues) */
function getLocalMidnight() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

/** POST /api/weight
 * Body: { weight }
 * Creates or updates today's weight
 */
export async function createWeight(req, res) {
  try {
    const { weight } = req.body;
    if (!weight) return res.status(400).json({ error: "Weight is required" });

    const today = getLocalMidnight();

    // 1) Create or update today's weight entry
    const entry = await WeightProgress.findOneAndUpdate(
      { user: req.userId, date: today },
      { weight },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 2) Sync Profile Weight with the latest logged weight
    await User.findByIdAndUpdate(req.userId, { weight });

    res.status(201).json({ entry });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to log weight." });
  }
}

/** GET /api/weight
 * Returns all logged weights sorted by date
 */
export async function getWeights(req, res) {
  try {
    const weights = await WeightProgress.find({ user: req.userId })
      .sort({ date: 1 })
      .select("weight date");

    res.json({ items: weights });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch weights." });
  }
}

/** PATCH /api/weight/:id
 * Body: { weight }
 * Updates a specific logged weight
 */
export async function updateWeight(req, res) {
  try {
    const { id } = req.params;
    const { weight } = req.body;

    if (!weight) return res.status(400).json({ error: "Weight is required" });

    const entry = await WeightProgress.findOne({ _id: id, user: req.userId });
    if (!entry) return res.status(404).json({ error: "Entry not found" });

    entry.weight = weight;
    await entry.save();

    res.json({ entry });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update weight." });
  }
}

/** DELETE /api/weight/:id */
export async function deleteWeight(req, res) {
  try {
    const { id } = req.params;
    const entry = await WeightProgress.findOneAndDelete({
      _id: id,
      user: req.userId,
    });
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete weight entry." });
  }
}
