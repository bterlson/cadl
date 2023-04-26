import Ajv from "ajv/dist/2020.js";

const ajv = new Ajv({
  schemas: [
    {
      $id: "hi",
      type: "array",
      contains: {
        type: ["string", "number"],
      },
      minContains: 2,
      maxContains: 3,
    },
  ],
});

const validate = ajv.getSchema("hi");
console.log(validate([1, 1]));

/*
const schemas = [];
const dir = await fs.readdir("./tsp-output/@typespec/json-schema");
for (const file of dir) {
  schemas.push(yaml.load(await fs.readFile(`./tsp-output/@typespec/json-schema/${file}`)));
}

const ajv = new Ajv({ schemas });
const validate = ajv.getSchema("user");
console.log(
  validate({
    username: "Brian",
    email: "brian.terlson@microsoft.com",
    posts: {
      nextLink: "/foo/bar.json",
      items: [{ contents: "hi how are u", createdAt: "2020-10-10", author: 1 }],
    },
  })
);
console.log(validate.errors);
/*
const ajv = new Ajv({
  schemas: [yaml.load(await fs.readFile(`./tsp-output/@typespec/json-schema/types.yaml`))],
});
addFormats(ajv);
const validate = ajv.getSchema("https://example.org/user");

console.log(
  validate({
    username: "Brian",
    email: "brian.terlson@microsoft.com",
    posts: {
      nextLink: "/foo/bar.json",
      items: [{ contents: "hi how are u", createdAt: "2020-10-10", author: 1 }],
    },
  })
);
console.log(validate.errors);
/*
const schema = new Ajv().compile({
  allOf: [{ type: "object", properties: { x: { type: "string" } } }],
});
console.log(schema([1]));

class Foo extends Array {
  constructor() {
    super();
  }
}
const f = new Foo();
console.log(schema({ length: 1 }));

*/