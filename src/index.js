const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");

const nodeExpress = require("./configs/nodeExpress");
const staticConfig = require("./configs/staticConfig");
const fef = require("./configs/fef");

const nowPath = path.join(process.cwd(), "now.json");
const existingConfig = fs.existsSync("now.json");

async function buildConfig() {
  let config = {
    version: 2
  };

  const answers = await inquirer.prompt([
    {
      type: "text",
      name: "name",
      message: "what is the name of the project?",
      default: path.basename(process.cwd())
    },
    {
      type: "list",
      name: "type",
      message: "what type of project?🐱‍👤",
      choices: ["node-express", "vue", "react", "static", "static-build"]
    }
  ]);
  config.name = answers.name;
  switch (answers.type) {
    case "node-express":
      config = await nodeExpress(config);
      break;
    case "static":
      config = await staticConfig(config);
      break;
    case "react":
      config = await fef(config, "build");
      break;
    case "vue":
      config = await fef(config);
      break;
    case "static-build":
      config = await fef(config);
      break;
    default:
      break;
  }
  const moreAnswers = await inquirer.prompt([
    {
      type: "confirm",
      name: "specifyAlias",
      message: "would you like to specify an alias?",
      default: true
    },
    {
      type: "text",
      name: "alias",
      message: "What is the Alias? (specify multiple seperated by comas)",
      default: answers.name,
      when: a => a.specifyAlias
    }
  ]);
  config.alias = moreAnswers.alias
    ? moreAnswers.alias.split(",").map(a => a.trim())
    : undefined;
  fs.writeFileSync(nowPath, JSON.stringify(config, null, 2), "utf8");
  console.log("All Done! Type now to deploy!");
  process.exit(0);
}

if (existingConfig) {
  inquirer
    .prompt([
      {
        type: "confirm",
        name: "OverWrite",
        message: "now.json already exists! Would you like to rewrite it?",
        default: false
      }
    ])
    .then(answers => {
      if (answers.OverWrite) {
        buildConfig();
      } else {
        console.log("goodbye");
      }
    });
} else {
  buildConfig();
}
