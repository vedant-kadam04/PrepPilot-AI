const express=require("express");
const cors=require("cors");


const authRoutes=require("./routes/authRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

const app=express();


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://prep-pilot-ai-one.vercel.app/",
    ],
    credentials: true,
  })
);
app.use(express.json());


app.use("/api/auth",authRoutes);
app.use("/api/interviews", interviewRoutes);

app.get("/",(req,res)=>{
    res.send("PrepPilot API running");

});

module.exports=app;