import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes"
import semesterRoutes from "./modules/semester/semester.routes"
import coursesRoutes from "./modules/courses/courses.routes"

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
    return this.toString();
};

app.get("/", (req, res) => {
    res.json({ message: "Backend berjalan!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/semester", semesterRoutes)
app.use("/api/courses", coursesRoutes)

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});

export default app;