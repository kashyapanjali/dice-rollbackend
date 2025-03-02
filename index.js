const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

let userBalance = 1000; // Starting balance

// Helper function to generate a provably fair hash
function generateHash(seed, roll) {
	return crypto
		.createHash("sha256")
		.update(seed + roll)
		.digest("hex");
}

// API Endpoint: Roll the Dice
app.post("/rolldice", (req, res) => {
	const { betAmount, clientSeed } = req.body;

	if (betAmount <= 0 || betAmount > userBalance) {
		return res.status(400).json({ message: "Invalid bet amount!" });
	}

	// Generate a random roll (1-6)
	const roll = Math.floor(Math.random() * 6) + 1;

	// Create a server seed (for fairness verification)
	const serverSeed = crypto.randomBytes(16).toString("hex");

	// Generate SHA-256 hash
	const hash = generateHash(serverSeed, roll);

	// Determine win or loss
	if (roll >= 4) {
		userBalance += betAmount; // 2x payout
	} else {
		userBalance -= betAmount;
	}

	res.json({
		roll,
		result: roll >= 4 ? "win" : "lose",
		newBalance: userBalance,
		serverSeed,
		hash, // Used for verification
	});
});

// Start the server
app.listen(4000, () => {
	console.log("Server running on http://localhost:4000");
});
