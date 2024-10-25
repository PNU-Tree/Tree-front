import * as express from "express";
import * as path from "path";
import * as fs from "fs";
import * as morgan from "morgan";
import signaling from "./signaling";
import { log, LogLevel } from "./log";
import Options from "./class/options";
import { reset as resetHandler } from "./class/httphandler";

const cors = require("cors");

export const createServer = (config: Options): express.Application => {
  const app: express.Application = express();
  resetHandler(config.mode);
  // logging http access
  if (config.logging != "none") {
    app.use(morgan(config.logging));
  }
  // const signal = require('./signaling');
  app.use(cors({ origin: "*" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.get("/config", (req, res) =>
    res.json({
      useWebSocket: config.type == "websocket",
      startupMode: config.mode,
      logging: config.logging,
    })
  );
  app.use("/signaling", signaling);
  app.use(express.static(path.join(__dirname, "../")));
  app.use("/module", express.static(path.join(__dirname, "../src/js/webApp")));
  app.get("/", (req, res) => {
    const indexPagePath: string = path.join(
      __dirname,
      "../src/pages/index.html"
    );
    fs.access(indexPagePath, (err) => {
      if (err) {
        log(LogLevel.warn, `Can't find file ' ${indexPagePath}`);
        res.status(404).send(`Can't find file ${indexPagePath}`);
      } else {
        res.sendFile(indexPagePath);
      }
    });
  });
  app.get("/hdrp", (req, res) => {
    const indexPagePath: string = path.join(
      __dirname,
      "../src/pages/hdrp.html"
    );
    fs.access(indexPagePath, (err) => {
      if (err) {
        log(LogLevel.warn, `Can't find file ' ${indexPagePath}`);
        res.status(404).send(`Can't find file ${indexPagePath}`);
      } else {
        res.sendFile(indexPagePath);
      }
    });
  });
  app.get("/fps", (req, res) => {
    const indexPagePath: string = path.join(
      __dirname,
      "../src/pages/fps.html"
    );
    fs.access(indexPagePath, (err) => {
      if (err) {
        log(LogLevel.warn, `Can't find file ' ${indexPagePath}`);
        res.status(404).send(`Can't find file ${indexPagePath}`);
      } else {
        res.sendFile(indexPagePath);
      }
    });
  });
  app.get("/sign-in", (req, res) => {
    const indexPagePath: string = path.join(
      __dirname,
      "../src/pages/signIn.html"
    );
    fs.access(indexPagePath, (err) => {
      if (err) {
        log(LogLevel.warn, `Can't find file ' ${indexPagePath}`);
        res.status(404).send(`Can't find file ${indexPagePath}`);
      } else {
        res.sendFile(indexPagePath);
      }
    });
  });
  app.get("/sign-up", (req, res) => {
    const indexPagePath: string = path.join(
      __dirname,
      "../src/pages/signUp.html"
    );
    fs.access(indexPagePath, (err) => {
      if (err) {
        log(LogLevel.warn, `Can't find file ' ${indexPagePath}`);
        res.status(404).send(`Can't find file ${indexPagePath}`);
      } else {
        res.sendFile(indexPagePath);
      }
    });
  });
  app.get("/sign-out", (req, res) => {
    const indexPagePath: string = path.join(
      __dirname,
      "../src/pages/signOut.html"
    );
    fs.access(indexPagePath, (err) => {
      if (err) {
        log(LogLevel.warn, `Can't find file ' ${indexPagePath}`);
        res.status(404).send(`Can't find file ${indexPagePath}`);
      } else {
        res.sendFile(indexPagePath);
      }
    });
  });
  app.get("/rank", (req, res) => {
    const indexPagePath: string = path.join(
      __dirname,
      "../src/pages/rank.html"
    );
    fs.access(indexPagePath, (err) => {
      if (err) {
        log(LogLevel.warn, `Can't find file ' ${indexPagePath}`);
        res.status(404).send(`Can't find file ${indexPagePath}`);
      } else {
        res.sendFile(indexPagePath);
      }
    });
  });
  return app;
};
