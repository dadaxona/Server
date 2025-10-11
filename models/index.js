"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

let storagePath;

if (env === "production") {
  // Build qilinganda resources papkadan o‘qiydi
  storagePath = path.join(process.resourcesPath, "app.sqlite");
} else {
  // Dev rejimda loyihaning rootidan
  storagePath = path.join(__dirname, "..", "app.sqlite");
}

const sequelize = new Sequelize({
  dialect: config.dialect,
  storage: storagePath,
  logging: false, // xohlasa log yoqiladi
});

// Model fayllarni avtomatik yuklash
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Assosiasiyalarni chaqirish
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
