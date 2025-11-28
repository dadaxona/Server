const { spawn } = require("child_process");
const { Server } = require("../models");

let runningProcesses = {};

module.exports = {

  async start(data) {
    const { id, path: projectPath, command } = data;
    if (runningProcesses[id]) {
      return { statusCode: 400, message: "Bu loyiha allaqachon ishlayapti" };
    }
    try {
      const proc = spawn("cmd.exe", ["/k", command], {
        cwd: projectPath,
        detached: true,
        windowsHide: false
      });
      runningProcesses[id] = proc;
      proc.on("exit", async () => {
        delete runningProcesses[id];
        await Server.update({ status: false }, { where: { id } });
      });
      await Server.update({ status: true }, { where: { id } });
      return {
        statusCode: 200,
        message: "Loyiha CMD oynasida ishga tushdi",
        pid: proc.pid
      };
    } catch (err) {
      return {
        statusCode: 500,
        message: "CMD ochishda xatolik",
        error: err.message
      };
    }
  },

  async stop(data) {
    const { id } = data;
    const proc = runningProcesses[id];

    if (!proc) {
      return { statusCode: 404, message: "Bu loyiha ishlamayapti" };
    }

    try {
      const { pid } = proc;
      spawn("taskkill", ["/F", "/T", "/PID", pid]);
      delete runningProcesses[id];
      await Server.update({ status: false }, { where: { id } });
      return { statusCode: 200, message: "CMD oynasi yopildi" };
    } catch (err) {
      return { statusCode: 500, message: "Stop bajarilmadi", error: err.message };
    }
  },

  async stopAll() {
    const ids = Object.keys(runningProcesses);
    for (const id of ids) {
      await this.stop({ id });
    }
    return {
      statusCode: 200,
      message: "Hamma loyihalar stop qilindi va CMD oynalari yopildi"
    };
  }

};
