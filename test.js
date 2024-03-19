const crypto = require("crypto");
const { TOKEN } = require("./src/config");

const checkSignature = (query) => {
  const { nonce, signature, timestamp } = query;
  const sha1 = crypto.createHash("sha1");
  const str = [timestamp, nonce, TOKEN].sort().join();
  console.log("str", str);
  sha1.update(str);
  const sha1str = sha1.digest("hex");
  console.log("sha1str", sha1str);
  return sha1str === signature;
};

console.log(
  checkSignature({
    nonce: "1376937691",
    signature: "2f48b9b5c9bb6bf3edf0a540d88743b7f1fee82d",
    timestamp: "1710830890",
  })
);
