const { app, PORT } = require("./app");

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Supabase bucket: ${process.env.SUPABASE_BUCKET || "files"}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
