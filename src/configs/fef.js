const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");

const baseConfig = {
  builds: [
    {
      src: "package.json",
      use: "@now/static-build",
      config: {
        distDir: "build"
      }
    }
  ],
  routes: [{ handle: "filesystem" }, { src: "/.*", dest: "index.html" }]
};

async function fef(config, defaultBuild = "dist") {
  let packageJSON;
  let packageJSONPath;
  let buildScript = "";
  try {
    packageJSONPath = path.join(process.cwd(), "package.json");
    packageJSON = require(packageJSONPath);
    buildScript = (packageJSON.scripts || {})["now-build"] || "npm run build";
  } catch (error) {
    console.error("Package.json does not exist!");
    process.exit(1);
  }
  const answers = await inquirer.prompt([
    {
      type: "text",
      name: "directory",
      message: "what is the build directory?",
      default: "build"
    },
    {
      type: "confirm",
      name: "addBuildScript",
      message:
        "Do you want to add/update a 'now build' script in your package.json",
      default: true
    },
    {
      type: "text",
      name: "buildScript",
      message: "what is the build command?",
      default: buildScript,
      when: a => a.addBuildScript
    }
  ]);
  if (answers.addBuildScript) {
    packageJSON.scripts = packageJSON.scripts || {};
    packageJSON.scripts["now-build"] = answers.buildScript;
    fs.writeFileSync(
      packageJSONPath,
      JSON.stringify(packageJSON, null, 2),
      "utf8"
    );
  }
  baseConfig.builds[0].config.distDir = answers.directory;
  console.log(answers);
  return {
    ...config,
    ...baseConfig
  };
}

module.exports = fef;