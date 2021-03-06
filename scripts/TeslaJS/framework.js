"use strict";

require("colors");
const fs = require("fs");
const tjs = require("teslajs");

function printLogo() {
  console.log("\n");
  console.log("TTTTT EEEEE SSSSS L     AAAAA     J SSSSS");
  console.log("  T   EEEEE S     L     AAAAA     J S");
  console.log(" TTT        s     L               J S");
  console.log("  T   EEEEE SSSSS L     AAAAA     J SSSSS");
  console.log("  T             S L     A   A     J     S");
  console.log("  T   EEEEE     S L     A   A J   J     S");
  console.log("  T   EEEEE SSSSS LLLLL A   A JJJJJ SSSSS");
  console.log("=========================================");
}

function framework(program, main) {
  this.program = program;
  this.tokenFound = false;
  this.main = main;

  this.login_cb = function(err, result) {
    if (result.error) {
      console.error("Login failed!".red);
      console.warn(JSON.stringify(result.error));
      return;
    }

    printLogo();

    let options = { authToken: result.authToken };
    tjs.vehicles(options, function(err, vehicles) {
      if (err) {
        console.log("\nError: " + err.red);
        return;
      }

      const vehicle = vehicles[program.index || 0];
      options.vehicleID = vehicle.id_s;
      options.vehicle_id = vehicle.vehicle_id;
      options.tokens = vehicle.tokens;

      if (vehicle.state.toUpperCase() == "OFFLINE") {
        console.log(
          "\nResult: " + "Unable to contact vehicle, exiting!".bold.red
        );
        return;
      }

      const carType = tjs.getModel(vehicle);

      console.log(
        "\nVehicle " +
          vehicle.vin.green +
          " - " +
          carType.green +
          " ( '" +
          vehicle.display_name.cyan +
          "' ) is: " +
          vehicle.state.toUpperCase().bold.green
      );

      if (main) {
        main(tjs, options);
      }
    });
  };

  this.run = function() {
    try {
      this.tokenFound = fs.statSync(".token").isFile();
    } catch (e) {}

    if (program.uri) {
      console.log("Setting portal URI to: " + program.uri);
      tjs.setPortalBaseURI(program.uri);
    }

    if (this.tokenFound) {
      const fileStr = fs.readFileSync(".token", "utf8");
      let token = JSON.parse(fileStr);

      if (!token) {
        program.help();
      }

      if (token.access_token) {
        token = token.access_token;
      }

      this.login_cb(null, { error: false, authToken: token });
    } else {
      const username = program.username || process.env.TESLAJS_USER;
      const password = program.password || process.env.TESLAJS_PASS;

      if (!username || !password) {
        program.help();
      }

      tjs.login(username, password, this.login_cb);
    }
  };
}

module.exports = framework;
