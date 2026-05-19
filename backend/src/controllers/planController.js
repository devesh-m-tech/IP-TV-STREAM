const Plan = require("../models/Plan");

/**
 * Get all Plans
 */
exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Create a Plan
 */
exports.createPlan = async (req, res) => {
  const { name, price, duration, maxDevices, resolution, features } = req.body;
  try {
    const newPlan = new Plan({
      name,
      price,
      duration,
      maxDevices,
      resolution,
      features: Array.isArray(features) ? features : (features ? features.split(",").map(f => f.trim()) : [])
    });
    await newPlan.save();
    res.json({ message: "Plan created successfully", plan: newPlan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update a Plan
 */
exports.updatePlan = async (req, res) => {
  const { id } = req.params;
  const { name, price, duration, maxDevices, resolution, features } = req.body;
  try {
    const plan = await Plan.findById(id);
    if (!plan) return res.status(404).json({ error: "Plan not found" });

    if (name !== undefined) plan.name = name;
    if (price !== undefined) plan.price = price;
    if (duration !== undefined) plan.duration = duration;
    if (maxDevices !== undefined) plan.maxDevices = maxDevices;
    if (resolution !== undefined) plan.resolution = resolution;
    if (features !== undefined) {
      plan.features = Array.isArray(features) ? features : features.split(",").map(f => f.trim());
    }

    await plan.save();
    res.json({ message: "Plan updated successfully", plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete a Plan
 */
exports.deletePlan = async (req, res) => {
  const { id } = req.params;
  try {
    const plan = await Plan.findByIdAndDelete(id);
    if (!plan) return res.status(404).json({ error: "Plan not found" });
    res.json({ message: "Plan deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
