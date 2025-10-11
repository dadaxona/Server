const { spawn } = require("child_process");
const path = require("path");
const kill = require("tree-kill");
const { Server } = require("../models");

let runningProcesses = {};

// yordamchi: promisefied kill
function killPid(pid) {
  return new Promise((resolve) => {
    kill(pid, "SIGTERM", (err) => {
      if (err) return resolve({ ok: false, err });
      resolve({ ok: true });
    });
  });
}

module.exports = {
  async start(data) {
    const { id, path: projectPath, command } = data;

    if (runningProcesses[id]) {
      return { statusCode: 400, message: "Bu loyiha allaqachon ishlayapti" };
    }

    const [cmd, ...args] = command.split(" ");
    let proc;

    try {
      proc = spawn(cmd, args, {
        cwd: projectPath,
        shell: true
      });
    } catch (err) {
      return { statusCode: 500, message: "Ishga tushirishda xatolik", error: err.message };
    }

    runningProcesses[id] = proc;

    // ❌ Agar ishga tushirishda xato bo‘lsa
    proc.on("error", async (err) => {
      console.error("Process start error:", err);
      if (runningProcesses[id]) delete runningProcesses[id];
      await Server.update({ status: false }, { where: { id } });
    });

    // ✅ Agar normal tugasa
    proc.on("exit", async () => {
      if (runningProcesses[id]) delete runningProcesses[id];
      await Server.update({ status: false }, { where: { id } });
    });

    // ✅ Bu joyni o‘zgartiramiz: faqat muvaffaqiyatli spawn bo‘lsa
    if (proc.pid) {
      await Server.update({ status: true }, { where: { id } });
      return { statusCode: 200, message: "Loyiha ishga tushdi", pid: proc.pid };
    } else {
      return { statusCode: 500, message: "Loyiha ishga tushmadi" };
    }
  },

  async stop(data) {
    const { id } = data;
    const proc = runningProcesses[id];

    if (!proc) {
      return { statusCode: 404, message: "Bu loyiha ishlamayapti" };
    }

    try {
      const res = await killPid(proc.pid);

      if (!res.ok) {
        // agar ESRCH (process yo‘q) bo‘lsa → baribir tozalaymiz
        if (res.err && res.err.code === "ESRCH") {
          delete runningProcesses[id];
          await Server.update({ status: false }, { where: { id } });
          return { statusCode: 200, message: "Process topilmadi (allaqachon tugagan), status yangilandi" };
        }

        console.error("Stop error:", res.err);
        return { statusCode: 500, message: "To‘xtatishda xatolik", error: res.err.message || res.err };
      }

      // muvaffaqiyatli o‘chdi
      delete runningProcesses[id];
      await Server.update({ status: false }, { where: { id } });
      return { statusCode: 200, message: "Loyiha to‘xtatildi" };

    } catch (err) {
      console.error("Stop exception:", err);
      return { statusCode: 500, message: "Stop bajarilmadi", error: err.message };
    }
  },

  async stopAll() {
    const ids = Object.keys(runningProcesses);

    let results = [];
    for (const id of ids) {
      try {
        const res = await this.stop({ id });
        results.push({ id, ...res });
      } catch (err) {
        results.push({ id, statusCode: 500, message: "StopAll xato", error: err.message });
      }
    }

    return { statusCode: 200, message: "Hamma stopAll chaqirildi", results };
  }

};
