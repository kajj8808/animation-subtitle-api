import "./anissia";
import exporss from "express";
import cors from "cors";
import http from "http";
import db from "../util/db";
import "dotenv";

const app = exporss();
app.use(cors());

app.get("/", async (_, res) => {
  const animations = await db.animation.findMany({
    include: {
      _count: {
        select: {
          SubTitle: true,
        },
      },
    },
    take: 10,
  });
  res.json({
    ok: true,
    data: animations,
  });
});

app.get("/:animeNo", async (req, res) => {
  const { animeNo } = req.params;
  if (animeNo) {
    const subtitles = await db.subTitle.findMany({
      where: {
        animeNo: +animeNo,
      },
    });
    res.json({ ok: true, data: subtitles });
  }
  res.status(404).end();
});

const httpServer = http.createServer(app);

function handleListen() {
  console.log(`server is ready http://localhost:${process.env.PORT}`);
}

httpServer.listen(process.env.PORT, handleListen);
