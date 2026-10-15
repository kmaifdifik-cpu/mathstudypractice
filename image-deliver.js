/**
 * Image Deliver - Fetches the image and produces a JS-deliverable data URL.
 * Run with: node image-deliver.js
 */

const IMAGE_URL = "https://upload.wikimedia.org/wikipedia/en/8/84/Skate-3-Boxart.jpg";

async function deliverImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "image/jpeg";
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const dataUrl = `data:${contentType};base64,${base64}`;

  console.log("=== Image Delivered as JS Data URL ===\n");
  console.log(dataUrl);
  console.log("\n========================================");
  console.log(`Content-Type : ${contentType}`);
  console.log(`Size         : ${(arrayBuffer.byteLength / 1024).toFixed(1)} KB`);
  console.log(`Base64 length: ${base64.length} characters`);

  return dataUrl;
}

deliverImage(IMAGE_URL).catch((err) => {
  console.error(err.message);
  process.exit(1);
});
