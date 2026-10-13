const testAPI = (req, res) => {
    res.status(200).json({
        success: true,
        message: "AI E-Commerce Backend is running"
    });
};

module.exports = { testAPI };