
// Create a new task
export const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, status } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      status: status || "Pending",
      owner: req.user._id
    });

    const saved = await task.save();

    return res.status(201).json({ success: true, task: saved });

  } catch (err) {
    console.error("Error creating task:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
